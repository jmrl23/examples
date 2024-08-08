import { type Cache } from 'cache-manager';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { JWT_SECRET } from './constants';
import { prismaClient } from './prisma';

export class UserService {
  constructor(private readonly cache: Cache) {}

  public async getUserById(
    id: number,
    options: OptionsWithRevalidate = {},
  ): Promise<User | null> {
    const cacheKey = `user:${id}`;

    if (options.revalidate === true) {
      await this.cache.del(cacheKey);
    }

    const cachedUser = await this.cache.get<User>(cacheKey);
    if (cachedUser !== undefined) {
      return structuredClone(cachedUser);
    }

    const user = await prismaClient.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        password: true,
      },
    });
    await this.cache.set(cacheKey, user, ms('5m'));
    return structuredClone(user);
  }

  public async loginUser(
    username: string,
    password: string,
  ): Promise<string | Error> {
    const user = await prismaClient.user.findFirst({
      where: { username, password },
      select: { id: true },
    });
    if (!user) return new Error('incorrect username or password');

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    // use token as session
    await this.cache.set(`session:${token}`, user.id, ms('7d'));
    return token;
  }

  public async getSessionUser(token: string): Promise<User | null> {
    if (!(await this.validToken(token))) return null;

    const userId = await this.cache.get<number>(`session:${token}`);
    if (userId === undefined) return null;

    const user = await this.getUserById(userId);
    if (user) delete user.password;
    return user;
  }

  public async logoutUser(token: string): Promise<User | null> {
    const user = await this.getSessionUser(token);
    if (user) await this.cache.del(`session:${token}`);
    return user;
  }

  private async validToken(token: string): Promise<boolean> {
    const cacheKey = `session:verify:${token}`;
    const cachedResponse = await this.cache.get<boolean>(cacheKey);

    if (cachedResponse !== undefined) return cachedResponse;

    try {
      jwt.verify(token, JWT_SECRET);
      await this.cache.set(cacheKey, true, ms('5m'));
      return true;
    } catch (error) {
      await this.cache.set(cacheKey, false, ms('5m'));
      return false;
    }
  }
}
