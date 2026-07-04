import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

// Configuration Firebase Admin
let adminApp;
if (getApps().length > 0) {
  adminApp = getApp();
} else {
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (serviceAccountJson) {
    const serviceAccount = JSON.parse(serviceAccountJson);
    adminApp = initializeApp({
      credential: require('firebase-admin').credential.cert(serviceAccount),
    });
  } else {
    // Utilise les identifiants par défaut (GOOGLE_APPLICATION_CREDENTIALS)
    adminApp = initializeApp();
  }
}

const db = getFirestore(adminApp);
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

// Racine de l'API
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Pro Informatique API is up and running' });
});

// --- Services ---
app.get('/services', async (req, res) => {
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

app.post('/services', async (req, res) => {
    try {
        const newService = req.body;
        const docRef = await db.collection('services').doc(newService.id);
        await docRef.set(newService);
        res.status(201).json({ id: newService.id, message: 'Service created successfully' });
    } catch (error) {
        console.error('Error adding service:', error);
        res.status(500).json({ error: 'Failed to add service' });
    }
});

app.put('/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedService = req.body;
        await db.collection('services').doc(id).update(updatedService);
        res.status(200).json({ message: 'Service updated successfully' });
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ error: 'Failed to update service' });
    }
});

app.delete('/services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('services').doc(id).delete();
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        console.error('Error deleting service:', error);
        res.status(500).json({ error: 'Failed to delete service' });
    }
});

// --- Products ---
app.get('/products', async (req, res) => {
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

app.post('/products', async (req, res) => {
    try {
        const newProduct = req.body;
        const docRef = await db.collection('products').doc(newProduct.id);
        await docRef.set(newProduct);
        res.status(201).json({ id: newProduct.id, message: 'Product created successfully' });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = req.body;
        await db.collection('products').doc(id).update(updatedProduct);
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('products').doc(id).delete();
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// --- Reviews ---
app.get('/reviews', async (req, res) => {
    try {
        const { product_id } = req.query;
        let reviewsSnapshot;
        if (product_id) {
            reviewsSnapshot = await db.collection('reviews').where('product_id', '==', product_id).get();
        } else {
            reviewsSnapshot = await db.collection('reviews').get();
        }
        const reviewsList = reviewsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(reviewsList);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews' });
    }
});

app.post('/reviews', async (req, res) => {
    try {
        const newReview = req.body;
        const docRef = await db.collection('reviews').doc(newReview.id);
        await docRef.set(newReview);
        res.status(201).json({ id: newReview.id, message: 'Review created successfully' });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
});

app.delete('/reviews/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('reviews').doc(id).delete();
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review' });
    }
});

// --- Cyber Tickets ---
app.get('/cyber-tickets', async (req, res) => {
    try {
        const ticketsSnapshot = await db.collection('cyber_tickets').get();
        const ticketsList = ticketsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(ticketsList);
    } catch (error) {
        console.error('Error fetching cyber tickets:', error);
        res.status(500).json({ error: 'Failed to fetch cyber tickets' });
    }
});

app.post('/cyber-tickets', async (req, res) => {
    try {
        const newTicket = req.body;
        const docRef = await db.collection('cyber_tickets').doc(newTicket.id);
        await docRef.set(newTicket);
        res.status(201).json({ id: newTicket.id, message: 'Cyber ticket created successfully' });
    } catch (error) {
        console.error('Error adding cyber ticket:', error);
        res.status(500).json({ error: 'Failed to add cyber ticket' });
    }
});

app.put('/cyber-tickets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTicket = req.body;
        await db.collection('cyber_tickets').doc(id).update(updatedTicket);
        res.status(200).json({ message: 'Cyber ticket updated successfully' });
    } catch (error) {
        console.error('Error updating cyber ticket:', error);
        res.status(500).json({ error: 'Failed to update cyber ticket' });
    }
});

app.delete('/cyber-tickets/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('cyber_tickets').doc(id).delete();
        res.status(200).json({ message: 'Cyber ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting cyber ticket:', error);
        res.status(500).json({ error: 'Failed to delete cyber ticket' });
    }
});

// --- Computers ---
app.get('/computers', async (req, res) => {
    try {
        const computersSnapshot = await db.collection('computers').get();
        const computersList = computersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(computersList);
    } catch (error) {
        console.error('Error fetching computers:', error);
        res.status(500).json({ error: 'Failed to fetch computers' });
    }
});

app.put('/computers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedComputer = req.body;
        await db.collection('computers').doc(id).update(updatedComputer);
        res.status(200).json({ message: 'Computer updated successfully' });
    } catch (error) {
        console.error('Error updating computer:', error);
        res.status(500).json({ error: 'Failed to update computer' });
    }
});

// --- Promotions ---
app.get('/promotions', async (req, res) => {
    try {
        const promotionsSnapshot = await db.collection('promotions').get();
        const promotionsList = promotionsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(promotionsList);
    } catch (error) {
        console.error('Error fetching promotions:', error);
        res.status(500).json({ error: 'Failed to fetch promotions' });
    }
});

app.post('/promotions', async (req, res) => {
    try {
        const newPromotion = req.body;
        const docRef = await db.collection('promotions').doc(newPromotion.id);
        await docRef.set(newPromotion);
        res.status(201).json({ id: newPromotion.id, message: 'Promotion created successfully' });
    } catch (error) {
        console.error('Error adding promotion:', error);
        res.status(500).json({ error: 'Failed to add promotion' });
    }
});

app.put('/promotions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPromotion = req.body;
        await db.collection('promotions').doc(id).update(updatedPromotion);
        res.status(200).json({ message: 'Promotion updated successfully' });
    } catch (error) {
        console.error('Error updating promotion:', error);
        res.status(500).json({ error: 'Failed to update promotion' });
    }
});

app.delete('/promotions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('promotions').doc(id).delete();
        res.status(200).json({ message: 'Promotion deleted successfully' });
    } catch (error) {
        console.error('Error deleting promotion:', error);
        res.status(500).json({ error: 'Failed to delete promotion' });
    }
});

// --- Authentication ---

app.post('/auth/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password and name are required' });
        }

        // Check if user already exists
        const existingUser = await db.collection('users').where('email', '==', email).get();
        if (!existingUser.empty) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Create user
        const userRef = await db.collection('users').doc();
        await userRef.set({
            email,
            password, // In production, hash this!
            name,
            createdAt: new Date().toISOString(),
            role: 'user',
        });

        res.status(201).json({ 
            message: 'User created successfully',
            userId: userRef.id 
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const userSnapshot = await db.collection('users').where('email', '==', email).get();
        if (userSnapshot.empty) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        // Check password (in production, use bcrypt)
        if (userData.password !== password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({ 
            message: 'Login successful',
            user: {
                id: userDoc.id,
                email: userData.email,
                name: userData.name,
                role: userData.role,
            },
            token: 'simple-token-' + userDoc.id // In production, use JWT
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// --- Users Management (Admin) ---

app.get('/users', async (req, res) => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const usersList = usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.status(200).json(usersList);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('users').doc(id).delete();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

app.put('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        await db.collection('users').doc(id).update({ role });
        res.status(200).json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Failed to update user role' });
    }
});

export default app;
