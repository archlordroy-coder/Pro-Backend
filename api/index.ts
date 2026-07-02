import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

// Configuration Firebase Admin (Requires service account JSON)
// Assumes GOOGLE_APPLICATION_CREDENTIALS points to the service account JSON file
initializeApp();

const auth = getAuth();
const db = getFirestore();
const app = express();

app.use(cors({ origin: 'https://proinformatique.dev' }));
app.use(express.json());

// Middleware d'authentification
const authenticate = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
        await auth.verifyIdToken(token);
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

// Racine de l'API
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Pro Informatique API is up and running' });
});

// Appliquer l'authentification aux routes protégées
app.use('/api/services', authenticate);
app.use('/api/products', authenticate);
app.use('/api/orders', authenticate);

// --- Services ---
app.get('/api/services', async (req, res) => {
    try {
        const servicesSnapshot = await db.collection('services').get();
        const servicesList = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(servicesList);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});

app.post('/api/services', async (req, res) => {
    try {
        const newService = req.body;
        const docRef = await db.collection('services').add(newService);
        res.status(201).json({ id: docRef.id, message: 'Service created successfully' });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ error: 'Failed to add service' });
    }
});

// --- Products ---
app.get('/api/products', async (req, res) => {
    try {
        const productsSnapshot = await db.collection('products').get();
        const productsList = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(productsList);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = req.body;
        const docRef = await db.collection('products').add(newProduct);
        res.status(201).json({ id: docRef.id, message: 'Product created successfully' });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// --- Orders ---
app.get('/api/orders', async (req, res) => {
    try {
        const ordersSnapshot = await db.collection('orders').get();
        const ordersList = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(ordersList);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = req.body;
        const docRef = await db.collection('orders').add(newOrder);
        res.status(201).json({ id: docRef.id, message: 'Order created successfully' });
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ error: 'Failed to add order' });
    }
});

export default app;
