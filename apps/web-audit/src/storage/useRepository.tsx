'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { LocalRepository } from './LocalRepository';
import type { Repository } from './types';

let shared: Repository | null = null;

/** Единственный экземпляр на вкладку; IndexedDB открывается лениво, при первом обращении. */
export function getDefaultRepository(): Repository {
  shared ??= new LocalRepository();
  return shared;
}

const RepositoryContext = createContext<Repository | null>(null);

export function RepositoryProvider({
  repository,
  children,
}: {
  repository?: Repository;
  children: ReactNode;
}) {
  return (
    <RepositoryContext.Provider value={repository ?? getDefaultRepository()}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useRepository(): Repository {
  return useContext(RepositoryContext) ?? getDefaultRepository();
}
