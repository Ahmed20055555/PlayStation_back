import express from 'express';
import prisma from '../prismaClient';

const router = express.Router();

// GET all break requests (Admin - latest first) or by employeeId
router.get('/', async (req, res) => {
  try {
    const { employeeId, status } = req.query;

    const filter: any = {};
    if (employeeId) filter.employeeId = employeeId;
    if (status) filter.status = status;

    const requests = await prisma.breakRequest.findMany({
      where: filter,
      include: {
        employee: {
          select: { name: true, username: true, role: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create a break request (Employee)
router.post('/', async (req, res) => {
  try {
    const { employeeId, type, reason, duration } = req.body;

    const request = await prisma.breakRequest.create({
      data: {
        employeeId,
        type: type || 'break',
        reason,
        duration: duration || null,
      }
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PATCH approve or reject (Admin)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }

    const updated = await prisma.breakRequest.update({
      where: { id },
      data: { status, adminNote: adminNote || null }
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE a break request
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.breakRequest.delete({ where: { id } });
    res.json({ message: 'Request deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
