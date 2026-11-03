'use client';
import { useEffect, useRef, useState } from 'react';
import { useStore } from 'zustand';
import { useRepository } from '@/storage';
import { createTaskApi } from './api';
import { createTaskFlow, type FlowState } from './taskFlow';
import type { NextBody, TaskModule } from './types';

/** Поток задания для экрана сессии: загрузка при монтировании, дальше load()/submit(). */
export function useTaskFlow(module: TaskModule, body: NextBody): FlowState {
  const repo = useRepository();
  const bodyRef = useRef(body);
  bodyRef.current = body;
  const [store] = useState(() => createTaskFlow({ api: createTaskApi(), repo, module, body: () => bodyRef.current }));
  useEffect(() => {
    void store.getState().load();
  }, [store]);
  return useStore(store);
}
