import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// ─── Models ──────────────────────────────────────────────────
import Admin from './models/Admin.js';
import Bookie from './models/Bookie.js';
import Player from './models/Player.js';
import Market from './models/Market.js';
import Bet from './models/Bet.js';
import Transaction from './models/Transaction.js';
import Rate from './models/Rate.js';

const app = express();
app.use(cors());
app.use(express.json());

// ─── MongoDB Connection ──────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/offline-bookie';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });

// ─── Helpers ─────────────────────────────────────────────────
/** Parse IST time string like "10:30" into today's Date object in IST */
const parseTimeIST = (timeStr) => {
    if (!timeStr) return null;
    const parts = String(timeStr).split(':');
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1] || '0', 10);
    if (!Number.isFinite(h)) return null;
    const now = new Date();
    const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
    const istNow = new Date(utcNow + 330 * 60000);
    istNow.setHours(h, m, 0, 0);
    return istNow;
};

const getNowIST = () => {
    const now = new Date();
    const utcNow = now.getTime() + now.getTimezoneOffset() * 60000;
    return new Date(utcNow + 330 * 60000);
};

// ─── Seed Default Data ───────────────────────────────────────
const seedDefaults = async () => {
    // Seed default admin
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
        await Admin.create({
            username: 'admin',
            password: 'admin123',
            role: 'super_admin',
            email: 'admin@admin.com',
            phone: '9999999999',
            status: 'active',
        });
        console.log('📌 Default admin seeded (admin / admin123)');
    }

    // Seed default rates
    const rateCount = await Rate.countDocuments();
    if (rateCount === 0) {
        await Rate.insertMany([
            { gameType: 'single', rate: 9 },
            { gameType: 'jodi', rate: 90 },
            { gameType: 'singlePatti', rate: 150 },
            { gameType: 'doublePatti', rate: 300 },
            { gameType: 'triplePatti', rate: 900 },
            { gameType: 'halfSangam', rate: 1000 },
            { gameType: 'fullSangam', rate: 10000 },
        ]);
        console.log('📌 Default rates seeded');
    }
};

