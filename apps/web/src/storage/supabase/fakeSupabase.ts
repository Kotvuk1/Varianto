import type { SupabaseClient } from '@supabase/supabase-js';

// Мок-клиент для тестов: подмножество PostgREST-билдера в памяти. Эмулирует RLS (строки видны по user_id),
// уникальные ключи и upsert. Это не рыночные данные и не замена проверки RLS в Postgres (supabase/tests).

type Row = Record<string, unknown>;
const UNIQUE: Record<string, string[][]> = {
  attempts: [['id']],
  skill_stats: [['id'], ['user_id', 'skill']],
  terminal_marks: [['id'], ['user_id', 'symbol']],
  settings: [['id'], ['user_id']],
  daily_activity: [['id'], ['user_id', 'day']],
  profiles: [['id']],
};

export class FakeSupabase {
  tables: Record<string, Row[]> = {};
  failNext: string | null = null;
  calls: string[] = [];
  constructor(public userId: string) {}

  rows(table: string): Row[] {
    return (this.tables[table] ??= []);
  }

  from(table: string) {
    this.calls.push(table);
    return new Query(this, table);
  }

  asClient(): SupabaseClient {
    return this as unknown as SupabaseClient;
  }
}

class Query implements PromiseLike<{ data: unknown; error: { message: string } | null }> {
  private filters: ((r: Row) => boolean)[] = [];
  private op: 'select' | 'insert' | 'upsert' | 'update' = 'select';
  private payload: Row[] = [];
  private patch: Row = {};
  private opts: { onConflict?: string; ignoreDuplicates?: boolean } = {};
  private orderBy: { col: string; asc: boolean } | null = null;
  private window: [number, number] | null = null;
  private single = false;

  constructor(
    private db: FakeSupabase,
    private table: string,
  ) {}

  select() {
    return this;
  }
  insert(rows: Row | Row[]) {
    this.op = 'insert';
    this.payload = [rows].flat();
    return this;
  }
  upsert(rows: Row | Row[], opts: { onConflict?: string; ignoreDuplicates?: boolean } = {}) {
    this.op = 'upsert';
    this.payload = [rows].flat();
    this.opts = opts;
    return this;
  }
  update(patch: Row) {
    this.op = 'update';
    this.patch = patch;
    return this;
  }
  eq(col: string, v: unknown) {
    this.filters.push((r) => r[col] === v);
    return this;
  }
  in(col: string, vs: unknown[]) {
    this.filters.push((r) => vs.includes(r[col]));
    return this;
  }
  gte(col: string, v: string | number) {
    this.filters.push((r) => (r[col] as string | number) >= v);
    return this;
  }
  lte(col: string, v: string | number) {
    this.filters.push((r) => (r[col] as string | number) <= v);
    return this;
  }
  contains(col: string, vs: unknown[]) {
    this.filters.push((r) => vs.every((v) => (r[col] as unknown[]).includes(v)));
    return this;
  }
  order(col: string, o: { ascending?: boolean } = {}) {
    this.orderBy = { col, asc: o.ascending ?? true };
    return this;
  }
  range(from: number, to: number) {
    this.window = [from, to];
    return this;
  }
  limit(n: number) {
    this.window = [0, n - 1];
    return this;
  }
  maybeSingle() {
    this.single = true;
    return this;
  }

  private visible(): Row[] {
    const key = this.table === 'profiles' ? 'id' : 'user_id';
    return this.db.rows(this.table).filter((r) => r[key] === this.db.userId);
  }

  private run(): { data: unknown; error: { message: string } | null } {
    if (this.db.failNext === this.table) {
      this.db.failNext = null;
      return { data: null, error: { message: `fail ${this.table}` } };
    }
    const t = this.db.rows(this.table);
    const uniques = UNIQUE[this.table] ?? [];
    const owner = this.table === 'profiles' ? 'id' : 'user_id';
    const same = (a: Row, b: Row, k: string[]) => k.every((c) => a[c] === b[c]);

    if (this.op === 'insert' || this.op === 'upsert') {
      const conflictKey = this.opts.onConflict?.split(',') ?? ['id'];
      for (const p of this.payload) {
        const row: Row = { id: crypto.randomUUID(), [owner]: this.db.userId, ...p };
        if (row[owner] !== this.db.userId) return { data: null, error: { message: 'RLS: чужой user_id' } };
        const clash = t.find((e) => uniques.some((k) => same(e, row, k)));
        if (clash) {
          if (this.op === 'insert') return { data: null, error: { message: 'duplicate key' } };
          if (!uniques.some((k) => k.join() === conflictKey.join())) return { data: null, error: { message: 'bad onConflict' } };
          if (this.opts.ignoreDuplicates) continue;
          Object.assign(clash, p);
          continue;
        }
        t.push(row);
      }
      return { data: null, error: null };
    }
    const rows = this.visible().filter((r) => this.filters.every((f) => f(r)));
    if (this.op === 'update') {
      for (const r of rows) Object.assign(r, this.patch);
      return { data: null, error: null };
    }
    if (this.orderBy) {
      const { col, asc } = this.orderBy;
      rows.sort((a, b) => ((a[col] as string) < (b[col] as string) ? -1 : (a[col] as string) > (b[col] as string) ? 1 : 0) * (asc ? 1 : -1));
    }
    const out = this.window ? rows.slice(this.window[0], this.window[1] + 1) : rows;
    return { data: this.single ? (out[0] ?? null) : out.map((r) => structuredClone(r)), error: null };
  }

  then<R1, R2>(
    ok?: ((v: { data: unknown; error: { message: string } | null }) => R1 | PromiseLike<R1>) | null,
    err?: ((e: unknown) => R2 | PromiseLike<R2>) | null,
  ) {
    return Promise.resolve(this.run()).then(ok, err);
  }
}
