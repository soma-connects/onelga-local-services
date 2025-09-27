const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateUserRole() {
  try {
    // First, let's see all users and their current roles
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log('Current users in database:');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.firstName} ${user.lastName}): Role = ${user.role}`);
    });

    if (users.length === 0) {
      console.log('No users found in database.');
      return;
    }

    // Find the user you want to update
    const userToUpdate = users.find(user => user.email === 'pauljizy@gmail.com');
    
    if (!userToUpdate) {
      console.log('User pauljizy@gmail.com not found.');
      console.log('Available users:', users.map(u => u.email));
      return;
    }

    console.log(`\nUpdating user ${userToUpdate.email} from role '${userToUpdate.role}' to 'ADMIN'...`);

    // Update the user role
    const updatedUser = await prisma.user.update({
      where: { id: userToUpdate.id },
      data: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log('✅ User updated successfully:');
    console.log(`- Email: ${updatedUser.email}`);
    console.log(`- Name: ${updatedUser.firstName} ${updatedUser.lastName}`);
    console.log(`- New Role: ${updatedUser.role}`);

  } catch (error) {
    console.error('❌ Error updating user role:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUserRole();