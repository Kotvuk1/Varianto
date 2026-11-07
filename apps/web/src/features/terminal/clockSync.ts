// Синхронизация часов с Binance для таймера свечи: WS-поле E (приоритет), иначе заголовок Date REST-ответа.
// Подмена WebSocket/fetch оборачивает нативные реализации и не меняет данные, которые видит LiveFeed.
import type { WebSocketCtor, WebSocketLike, LiveFetch } from '@tl/market-data';
import { ClockOffsetEstimator } from '../../chart/countdown';

export class ClockSync {
  private readonly ws = new ClockOffsetEstimator(15);
  private readonly http = new ClockOffsetEstimator(5);
  private hasWs = false;
  /** Вызывается, когда смещение могло измениться. */
  onChange: (() => void) | null = null;

  offset(): number {
    return this.hasWs ? this.ws.offset() : this.http.offset();
  }
  addEvent(E: number, localNow = Date.now()) {
    if (!Number.isFinite(E)) return;
    this.hasWs = true;
    this.ws.addEvent(E, localNow);
    this.onChange?.();
  }
  /** Date-заголовок точен до секунды (усечение): поправка +500 мс до середины интервала. */
  addDateHeader(header: string | null, localNow = Date.now()) {
    const t = header ? Date.parse(header) : NaN;
    if (!Number.isFinite(t)) return;
    this.http.addServerTime(t + 500, localNow);
    this.onChange?.();
  }
}

export function eventTimeOf(data: unknown): number | null {
  try {
    const E = (JSON.parse(String(data)) as { E?: unknown }).E;
    return typeof E === 'number' ? E : null;
  } catch {
    return null;
  }
}

export function sniffingWebSocket(sync: ClockSync): WebSocketCtor | undefined {
  const Found = (globalThis as { WebSocket?: WebSocketCtor }).WebSocket;
  if (!Found) return undefined;
  const Native: WebSocketCtor = Found;
  return class implements WebSocketLike {
    onopen: (() => void) | null = null;
    onmessage: ((e: { data: unknown }) => void) | null = null;
    onclose: (() => void) | null = null;
    onerror: (() => void) | null = null;
    private readonly sock: WebSocketLike;
    constructor(url: string) {
      this.sock = new Native(url);
      this.sock.onopen = () => this.onopen?.();
      this.sock.onmessage = (e) => {
        const E = eventTimeOf(e.data);
        if (E !== null) sync.addEvent(E);
        this.onmessage?.(e);
      };
      this.sock.onclose = () => this.onclose?.();
      this.sock.onerror = () => this.onerror?.();
    }
    close() {
      this.sock.close();
    }
  };
}

export function sniffingFetch(sync: ClockSync): LiveFetch {
  return async (url) => {
    const res = await globalThis.fetch(url);
    sync.addDateHeader(res.headers.get('date'));
    return res;
  };
}
