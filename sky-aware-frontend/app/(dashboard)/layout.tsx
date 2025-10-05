'use client';

import Footer from '@/components/footer';
import Header from '@/components/header';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex flex-col min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white'>
      <Header />
      <main className='flex-1'>{children}</main>
      <Footer />
    </div>
  );
}
