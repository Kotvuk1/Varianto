'use client';
import { useEffect, useState } from 'react';
import { useStore } from 'zustand';
import { useRepository } from '@/storage';
import { createTaskApi } from './api';
import { createTaskFlow, type FlowState } from './taskFlow';
import type { NextBody, TaskModule } from './types';

/** Параметры фиксируются при монтировании (экран ставит key по параметрам). Поток задания для экрана сессии: загрузка при монтировании, дальше load()/submit(). */
export function useTaskFlow(module: TaskModule, body: NextBody): FlowState {
  const repo = useRepository();
  const [store] = useState(() => createTaskFlow({ api: createTaskApi(), repo, module, body: () => body }));
  useEffect(() => {
    void store.getState().load();
  }, [store]);
  return useStore(store);
}
