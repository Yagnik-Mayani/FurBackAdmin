const mongoose = require('mongoose');
const { isBuffer } = require('util');

// Define the schema
const loginSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    default: 'admin', // Static username
    immutable: true,  // Prevent further modification
  },
  password: {
    type: String,
    required: true,
  }
});

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  }
});

const offerSchema = new mongoose.Schema({
  offerName: {
    type: String,
    required: true,
  },
  offerDiscount: {
    type: Number, // Assuming it's a percentage like 10 or 20
    required: true,
    min: 0,
    max: 100
  },
  offerDescription: {
    type: String,
    required: false,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  }
});

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  productPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  productQty: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  productOffer: {
    type: String,
    trim: true,
    default: "",
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  productImage: {
    data: Buffer,
    contentType: String, // You can store the URL or path to the image
  },
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
});

// Create and export the model
const Login = mongoose.model('Login', loginSchema);
const Category = mongoose.model('Category', categorySchema);
const Offer = mongoose.model('Offer', offerSchema);
const Product = mongoose.model('Product', productSchema);
const Profile=mongoose.model('Profile',userSchema);

module.exports = {
  Login,
  Category,
  Offer,
  Product,
  Profile
};
