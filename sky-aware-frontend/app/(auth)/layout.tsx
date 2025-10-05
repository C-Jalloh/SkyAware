import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SkyAware App',
  description: 'Authentication pages',
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className='flex min-h-svh flex-col justify-center items-center gap-6 p-6 md:p-10 bg-slate-900/90 backdrop-blur-md text-white'>
      {children}
    </div>
  );
}
