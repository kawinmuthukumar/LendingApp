// Importing dependencies
import mongoose from "mongoose";
import express from "express";
import { v4 as uuid } from "uuid";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/scripts', express.static(path.join(__dirname, 'scripts')));
app.use('/styles', express.static(path.join(__dirname, 'styles')));

// MongoDB URI
const dbURI = "mongodb+srv://kawin:saipranavika17@kawin.lozfqbm.mongodb.net/LendingDB?retryWrites=true&w=majority";

// Connect to MongoDB
const startServer = async () => {
    try {
        await mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to the database successfully");

        // Start the server
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
            console.log("Access the application at: http://localhost:3000");
        });
    } catch (err) {
        console.error("Database connection failed:", err);
        process.exit(1); // Exit the application on failure
    }
};

// Define User Schema
const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Define Item Schema
const itemSchema = new mongoose.Schema({
    id: { type: String, default: uuid, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    ownerId: { type: String, required: true, ref: 'User' },
    status: { type: String, enum: ['available', 'borrowed'], default: 'available' }
});
const Item = mongoose.model("Item", itemSchema);

// Define Transaction Schema
const transactionSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    itemId: { type: String, required: true, ref: 'Item' },
    lenderId: { type: String, required: true, ref: 'User' },
    borrowerId: { type: String, required: true, ref: 'User' },
    status: { type: String, default: "Pending" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    borrowDate: { type: Date }
});
const Transaction = mongoose.model("Transaction", transactionSchema);

// API Routes

// User Routes
// Register User
app.post("/api/register", async (req, res) => {
    try {
        console.log('Received registration request:', req.body);
        const { name, email, password, id } = req.body;
        
        if (!name || !email || !password) {
            console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
            return res.status(400).json({ message: "All fields are required" });
        }

        console.log('Checking for existing user with email:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists with email:', email);
            return res.status(409).json({ message: "Email already in use" });
        }

        // Use provided id or generate new one
        const userId = id || uuid();
        console.log('Creating new user with ID:', userId);
        const newUser = new User({ id: userId, name, email, password });
        
        try {
            const savedUser = await newUser.save();
            console.log('User saved successfully:', savedUser);
            res.status(201).json({ message: "User registered successfully", data: savedUser });
        } catch (saveError) {
            console.error('Error saving user to database:', saveError);
            throw saveError;
        }
    } catch (err) {
        console.error("Error registering user:", err);
        console.error("Full error details:", {
            message: err.message,
            stack: err.stack,
            name: err.name
        });
        res.status(500).json({ message: "Failed to register user: " + err.message });
    }
});

