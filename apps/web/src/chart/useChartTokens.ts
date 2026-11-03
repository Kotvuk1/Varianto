'use client';
import { useEffect, useState } from 'react';
import { readChartTokens, type ChartTokens } from './theme/chartTokens';

/**
 * Токены графика из CSS. Перечитываются при смене data-theme / data-candles на <html>
 * (не зависит от конкретной реализации хранилища темы). До монтирования - null (SSR).
 */
export function useChartTokens(): ChartTokens | null {
  const [tokens, setTokens] = useState<ChartTokens | null>(null);
  useEffect(() => {
    const read = () => setTokens(readChartTokens());
    read();
    const mo = new MutationObserver(read);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'data-candles', 'class'] });
    return () => mo.disconnect();
  }, []);
  return tokens;
}
