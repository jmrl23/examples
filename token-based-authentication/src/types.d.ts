import type { Prisma } from '@prisma/client';

export declare global {
  interface User
    extends Prisma.UserGetPayload<{
      select: {
        id: true;
        username: true;
      };
    }> {
    password?: string;
  }

  interface OptionsWithRevalidate {
    revalidate?: boolean;
  }
}
