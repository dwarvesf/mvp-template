import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'mvp@example.com' },
  });

  if (existingUser) {
    console.log('Default user already exists');
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash('Pwd123!', 10);

  // Create the default user
  const user = await prisma.user.create({
    data: {
      email: 'mvp@example.com',
      password: hashedPassword,
      name: 'MVP User',
      verified: true,
    },
  });

  console.log('Created default user:', {
    email: user.email,
    name: user.name,
    id: user.id,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
