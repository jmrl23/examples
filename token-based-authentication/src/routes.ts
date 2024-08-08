import { Router, type Application, type Response } from 'express';
import { cacheFactory } from './factories';
import { UserService } from './services';

export default async function routes(app: Application) {
  const routes = [userRoutes];
  await Promise.all(routes.map((route) => route(app)));
}

async function userRoutes(app: Application) {
  const router = Router();
  const cache = await cacheFactory('redis');
  const userService = new UserService(cache);

  app.use('/user', router);

  router

    .get(
      '/session',
      async function getSessionUser(
        request,
        response: Response<{ user: User | null }>,
      ) {
        const [scheme, token] = request.headers.authorization?.split(' ') ?? [];

        if (scheme !== 'Bearer') {
          response.json({ user: null });
          return;
        }

        const user = await userService.getSessionUser(token);
        response.json({ user });
      },
    )

    .post(
      '/login',
      async function loginUser(
        request,
        response: Response<
          { message: string; error: string } | { token: string }
        >,
      ) {
        const username = request.body.username ?? '';
        const password = request.body.password ?? '';
        const token = await userService.loginUser(username, password);

        if (token instanceof Error) {
          const error = token;

          response.json({
            error: error.name,
            message: error.message,
          });
          return;
        }

        response.json({ token });
      },
    )

    .delete(
      '/logout',
      async function logoutUser(
        request,
        response: Response<{ user: User | null }>,
      ) {
        const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
        if (scheme === 'Bearer') {
          const user = await userService.logoutUser(token);

          response.json({ user });
          return;
        }

        response.json({ user: null });
      },
    );
}
