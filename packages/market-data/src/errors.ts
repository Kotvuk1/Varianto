export type ArchiveErrorCode = 'not_found' | 'unavailable' | 'bad_format';

/** Типизированная ошибка серверного чтения архива data.binance.vision. */
export class ArchiveError extends Error {
  constructor(
    readonly code: ArchiveErrorCode,
    message: string,
    readonly url?: string,
  ) {
    super(message);
    this.name = 'ArchiveError';
  }
}
