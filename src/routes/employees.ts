import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prismaClient';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Employee Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const employee = await prisma.employee.findUnique({ where: { username } });
    if (!employee) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, employee.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (!employee.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    const token = jwt.sign(
      { id: employee.id, username: employee.username, role: employee.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );
    res.json({ token, employee: { id: employee.id, name: employee.name, username: employee.username, role: employee.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET all employees (Admin)
router.get('/', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(employees.map(e => {
        const { password, ...rest } = e;
        return rest;
    }));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create employee (Admin)
router.post('/', async (req, res) => {
  try {
    const { name, username, password, role, phone, shift, salary } = req.body;
    
    const existing = await prisma.employee.findUnique({ where: { username } });
    if (existing) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newEmployee = await prisma.employee.create({
      data: {
        name,
        username,
        password: hashedPassword,
        role: role || 'employee',
        phone,
        shift,
        salary: salary ? parseFloat(salary) : null,
      }
    });

    const { password: _, ...employeeWithoutPassword } = newEmployee;
    res.status(201).json(employeeWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update employee (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, username, password, role, phone, shift, salary, isActive } = req.body;

    const data: any = { name, username, role, phone, shift, salary: salary ? parseFloat(salary) : null, isActive };
    if (password) {
        data.password = await bcrypt.hash(password, 10);
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data
    });

    const { password: _, ...employeeWithoutPassword } = updatedEmployee;
    res.json(employeeWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE employee (Admin)
router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await prisma.employee.delete({ where: { id } });
      res.json({ message: 'Employee deleted' });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
});

export default router;
