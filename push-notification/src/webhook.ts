import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { PushSubscription } from 'web-push';
import webpush from 'web-push';
import {
  type Push,
  pushSchema,
  type PushSubscribe,
  pushSubscribeSchema,
  type PushUnsubscribe,
  pushUnsubscribeSchema,
} from './schema';
import { privateKey, publicKey } from './vapid.json';
import { createClient } from 'redis';

export default async function webhook(app: FastifyInstance) {
  const redisClient = createClient({
    url: process.env.REDIS_URL ?? 'redis://',
  });

  await redisClient.connect();

  app

    .route({
      method: 'GET',
      url: '/push/key',
      async handler() {
        return publicKey;
      },
    })

    .route({
      method: 'POST',
      url: '/push/subscribe',
      schema: { body: pushSubscribeSchema },
      async handler(request: FastifyRequest<{ Body: PushSubscribe }>, reply) {
        await redisClient.set(
          `push:${request.body.endpoint}`,
          JSON.stringify(request.body),
        );
        reply.status(200);
      },
    })

    .route({
      method: 'DELETE',
      url: '/push/unsubscribe',
      schema: { querystring: pushUnsubscribeSchema },
      async handler(
        request: FastifyRequest<{ Querystring: PushUnsubscribe }>,
        reply,
      ) {
        await redisClient.del(`push:${request.query.endpoint}`);
        reply.status(200);
      },
    })

    .route({
      method: 'POST',
      url: '/push',
      schema: { body: pushSchema },
      async handler(request: FastifyRequest<{ Body: Push }>, reply) {
        const keys = await redisClient.keys('push:*');
        const pushSubscriptions = (
          await Promise.all(keys.map((key) => redisClient.get(key)))
        )
          .filter((value) => value !== null)
          .map((value) => JSON.parse(value) as PushSubscription);
        try {
          await Promise.all(
            pushSubscriptions.map((subscription) =>
              webpush.sendNotification(
                subscription,
                JSON.stringify(request.body),
                {
                  vapidDetails: {
                    subject: 'mailto: <johndoe@example.com>',
                    publicKey,
                    privateKey,
                  },
                },
              ),
            ),
          );
        } catch (error) {}
        reply.status(200);
      },
    });
}
