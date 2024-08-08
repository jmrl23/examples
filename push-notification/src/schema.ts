export const pushSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    title: {
      type: 'string',
      minLength: 1,
    },
    message: {
      type: 'string',
      minLength: 1,
    },
  },
} as const;
export interface Push {
  message: string;
}

export const pushSubscribeSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['endpoint', 'keys'],
  properties: {
    endpoint: {
      type: 'string',
      format: 'uri',
    },
    keys: {
      type: 'object',
      additionalProperties: false,
      required: ['p256dh', 'auth'],
      properties: {
        p256dh: {
          type: 'string',
        },
        auth: {
          type: 'string',
        },
      },
    },
  },
} as const;
export interface PushSubscribe {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const pushUnsubscribeSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['endpoint'],
  properties: {
    endpoint: {
      type: 'string',
      format: 'uri',
    },
  },
} as const;
export interface PushUnsubscribe {
  endpoint: string;
}
