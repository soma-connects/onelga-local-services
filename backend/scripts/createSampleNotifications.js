const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleNotifications() {
  try {
    // Get the first user from the database
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.log('No users found in database. Please create a user first.');
      return;
    }

    console.log(`Creating sample notifications for user: ${user.email}`);

    // Check if notifications already exist
    const existingNotifications = await prisma.notification.findMany({
      where: { userId: user.id }
    });

    if (existingNotifications.length > 0) {
      console.log(`User already has ${existingNotifications.length} notifications. Skipping creation.`);
      return;
    }

    // Create sample notifications
    const notifications = [
      {
        userId: user.id,
        title: 'Application Approved',
        message: 'Your identification letter application has been approved and is ready for collection.',
        type: 'APPLICATION_UPDATE',
        isRead: false
      },
      {
        userId: user.id,
        title: 'Document Required',
        message: 'Additional documents are needed for your birth certificate application.',
        type: 'APPLICATION_UPDATE',
        isRead: false
      },
      {
        userId: user.id,
        title: 'Payment Confirmed',
        message: 'Your payment has been confirmed for business registration.',
        type: 'APPLICATION_UPDATE',
        isRead: true
      },
      {
        userId: user.id,
        title: 'Account Updated',
        message: 'Your profile information has been successfully updated.',
        type: 'ACCOUNT_UPDATE',
        isRead: true
      },
      {
        userId: user.id,
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur on Sunday from 2-4 AM.',
        type: 'INFO',
        isRead: false
      }
    ];

    // Create notifications
    for (const notificationData of notifications) {
      const notification = await prisma.notification.create({
        data: notificationData
      });
      console.log(`Created notification: ${notification.title}`);
    }

    console.log('Sample notifications created successfully!');
    
  } catch (error) {
    console.error('Error creating sample notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleNotifications();