import { supabase } from './src/config/supabase';
import { prisma } from './src/config/prisma';

async function main() {
  const email = 'kushwahashivanshu350@gmail.com';
  const password = '15062004';
  const fullName = 'Shivanshu Kushwaha';
  const phone = '9305813717';
  const gymName = 'rudra gym';

  try {
    console.log('Fetching users...');
    const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    const existingUser = usersData.users.find((u: any) => u.email === email);
    if (existingUser) {
      console.log(`Deleting existing incomplete user ${existingUser.id}...`);
      await supabase.auth.admin.deleteUser(existingUser.id);
      
      // Attempt to clean up any orphaned records in prisma just in case
      try {
        await prisma.userGymRole.deleteMany({ where: { userId: existingUser.id } });
        await prisma.profile.delete({ where: { id: existingUser.id } });
      } catch (e) {
        // Ignore if records don't exist
      }
    }

    console.log('Creating user in Supabase Auth...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      console.error('Failed to create user in Auth:', authError);
      return;
    }

    const userId = authData.user.id;
    console.log(`Auth User created with ID: ${userId}`);

    console.log('Creating database records in Prisma...');
    const result = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.create({
        data: {
          id: userId,
          fullName,
          phone,
        }
      });

      const gym = await tx.gym.create({
        data: {
          name: gymName,
        }
      });

      const role = await tx.userGymRole.create({
        data: {
          userId: userId,
          gymId: gym.id,
          role: 'SUPER_ADMIN'
        }
      });

      return { profile, gym, role };
    });

    console.log('Admin user successfully created!');
    console.log(result);

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
