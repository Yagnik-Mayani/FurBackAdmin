const mongoose =require('mongoose');

const deliveryInfoSchema = new mongoose.Schema({
    country: String,
    firstName: String,
    lastName: String,
    address: String,
    city: String,
    state: String,
    phone: String
});

const itemSchema = new mongoose.Schema({
    productId: String,     // or ObjectId if referencing another collection
    name: String,
    quantity: Number,
    price: Number
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    items: [itemSchema],
    total: {
        type: Number,
        required: true
    },
    deliveryInfo: deliveryInfoSchema,
    paymentMethod: {
        type: String,
        enum: ['Cash On Delivery', 'Online Payment'],
        default: 'Cash On Delivery'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = { orderSchema };