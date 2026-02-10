import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'super_admin' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    status: { type: String, default: 'active' },
}, { timestamps: true });

export default mongoose.model('Admin', adminSchema);
