const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Creating test user...');
  
  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: 'test@onelga.gov.ng',
      firstName: 'Test',
      lastName: 'User',
      password: '$2b$12$dummy.hash.for.testing',
      role: 'CITIZEN',
      isVerified: true,
      phoneNumber: '+234-801-234-5678',
      address: '123 Test Street, Lagos'
    }
  });

  console.log('Created user:', user);

  // Create a test health center
  const healthCenter = await prisma.healthCenter.create({
    data: {
      name: 'Onelga General Hospital',
      address: 'Hospital Road, Onelga',
      phoneNumber: '+234-802-345-6789',
      services: JSON.stringify(['General Consultation', 'Laboratory', 'X-ray'])
    }
  });

  console.log('Created health center:', healthCenter);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