// Login User
app.post("/api/users/login", async (req, res) => {
    try {
        console.log('Login attempt received:', req.body);
        const { email, password } = req.body;
        
        if (!email || !password) {
            console.log('Missing email or password');
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        console.log('User found:', user ? 'Yes' : 'No');

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        console.log('Login successful for user:', user.email);
        res.json({ 
            message: "Login successful", 
            userId: user.id,
            name: user.name,
            email: user.email
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: "Error logging in", error: err.message });
    }
});

// Get All Users
app.get("/api/users", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

// Item Routes
// Add Item
app.post("/api/items", async (req, res) => {
    try {
        const { name, description, ownerId } = req.body;
        
        if (!name || !description || !ownerId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Verify that the owner exists
        const owner = await User.findOne({ id: ownerId });
        if (!owner) {
            return res.status(404).json({ message: "Owner not found" });
        }

        const newItem = new Item({
            name,
            description,
            ownerId: owner.id,
            status: 'available'
        });

        const savedItem = await newItem.save();
        console.log('Created item:', savedItem);
        
        res.status(201).json({ 
            message: "Item created successfully", 
            item: {
                ...savedItem.toObject(),
                owner: {
                    name: owner.name,
                    email: owner.email
                }
            }
        });
    } catch (err) {
        console.error('Error creating item:', err);
        res.status(500).json({ message: "Failed to create item", error: err.message });
    }
});

// Get all items with owner details
app.get("/api/items", async (req, res) => {
    try {
        console.log('Fetching items...');
        const items = await Item.find().lean();
        console.log('Found items:', items);
        
        if (!items.length) {
            return res.json([]);
        }

        // Get all unique owner IDs
        const ownerIds = [...new Set(items.map(item => item.ownerId))];
        console.log('Owner IDs:', ownerIds);
        
        // Fetch all owners in one query
        const owners = await User.find({ id: { $in: ownerIds } });
        console.log('Found owners:', owners);
        
        // Create a map of owner IDs to owner details
        const ownerMap = owners.reduce((map, owner) => {
            map[owner.id] = {
                name: owner.name,
                email: owner.email
            };
            return map;
        }, {});
        
        // Add owner details to each item
        const itemsWithOwners = items.map(item => ({
            ...item,
            _id: item._id.toString(),
            owner: ownerMap[item.ownerId] || { 
                name: 'Unknown User',
                email: ''
            }
        }));

        console.log('Sending items with owners:', itemsWithOwners);
        res.json(itemsWithOwners);
    } catch (err) {
        console.error('Error fetching items:', err);
        res.status(500).json({ message: "Error fetching items", error: err.message });
    }
});

// Update Item Availability
app.put("/api/items/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { available } = req.body;
        
        if (available === undefined) {
            return res.status(400).json({ message: "Available status is required" });
        }

        const updatedItem = await Item.findOneAndUpdate(
            { id },
            { available },
            { new: true }
        );

        if (!updatedItem) {
            return res.status(404).json({ message: "Item not found" });
        }

        res.status(200).json({ message: "Item updated successfully", data: updatedItem });
    } catch (err) {
        console.error("Error updating item:", err);
        res.status(500).json({ message: "Failed to update item" });
    }
});

// Transaction Routes
// Create Transaction
app.post("/api/transactions", async (req, res) => {
    try {
        const { itemId, borrowerId } = req.body;
        
        // Find the item first
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Check if user is trying to borrow their own item
        if (item.ownerId === borrowerId) {
            return res.status(400).json({ 
                message: "You cannot borrow your own item" 
            });
        }

        // Check if item is already borrowed
        if (item.status === 'borrowed') {
            return res.status(400).json({ 
                message: "This item is already borrowed" 
            });
        }

        // Create new transaction
        const transaction = new Transaction({
            itemId,
            borrowerId,
            lenderId: item.ownerId,
            status: 'active',
            borrowDate: new Date()
        });

        await transaction.save();

        // Update item status
        item.status = 'borrowed';
        await item.save();

        res.status(201).json({ 
            message: "Item borrowed successfully", 
            transaction 
        });
    } catch (err) {
        console.error('Transaction error:', err);
        res.status(500).json({ 
            message: "Error creating transaction", 
            error: err.message 
        });
    }
});

// Get All Transactions
app.get("/api/transactions", async (req, res) => {
    try {
        const transactions = await Transaction.find();
        res.status(200).json(transactions);
    } catch (err) {
        console.error("Error fetching transactions:", err);
        res.status(500).json({ message: "Failed to fetch transactions" });
    }
});

// Update Transaction Status
app.put("/api/transactions/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const updatedTransaction = await Transaction.findOneAndUpdate(
            { id },
            { status },
            { new: true }
        );

        if (!updatedTransaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        res.status(200).json({ message: "Transaction updated successfully", data: updatedTransaction });
    } catch (err) {
        console.error("Error updating transaction:", err);
        res.status(500).json({ message: "Failed to update transaction" });
    }
});

// Cancel Transaction
app.post("/api/transactions/:id/cancel", async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find and update transaction status to cancelled
        const transaction = await Transaction.findOneAndUpdate(
            { id },
            { status: 'cancelled' },
            { new: true }
        );

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        // Update item availability back to true
        await Item.findOneAndUpdate(
            { id: transaction.itemId },
            { status: 'available' }
        );

        res.status(200).json({ 
            message: "Transaction cancelled successfully", 
            data: transaction 
        });
    } catch (err) {
        console.error("Error cancelling transaction:", err);
        res.status(500).json({ message: "Failed to cancel transaction" });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
startServer();