import { prismaClient } from './prisma';

async function init() {
  try {
    // create user accounts
    await prismaClient.user.createMany({
      data: [
        {
          username: 'user01',
          password: 'password01',
        },
        {
          username: 'user02',
          password: 'password02',
        },
        {
          username: 'user03',
          password: 'password03',
        },
      ],
    });
  } catch (error) {}
}
void init();
