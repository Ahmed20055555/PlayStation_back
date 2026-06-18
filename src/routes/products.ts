import express from 'express';
import prisma from '../prismaClient';

const router = express.Router();

// Get all active products (for customer)
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all products (for dashboard)
router.get('/all', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product
router.post('/', async (req, res) => {
  try {
    const { name, price, image, category } = req.body;
    const product = await prisma.product.create({
      data: { name, price, image, category }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const { name, price, image, category, isActive } = req.body;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { name, price, image, category, isActive }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
