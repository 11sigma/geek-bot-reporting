import type { Readable } from 'stream';

export function invariant(predicate: any, msg = 'Unexpected error'): asserts predicate {
  if (!predicate) {
    throw new Error(msg);
  }
}

export function streamToString(stream: Readable) {
  // eslint-disable-next-line functional/prefer-readonly-type -- required mutable array
  const chunks: Buffer[] = [];
  return new Promise<string>((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

export const getIsoDate = (d: Date) => d.toISOString().slice(0, `XXXX-XX-XX`.length);
export const isWeekend = (d: Date) => [SATURDAY, SUNDAY].includes(d.getDay());
export const isDayOff = (d: Date) => POLISH_HOLIDAYS_2021.some((holiday) => getIsoDate(holiday) === getIsoDate(d));

export const WEEKEND = 'WEEKEND' as const;
export const DAY_OFF = 'DAY_OFF' as const;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;
export const SATURDAY = 6;
export const SUNDAY = 0;
export const POLISH_HOLIDAYS_2021 = [
  '2021-01-01', // New Year's Day
  '2021-01-06', // Epiphany
  '2021-04-04', // Easter Sunday
  '2021-04-05', // Easter Monday
  '2021-05-01', // Labour Day
  '2021-05-03', // 3 May Constitution Day
  '2021-05-23', // Whitsun
  '2021-06-03', // Corpus Christi
  '2021-08-15', // Armed Forces Day
  '2021-08-15', // Assumption of Mary
  '2021-11-01', // All Saints' Day
  '2021-11-11', // Poland Independence Day
  '2021-12-25', // Christmas Day
  '2021-12-26', // 2nd Day of Christmas
].map((d) => new Date(d + 'T00:00:00.000Z'));
