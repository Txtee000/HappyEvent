type Dependencies = {
  createContext: () => AudioContext;
  getStream: () => Promise<MediaStream>;
  requestFrame: (callback: FrameRequestCallback) => number;
  cancelFrame: (id: number) => void;
  now: () => number;
};

type ListenOptions = {
  sensitivity: () => number;
  onLevel: (level: number) => void;
  onBlow: () => void;
  onEnded: () => void;
};

const browserDependencies: Dependencies = {
  createContext: () => new AudioContext(),
  getStream: () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('เปิดเว็บผ่าน HTTPS เพื่อใช้ไมโครโฟน หรือใช้ปุ่มเป่าเทียนด้านล่าง');
    }
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
    });
  },
  requestFrame: callback => requestAnimationFrame(callback),
  cancelFrame: id => cancelAnimationFrame(id),
  now: () => performance.now(),
};

// Each listening attempt owns its resources. A cancelled permission request
// cannot attach its stream to a later attempt or keep the microphone running.
export class BlowMicrophone {
  private generation = 0;
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private frame: number | null = null;
  private removeListeners: (() => void) | null = null;

  constructor(private readonly dependencies: Dependencies = browserDependencies) {}

  stop() {
    this.generation++;
    if (this.frame !== null) this.dependencies.cancelFrame(this.frame);
    this.frame = null;
    this.removeListeners?.();
    this.removeListeners = null;
    this.source?.disconnect();
    this.analyser?.disconnect();
    this.source = null;
    this.analyser = null;
    this.stream?.getTracks().forEach(track => track.stop());
    this.stream = null;
    const context = this.context;
    this.context = null;
    if (context && context.state !== 'closed') void context.close().catch(() => {});
  }

  async start(options: ListenOptions): Promise<boolean> {
    this.stop();
    const generation = this.generation;
    try {
      const context = this.dependencies.createContext();
      this.context = context;
      await context.resume();
      if (generation !== this.generation) return false;
      const stream = await this.dependencies.getStream();
      if (generation !== this.generation) {
        stream.getTracks().forEach(track => track.stop());
        return false;
      }
      this.stream = stream;
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      this.source = source;
      this.analyser = analyser;
      analyser.fftSize = 1024;
      source.connect(analyser);
      const ended = () => {
        if (generation !== this.generation) return;
        this.stop();
        options.onEnded();
      };
      const tracks = stream.getTracks();
      tracks.forEach(track => track.addEventListener('ended', ended));
      this.removeListeners = () => tracks.forEach(track => track.removeEventListener('ended', ended));

      const data = new Uint8Array(analyser.fftSize);
      const started = this.dependencies.now();
      let last = started, held = 0, baseline = .015;
      const sample = (now: number) => {
        if (generation !== this.generation) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const value of data) sum += ((value - 128) / 128) ** 2;
        const rms = Math.sqrt(sum / data.length);
        const elapsed = Math.min(now - last, 100);
        last = now;
        if (now - started < 1000) {
          baseline = baseline * .9 + rms * .1;
          options.onLevel(Math.min(100, rms * 400));
        } else {
          const gate = Math.max(.025, baseline * 2.6, (100 - options.sensitivity()) * .0018);
          options.onLevel(Math.min(100, rms / gate * 65));
          held = rms > gate ? held + elapsed : Math.max(0, held - elapsed * 2);
          if (held > 450) {
            this.stop();
            options.onBlow();
            return;
          }
        }
        this.frame = this.dependencies.requestFrame(sample);
      };
      this.frame = this.dependencies.requestFrame(sample);
      return true;
    } catch (error) {
      if (generation !== this.generation) return false;
      this.stop();
      throw error;
    }
  }
}
