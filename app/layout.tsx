import type { Metadata } from 'next';
import './globals.css';
import './experience.css';
export const metadata: Metadata = { title: 'เค้กวันเกิดของคุณ'};
export default function Layout({children}: {children: React.ReactNode}) { return <html lang="th"><body>{children}</body></html>; }
