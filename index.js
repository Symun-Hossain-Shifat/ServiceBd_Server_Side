require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB client
const client = new MongoClient(process.env.MONGODB_URL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

async function connectToMongoDB() {
    await client.connect();
    await client.db('admin').command({ ping: 1 });
    console.log('You successfully connected to MongoDB!');
}

async function disconnectFromMongoDB() {
    await client.close();
    console.log('MongoDB connection closed.');
}

// Routes
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// 404 handler
app.use((req, res) => {
    res.status(404).send({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send({ message: 'Internal server error' });
});

// Start server only after the database connects
async function start() {
    try {
        await connectToMongoDB();
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', async () => {
    await disconnectFromMongoDB();
    process.exit(0);
});

start();