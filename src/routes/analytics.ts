import express from 'express';
import prisma from '../prismaClient';

const router = express.Router();

// Get monthly revenue
router.get('/revenue', async (req, res) => {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get all completed reservations for the current month
    const reservations = await prisma.reservation.findMany({
      where: {
        status: 'completed',
        endTime: {
          gte: firstDayOfMonth
        }
      }
    });

    // const totalRevenue = reservations.reduce((sum, res) => sum + (res.totalPrice || 0), 0);
    // const totalRevenue = reservations.reduce((sum: number, res) => sum + (res.totalPrice || 0), 0);
    const totalRevenue = reservations.reduce((sum: number, reservation) => sum + (reservation.totalPrice || 0), 0);

    // Also get active rooms count
    const activeReservations = await prisma.reservation.count({
      where: { status: 'active' }
    });

    res.json({
      monthlyRevenue: totalRevenue,
      activeRooms: activeReservations,
      totalCompleted: reservations.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
