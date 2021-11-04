export const QUESTIONS = [
  'Any blockers we should address?',
  'What did you do previously?',
  'What will you do today?',
  'On track to hit team goals?',
] as const;
export type Question = typeof QUESTIONS[number];
export const IGNORED_QUESTIONS: readonly Question[] = [
  'Any blockers we should address?',
  'On track to hit team goals?',
];

export interface SlackSearchResponse {
  readonly ok: boolean;
  readonly query: string;
  readonly messages: Messages;
}

export interface Messages {
  readonly total: number;
  readonly pagination: Pagination;
  readonly paging: Paging;
  readonly matches: readonly Match[];
}

export interface Match {
  readonly iid: string;
  readonly team: 'T5VDDKPT2';
  readonly score: number;
  readonly channel: Channel;
  readonly type: 'message';
  readonly user: null;
  readonly 'michał miszczyszyn': 'michał miszczyszyn';
  readonly ts: string;
  readonly attachments: readonly Attachment[];
  readonly text: string;
  readonly permalink: string;
  readonly no_reactions?: boolean;
}

export interface Attachment {
  readonly fallback: string;
  readonly text: string;
  readonly title: Question;
  readonly id: number;
  readonly color: 'c0dadb' | 'e2e2e2' | 'ea9c9c' | '839bbd';
  readonly mrkdwn_in: readonly 'text'[];
}

export interface Channel {
  readonly id: 'C01NNC5MNF2';
  readonly is_channel: boolean;
  readonly is_group: boolean;
  readonly is_im: boolean;
  readonly name: 'carriers-team-daily-standup';
  readonly is_shared: boolean;
  readonly is_org_shared: boolean;
  readonly is_ext_shared: boolean;
  readonly is_private: boolean;
  readonly is_mpim: boolean;
  readonly pending_shared: readonly any[];
  readonly is_pending_ext_shared: boolean;
}

export interface Pagination {
  readonly total_count: number;
  readonly page: number;
  readonly per_page: number;
  readonly page_count: number;
  readonly first: number;
  readonly last: number;
}

export interface Paging {
  readonly count: number;
  readonly total: number;
  readonly page: number;
  readonly pages: number;
}
