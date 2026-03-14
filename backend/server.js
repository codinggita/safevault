const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/medical', require('./routes/medicalRoutes'));

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'SafeVault API is running...' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
