const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAdminUser() {
  try {
    console.log('Updating user to admin role...');
    
    // Update the specific user to admin
    const user = await prisma.user.update({
      where: { email: 'pauljizy1@gmail.com' },
      data: { 
        role: 'STAFF',
        isVerified: true,
        isActive: true 
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        isActive: true
      }
    });

    console.log('✅ User updated successfully:', user);
    
    // Also check if user exists, if not create it
    const existingUser = await prisma.user.findUnique({
      where: { email: 'pauljizy1@gmail.com' }
    });
    
    if (!existingUser) {
      console.log('User not found. Please register with this email first.');
    }

  } catch (error) {
    if (error.code === 'P2025') {
      console.log('❌ User with email pauljizy1@gmail.com not found.');
      console.log('Please register with this email first, then run this script again.');
    } else {
      console.error('❌ Error updating user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminUser();