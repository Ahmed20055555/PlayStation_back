import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import roomsRoutes from './routes/rooms';
import reservationsRoutes from './routes/reservations';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';
import employeesRoutes from './routes/employees';
import announcementsRoutes from './routes/announcements';
import attendanceRoutes from './routes/attendance';
import breakRequestsRoutes from './routes/breakRequests';
import productsRoutes from './routes/products';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://play-station-front.vercel.app',
      (process.env.FRONTEND_URL || '').replace(/\/+$/, ''),
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // allow all for now
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/break-requests', breakRequestsRoutes);
app.use('/api/products', productsRoutes);

app.get('/', (req, res) => {
  res.send('PlayStation Lounge API is running');
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
