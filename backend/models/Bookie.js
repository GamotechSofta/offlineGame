import mongoose from 'mongoose';

const bookieSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    name: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    status: { type: String, default: 'active' },
}, { timestamps: true });

export default mongoose.model('Bookie', bookieSchema);
