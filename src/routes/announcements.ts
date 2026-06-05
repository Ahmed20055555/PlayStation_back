import express from 'express';
import prisma from '../prismaClient';

const router = express.Router();

// GET all announcements
router.get('/', async (req, res) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create announcement (Admin)
router.post('/', async (req, res) => {
  try {
    const { title, content, targetRole } = req.body;
    const newAnnouncement = await prisma.announcement.create({
      data: {
        title,
        content,
        targetRole: targetRole || null,
      }
    });
    res.status(201).json(newAnnouncement);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE announcement (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.announcement.delete({ where: { id } });
    res.json({ message: 'Announcement deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
