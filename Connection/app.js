const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const { Login, Category, Offer, Product, Profile } = require('../UserSchema/schema'); // Use the correct schema file
const { orderSchema } = require('../ClientSchema/schema');
const app = express();
const PORT = 3000;
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Enable CORS
app.use(cors()); // Enable all origins (you can customize it if needed)
app.use(bodyParser.json());

const storage = multer.memoryStorage(); // or use diskStorage if you want to save to filesystem
const upload = multer({ storage });

const MONGO_URI = "mongodb+srv://Yagnik:M.y.k.@cluster0.lqrel0o.mongodb.net/adminDB?retryWrites=true&w=majority&appName=Cluster0"
// MongoDB Connection
mongoose.connect(MONGO_URI).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

const clientDB = mongoose.createConnection('mongodb+srv://Yagnik:M.y.k.@cluster0.lqrel0o.mongodb.net/clientDB?retryWrites=true&w=majority&appName=Cluster0');

clientDB.on('connected', () => {
    console.log('Connected to adminDB');
});

const Order = clientDB.model('Order', orderSchema, 'orders');

// Route to set admin once or authenticate
app.post('/admin', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingAdmin = await Login.findOne({});

    if (existingAdmin) {
      if (existingAdmin.username === username && existingAdmin.password === password) {
        return res.status(200).json({ message: 'Authenticated successfully' });
      } else {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
    }

    const newAdmin = new Login({ username, password });
    await newAdmin.save();
    return res.status(201).json({ message: 'Admin user created successfully' });

  } catch (error) {
    console.error("Server error:", error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//Add Category
app.post('/api/category', async (req, res) => {
  const { categoryName } = req.body;

  try {
    if (!categoryName) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if the category already exists
    const existing = await Category.findOne({ categoryName });

    if (existing) {
      return res.status(409).json({ message: 'Category already exists' });
    }

    // Save new category
    const newCategory = new Category({ categoryName });
    await newCategory.save();

    return res.status(201).json({ message: 'Category added successfully' });

  } catch (error) {
    console.error("Error saving category:", error);
    return res.status(500).json({ message: 'Server error' });
  }
});

//Get Category
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE Category by ID
app.delete('/api/category/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting category' });
  }
});

// UPDATE Category by ID
app.put('/api/category/:id', async (req, res) => {
  const { categoryName } = req.body;
  try {
    await Category.findByIdAndUpdate(req.params.id, { categoryName });
    res.json({ message: 'Category updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating category' });
  }
});

//Add Offer
app.post('/api/offers', async (req, res) => {
  try {
    const newOffer = new Offer(req.body);
    await newOffer.save();
    res.status(201).json({ message: "Offer created successfully" });
  } catch (err) {
    console.error("Offer creation error:", err);
    res.status(400).json({ message: err.message });
  }
});

// GET All Offers
app.get('/api/offers', async (req, res) => {
  try {
    const offers = await Offer.find();
    res.json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE Offer by ID
app.delete('/api/offer/:id', async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Offer deleted' });
  } catch (err) {
    console.error('Error deleting offer:', err);
    res.status(500).json({ message: 'Error deleting offer' });
  }
});

// UPDATE Offer by ID
app.put('/api/offer/:id', async (req, res) => {
  const { offerName, offerDiscount, offerDescription, startDate, endDate } = req.body;
  try {
    await Offer.findByIdAndUpdate(req.params.id, {
      offerName,
      offerDiscount,
      offerDescription,
      startDate,
      endDate
    });
    res.json({ message: 'Offer updated' });
  } catch (err) {
    console.error('Error updating offer:', err);
    res.status(500).json({ message: 'Error updating offer' });
  }
});

//Add Product
app.post('/api/products', upload.single('productImage'), async (req, res) => {
  try {
    const {
      productName,
      productPrice,
      productQty,
      category,
      productOffer,
      description
    } = req.body;

    const newProduct = new Product({
      productName,
      productPrice,
      productQty,
      category,
      productOffer,
      description,
      productImage: req.file
        ? {
          data: req.file.buffer,
          contentType: req.file.mimetype
        }
        : null
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully" });
  } catch (err) {
    console.error("Product creation error:", err);
    res.status(400).json({ message: err.message });
  }
});


//Get Product
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find();
    const updatedProducts = products.map((product) => {
      return {
        ...product._doc,
        productImage: product.productImage?.data
          ? `data:${product.productImage.contentType};base64,${product.productImage.data.toString("base64")}`
          : null,
      };
    });
    res.json(updatedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
});


//Delete Product
app.delete('/api/product/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

//Update Product
app.put('/api/product/:id', upload.single('productImage'), async (req, res) => {
  const { productName, productPrice, productQty, category, productOffer, description } = req.body;
  let productImage;

  // Check if a new image is uploaded
  if (req.file) {
    productImage = {
      data: req.file.buffer,
      contentType: req.file.mimetype
    };
  }

  try {
    const updateData = {
      productName,
      productPrice,
      productQty,
      category,
      productOffer,
      description,
      productImage
    };

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // Convert productImage to base64 format if it exists
    const productWithImage = {
      ...updatedProduct._doc,
      productImage: updatedProduct.productImage
        ? `data:${updatedProduct.productImage.contentType};base64,${updatedProduct.productImage.data.toString("base64")}`
        : null
    };

    res.json(productWithImage);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ message: 'Error updating product' });
  }
});

app.get("/api/user", async (req, res) => {
  try {
    const user = await Profile.findOne(); // Just for testing
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ username: user.username, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error });
  }
});

app.put("/api/user/update", async (req, res) => {
  const { username, email, password } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required for update" });
  }

  try {
    // Check if the user exists by email
    let user = await Profile.findOne({ email });

    if (!user) {
      // If the user is not found, create a new one
      user = new Profile({
        username,
        email,
        password,
      });

      await user.save();
      return res.status(201).json({ message: "User created successfully", user });
    }

    // If the user exists, update the existing user
    user.username = username || user.username;
    user.email = email || user.email;

    if (password) {
      user.password = password;

      // Update the password in the Login collection as well
      const admin = await Login.findOne({ username: user.username });
      if (admin) {
        admin.password = password;
        await admin.save();
      }
    }

    // If the username has changed, also update the username in the Login collection
    if (username && username !== user.username) {
      const admin = await Login.findOne({ username: user.username });
      if (admin) {
        admin.username = username; // Update username in Login collection
        await admin.save();
      }
    }

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Update failed", error });
  }
});

app.get('/api/confirm', async (req, res) => {
  try {
    const orders = await Order.find({}, {
      userId: 1,
      'deliveryInfo.address': 1,
      'deliveryInfo.phone': 1,
      paymentMethod: 1,
      total: 1,
      createdAt: 1
    });

    res.status(200).json(orders);
  } catch (err) {
    console.error('Error retrieving orders:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
