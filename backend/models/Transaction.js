import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    type: { type: String, required: true }, // 'credit' or 'debit'
    playerId: { type: String, required: true },
    playerName: { type: String, default: '' },
    bookieId: { type: String, default: '' },
    amount: { type: Number, required: true },
    prevBalance: { type: Number, default: 0 },
    newBalance: { type: Number, default: 0 },
    note: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Transaction', transactionSchema);
