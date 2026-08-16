import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phone = '8303311096';
  const profile = await prisma.profile.findFirst({
    where: { phone: phone },
    include: {
      memberships: {
        include: { plan: true, gym: true }
      },
      gymRoles: true
    }
  });

  if (!profile) {
    console.log(`No profile found with phone ${phone}`);
    return;
  }

  console.log(`Found profile: ${profile.fullName} (ID: ${profile.id})`);
  
  if (profile.memberships.length > 0) {
    for (const membership of profile.memberships) {
      if (membership.status !== 'ACTIVE') {
        await prisma.membership.update({
          where: { id: membership.id },
          data: { status: 'ACTIVE' }
        });
        console.log(`Activated membership ${membership.id} for plan ${membership.plan.name}`);
      } else {
        console.log(`Membership ${membership.id} for plan ${membership.plan.name} is already ACTIVE`);
      }
    }
  } else {
    console.log(`No memberships found for this profile. Creating one...`);
    // Find the first gym
    const gym = await prisma.gym.findFirst();
    if (!gym) {
      console.log(`No gym found in the system.`);
      return;
    }
    
    // Find a plan
    let plan = await prisma.membershipPlan.findFirst({
      where: { gymId: gym.id }
    });
    
    if (!plan) {
      console.log(`No plan found in gym ${gym.name}. Creating a default plan...`);
      plan = await prisma.membershipPlan.create({
        data: {
          gymId: gym.id,
          name: 'Monthly Standard Plan',
          durationDays: 30,
          price: 1500,
          planType: 'STANDARD'
        }
      });
    }

    // Create the membership
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const newMembership = await prisma.membership.create({
      data: {
        userId: profile.id,
        gymId: gym.id,
        planId: plan.id,
        startDate: now,
        endDate: endDate,
        status: 'ACTIVE'
      }
    });
    console.log(`Created and activated new membership ${newMembership.id} for plan ${plan.name} (Gym: ${gym.name})`);
  }
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
