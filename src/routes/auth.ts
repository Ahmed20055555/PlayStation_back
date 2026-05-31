import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: admin.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Setup initial admin if none exists
router.post('/setup', async (req, res) => {
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount > 0) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await prisma.admin.create({
      data: { username, password: hashedPassword }
    });
    
    res.status(201).json({ message: 'Admin created', username: admin.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
