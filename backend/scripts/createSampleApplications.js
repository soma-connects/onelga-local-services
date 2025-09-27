const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleApplications() {
  try {
    // Get the first user from the database
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('No users found in database. Please create a user first.');
      return;
    }

    console.log(`Creating sample applications for user: ${user.email}`);

    // Create sample applications
    const applications = [
      {
        userId: user.id,
        type: 'IDENTIFICATION_LETTER',
        status: 'APPROVED',
        data: JSON.stringify({
          purpose: 'Bank account opening',
          documents: ['ID Copy', 'Proof of Residence']
        })
      },
      {
        userId: user.id,
        type: 'BIRTH_CERTIFICATE',
        status: 'PENDING',
        data: JSON.stringify({
          childName: 'John Doe Jr.',
          childDateOfBirth: '2023-05-15',
          documents: ['Hospital Birth Record']
        })
      },
      {
        userId: user.id,
        type: 'BUSINESS_REGISTRATION',
        status: 'UNDER_REVIEW',
        data: JSON.stringify({
          businessName: 'Tech Solutions Ltd',
          businessType: 'Technology',
          documents: ['Business Plan', 'Tax ID']
        })
      },
      {
        userId: user.id,
        type: 'HEALTH_APPOINTMENT',
        status: 'COMPLETED',
        data: JSON.stringify({
          appointmentType: 'General Checkup',
          preferredDate: '2024-01-20',
          documents: []
        })
      }
    ];

    // Check if applications already exist
    const existingApps = await prisma.application.findMany({
      where: { userId: user.id }
    });

    if (existingApps.length > 0) {
      console.log(`User already has ${existingApps.length} applications. Skipping creation.`);
      return;
    }

    // Create applications
    for (const appData of applications) {
      const application = await prisma.application.create({
        data: appData
      });
      console.log(`Created application: ${application.type} (${application.status})`);
    }

    console.log('Sample applications created successfully!');
    
  } catch (error) {
    console.error('Error creating sample applications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleApplications();