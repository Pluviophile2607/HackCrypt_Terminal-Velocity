const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const authRoutes = require('./routes/authRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/session', sessionRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend connected successfully!' });
});

// Create Server for Socket.io
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
    cors: {
        origin: "*", // Adjust in production
        methods: ["GET", "POST"]
    }
});

app.set('socketio', io);

// Socket.io Connection Logic
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("joinSession", (sessionId) => {
        socket.join(sessionId);
        console.log(`User joined session: ${sessionId}`);
    });

    socket.on("attendanceMarked", (data) => {
        // Emit to everyone in that session (faculty dashboard)
        io.to(data.sessionId).emit("liveUpdate", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Start Server
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
