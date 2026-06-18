import express from 'express';
import prisma from '../prismaClient';

const router = express.Router();

// Get all reservations
router.get('/', async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { room: true },
      orderBy: { startTime: 'desc' }
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending-payment reservations (for dashboard)
router.get('/pending', async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { status: 'pending_payment' },
      include: { room: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get active reservations (for dashboard)
router.get('/active', async (req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      where: { status: 'active' },
      include: { room: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a reservation (pending_payment by default)
router.post('/', async (req, res) => {
  try {
    const { roomId, customerName, customerPhone, transferToNumber, transferImage, isOpentime, startTime, endTime, items } = req.body;

    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return res.status(404).json({ message: 'Room not found' });

    const start = new Date(startTime);

    // Use discount rate if active at this hour
    const currentHour = start.getHours();
    let effectiveRate = room.hourlyRate;
    if (room.discountRate != null && room.discountStart != null && room.discountEnd != null) {
      const s = room.discountStart;
      const e = room.discountEnd;
      const inWindow = s < e
        ? currentHour >= s && currentHour < e
        : currentHour >= s || currentHour < e;
      if (inWindow) effectiveRate = room.discountRate;
    }

    let totalPrice = 0;
    let end: Date | null = null;
    let checkEnd: Date; // Used only for overlap validation

    let snacksTotal = 0;
    const validatedItems = [];
    if (items && Array.isArray(items)) {
      for (const item of items) {
        validatedItems.push({
          productId: item.productId,
          name: item.name,
          priceAtTime: item.priceAtTime,
          quantity: item.quantity
        });
      }
    }

    if (isOpentime) {
      totalPrice = effectiveRate; // 1 hour deposit for open time (Snacks are not included in totalPrice field anymore)
      checkEnd = new Date(start.getTime() + 12 * 60 * 60 * 1000); // Assume 12h for open time overlap check
    } else {
      end = new Date(endTime);
      checkEnd = end;
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalPrice = hours * effectiveRate;
    }

    // Backend Overlap Validation
    const existingReservations = await prisma.reservation.findMany({
      where: {
        roomId: roomId,
        status: { in: ['pending', 'pending_payment', 'active'] }
      }
    });

    for (const existingRes of existingReservations) {
      if (!existingRes.startTime) continue;
      const resStart = new Date(existingRes.startTime);
      const resEnd = existingRes.endTime ? new Date(existingRes.endTime) : new Date(resStart.getTime() + 12 * 60 * 60 * 1000);
      
      if (start < resEnd && checkEnd > resStart) {
        return res.status(400).json({ message: 'هذا الوقت يتعارض مع حجز آخر مسجل مسبقاً.' });
      }
    }

    const reservation = await prisma.reservation.create({
      data: {
        roomId: roomId,
        customerName,
        customerPhone,
        transferToNumber,
        transferImage,
        isOpentime: isOpentime || false,
        startTime: start,
        endTime: end,
        totalPrice,
        items: validatedItems,
        status: 'pending_payment'
      }
    });

    res.status(201).json(reservation);
  } catch (error) {
    console.error('POST /reservations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Confirm payment → set status to active
router.patch('/:id/confirm-payment', async (req, res) => {
  try {
    const reservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'active' },
      include: { room: true }
    });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject payment → cancel the reservation
router.patch('/:id/reject-payment', async (req, res) => {
  try {
    const reservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data: { status: 'cancelled' },
      include: { room: true }
    });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete/Cancel a reservation
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, endTime, finalPrice } = req.body;
    
    const updateData: any = { status };
    if (endTime) updateData.endTime = new Date(endTime);
    if (finalPrice !== undefined) updateData.totalPrice = finalPrice;

    const reservation = await prisma.reservation.update({
      where: { id: req.params.id },
      data: updateData
    });
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
