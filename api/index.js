"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const app_1 = require("firebase/app");
const firestore_1 = require("firebase/firestore");
dotenv_1.default.config();
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
const appFirebase = (0, app_1.initializeApp)(firebaseConfig);
const db = (0, firestore_1.getFirestore)(appFirebase);
const app = (0, express_1.default)();
app.use(express_1.default.json());
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
        const servicesCol = (0, firestore_1.collection)(db, 'services');
        const servicesSnapshot = await (0, firestore_1.getDocs)(servicesCol);
        const servicesList = servicesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(servicesList);
    }
    catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ error: 'Failed to fetch services' });
    }
});
app.post('/api/services', async (req, res) => {
    try {
        const newService = req.body;
        const servicesCol = (0, firestore_1.collection)(db, 'services');
        const docRef = await (0, firestore_1.addDoc)(servicesCol, newService);
        res.status(201).json({ id: docRef.id, message: 'Service created successfully' });
    }
    catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ error: 'Failed to add service' });
    }
});
// --- Products ---
app.get('/api/products', async (req, res) => {
    try {
        const productsCol = (0, firestore_1.collection)(db, 'products');
        const productsSnapshot = await (0, firestore_1.getDocs)(productsCol);
        const productsList = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(productsList);
    }
    catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = req.body;
        const productsCol = (0, firestore_1.collection)(db, 'products');
        const docRef = await (0, firestore_1.addDoc)(productsCol, newProduct);
        res.status(201).json({ id: docRef.id, message: 'Product created successfully' });
    }
    catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});
// --- Orders ---
// GET /api/orders
app.get('/api/orders', async (req, res) => {
    try {
        const ordersCol = (0, firestore_1.collection)(db, 'orders');
        const ordersSnapshot = await (0, firestore_1.getDocs)(ordersCol);
        const ordersList = ordersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(ordersList);
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
// POST /api/orders
app.post('/api/orders', async (req, res) => {
    try {
        const newOrder = req.body;
        const ordersCol = (0, firestore_1.collection)(db, 'orders');
        const docRef = await (0, firestore_1.addDoc)(ordersCol, newOrder);
        res.status(201).json({ id: docRef.id, message: 'Order created successfully' });
    }
    catch (error) {
        console.error('Error adding order:', error);
        res.status(500).json({ error: 'Failed to add order' });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map