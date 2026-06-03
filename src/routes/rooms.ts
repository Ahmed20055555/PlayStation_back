// import express from 'express';
// import prisma from '../prismaClient';

// const router = express.Router();

// // Get all rooms
// router.get('/', async (req, res) => {
//   try {
//     const rooms = await prisma.room.findMany({
//       include: {
//         reservations: {
//           where: {
//             status: {
//               in: ['pending', 'active']
//             }
//           }
//         }
//       }
//     });
//     res.json(rooms);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Get a single room
// router.get('/:id', async (req, res) => {
//   try {
//     const room = await prisma.room.findUnique({ where: { id: Number(req.params.id) } });
//     if (!room) return res.status(404).json({ message: 'Room not found' });
//     res.json(room);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Create a new room
// router.post('/', async (req, res) => {
//   try {
//     const { name, consoleType, hourlyRate, discountRate, discountStart, discountEnd } = req.body;
//     const room = await prisma.room.create({
//       data: {
//         name,
//         consoleType,
//         hourlyRate: Number(hourlyRate),
//         discountRate: discounذtRate !== undefined && discountRate !== null && discountRate !== "" ? Number(discountRate) : null,
//         discountStart: discountStart !== undefined && discountStart !== null && discountStart !== "" ? Number(discountStart) : null,
//         discountEnd: discountEnd !== undefined && discountEnd !== null && discountEnd !== "" ? Number(discountEnd) : null,
//       }
//     });
//     res.status(201).json(room);
//   } catch (error) {
//     console.error("POST /rooms Error:", error);
//     res.status(500).json({ message: 'Server error', error: String(error) });
//   }
// });

// // Update a room
// router.put('/:id', async (req, res) => {
//   try {
//     const { name, consoleType, hourlyRate, discountRate, discountStart, discountEnd } = req.body;
//     const room = await prisma.room.update({
//       where: { id: Number(req.params.id) },
//       data: {
//         name,
//         consoleType,
//         hourlyRate: Number(hourlyRate),
//         discountRate: discountRate !== undefined && discountRate !== null && discountRate !== "" ? Number(discountRate) : null,
//         discountStart: discountStart !== undefined && discountStart !== null && discountStart !== "" ? Number(discountStart) : null,
//         discountEnd: discountEnd !== undefined && discountEnd !== null && discountEnd !== "" ? Number(discountEnd) : null,
//       }
//     });
//     res.json(room);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// // Delete a room
// router.delete('/:id', async (req, res) => {
//   try {
//     const roomId = Number(req.params.id);
//     // First delete all reservations associated with this room to avoid foreign key constraint errors
//     await prisma.reservation.deleteMany({ where: { roomId } });
//     // Then delete the room itself
//     await prisma.room.delete({ where: { id: roomId } });
//     res.json({ message: 'Room deleted' });
//   } catch (error) {
//     console.error("Delete room error:", error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// export default router;
// ده الكود كامل بعد التصليح — شيل كل الـ comments وحط ده:
// typescript
import express from 'express';
import prisma from '../prismaClient';

const router = express.Router();

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        reservations: {
          where: {
            status: {
              in: ['pending', 'pending_payment', 'active']
            }
          }
        }
      }
    });
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single room
router.get('/:id', async (req, res) => {
  try {
    const room = await prisma.room.findUnique({ where: { id: req.params.id as any } });
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new room
router.post('/', async (req, res) => {
  try {
    const { name, consoleType, hourlyRate, discountRate, discountStart, discountEnd } = req.body;
    const room = await prisma.room.create({
      data: {
        name,
        consoleType,
        hourlyRate: Number(hourlyRate),
        discountRate: discountRate !== undefined && discountRate !== null && discountRate !== "" ? Number(discountRate) : null,
        discountStart: discountStart !== undefined && discountStart !== null && discountStart !== "" ? Number(discountStart) : null,
        discountEnd: discountEnd !== undefined && discountEnd !== null && discountEnd !== "" ? Number(discountEnd) : null,
      }
    });
    res.status(201).json(room);
  } catch (error) {
    console.error("POST /rooms Error:", error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

// Update a room
router.put('/:id', async (req, res) => {
  try {
    const { name, consoleType, hourlyRate, discountRate, discountStart, discountEnd } = req.body;
    const room = await prisma.room.update({
      where: { id: req.params.id as any },
      data: {
        name,
        consoleType,
        hourlyRate: Number(hourlyRate),
        discountRate: discountRate !== undefined && discountRate !== null && discountRate !== "" ? Number(discountRate) : null,
        discountStart: discountStart !== undefined && discountStart !== null && discountStart !== "" ? Number(discountStart) : null,
        discountEnd: discountEnd !== undefined && discountEnd !== null && discountEnd !== "" ? Number(discountEnd) : null,
      }
    });
    res.json(room);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a room
router.delete('/:id', async (req, res) => {
  try {
    const roomId = req.params.id;
    await prisma.reservation.deleteMany({ where: { roomId: roomId as any } });
    await prisma.room.delete({ where: { id: roomId as any } });
    res.json({ message: 'Room deleted' });
  } catch (error) {
    console.error("Delete room error:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;