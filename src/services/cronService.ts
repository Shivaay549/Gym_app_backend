import cron from 'node-cron';
import { prisma } from '../config/prisma';

// Run every day at 00:01 AM
cron.schedule('1 0 * * *', async () => {
  console.log('[CRON] Running daily membership checks...');

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activeMemberships = await prisma.membership.findMany({
      where: {
        status: { in: ['ACTIVE', 'GRACE_PERIOD'] }
      },
      include: { user: true }
    });

    for (const membership of activeMemberships) {
      const endDate = new Date(membership.endDate);
      endDate.setHours(0, 0, 0, 0);

      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Expiry Notifications
      if (diffDays === 7 || diffDays === 3 || diffDays === 0) {
        await prisma.notification.create({
          data: {
            userId: membership.userId,
            title: 'Membership Expiry Warning',
            message: `Your membership expires in ${diffDays} days.`
          }
        });
        console.log(`[CRON] Notified user ${membership.userId} of expiry in ${diffDays} days.`);
      }

      // Grace Period Logic
      if (diffDays < 0) {
        if (diffDays >= -5) {
          // Inside grace period
          if (membership.status !== 'GRACE_PERIOD') {
            await prisma.membership.update({
              where: { id: membership.id },
              data: { status: 'GRACE_PERIOD' }
            });
            console.log(`[CRON] Membership ${membership.id} moved to GRACE_PERIOD.`);
          }
        } else {
          // Grace period over
          if (membership.status !== 'EXPIRED') {
            await prisma.membership.update({
              where: { id: membership.id },
              data: { status: 'EXPIRED' }
            });
            console.log(`[CRON] Membership ${membership.id} EXPIRED. Access revoked.`);
          }
        }
      }
    }
  } catch (error) {
    console.error('[CRON] Error during daily checks:', error);
  }
});
