import { prisma } from '../lib/db';
import bcrypt from 'bcryptjs';
import { logger } from '../utils/logger';



async function main() {
  logger.info('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@onelga.gov.ng' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@onelga.gov.ng',
      firstName: 'System',
      lastName: 'Administrator',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      phoneNumber: '+234-xxx-xxx-xxxx',
      address: 'Onelga Local Government Secretariat',
    },
  });

  logger.info('👤 Admin user created/updated');

  // Create sample health centers
  const healthCenters = [
    {
      name: 'Onelga General Hospital',
      address: 'Main Road, Omoku, Rivers State',
      phoneNumber: '+234-xxx-xxx-1001',
      services: ['General Consultation', 'Emergency Services', 'Maternity', 'Pediatrics'],
      latitude: 5.2177,
      longitude: 6.6594,
    },
    {
      name: 'Omoku Primary Health Care',
      address: 'Omoku Town, Rivers State',
      phoneNumber: '+234-xxx-xxx-1002',
      services: ['Primary Care', 'Immunization', 'Family Planning', 'Antenatal Care'],
      latitude: 5.2200,
      longitude: 6.6600,
    },
    {
      name: 'Egbema Health Centre',
      address: 'Egbema Community, Rivers State',
      phoneNumber: '+234-xxx-xxx-1003',
      services: ['Primary Care', 'Emergency First Aid', 'Health Education'],
      latitude: 5.2150,
      longitude: 6.6550,
    },
  ];

  for (const center of healthCenters) {
    await prisma.healthCenter.upsert({
      where: { id: center.name }, // Use name as ID for uniqueness
      update: {},
      create: {
        ...center,
        services: JSON.stringify(center.services)
      },
    });
  }

  logger.info('🏥 Health centers created/updated');

  // Create sample staff users
  const staffUsers = [
    {
      email: 'health.staff@onelga.gov.ng',
      firstName: 'Health',
      lastName: 'Staff',
      role: 'HEALTH_STAFF' as const,
    },
    {
      email: 'business.staff@onelga.gov.ng',
      firstName: 'Business',
      lastName: 'Staff',
      role: 'BUSINESS_STAFF' as const,
    },
    {
      email: 'education.staff@onelga.gov.ng',
      firstName: 'Education',
      lastName: 'Staff',
      role: 'EDUCATION_STAFF' as const,
    },
  ];

  const defaultStaffPassword = await bcrypt.hash('staff123', 12);

  for (const staff of staffUsers) {
    await prisma.user.upsert({
      where: { email: staff.email },
      update: {},
      create: {
        ...staff,
        password: defaultStaffPassword,
        isVerified: true,
      },
    });
  }

  logger.info('👥 Staff users created/updated');

  // Create sample citizen for testing
  const citizenPassword = await bcrypt.hash('citizen123', 12);
  
  const citizen = await prisma.user.upsert({
    where: { email: 'citizen@example.com' },
    update: {},
    create: {
      email: 'citizen@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: citizenPassword,
      role: 'CITIZEN',
      isVerified: true,
      phoneNumber: '+234-xxx-xxx-2001',
      dateOfBirth: new Date('1990-01-15'),
      address: 'Sample Address, Onelga LGA, Rivers State',
    },
  });

  logger.info('👤 Sample citizen created/updated');

  // Create some sample notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: 'Welcome to Onelga Services',
        message: 'Your admin account has been set up successfully.',
        type: 'SYSTEM_ANNOUNCEMENT',
      },
      {
        userId: citizen.id,
        title: 'Welcome to Onelga Services',
        message: 'Welcome to the Onelga Local Services platform. You can now apply for various government services online.',
        type: 'SYSTEM_ANNOUNCEMENT',
      },
    ],
  });

  logger.info('📧 Sample notifications created');

  logger.info('✅ Database seeding completed successfully!');
  
  console.log('\n=== Seeded Users ===');
  console.log(`Admin: ${admin.email} (password: ${process.env.ADMIN_PASSWORD || 'admin123'})`);
  console.log(`Citizen: citizen@example.com (password: citizen123)`);
  console.log(`Staff users: staff123 (password for all staff)`);
  console.log('\n=== Health Centers ===');
  console.log(`Created ${healthCenters.length} health centers`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error('❌ Error during database seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });