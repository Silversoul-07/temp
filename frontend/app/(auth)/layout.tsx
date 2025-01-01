import React, { Suspense } from 'react';
import Loading from '@/components/Loading';

export default function Layout({
    children,
}: {
  children: React.ReactNode
}) {
  return (
        <main>
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </main>
  );
}