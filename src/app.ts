import Fsp from 'node:fs/promises';
import Process from 'node:process';

import Stringify from 'csv-stringify';
import Fetch from 'node-fetch';

import { QUESTIONS, IGNORED_QUESTIONS } from './slack.types.js';
import { HOLIDAY, getIsoDate, invariant, isHoliday, isWeekend, ONE_DAY_MS, WEEKEND } from './utils.js';

import type { Match, SlackSearchResponse, Attachment } from './slack.types.js';

async function getAllStandups(message: string, page = 1): Promise<readonly Match[]> {
  const res = await Fetch(`https://slack.com/api/search.messages?query=${encodeURIComponent(message)}&pretty=1`, {
    headers: {
      Authorization: `Bearer ${Process.env['SLACK_USER_TOKEN']}`,
    },
  });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- response type
  const json = (await res.json()) as SlackSearchResponse;
  if (!json.ok) {
    console.error(json);
    throw new Error(JSON.stringify(json, null, 2));
  }

  if (page < json.messages.paging.pages) {
    return [...json.messages.matches, ...(await getAllStandups(message, page + 1))];
  } else {
    return json.messages.matches;
  }
}

async function getAllStandupsAndMap() {
  const name = Process.env['USER_NAME'];
  const channelId = Process.env['SLACK_CHANNEL_ID'];
  const channelName = Process.env['SLACK_CHANNEL_NAME'];

  invariant(name, `Missing USER_NAME!`);
  invariant(channelId, `Missing SLACK_CHANNEL_ID!`);
  invariant(channelName, `Missing SLACK_CHANNEL_NAME!`);

  const message = `"*${name}* posted an update" in:<#${channelId}|${channelName}>`;

  const matches = await getAllStandups(message);
  return matches
    .map((m) => {
      return {
        ...m,
        postedAt: new Date(Number(m.ts) * 1000),
        attachments: m.attachments.slice().sort((a, b) => QUESTIONS.indexOf(a.title) - QUESTIONS.indexOf(b.title)),
      };
    })
    .sort((a, b) => a.postedAt.getTime() - b.postedAt.getTime());
}

type Row = readonly [
  date: Date,
  didPreviously: typeof WEEKEND | typeof HOLIDAY | string,
  willDo: typeof WEEKEND | typeof HOLIDAY | string,
  hours: 8 | 0,
];

export async function run() {
  const standups = await getAllStandupsAndMap();
  const startDate = standups.at(0)?.postedAt;
  const endDate = standups.at(-1)?.postedAt;

  invariant(startDate && endDate);

  const daysBetween = Math.ceil(Math.abs((endDate.getTime() - startDate.getTime()) / ONE_DAY_MS)) + 1;

  const rows = Array.from({ length: daysBetween }, (_, i): Row => {
    const currentDate = new Date(startDate.getTime());
    currentDate.setDate(currentDate.getDate() + i);

    if (isWeekend(currentDate)) {
      return [currentDate, WEEKEND, WEEKEND, 0];
    }
    if (isHoliday(currentDate)) {
      return [currentDate, HOLIDAY, HOLIDAY, 0];
    }

    const standup = standups.find((s) => getIsoDate(s.postedAt) === getIsoDate(currentDate));
    if (!standup) {
      return [currentDate, ``, ``, 8];
    }

    return [currentDate, ...attachmentToText(standup.attachments), 8] as const;
  });

  const csv = Stringify(rows, {
    header: true,
    cast: {
      date: (v) => getIsoDate(v),
    },
    columns: ['date', 'What did you do previously?', 'What will you do today?', 'hours'],
  });

  return Fsp.writeFile('results.csv', csv, 'utf8');
}

function attachmentToText(attachments: readonly Attachment[]): readonly [string, string] {
  const result = attachments
    .filter((a) => QUESTIONS.includes(a.title) && !IGNORED_QUESTIONS.includes(a.title))
    .map((a) => a.fallback.replace(/\n+/, '\n').split('\n')[1]?.trim());

  return [result[0] ?? ``, result[1] ?? ``];
}
