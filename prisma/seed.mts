import { faker } from '@faker-js/faker'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function createUser() {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.internet.userName(),
    metronomes: {
      create: Array.from(
        Array(faker.datatype.number({ min: 0, max: 20 })),
        createMetronome
      ),
    },
  }
}

function createMetronome() {
  const metronome = {
    name: `${faker.music.songName()}`,
    bpm: faker.datatype.number({ min: 0, max: 250 }),
  }

  return faker.datatype.boolean()
    ? metronome
    : { ...metronome, lastOpened: faker.date.past(1) }
}

async function main() {
  for (let i = 0; i <= faker.datatype.number({ min: 3, max: 10 }); i++) {
    await prisma.user.create({
      data: createUser(),
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
