'use client';

import type { ReactNode } from 'react';
import { InterwovenKitProvider, TESTNET } from '@initia/interwovenkit-react';

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <InterwovenKitProvider
      {...TESTNET}
      theme="dark"
    >
      {children}
    </InterwovenKitProvider>
  );
}
