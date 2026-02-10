import React, { useEffect, useMemo, useRef, useState } from 'react';
import BidLayout from '../BidLayout';
import BidReviewModal from './BidReviewModal';
import { placeBet, updateUserBalance } from '../../../api/bets';

const isValidTriplePana = (n) => {
    const s = (n ?? '').toString().trim();
    if (!/^[0-9]{3}$/.test(s)) return false;
    return s[0] === s[1] && s[1] === s[2];
};

const TriplePanaBid = ({ market, title }) => {
    const [activeTab] = useState('special');
    const [session, setSession] = useState(() => (market?.status === 'running' ? 'CLOSE' : 'OPEN'));
    const [bids, setBids] = useState([]);
    const [inputNumber, setInputNumber] = useState('');
    const [inputPoints, setInputPoints] = useState('');
    const pointsInputRef = useRef(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [warning, setWarning] = useState('');
    const [selectedDate, setSelectedDate] = useState(() => {
        try { const savedDate = localStorage.getItem('betSelectedDate'); if (savedDate) { const today = new Date().toISOString().split('T')[0]; if (savedDate > today) return savedDate; } } catch (e) {}
        return new Date().toISOString().split('T')[0];
    });
    const handleDateChange = (newDate) => { try { localStorage.setItem('betSelectedDate', newDate); } catch (e) {} setSelectedDate(newDate); };
    const showWarning = (msg) => { setWarning(msg); window.clearTimeout(showWarning._t); showWarning._t = window.setTimeout(() => setWarning(''), 2200); };

    const tripleNumbers = useMemo(() => Array.from({ length: 10 }, (_, i) => `${i}${i}${i}`), []);
    const [specialInputs, setSpecialInputs] = useState(() => Object.fromEntries(tripleNumbers.map((n) => [n, ''])));

    const walletBefore = useMemo(() => { try { const u = JSON.parse(localStorage.getItem('user') || 'null'); const val = u?.wallet || u?.balance || u?.points || u?.walletAmount || u?.wallet_amount || u?.amount || 0; const n = Number(val); return Number.isFinite(n) ? n : 0; } catch (e) { return 0; } }, []);

    const totalPoints = bids.reduce((sum, b) => sum + Number(b.points || 0), 0);
    const todayDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const dateText = new Date().toLocaleDateString('en-GB');
    const marketTitle = market?.gameName || market?.marketName || title;
    const isRunning = market?.status === 'running';

    useEffect(() => { if (isRunning) setSession('CLOSE'); }, [isRunning]);

    const clearAll = () => {
        setBids([]); setInputNumber(''); setInputPoints(''); setSpecialInputs(Object.fromEntries(tripleNumbers.map((n) => [n, ''])));
        const today = new Date().toISOString().split('T')[0]; setSelectedDate(today);
        try { localStorage.removeItem('betSelectedDate'); } catch (e) {}
    };

    const handleCancelBet = () => { setIsReviewOpen(false); clearAll(); };

    const handleSubmitBet = async () => {
        const marketId = market?._id || market?.id;
        if (!marketId) throw new Error('Market not found');
        const payload = bids.map((b) => ({ betType: 'panna', betNumber: String(b.number), amount: Number(b.points) || 0, betOn: String(b?.type || session).toUpperCase() === 'CLOSE' ? 'close' : 'open' }));
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const selectedDateObj = new Date(selectedDate); selectedDateObj.setHours(0, 0, 0, 0);
        const scheduledDate = selectedDateObj > today ? selectedDate : null;
        const result = await placeBet(marketId, payload, scheduledDate);
        if (!result.success) throw new Error(result.message);
        if (result.data?.newBalance != null) updateUserBalance(result.data.newBalance);
        setIsReviewOpen(false); clearAll();
    };

    const handleAddSpecialModeBids = () => {
        const toAdd = Object.entries(specialInputs).filter(([, pts]) => Number(pts) > 0).map(([num, pts]) => ({ id: Date.now() + Number(num[0]), number: num, points: String(pts), type: session }));
        if (!toAdd.length) { showWarning('Please enter points for at least one triple pana (000-999).'); return; }
        const next = [...bids, ...toAdd];
        setBids(next); setSpecialInputs(Object.fromEntries(tripleNumbers.map((n) => [n, '']))); setIsReviewOpen(true);
    };

    const dateSessionRow = (
        <div className="grid grid-cols-2 gap-3">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                <input type="text" value={todayDate} readOnly className="w-full pl-10 py-3 sm:py-2.5 min-h-[44px] bg-blue-50 border border-blue-200 text-gray-900 rounded-full text-sm font-bold text-center focus:outline-none" />
            </div>
            <div className="relative">
                <select value={session} onChange={(e) => setSession(e.target.value)} disabled={isRunning} className={`w-full appearance-none bg-blue-50 border border-blue-200 text-gray-900 font-bold text-sm py-3 sm:py-2.5 min-h-[44px] px-4 rounded-full text-center focus:outline-none focus:border-blue-500 ${isRunning ? 'opacity-80 cursor-not-allowed' : ''}`}>
                    {isRunning ? (<option value="CLOSE">CLOSE</option>) : (<><option value="OPEN">OPEN</option><option value="CLOSE">CLOSE</option></>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-600"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>
            </div>
        </div>
    );

    return (
        <BidLayout market={market} title={title} bidsCount={bids.length} totalPoints={totalPoints} showDateSession={true} selectedDate={selectedDate} setSelectedDate={handleDateChange} extraHeader={null} session={session} setSession={setSession} hideFooter walletBalance={walletBefore}>
            <div className="px-3 sm:px-4 py-4 sm:py-2 md:max-w-3xl md:mx-auto md:items-start">
                <div className="space-y-4">
                    {warning && (<div className="bg-red-500/10 border border-red-500/30 text-red-600 rounded-xl px-4 py-3 text-sm">{warning}</div>)}
                    {dateSessionRow}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                        {tripleNumbers.map((num) => (
                            <div key={num} className="flex items-center gap-2">
                                <div className="w-12 h-10 bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center rounded-l-md font-bold text-sm shrink-0">{num}</div>
                                <input type="text" inputMode="numeric" placeholder="Pts" value={specialInputs[num] || ''} onChange={(e) => setSpecialInputs((p) => ({ ...p, [num]: e.target.value.replace(/\D/g, '').slice(0, 6) }))} className="w-full h-10 bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 rounded-r-md focus:outline-none focus:border-blue-500 px-3 text-sm font-semibold" />
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddSpecialModeBids} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-md shadow-md hover:from-blue-600 hover:to-blue-700 transition-all">Add to List</button>
                </div>
            </div>
            <BidReviewModal open={isReviewOpen} onClose={handleCancelBet} onSubmit={handleSubmitBet} marketTitle={marketTitle} dateText={dateText} labelKey="Pana" rows={bids} walletBefore={walletBefore} totalBids={bids.length} totalAmount={totalPoints} />
        </BidLayout>
    );
};

export default TriplePanaBid;
