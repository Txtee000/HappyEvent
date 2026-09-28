'use client';

import type { RefObject } from 'react';
import { CakeSlice, Truck } from 'lucide-react';
import styles from './DeliveryDialog.module.css';

type DeliveryDialogProps = {
  dialogRef: RefObject<HTMLDialogElement | null>;
};

export default function DeliveryDialog({ dialogRef }: DeliveryDialogProps) {
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="delivery-title"
      aria-describedby="delivery-message"
      className="fixed inset-0 m-auto w-[min(420px,calc(100%-32px))] max-h-[calc(100dvh-40px)] overflow-y-auto rounded-[20px] border border-[#eee3dc] bg-[#fffdf9] p-6 text-center text-[#50413d] shadow-xl backdrop:bg-[#3f302c]/35 backdrop:backdrop-blur-[3px]"
    >
      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#f7e6e8] text-[#bc8190]" aria-hidden="true">
        <CakeSlice size={30} />
      </div>
      <h2 id="delivery-title" className="mb-2 text-2xl font-semibold">เค้กมาส่งแล้ว</h2>
      <p id="delivery-message" className="text-[15px] text-[#a08b84]">กรุณาไปรับด้วย</p>
      <div className={styles.route} aria-label="เค้กเดินทางจากร้านเค้กมาถึงคุณ">
        <div className={styles.path} aria-hidden="true">
          <span className={styles.progress} />
          <span className={styles.vehicle}>
            <Truck size={25} strokeWidth={1.8} />
            <CakeSlice size={12} strokeWidth={2} className={styles.cake} />
          </span>
        </div>
        <div className={styles.stops}>
          <span>ร้านเค้ก</span>
          <span>ถึงคุณ ♡</span>
        </div>
      </div>
      <form method="dialog" className="mt-6">
        <button type="submit" autoFocus className="min-h-12 w-full rounded-xl bg-[#bc8390] px-5 py-3 text-sm font-semibold text-white hover:bg-[#aa7180] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#bc8b9b]">
          ตกลง
        </button>
      </form>
    </dialog>
  );
}
