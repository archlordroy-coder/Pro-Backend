import express from 'express';
import dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';

dotenv.config();

// Firebase configuration provided by user
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase Client
const appFirebase = initializeApp(firebaseConfig);
const db = getFirestore(appFirebase);

const app = express();
app.use(express.json());

// Racine de l'API
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Pro Informatique API is up and running' });
});

// Basic Route to test Firestore connection
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'API is running and connected to Firestore (Client SDK)' });
});

// --- Services ---
app.get('/api/services', async (req, res) => {
    try {
        const servicesCol = collection(db, 'services');
        const servicesSnapshot = await getDocs(servicesCol);
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
        const servicesCol = collection(db, 'services');
        const docRef = await addDoc(servicesCol, newService);
        res.status(201).json({ id: docRef.id, message: 'Service created successfully' });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ error: 'Failed to add service' });
    }
});

// --- Products ---
app.get('/api/products', async (req, res) => {
    try {
        const productsCol = collection(db, 'products');
        const productsSnapshot = await getDocs(productsCol);
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
        const productsCol = collection(db, 'products');
        const docRef = await addDoc(productsCol, newProduct);
        res.status(201).json({ id: docRef.id, message: 'Product created successfully' });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// --- Orders ---
// GET /api/orders
app.get('/api/orders', async (req, res) => {
    try {
        const ordersCol = collection(db, 'orders');
        const ordersSnapshot = await getDocs(ordersCol);
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

// POST /api/orders
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = req.body;
        const ordersCol = collection(db, 'orders');
        const docRef = await addDoc(ordersCol, newOrder);
        res.status(201).json({ id: docRef.id, message: 'Order created successfully' });
    } catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ error: 'Failed to add order' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
export default app;
