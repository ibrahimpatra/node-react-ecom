// Full-Stack Application Integrating Task Manager, E-commerce, and Gallery

// Backend: Node.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://your-firebase-project.firebaseio.com',
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Firestore Database Reference
const db = admin.firestore();

// User Authentication Middleware

const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract the token after "Bearer"
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    jwt.verify(token, 'secret_key', (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });

        // Extracting email and uid from the decoded token
        if (decoded && decoded.email && decoded.uid) {
            req.user = {
                email: decoded.email,
                uid: decoded.uid,
            };
            next();
        } else {
            return res.status(400).json({ message: 'Invalid token structure' });
        }
    });
};

module.exports = authenticate;



app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
        });

        // Add isAdmin flag to Firestore users collection
        await db.collection('users').doc(userRecord.uid).set({
            email,
            isAdmin: false, // Default to false
        });

        res.json({ uid: userRecord.uid });
    } catch (error) {
        let errorMessage = 'An error occurred during registration';
        if (error.code === 'auth/email-already-exists') {
            errorMessage = 'Email is already registered';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak';
        }

        res.status(400).json({ message: errorMessage });
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        if (!userRecord) {
            return res.status(404).json({ message: 'User not found' });
        }

        const token = jwt.sign({ email: userRecord.email, uid: userRecord.uid }, 'secret_key', { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        let errorMessage = 'Login failed';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'User not found';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Invalid password';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email address';
        }

        res.status(401).json({ message: errorMessage });
    }
});


// Task Manager Endpoints
app.get('/tasks', authenticate, async (req, res) => {
    try {
        const snapshot = await db.collection('tasks').where('userId', '==', req.user.uid).get();
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tasks' });
    }
});

app.post('/tasks', authenticate, async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Task title is required' });
        }

        const task = {
            title,
            userId: req.user.uid,
            username: req.user.email.split('@')[0], // Using email prefix as username
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('tasks').add(task);
        res.json({ id: docRef.id, ...task });
    } catch (error) {
        res.status(500).json({ message: 'Failed to create task' });
    }
});

app.put('/tasks/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ message: 'Task title is required' });
        }

        const taskDoc = db.collection('tasks').doc(id);
        const task = await taskDoc.get();

        if (!task.exists || task.data().userId !== req.user.uid) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await taskDoc.update({ title });
        res.json({ id, title });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update task' });
    }
});


app.delete('/tasks/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const taskDoc = db.collection('tasks').doc(id);
        const task = await taskDoc.get();

        if (!task.exists || task.data().userId !== req.user.uid) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await taskDoc.delete();
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete task' });
    }
});

// E-commerce Endpoints
// E-commerce: Brand and Category APIs

// Fetch all brands
app.get('/brands', async (req, res) => {
    try {
        const snapshot = await db.collection('brands').get();
        const brands = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(brands);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new brand
app.post('/brands', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Brand name is required' });
        }

        const brand = { name };
        const docRef = await db.collection('brands').add(brand);
        res.json({ id: docRef.id, ...brand });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch all categories
app.get('/categories', async (req, res) => {
    try {
        const snapshot = await db.collection('categories').get();
        const categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new category
app.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Category name is required' });
        }

        const category = { name };
        const docRef = await db.collection('categories').add(category);
        res.json({ id: docRef.id, ...category });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new product with linked brand and category
app.post('/products', authenticate, async (req, res) => {
    try {
        const { name, description, price, brandId, categoryId } = req.body;

        if (!name || !description || !price || !brandId || !categoryId) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const product = {
            name,
            description,
            price,
            brandId,
            categoryId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('products').add(product);
        res.json({ id: docRef.id, ...product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products', async (req, res) => {
    try {
        const snapshot = await db.collection('products').get();
        const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const doc = await db.collection('products').doc(req.params.id).get();
        if (!doc.exists) return res.status(404).json({ message: 'Product not found' });
        res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = req.body;

        await db.collection('products').doc(id).update(updatedProduct);
        res.json({ id, ...updatedProduct });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('products').doc(id).delete();
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add a product to the cart
app.post('/cart', authenticate, async (req, res) => {
    const { productId } = req.body;
    const { uid } = req.user;

    if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
    }

    try {
        const cartRef = db.collection('carts').doc(uid);
        const cartDoc = await cartRef.get();

        if (!cartDoc.exists) {
            await cartRef.set({ products: [productId] });
        } else {
            const { products } = cartDoc.data();
            if (!products.includes(productId)) {
                await cartRef.update({ products: [...products, productId] });
            }
        }

        res.json({ message: 'Product added to cart' });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Failed to add product to cart' });
    }
});

// Get products in the cart
app.get('/cart', authenticate, async (req, res) => {
    const { uid } = req.user;

    try {
        const cartRef = db.collection('carts').doc(uid);
        const cartDoc = await cartRef.get();

        if (!cartDoc.exists) {
            return res.json({ products: [] });
        }

        const { products } = cartDoc.data();
        res.json({ products });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Failed to fetch cart' });
    }
});

// Start Server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));
