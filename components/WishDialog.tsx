'use client';

import type { RefObject } from 'react';
import { Sparkles } from 'lucide-react';

type WishDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
  onConfirm: () => void;
};

export default function WishDialog({ dialogRef, onConfirm }: WishDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="wish-title"
      aria-describedby="wish-message"
      className="fixed inset-0 m-auto w-[min(420px,calc(100%-32px))] max-h-[calc(100dvh-40px)] overflow-y-auto rounded-[20px] border border-[#eee3dc] bg-[#fffdf9] p-6 text-center text-[#50413d] shadow-xl backdrop:bg-[#3f302c]/35 backdrop:backdrop-blur-[3px]"
    >
      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#f7e6e8] text-[#bc8190]" aria-hidden="true">
        <Sparkles size={30} />
      </div>
      <h2 id="wish-title" className="mb-2 text-2xl font-semibold">คำอธิษฐานของคุณ</h2>
      <p id="wish-message" className="text-[15px] text-[#a08b84]">ขอให้ทุกความฝันเป็นจริง ♡</p>
      <button
        type="button"
        autoFocus
        onClick={onConfirm}
        className="mt-6 min-h-12 w-full rounded-xl bg-[#bc8390] px-5 py-3 text-sm font-semibold text-white hover:bg-[#aa7180] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bc8b9b]"
      >
        ตกลง
      </button>
    </dialog>
  );
}
