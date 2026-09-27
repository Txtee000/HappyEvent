import type { Metadata } from 'next';
import './globals.css';
import './experience.css';
export const metadata: Metadata = { title: 'Make a Wish — เค้กวันเกิดของคุณ', description: 'สร้างเค้กวันเกิด 3D ปักเทียน อธิษฐาน และเป่าเทียนผ่านไมโครโฟน' };
export default function Layout({children}: {children: React.ReactNode}) { return <html lang="th"><body>{children}</body></html>; }
