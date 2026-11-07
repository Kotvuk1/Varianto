'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AsyncState } from '../common/useAsync';

/**
 * Загрузка с автообновлением: репозиторий не публикует изменений, поэтому данные перечитываются
 * при возврате фокуса/видимости страницы и при показе из bfcache. Старые данные остаются на экране
 * во время обновления (без мигания скелетона).
 */
export function useLiveData<T>(load: () => Promise<T>): AsyncState<T> & { reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const seq = useRef(0);
  const alive = useRef(true);

  const run = useCallback(() => {
    const my = ++seq.current;
    load().then(
      (data) => {
        if (alive.current && my === seq.current) setState({ status: 'ready', data });
      },
      (error: unknown) => {
        if (alive.current && my === seq.current) setState({ status: 'error', error });
      },
    );
  }, [load]);

  useEffect(() => {
    alive.current = true;
    run();
    const onVisible = () => {
      if (document.visibilityState === 'visible') run();
    };
    window.addEventListener('focus', run);
    window.addEventListener('pageshow', run);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      alive.current = false;
      window.removeEventListener('focus', run);
      window.removeEventListener('pageshow', run);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [run]);

  const reload = useCallback(() => {
    setState({ status: 'loading' });
    run();
  }, [run]);

  return { ...state, reload };
}
