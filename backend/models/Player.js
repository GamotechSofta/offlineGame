import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema({
    bookieId: { type: String, default: null },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, default: '' },
    pin: { type: String, default: '' },
    balance: { type: Number, default: 0 },
    status: { type: String, default: 'active' },
}, { timestamps: true });

export default mongoose.model('Player', playerSchema);
