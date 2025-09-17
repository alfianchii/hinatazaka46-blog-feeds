export class DateError extends Error {
  constructor(message: string, public override cause?: unknown) {
    super(message)
    this.name = "DateError"
  }
}

export const japaneseTimeStyle = (time: string, targetUTCOffset: number, sourceUTCOffset: number = 9): string => {
  if (!time) throw new DateError("❌ Empty time string")

  const match = time.match(/^(\d{4})\.(\d{1,2})\.(\d{1,2}) (\d{1,2}):(\d{2})$/)
  if (!match) throw new DateError(`❌ Invalid time format: ${time}`)

  const [, y, m, d, h, min] = match

  const utcMs = Date.UTC(Number(y), Number(m) - 1, Number(d), Number(h) - (sourceUTCOffset ?? 0), Number(min), 0);
  const targetMs = utcMs + targetUTCOffset * 60 * 60 * 1000
  const newDate = new Date(targetMs)

  const year = newDate.getUTCFullYear()
  const month = newDate.getUTCMonth() + 1
  const day = newDate.getUTCDate()
  const hour = newDate.getUTCHours().toString().padStart(2, "0")
  const minute = newDate.getUTCMinutes().toString().padStart(2, "0")

  return `${year}年${month}月${day}日, ${hour}時${minute}分`
}

export function getCurrentJktMonth(): number {
  const now = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" })
  );
  return now.getMonth() + 1;
}

export const getCurrentJktDayOfMonth = (d: Date = new Date()): number => {
  return Number(
    new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", day: "2-digit" })
      .format(d)
  );
};

export const isWithinJktDayRange = (min: number, max: number, d: Date = new Date()): boolean => {
  const day = getCurrentJktDayOfMonth(d);
  return day >= min && day <= max;
};

export const timestamp = (): string => new Date().toISOString()