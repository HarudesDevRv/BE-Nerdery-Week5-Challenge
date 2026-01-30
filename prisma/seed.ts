import prisma from "../src/prisma";
import * as bcrypt from "bcrypt";
const saltRounds = 10;

async function seed() {
  await prisma.user.create({
    include: { address: {} },
    data: {
      email: "test_client@mail.com",
      firstName: "Tester",
      lastName: "Testing",
      password: await bcrypt.hash("abc123", saltRounds),
      address: {
        create: {
          address: "Fake street 123",
          city: "Arequipa",
          country: "Peru",
        },
      },
    },
  });
  await prisma.user.create({
    include: { address: {} },
    data: {
      email: "test_client2@mail.com",
      firstName: "Tester",
      lastName: "Testing",
      password: await bcrypt.hash("abc123", saltRounds),
      address: {
        create: {},
      },
    },
  });
  await prisma.user.create({
    include: { address: {} },
    data: {
      email: "test_manager@mail.com",
      firstName: "Tester",
      lastName: "Testing",
      password: await bcrypt.hash("abc123", saltRounds),
      address: {
        create: {},
      },
    },
  });
}

seed()
  .then(() => {
    console.log("Seeder executed successfully");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
