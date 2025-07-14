const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const superAdminEmails = [
  'kshitijsingh578@gmail.com',
  'ahahwuuw@gmail.com',
  'divinixxofficial@gmail.com'
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create super admin users
  for (const email of superAdminEmails) {
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0], // Use email prefix as default name
          role: 'SUPER_ADMIN'
        }
      });
      console.log(`✅ Created super admin: ${email}`);
    } else {
      // Update existing user to super admin if not already
      if (existingUser.role !== 'SUPER_ADMIN') {
        await prisma.user.update({
          where: { email },
          data: { role: 'SUPER_ADMIN' }
        });
        console.log(`✅ Updated ${email} to super admin`);
      } else {
        console.log(`ℹ️  Super admin already exists: ${email}`);
      }
    }
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
