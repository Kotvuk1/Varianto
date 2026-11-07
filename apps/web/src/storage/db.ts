import type { Mark, Symbol, UtcMs } from '@tl/core';
import Dexie, { type Table } from 'dexie';
import type { Attempt, Settings, SkillId } from './types';

export interface SkillStatRow {
  skill: SkillId;
  attempts: number;
  correct: number;
  recent: { t: UtcMs; ok: boolean }[];
  updatedAt: UtcMs;
}
export interface TerminalMarksRow {
  id: string;
  symbol: Symbol;
  marks: Mark[];
  updatedAt: UtcMs;
}
export interface DailyActivityRow {
  day: string;
  tasksDone: number;
  goal: number;
  updatedAt: UtcMs;
}

/** DATABASE_SCHEMA.md §2, версия схемы 1. Изменения — только новыми версиями с upgrade. */
export class TradingLabDB extends Dexie {
  attempts!: Table<Attempt, string>;
  skillStats!: Table<SkillStatRow, SkillId>;
  terminalMarks!: Table<TerminalMarksRow, string>;
  settings!: Table<Settings, string>;
  dailyActivity!: Table<DailyActivityRow, string>;
  meta!: Table<{ key: string; value: unknown }, string>;

  constructor(name = 'trading-lab') {
    super(name);
    this.version(1).stores({
      attempts: 'id, module, createdAt, [module+createdAt], localDay, updatedAt, *skills',
      skillStats: 'skill, updatedAt',
      terminalMarks: 'id, &symbol, updatedAt',
      settings: 'id, updatedAt',
      dailyActivity: 'day, updatedAt',
      meta: 'key',
    });
    this.on('populate', (tx) => {
      void tx.table('meta').put({ key: 'schemaVersion', value: 1 });
    });
  }
}
