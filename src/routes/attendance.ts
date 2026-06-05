import express from 'express';
import prisma from '../prismaClient';

const router = express.Router();

// GET all attendance logs (Admin) or specific to employee if queried
router.get('/', async (req, res) => {
  try {
    const { employeeId, date } = req.query;
    
    const filter: any = {};
    if (employeeId) filter.employeeId = employeeId;
    if (date) filter.date = date;

    const attendanceLogs = await prisma.attendance.findMany({
      where: filter,
      include: {
        employee: {
          select: { name: true, username: true, role: true }
        }
      },
      orderBy: { clockIn: 'desc' }
    });
    res.json(attendanceLogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST clock-in
router.post('/clock-in', async (req, res) => {
  try {
    const { employeeId } = req.body;
    
    // Get today's date in YYYY-MM-DD for logging purposes
    const today = new Date().toISOString().split('T')[0];

    // Check if already clocked in without clocking out
    const latestLog = await prisma.attendance.findFirst({
        where: { employeeId },
        orderBy: { clockIn: 'desc' }
    });

    if (latestLog && !latestLog.clockOut) {
        return res.status(400).json({ message: 'Already clocked in without clocking out.' });
    }

    const log = await prisma.attendance.create({
      data: {
        employeeId,
        date: today,
        clockIn: new Date(),
      }
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST clock-out
router.post('/clock-out', async (req, res) => {
  try {
    const { employeeId } = req.body;

    // Find the latest clock-in for the employee
    const latestLog = await prisma.attendance.findFirst({
        where: { employeeId },
        orderBy: { clockIn: 'desc' }
    });

    if (!latestLog || latestLog.clockOut) {
        return res.status(400).json({ message: 'No active clock-in found.' });
    }

    const activeLog = latestLog;

    const log = await prisma.attendance.update({
        where: { id: activeLog.id },
        data: { clockOut: new Date() }
    });

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
