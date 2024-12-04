import { IUsageEmailData } from './types';

export const sampleUsageData: IUsageEmailData = {
  organizationName: 'dima test org 2',
  period: {
    current: '2024-01-01',
    previous: '2023-01-01',
  },
  subscriberNotifications: {
    current: 86,
    previous: 161,
    change: -46.58385093167702,
  },
  channelBreakdown: {
    push: {
      current: 4,
      previous: 29,
      change: -86.20689655172413,
    },
    trigger: {
      current: 86,
      previous: 161,
      change: -46.58385093167702,
    },
    email: {
      current: 86,
      previous: 161,
      change: -46.58385093167702,
    },
  },
  inboxMetrics: {
    sessionInitialized: {
      current: 350009,
      previous: 1110879,
      change: -68.49260810583331,
    },
    updatePreferences: {
      current: 0,
      previous: 2,
      change: -100,
    },
    markNotification: {
      current: 74,
      previous: 249,
      change: -70.28112449799197,
    },
    updateAction: {
      current: 0,
      previous: 0,
      change: 0,
    },
  },
  workflowStats: {
    'incorrect-password': {
      current: 1,
      previous: 1,
      change: 0,
    },
    FILE_UPLOAD: {
      current: 4,
      previous: 29,
      change: -86.20689655172413,
    },
    'User Welcome Email': {
      current: 2,
      previous: 3,
      change: -33.33333333333333,
    },
    'Schedule Project': {
      current: 68,
      previous: 124,
      change: -45.16129032258064,
    },
    'Client UserAccount verification': {
      current: 1,
      previous: 3,
      change: -66.66666666666666,
    },
    'Account Verification': {
      current: 10,
      previous: 1,
      change: 900,
    },
  },
};
