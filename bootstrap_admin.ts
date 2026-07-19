import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase URL or Service Key is missing in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
const prisma = new PrismaClient();

async function main() {
  // CONFIG: Set your desired first admin credentials here
  const email = 'admin@gymflow.com';
  const password = 'Password@123';
  const fullName = 'Main Administrator';
  const gymName = 'GymFlow Elite';

  console.log('1. Registering user in Supabase Auth...');
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError || !authData.user) {
    throw new Error('Supabase Auth creation failed: ' + authError?.message);
  }

  const userId = authData.user.id;
  console.log(`Supabase User created successfully! (ID: ${userId})`);

  console.log('2. Syncing profile and role in PostgreSQL database...');
  await prisma.$transaction(async (tx) => {
    // Create local profile
    const profile = await tx.profile.create({
      data: {
        id: userId,
        fullName,
        phone: '9999999999',
      }
    });

    // Create the default gym branch
    const gym = await tx.gym.create({
      data: {
        name: gymName,
      }
    });

    // Assign GYM_ADMIN role to this user for this gym
    await tx.userGymRole.create({
      data: {
        userId: userId,
        gymId: gym.id,
        role: 'GYM_ADMIN'
      }
    });

    console.log(`Database tables populated for Gym: "${gymName}"`);
  });

  console.log('\n🎉 First Admin Account Created Successfully!');
  console.log('-------------------------------------------');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('-------------------------------------------');
}

main()
  .catch((err) => {
    console.error('\n❌ Bootstrap failed:', err.message);
  })
  .finally(() => {
    prisma.$disconnect();
  });
