import mongoose from 'mongoose';

const marketSchema = new mongoose.Schema({
    marketName: { type: String, required: true },
    marketType: { type: String, default: 'main' },
    startingTime: { type: String, default: '' },
    closingTime: { type: String, default: '' },
    betClosureTime: { type: Number, default: 300 },
    openingNumber: { type: String, default: null },
    closingNumber: { type: String, default: null },
    displayResult: { type: String, default: '***-**-***' },
    status: { type: String, default: 'open' },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Market', marketSchema);