// ═══════════════════════════════════════════════════════════════
// ─── Admin Auth ───────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username, password });
        if (!admin) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }
        const adminData = admin.toObject();
        delete adminData.password;
        return res.json({ success: true, data: { ...adminData, id: adminData._id } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// ─── Bookie Auth ──────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.post('/api/bookie/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const bookie = await Bookie.findOne({
            password,
            $or: [{ username }, { phone: username }, { name: username }],
        });
        if (!bookie) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        if (bookie.status === 'suspended') {
            return res.status(403).json({ success: false, message: 'Your account has been suspended. Contact admin.' });
        }
        return res.json({
            success: true,
            data: {
                id: bookie._id,
                username: bookie.username,
                name: bookie.name || bookie.username,
                phone: bookie.phone || '',
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// ─── Player Management (Bookie) ──────────────────────────────
// ═══════════════════════════════════════════════════════════════

// GET all players for a bookie
app.get('/api/bookie/players', async (req, res) => {
    try {
        const { bookieId } = req.query;
        if (!bookieId) return res.json({ success: false, message: 'bookieId required' });
        const players = await Player.find({ bookieId }).lean();
        // Map _id to id for frontend compatibility
        const data = players.map((p) => ({ ...p, id: p._id }));
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// CREATE player
app.post('/api/bookie/players', async (req, res) => {
    try {
        const { bookieId, name, phone, password, pin } = req.body;
        if (!bookieId || !name || !phone) {
            return res.json({ success: false, message: 'bookieId, name, and phone are required' });
        }
        const exists = await Player.findOne({ bookieId, phone });
        if (exists) {
            return res.json({ success: false, message: 'Player with this phone already exists' });
        }
        const player = await Player.create({
            bookieId,
            name,
            phone,
            password: password || phone,
            pin: pin || '',
        });
        const data = player.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// UPDATE player details
app.put('/api/bookie/players/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const player = await Player.findById(id);
        if (!player) return res.json({ success: false, message: 'Player not found' });
        const { name, phone, password, pin } = req.body;
        if (name !== undefined) player.name = name.trim();
        if (phone !== undefined) {
            const dup = await Player.findOne({ _id: { $ne: id }, bookieId: player.bookieId, phone });
            if (dup) return res.json({ success: false, message: 'Another player already has this phone' });
            player.phone = phone.trim();
        }
        if (password !== undefined) player.password = password;
        if (pin !== undefined) player.pin = pin;
        await player.save();
        const data = player.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE player
app.delete('/api/bookie/players/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Player.findByIdAndDelete(id);
        if (!result) return res.json({ success: false, message: 'Player not found' });
        return res.json({ success: true, message: 'Player deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// TOGGLE player status (active / suspended)
app.post('/api/bookie/players/:id/toggle-status', async (req, res) => {
    try {
        const { id } = req.params;
        const player = await Player.findById(id);
        if (!player) return res.json({ success: false, message: 'Player not found' });
        player.status = player.status === 'active' ? 'suspended' : 'active';
        await player.save();
        const data = player.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ADD FUNDS
app.post('/api/bookie/players/:id/add-funds', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, note } = req.body;
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            return res.json({ success: false, message: 'Valid amount required' });
        }
        const player = await Player.findById(id);
        if (!player) return res.json({ success: false, message: 'Player not found' });
        const prevBalance = player.balance || 0;
        player.balance = prevBalance + numAmount;
        await player.save();
        // Log transaction
        await Transaction.create({
            type: 'credit',
            playerId: id,
            playerName: player.name,
            bookieId: player.bookieId,
            amount: numAmount,
            prevBalance,
            newBalance: player.balance,
            note: note || 'Fund added by bookie',
        });
        const data = player.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// WITHDRAW / DEDUCT FUNDS
app.post('/api/bookie/players/:id/withdraw-funds', async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, note } = req.body;
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) {
            return res.json({ success: false, message: 'Valid amount required' });
        }
        const player = await Player.findById(id);
        if (!player) return res.json({ success: false, message: 'Player not found' });
        const prevBalance = player.balance || 0;
        if (prevBalance < numAmount) {
            return res.json({ success: false, message: `Insufficient balance. Current: ₹${prevBalance}` });
        }
        player.balance = prevBalance - numAmount;
        await player.save();
        // Log transaction
        await Transaction.create({
            type: 'debit',
            playerId: id,
            playerName: player.name,
            bookieId: player.bookieId,
            amount: numAmount,
            prevBalance,
            newBalance: player.balance,
            note: note || 'Fund withdrawn by bookie',
        });
        const data = player.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Keep old deduct-funds endpoint as alias
app.post('/api/bookie/players/:id/deduct-funds', (req, res) => {
    req.url = req.url.replace('deduct-funds', 'withdraw-funds');
    return app.handle(req, res);
});

// GET transactions for a player
app.get('/api/bookie/players/:id/transactions', async (req, res) => {
    try {
        const { id } = req.params;
        const txns = await Transaction.find({ playerId: id }).sort({ createdAt: -1 }).lean();
        const data = txns.map((t) => ({ ...t, id: t._id }));
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// GET all transactions for a bookie
app.get('/api/bookie/transactions', async (req, res) => {
    try {
        const { bookieId } = req.query;
        if (!bookieId) return res.json({ success: false, message: 'bookieId required' });
        const txns = await Transaction.find({ bookieId }).sort({ createdAt: -1 }).lean();
        const data = txns.map((t) => ({ ...t, id: t._id }));
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// GET bet history for a player
app.get('/api/bookie/players/:id/bets', async (req, res) => {
    try {
        const { id } = req.params;
        const bets = await Bet.find({ userId: id }).sort({ createdAt: -1 }).lean();
        const data = bets.map((b) => ({ ...b, id: b._id }));
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Bookie Change Password ───────────────────────────────────
app.post('/api/bookie/change-password', async (req, res) => {
    try {
        const { bookieId, oldPassword, newPassword } = req.body;
        if (!bookieId || !newPassword) {
            return res.json({ success: false, message: 'Missing required fields' });
        }
        const bookie = await Bookie.findById(bookieId);
        if (!bookie) return res.json({ success: false, message: 'Bookie not found' });
        if (oldPassword && bookie.password !== oldPassword) {
            return res.json({ success: false, message: 'Current password is incorrect' });
        }
        bookie.password = newPassword;
        await bookie.save();
        return res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// ─── Player Login (for frontend users) ───────────────────────
// ═══════════════════════════════════════════════════════════════
app.post('/api/users/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const player = await Player.findOne({ phone });
        if (!player) {
            return res.json({ success: false, message: 'Player not found' });
        }
        if (password && password !== phone && password !== player.password) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }
        return res.json({
            success: true,
            data: {
                id: player._id,
                name: player.name,
                phone: player.phone,
                balance: player.balance || 0,
                wallet: player.balance || 0,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/users/heartbeat', (_req, res) => {
    return res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════
// ─── Markets ─────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/markets/get-markets', async (_req, res) => {
    try {
        const markets = await Market.find({ isDeleted: { $ne: true } }).lean();
        const data = markets.map((m) => ({ ...m, _id: m._id, id: m._id }));
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/markets/create-market', async (req, res) => {
    try {
        const { marketName, marketType, startingTime, closingTime, betClosureTime } = req.body;
        if (!marketName || !closingTime) {
            return res.json({ success: false, message: 'Market name and closing time are required' });
        }
        const market = await Market.create({
            marketName,
            marketType: marketType || 'main',
            startingTime: startingTime || closingTime,
            closingTime,
            betClosureTime: Number(betClosureTime) || 300,
            openingNumber: null,
            closingNumber: null,
            displayResult: '***-**-***',
            isActive: true,
            isDeleted: false,
        });
        const data = market.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/markets/update-market/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const market = await Market.findById(id);
        if (!market) return res.json({ success: false, message: 'Market not found' });
        const { marketName, marketType, startingTime, closingTime, betClosureTime, isActive } = req.body;
        if (marketName !== undefined) market.marketName = marketName;
        if (marketType !== undefined) market.marketType = marketType;
        if (startingTime !== undefined) market.startingTime = startingTime;
        if (closingTime !== undefined) market.closingTime = closingTime;
        if (betClosureTime !== undefined) market.betClosureTime = Number(betClosureTime) || market.betClosureTime;
        if (isActive !== undefined) market.isActive = isActive;
        await market.save();
        const data = market.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/markets/delete-market/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const market = await Market.findById(id);
        if (!market) return res.json({ success: false, message: 'Market not found' });
        market.isDeleted = true;
        market.isActive = false;
        await market.save();
        return res.json({ success: true, message: 'Market deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ─── Market Result Declaration ───────────────────────────────
app.get('/api/markets/preview-declare-open/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { openingNumber } = req.query;
        const market = await Market.findById(id).lean();
        if (!market) return res.json({ success: false, message: 'Market not found' });

        const marketBets = await Bet.find({ marketId: id, betOn: 'open' }).lean();
        const totalBetAmount = marketBets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
        const pattiBets = marketBets.filter((b) => String(b.betNumber) === String(openingNumber));
        const totalBetAmountOnPatti = pattiBets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
        const uniquePlayers = new Set(marketBets.map((b) => b.userId));
        const uniquePlayersPatti = new Set(pattiBets.map((b) => b.userId));

        return res.json({
            success: true,
            data: {
                market: { ...market, id: market._id },
                openingNumber,
                preview: true,
                totalBetAmount,
                totalWinAmount: 0,
                totalBetAmountOnPatti,
                totalWinAmountOnPatti: 0,
                noOfPlayers: uniquePlayers.size,
                totalPlayersBetOnPatti: uniquePlayersPatti.size,
                profit: totalBetAmount,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/markets/declare-open/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { openingNumber } = req.body;
        const market = await Market.findById(id);
        if (!market) return res.json({ success: false, message: 'Market not found' });
        market.openingNumber = openingNumber;
        market.status = 'running';
        const oNum = openingNumber || '***';
        const cNum = market.closingNumber || '***';
        const oDigits = String(oNum).split('').map(Number);
        const oSum = oDigits.reduce((a, b) => a + b, 0) % 10;
        if (cNum === '***') {
            market.displayResult = `${oNum}-${oSum}*-***`;
        } else {
            const cDigits = String(cNum).split('').map(Number);
            const cSum = cDigits.reduce((a, b) => a + b, 0) % 10;
            market.displayResult = `${oNum}-${oSum}${cSum}-${cNum}`;
        }
        await market.save();
        const data = market.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/markets/preview-declare-close/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { closingNumber } = req.query;
        const market = await Market.findById(id).lean();
        if (!market) return res.json({ success: false, message: 'Market not found' });

        const marketBets = await Bet.find({ marketId: id, betOn: 'close' }).lean();
        const totalBetAmount = marketBets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
        const pattiBets = marketBets.filter((b) => String(b.betNumber) === String(closingNumber));
        const totalBetAmountOnPatti = pattiBets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
        const uniquePlayers = new Set(marketBets.map((b) => b.userId));
        const uniquePlayersPatti = new Set(pattiBets.map((b) => b.userId));

        return res.json({
            success: true,
            data: {
                market: { ...market, id: market._id },
                closingNumber,
                preview: true,
                totalBetAmount,
                totalWinAmount: 0,
                totalBetAmountOnPatti,
                totalWinAmountOnPatti: 0,
                noOfPlayers: uniquePlayers.size,
                totalPlayersBetOnPatti: uniquePlayersPatti.size,
                profit: totalBetAmount,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/markets/declare-close/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { closingNumber } = req.body;
        const market = await Market.findById(id);
        if (!market) return res.json({ success: false, message: 'Market not found' });
        market.closingNumber = closingNumber;
        market.status = 'closed';
        const oNum = market.openingNumber || '***';
        const cNum = closingNumber || '***';
        const oDigits = String(oNum).split('').map(Number);
        const cDigits = String(cNum).split('').map(Number);
        const oSum = oDigits.reduce((a, b) => a + b, 0) % 10;
        const cSum = cDigits.reduce((a, b) => a + b, 0) % 10;
        market.displayResult = `${oNum}-${oSum}${cSum}-${cNum}`;
        await market.save();
        const data = market.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/markets/clear-result/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const market = await Market.findById(id);
        if (!market) return res.json({ success: false, message: 'Market not found' });
        market.openingNumber = null;
        market.closingNumber = null;
        market.displayResult = '***-**-***';
        market.status = 'open';
        await market.save();
        const data = market.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/markets/get-market-stats/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const market = await Market.findById(id).lean();
        if (!market) return res.status(404).json({ success: false, message: 'Market not found' });

        const marketBets = await Bet.find({ marketId: id }).lean();
        const totalAmount = marketBets.reduce((s, b) => s + (Number(b.amount) || 0), 0);

        // ── Helpers to classify panna bets by betNumber ──
        const classifyPanna = (num) => {
            if (!/^\d{3}$/.test(num)) return 'singlePatti'; // fallback
            const [a, b, c] = num.split('');
            if (a === b && b === c) return 'triplePatti';
            if (a === b || b === c) return 'doublePatti';
            return 'singlePatti';
        };

        // ── Helper: build breakdown for a set of bets ──
        const buildBreakdown = (bets) => {
            const singleDigit = { digits: {}, totalAmount: 0, totalBets: 0 };
            const jodi = { items: {}, totalAmount: 0, totalBets: 0 };
            const singlePatti = { items: {}, totalAmount: 0, totalBets: 0 };
            const doublePatti = { items: {}, totalAmount: 0, totalBets: 0 };
            const triplePatti = { items: {}, totalAmount: 0, totalBets: 0 };
            const halfSangam = { items: {}, totalAmount: 0, totalBets: 0 };
            const fullSangam = { items: {}, totalAmount: 0, totalBets: 0 };

            const addTo = (bucket, key, amt) => {
                if (!bucket.items) { // singleDigit uses .digits
                    if (!bucket.digits[key]) bucket.digits[key] = { amount: 0, count: 0 };
                    bucket.digits[key].amount += amt;
                    bucket.digits[key].count++;
                } else {
                    if (!bucket.items[key]) bucket.items[key] = { amount: 0, count: 0 };
                    bucket.items[key].amount += amt;
                    bucket.items[key].count++;
                }
                bucket.totalAmount += amt;
                bucket.totalBets++;
            };

            for (const b of bets) {
                const amt = Number(b.amount) || 0;
                const num = String(b.betNumber || '').trim();
                const rawType = (b.betType || '').toLowerCase().replace(/[\s_]/g, '');

                if (rawType === 'single' || rawType === 'singledigit') {
                    addTo(singleDigit, num, amt);
                } else if (rawType === 'jodi') {
                    addTo(jodi, num, amt);
                } else if (rawType === 'panna' || rawType === 'pana') {
                    // Classify panna subtype by the actual bet number
                    const pannaType = classifyPanna(num);
                    if (pannaType === 'triplePatti') addTo(triplePatti, num, amt);
                    else if (pannaType === 'doublePatti') addTo(doublePatti, num, amt);
                    else addTo(singlePatti, num, amt);
                } else if (rawType === 'singlepatti' || rawType === 'singlepana' || rawType === 'singlepanna') {
                    addTo(singlePatti, num, amt);
                } else if (rawType === 'doublepatti' || rawType === 'doublepana' || rawType === 'doublepanna') {
                    addTo(doublePatti, num, amt);
                } else if (rawType === 'triplepatti' || rawType === 'triplepana' || rawType === 'triplepanna') {
                    addTo(triplePatti, num, amt);
                } else if (rawType === 'half-sangam' || rawType === 'halfsangam') {
                    addTo(halfSangam, num, amt);
                } else if (rawType === 'full-sangam' || rawType === 'fullsangam') {
                    addTo(fullSangam, num, amt);
                }
            }

            return { singleDigit, jodi, singlePatti, doublePatti, triplePatti, halfSangam, fullSangam };
        };

        // Build overall + per-session breakdown
        const overall = buildBreakdown(marketBets);
        const openBets = marketBets.filter(b => b.betOn === 'open');
        const closeBets = marketBets.filter(b => b.betOn === 'close');
        const openBreakdown = buildBreakdown(openBets);
        const closeBreakdown = buildBreakdown(closeBets);

        return res.json({
            success: true,
            data: {
                market: { ...market, id: market._id },
                totalBets: marketBets.length,
                totalAmount,
                openBets: openBets.length,
                closeBets: closeBets.length,
                ...overall,
                bySession: {
                    open: {
                        totalBets: openBets.length,
                        totalAmount: openBets.reduce((s, b) => s + (Number(b.amount) || 0), 0),
                        ...openBreakdown,
                    },
                    close: {
                        totalBets: closeBets.length,
                        totalAmount: closeBets.reduce((s, b) => s + (Number(b.amount) || 0), 0),
                        ...closeBreakdown,
                    },
                },
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/markets/get-single-patti-summary/:id', (_req, res) => {
    return res.json({ success: true, data: [] });
});

app.get('/api/markets/winning-bets-preview/:id', (_req, res) => {
    return res.json({ success: true, data: { winningBets: [], totalPayout: 0 } });
});

// ─── Comprehensive Market Analysis (for Bookie) ─────────────
app.get('/api/markets/:id/analysis', async (req, res) => {
    try {
        const { id } = req.params;
        const { bookieId, date } = req.query;

        const market = await Market.findById(id).lean();
        if (!market) return res.status(404).json({ success: false, message: 'Market not found' });

        // Get all players for this bookie
        let playerFilter = {};
        let playerMap = {};
        if (bookieId) {
            const bookiePlayers = await Player.find({ bookieId }).lean();
            const playerIds = bookiePlayers.map(p => String(p._id));
            playerFilter = { userId: { $in: playerIds } };
            bookiePlayers.forEach(p => { playerMap[String(p._id)] = p; });
        }

        // Build bet query
        let betQuery = { marketId: String(id), ...playerFilter };

        // If date filter, filter bets by date
        if (date) {
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);
            betQuery.createdAt = { $gte: dayStart, $lte: dayEnd };
        }

        const allBets = await Bet.find(betQuery).sort({ createdAt: -1 }).lean();

        // ─── Overall Summary ───
        const totalBets = allBets.length;
        const totalAmount = allBets.reduce((s, b) => s + (b.amount || 0), 0);
        const pendingBets = allBets.filter(b => b.status === 'pending');
        const wonBets = allBets.filter(b => b.status === 'won');
        const lostBets = allBets.filter(b => b.status === 'lost');
        const totalWinPayout = wonBets.reduce((s, b) => s + (b.winAmount || 0), 0);
        const openBets = allBets.filter(b => b.betOn === 'open');
        const closeBets = allBets.filter(b => b.betOn === 'close');

        // ─── Breakdown by Bet Type ───
        const betTypeMap = {};
        allBets.forEach(b => {
            const type = b.betType || 'unknown';
            if (!betTypeMap[type]) {
                betTypeMap[type] = { betType: type, count: 0, totalAmount: 0, pendingCount: 0, wonCount: 0, lostCount: 0, winPayout: 0, numbers: {} };
            }
            betTypeMap[type].count++;
            betTypeMap[type].totalAmount += (b.amount || 0);
            if (b.status === 'pending') betTypeMap[type].pendingCount++;
            if (b.status === 'won') { betTypeMap[type].wonCount++; betTypeMap[type].winPayout += (b.winAmount || 0); }
            if (b.status === 'lost') betTypeMap[type].lostCount++;

            // Track number frequency within this bet type
            const num = b.betNumber || '-';
            if (!betTypeMap[type].numbers[num]) {
                betTypeMap[type].numbers[num] = { number: num, count: 0, totalAmount: 0 };
            }
            betTypeMap[type].numbers[num].count++;
            betTypeMap[type].numbers[num].totalAmount += (b.amount || 0);
        });

        const byBetType = Object.values(betTypeMap).map(bt => ({
            ...bt,
            numbers: Object.values(bt.numbers).sort((a, b) => b.totalAmount - a.totalAmount),
        })).sort((a, b) => b.totalAmount - a.totalAmount);

        // ─── Breakdown by Player ───
        const playerBetMap = {};
        allBets.forEach(b => {
            const pid = b.userId || 'unknown';
            if (!playerBetMap[pid]) {
                const pl = playerMap[pid];
                playerBetMap[pid] = { playerId: pid, playerName: pl?.name || 'Unknown', phone: pl?.phone || '-', count: 0, totalAmount: 0, wonCount: 0, winPayout: 0 };
            }
            playerBetMap[pid].count++;
            playerBetMap[pid].totalAmount += (b.amount || 0);
            if (b.status === 'won') { playerBetMap[pid].wonCount++; playerBetMap[pid].winPayout += (b.winAmount || 0); }
        });
        const byPlayer = Object.values(playerBetMap).sort((a, b) => b.totalAmount - a.totalAmount);

        // ─── Number Frequency (top numbers) ───
        const numberFreqMap = {};
        allBets.forEach(b => {
            const num = b.betNumber || '-';
            if (!numberFreqMap[num]) numberFreqMap[num] = { number: num, count: 0, totalAmount: 0 };
            numberFreqMap[num].count++;
            numberFreqMap[num].totalAmount += (b.amount || 0);
        });
        const topNumbers = Object.values(numberFreqMap).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 20);

        // ─── Open vs Close split ───
        const openCloseBreakdown = {
            open: { count: openBets.length, totalAmount: openBets.reduce((s, b) => s + (b.amount || 0), 0) },
            close: { count: closeBets.length, totalAmount: closeBets.reduce((s, b) => s + (b.amount || 0), 0) },
        };

        // ─── Recent Bets (latest 50) ───
        const recentBets = allBets.slice(0, 50).map(b => ({
            id: b._id,
            playerName: playerMap[b.userId]?.name || 'Unknown',
            betType: b.betType,
            betNumber: b.betNumber,
            betOn: b.betOn,
            amount: b.amount,
            status: b.status,
            winAmount: b.winAmount || 0,
            createdAt: b.createdAt,
        }));

        return res.json({
            success: true,
            data: {
                market: { ...market, id: market._id },
                summary: {
                    totalBets,
                    totalAmount,
                    pendingBets: pendingBets.length,
                    wonBets: wonBets.length,
                    lostBets: lostBets.length,
                    totalWinPayout,
                    profitLoss: totalAmount - totalWinPayout,
                },
                openCloseBreakdown,
                byBetType,
                byPlayer,
                topNumbers,
                recentBets,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// ─── Rates ───────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/rates', async (_req, res) => {
    try {
        const rates = await Rate.find().lean();
        return res.json({ success: true, data: rates });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/rates/current', async (_req, res) => {
    try {
        const rates = await Rate.find().lean();
        return res.json({ success: true, data: rates });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/rates/:gameType', async (req, res) => {
    try {
        const { gameType } = req.params;
        const { rate } = req.body;
        const rateDoc = await Rate.findOne({ gameType });
        if (!rateDoc) return res.json({ success: false, message: 'Rate type not found' });
        rateDoc.rate = Number(rate) || rateDoc.rate;
        await rateDoc.save();
        return res.json({ success: true, data: rateDoc });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// ─── Wallet ──────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/wallet/balance', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.json({ success: false, message: 'userId required' });
        const player = await Player.findById(userId);
        if (!player) return res.json({ success: false, message: 'Player not found' });
        return res.json({ success: true, data: { balance: player.balance || 0 } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/wallet/my-transactions', async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.json({ success: false, message: 'userId required' });
        const bets = await Bet.find({ userId }).sort({ createdAt: -1 }).lean();
        return res.json({ success: true, data: bets });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/wallet/all', async (_req, res) => {
    try {
        const players = await Player.find().lean();
        const wallets = players.map((p) => ({
            userId: p._id,
            name: p.name,
            phone: p.phone,
            balance: p.balance || 0,
        }));
        return res.json({ success: true, data: wallets });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/wallet/transactions', async (req, res) => {
    try {
        const { userId } = req.query;
        const query = userId ? { userId } : {};
        const bets = await Bet.find(query).sort({ createdAt: -1 }).lean();
        const transactions = bets.map((b) => ({
            _id: b._id,
            userId: b.userId,
            type: 'bet',
            amount: b.amount,
            description: `${b.betType} bet on ${b.marketName}`,
            createdAt: b.createdAt,
        }));
        return res.json({ success: true, data: transactions });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/wallet/adjust', async (req, res) => {
    try {
        const { userId, amount, type } = req.body;
        if (!userId || !amount) return res.json({ success: false, message: 'userId and amount required' });
        const player = await Player.findById(userId);
        if (!player) return res.json({ success: false, message: 'Player not found' });
        const numAmount = Number(amount) || 0;
        if (type === 'debit') {
            player.balance = Math.max(0, (player.balance || 0) - numAmount);
        } else {
            player.balance = (player.balance || 0) + numAmount;
        }
        await player.save();
        const data = player.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/wallet/set-balance', async (req, res) => {
    try {
        const { userId, balance } = req.body;
        if (!userId) return res.json({ success: false, message: 'userId required' });
        const player = await Player.findById(userId);
        if (!player) return res.json({ success: false, message: 'Player not found' });
        player.balance = Number(balance) || 0;
        await player.save();
        const data = player.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// ─── Bets ────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.post('/api/bets/place', async (req, res) => {
    try {
        const { marketId, bets: betItems, userId, scheduledDate } = req.body;
        if (!marketId || !betItems || !betItems.length || !userId) {
            return res.json({ success: false, message: 'marketId, bets, and userId are required' });
        }

        const player = await Player.findById(userId);
        if (!player) return res.json({ success: false, message: 'Player not found' });

        const totalAmount = betItems.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
        if (totalAmount > (player.balance || 0)) {
            return res.json({ success: false, message: 'Insufficient balance' });
        }

        player.balance = (player.balance || 0) - totalAmount;
        await player.save();

        const market = await Market.findById(marketId).lean();
        const marketName = market?.marketName || 'Unknown';

        const newBets = betItems.map((b) => ({
            userId,
            marketId,
            marketName,
            betType: b.betType,
            betNumber: b.betNumber,
            amount: Number(b.amount) || 0,
            betOn: b.betOn || 'open',
            scheduledDate: scheduledDate || null,
            status: 'pending',
        }));

        const inserted = await Bet.insertMany(newBets);

        return res.json({
            success: true,
            message: 'Bet placed successfully',
            data: {
                newBalance: player.balance,
                bets: inserted,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/bets/history', async (req, res) => {
    try {
        const { userId, startDate, endDate } = req.query;
        const query = {};
        if (userId) query.userId = userId;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }
        const bets = await Bet.find(query).sort({ createdAt: -1 }).lean();
        const data = bets.map((b) => ({ ...b, id: b._id }));
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/bets/top-winners', (_req, res) => {
    return res.json({ success: true, data: [] });
});

// ═══════════════════════════════════════════════════════════════
// ─── Admin: Dashboard Stats ──────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const { from, to } = req.query;

        // Build date filter for bets
        const betQuery = {};
        if (from || to) {
            betQuery.createdAt = {};
            if (from) betQuery.createdAt.$gte = new Date(from);
            if (to) betQuery.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
        }

        const [periodBets, allPlayers, activeMarkets, allBookies] = await Promise.all([
            Bet.find(betQuery).lean(),
            Player.find().lean(),
            Market.find({ isDeleted: { $ne: true } }).lean(),
            Bookie.find().lean(),
        ]);

        const totalBetAmount = periodBets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
        const winningBets = periodBets.filter((b) => b.status === 'won');
        const losingBets = periodBets.filter((b) => b.status === 'lost');
        const pendingBets = periodBets.filter((b) => b.status === 'pending');
        const totalPayouts = winningBets.reduce((s, b) => s + (Number(b.winAmount) || 0), 0);
        const winRate = periodBets.length > 0 ? Math.round((winningBets.length / periodBets.length) * 100) : 0;

        // Players stats
        let newPlayersInPeriod = 0;
        if (from) {
            const playerQuery = { createdAt: { $gte: new Date(from) } };
            if (to) playerQuery.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
            newPlayersInPeriod = await Player.countDocuments(playerQuery);
        }
        const activePlayers = allPlayers.filter((p) => p.status !== 'suspended').length;

        // Markets: check which are currently open
        const nowIST = getNowIST();
        const nowHM = nowIST.getHours() * 60 + nowIST.getMinutes();
        let openMainCount = 0;
        const marketsPendingResultList = [];

        for (const m of activeMarkets) {
            const closingParsed = parseTimeIST(m.closingTime);
            if (!closingParsed) continue;
            const closeHM = closingParsed.getHours() * 60 + closingParsed.getMinutes();
            const startParsed = parseTimeIST(m.startingTime);
            const startHM = startParsed ? startParsed.getHours() * 60 + startParsed.getMinutes() : 0;
            const isPastClosing = nowHM > closeHM;
            const isOpen = nowHM >= startHM && nowHM <= closeHM;

            if (isOpen) {
                openMainCount++;
            }

            if (isPastClosing) {
                const hasOpen = m.openingNumber && /^\d{3}$/.test(m.openingNumber);
                const hasClose = m.closingNumber && /^\d{3}$/.test(m.closingNumber);
                if (!hasOpen || !hasClose) {
                    marketsPendingResultList.push(m);
                }
            }
        }

        const totalWalletBalance = allPlayers.reduce((s, p) => s + (Number(p.balance) || 0), 0);

        return res.json({
            success: true,
            data: {
                revenue: {
                    total: totalBetAmount,
                    payouts: totalPayouts,
                    netProfit: totalBetAmount - totalPayouts,
                },
                users: {
                    total: allPlayers.length,
                    active: activePlayers,
                    newToday: newPlayersInPeriod,
                },
                bets: {
                    total: periodBets.length,
                    winning: winningBets.length,
                    losing: losingBets.length,
                    pending: pendingBets.length,
                    winRate,
                },
                markets: {
                    total: activeMarkets.length,
                    open: openMainCount,
                    main: activeMarkets.length,
                    openMain: openMainCount,
                },
                payments: {
                    totalDeposits: 0,
                    totalWithdrawals: 0,
                    pending: 0,
                    pendingDeposits: 0,
                    pendingWithdrawals: 0,
                },
                wallet: {
                    totalBalance: totalWalletBalance,
                },
                bookies: {
                    total: allBookies.length,
                    active: allBookies.filter((b) => b.status === 'active').length,
                },
                helpDesk: {
                    total: 0,
                    open: 0,
                    inProgress: 0,
                },
                marketsPendingResult: marketsPendingResultList.length,
                marketsPendingResultList: marketsPendingResultList.map((m) => ({
                    _id: m._id,
                    marketName: m.marketName,
                })),
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// ─── Admin: Bookies Management ───────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/bookies', async (_req, res) => {
    try {
        const bookies = await Bookie.find().select('-password').lean();
        const data = bookies.map((b) => ({ ...b, id: b._id }));
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/admin/bookies', async (req, res) => {
    try {
        const { username, password, name, firstName, lastName, email, phone } = req.body;
        if (!password) {
            return res.json({ success: false, message: 'Password is required' });
        }
        const finalUsername = username || `${(firstName || '').trim()} ${(lastName || '').trim()}`.trim();
        if (!finalUsername) {
            return res.json({ success: false, message: 'Username or name is required' });
        }
        const existsByName = await Bookie.findOne({ username: finalUsername });
        if (existsByName) {
            return res.json({ success: false, message: 'Bookie with this username already exists' });
        }
        if (phone) {
            const existsByPhone = await Bookie.findOne({ phone });
            if (existsByPhone) {
                return res.json({ success: false, message: 'Bookie with this phone number already exists' });
            }
        }
        const bookie = await Bookie.create({
            username: finalUsername,
            password,
            name: name || finalUsername,
            firstName: (firstName || '').trim(),
            lastName: (lastName || '').trim(),
            email: (email || '').trim(),
            phone: (phone || '').trim(),
            status: 'active',
        });
        const safe = bookie.toObject();
        delete safe.password;
        safe.id = safe._id;
        return res.json({ success: true, data: safe });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.put('/api/admin/bookies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const bookie = await Bookie.findById(id);
        if (!bookie) return res.json({ success: false, message: 'Bookie not found' });
        const { username, password, name, status, firstName, lastName, email, phone } = req.body;
        if (firstName !== undefined) bookie.firstName = firstName.trim();
        if (lastName !== undefined) bookie.lastName = lastName.trim();
        if (firstName !== undefined || lastName !== undefined) {
            const fn = (firstName !== undefined ? firstName : bookie.firstName || '').trim();
            const ln = (lastName !== undefined ? lastName : bookie.lastName || '').trim();
            bookie.username = `${fn} ${ln}`.trim();
            bookie.name = bookie.username;
        }
        if (username) bookie.username = username;
        if (password) bookie.password = password;
        if (name) bookie.name = name;
        if (email !== undefined) bookie.email = email.trim();
        if (phone !== undefined) bookie.phone = phone.trim();
        if (status) bookie.status = status;
        await bookie.save();
        const safe = bookie.toObject();
        delete safe.password;
        safe.id = safe._id;
        return res.json({ success: true, data: safe });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/admin/bookies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Bookie.findByIdAndDelete(id);
        if (!result) return res.json({ success: false, message: 'Bookie not found' });
        return res.json({ success: true, message: 'Bookie deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Accept both POST and PATCH for toggle-status
const toggleBookieStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const bookie = await Bookie.findById(id);
        if (!bookie) return res.json({ success: false, message: 'Bookie not found' });
        bookie.status = bookie.status === 'active' ? 'suspended' : 'active';
        await bookie.save();
        const safe = bookie.toObject();
        delete safe.password;
        safe.id = safe._id;
        return res.json({ success: true, data: safe });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
app.post('/api/admin/bookies/:id/toggle-status', toggleBookieStatus);
app.patch('/api/admin/bookies/:id/toggle-status', toggleBookieStatus);

// ═══════════════════════════════════════════════════════════════
// ─── Admin: Super Admins ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/super-admins', async (_req, res) => {
    try {
        const admins = await Admin.find().select('-password').lean();
        return res.json({ success: true, data: admins });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// ─── Admin: Users (All Players) ──────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/users', async (req, res) => {
    try {
        const { filter } = req.query;
        if (filter === 'super_admin') {
            const admins = await Admin.find().select('-password').lean();
            return res.json({ success: true, data: admins });
        }
        if (filter === 'bookie') {
            const bookies = await Bookie.find().select('-password').lean();
            return res.json({ success: true, data: bookies });
        }
        const players = await Player.find().lean();
        const data = players.map((p) => ({ ...p, id: p._id }));
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const player = await Player.findById(id).lean();
        if (!player) return res.json({ success: false, message: 'Player not found' });
        return res.json({ success: true, data: { ...player, id: player._id } });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/users/create', async (req, res) => {
    try {
        const { firstName, lastName, username, name, email, phone, password, role, balance, bookieId } = req.body;

        const finalName = name || username || `${(firstName || '').trim()} ${(lastName || '').trim()}`.trim();

        if (!finalName) {
            return res.json({ success: false, message: 'Name is required' });
        }
        if (!phone) {
            return res.json({ success: false, message: 'Phone number is required' });
        }

        // ── Create Bookie ───────────────────────────────────────
        if (role === 'bookie') {
            if (!password) {
                return res.json({ success: false, message: 'Password is required for bookie accounts' });
            }
            const existsByName = await Bookie.findOne({ username: finalName });
            if (existsByName) {
                return res.json({ success: false, message: 'Bookie with this username already exists' });
            }
            const existsByPhone = await Bookie.findOne({ phone });
            if (existsByPhone) {
                return res.json({ success: false, message: 'Bookie with this phone number already exists' });
            }
            const bookie = await Bookie.create({
                username: finalName,
                password,
                name: finalName,
                firstName: (firstName || '').trim(),
                lastName: (lastName || '').trim(),
                email: (email || '').trim(),
                phone: (phone || '').trim(),
                status: 'active',
            });
            const data = bookie.toObject();
            delete data.password;
            data.id = data._id;
            return res.json({ success: true, data });
        }

        // ── Create Player (default) ─────────────────────────────
        const existingPlayer = await Player.findOne({ phone });
        if (existingPlayer) {
            return res.json({ success: false, message: 'Player with this phone number already exists' });
        }
        const player = await Player.create({
            bookieId: bookieId || null,
            name: finalName,
            phone,
            password: password || '',
            balance: parseFloat(balance) || 0,
        });
        const data = player.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

const togglePlayerStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const player = await Player.findById(id);
        if (!player) return res.json({ success: false, message: 'Player not found' });
        player.status = player.status === 'active' ? 'suspended' : 'active';
        await player.save();
        const data = player.toObject();
        data.id = data._id;
        return res.json({ success: true, data });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};
app.post('/api/users/:id/toggle-status', togglePlayerStatus);
app.patch('/api/users/:id/toggle-status', togglePlayerStatus);

app.delete('/api/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await Player.findByIdAndDelete(id);
        if (!result) return res.json({ success: false, message: 'Player not found' });
        return res.json({ success: true, message: 'Player deleted' });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/users/:id/clear-devices', (req, res) => {
    return res.json({ success: true, message: 'Devices cleared' });
});

// ═══════════════════════════════════════════════════════════════
// ─── Admin: Reports ──────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/reports', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const query = {};
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate + 'T23:59:59.999Z');
        }
        const bets = await Bet.find(query).sort({ createdAt: -1 }).lean();
        const totalAmount = bets.reduce((s, b) => s + (Number(b.amount) || 0), 0);
        return res.json({
            success: true,
            data: {
                totalBets: bets.length,
                totalAmount,
                bets,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// ─── Admin: Logs ─────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/logs', (_req, res) => {
    return res.json({ success: true, data: [] });
});

// ═══════════════════════════════════════════════════════════════
// ─── Admin: Payments ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/payments', (_req, res) => {
    return res.json({ success: true, data: [] });
});

app.get('/api/payments/pending-count', (_req, res) => {
    return res.json({ success: true, data: { count: 0 } });
});

app.post('/api/payments/:id/approve', (req, res) => {
    return res.json({ success: true, message: 'Payment approved' });
});

app.post('/api/payments/:id/reject', (req, res) => {
    return res.json({ success: true, message: 'Payment rejected' });
});

// ═══════════════════════════════════════════════════════════════
// ─── Admin: Settings ─────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/admin/me/secret-declare-password-status', (_req, res) => {
    return res.json({ success: true, data: { hasPassword: false } });
});

app.post('/api/admin/me/secret-declare-password', (_req, res) => {
    return res.json({ success: true, message: 'Password updated' });
});

// ═══════════════════════════════════════════════════════════════
// ─── Admin: Help Desk ────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
app.get('/api/help-desk/tickets', (_req, res) => {
    return res.json({ success: true, data: [] });
});

app.put('/api/help-desk/tickets/:id/status', (_req, res) => {
    return res.json({ success: true, message: 'Ticket updated' });
});

// ═══════════════════════════════════════════════════════════════
// ─── Catch-all: Return 404 JSON for unknown routes ───────────
// ═══════════════════════════════════════════════════════════════
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
});

// ═══════════════════════════════════════════════════════════════
// ─── Start Server ────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 5050;

// Wait for MongoDB connection, seed data, then start
mongoose.connection.once('open', async () => {
    await seedDefaults();
    app.listen(PORT, () => {
        console.log(`🚀 Backend server running on http://localhost:${PORT}`);
    });
});
