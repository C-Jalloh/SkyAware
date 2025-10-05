'use client';

import type { ReactNode } from 'react';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';

interface SessionProviderProps {
  children: ReactNode;
  session: any;
}

export const SessionProvider = ({
  children,
  session,
}: Readonly<SessionProviderProps>) => {
  return (
    <NextAuthSessionProvider session={session}>
      {children}
    </NextAuthSessionProvider>
  );
};
