// Мягкая серия дней: DATABASE_SCHEMA.md §5.3. Одиночный пропуск серию не обнуляет и не увеличивает,
// два пропуска подряд обнуляют. Текущий день, пока цель не достигнута, пропуском не считается.

export interface DayStat {
  tasksDone: number;
  goal: number;
}

export function prevDay(day: string): string {
  const [y = 0, m = 1, d = 1] = day.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d - 1));
  return date.toISOString().slice(0, 10);
}

export function softStreak(
  days: ReadonlyMap<string, DayStat>,
  today: string,
  firstDay: string,
): { streak: number; atRisk: boolean } {
  const met = (d: string) => {
    const x = days.get(d);
    return !!x && x.tasksDone >= x.goal;
  };
  let streak = met(today) ? 1 : 0;
  let misses = 0;
  for (let d = prevDay(today); d >= firstDay; d = prevDay(d)) {
    if (met(d)) {
      streak++;
      misses = 0;
    } else if (++misses >= 2) break;
  }
  return { streak, atRisk: !met(today) && !met(prevDay(today)) };
}
