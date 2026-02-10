import React, { useEffect, useMemo, useRef, useState } from 'react';
import BidLayout from '../BidLayout';
import BidReviewModal from './BidReviewModal';
import { placeBet, updateUserBalance } from '../../../api/bets';

const EasyModeBid = ({
    market,
    title,
    label,
    maxLength = 3,
    validateInput,
    showBidsList = false,
    openReviewOnAdd = true,
    showFooterSubmit = false,
    showInlineSubmit = false,
    showModeTabs = false,
    specialModeType = null,
    desktopSplit = false,
    validDoublePanas = [],
    validSinglePanas = [],
}) => {
    const [activeTab, setActiveTab] = useState('easy');
    const lockSessionToOpen = specialModeType === 'jodi';
    const [session, setSession] = useState(() => (lockSessionToOpen ? 'OPEN' : (market?.status === 'running' ? 'CLOSE' : 'OPEN')));
    const [bids, setBids] = useState([]);
    const [reviewRows, setReviewRows] = useState([]);
    const [inputNumber, setInputNumber] = useState('');
    const [inputPoints, setInputPoints] = useState('');
    const pointsInputRef = useRef(null);
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [warning, setWarning] = useState('');
    const [matchingPanas, setMatchingPanas] = useState([]);
    const [selectedSum, setSelectedSum] = useState(null);
    const [selectedDate, setSelectedDate] = useState(() => {
        try {
            const savedDate = localStorage.getItem('betSelectedDate');
            if (savedDate) {
                const today = new Date().toISOString().split('T')[0];
                if (savedDate > today) return savedDate;
            }
        } catch (e) {}
        return new Date().toISOString().split('T')[0];
    });
    
    const handleDateChange = (newDate) => {
        try { localStorage.setItem('betSelectedDate', newDate); } catch (e) {}
        setSelectedDate(newDate);
    };
    const showWarning = (msg) => {
        setWarning(msg);
        window.clearTimeout(showWarning._t);
        showWarning._t = window.setTimeout(() => setWarning(''), 2200);
    };

    const isRunning = market?.status === 'running';
    useEffect(() => {
        if (lockSessionToOpen) { if (session !== 'OPEN') setSession('OPEN'); return; }
        if (isRunning) setSession('CLOSE');
    }, [isRunning, lockSessionToOpen, session]);

    const jodiNumbers = useMemo(() => Array.from({ length: 100 }, (_, i) => String(i).padStart(2, '0')), []);

    const isPanaSumMode = specialModeType === 'doublePana' || specialModeType === 'singlePana';
    const validPanasForSumMode = specialModeType === 'doublePana' ? validDoublePanas : (specialModeType === 'singlePana' ? validSinglePanas : []);
    const [specialInputs, setSpecialInputs] = useState(() => {
        if (specialModeType === 'jodi') return Object.fromEntries(Array.from({ length: 100 }, (_, i) => [String(i).padStart(2, '0'), '']));
        if (isPanaSumMode && validPanasForSumMode && validPanasForSumMode.length > 0) return Object.fromEntries(validPanasForSumMode.map((pana) => [pana, '']));
        return {};
    });

    const defaultValidate = (n) => { if (!n || !n.toString().trim()) return false; return true; };
    const isValid = validateInput || defaultValidate;

    const mergeBids = (prev, incoming) => {
        const map = new Map();
        for (const b of prev || []) { const num = (b?.number ?? '').toString().trim(); const type = (b?.type ?? '').toString().trim(); const key = `${num}__${type}`; map.set(key, { ...b, number: num, type, points: String(Number(b?.points || 0) || 0) }); }
        for (const b of incoming || []) { const num = (b?.number ?? '').toString().trim(); const type = (b?.type ?? '').toString().trim(); const key = `${num}__${type}`; const pts = Number(b?.points || 0) || 0; const existing = map.get(key); if (existing) { existing.points = String((Number(existing.points || 0) || 0) + pts); } else { map.set(key, { id: b?.id ?? `${Date.now()}-${Math.random()}`, number: num, points: String(pts), type }); } }
        return Array.from(map.values());
    };

    const handleAddBid = () => {
        const pts = Number(inputPoints);
        const n = inputNumber?.toString().trim() || '';
        if (!pts || pts <= 0) { showWarning('Please enter points.'); return; }
        if (!n) { showWarning(maxLength === 2 ? 'Please enter Digit (00-99).' : `Please enter ${labelKey}.`); return; }
        if (maxLength === 2 && n.length !== 2) { showWarning('Please enter 2-digit Digit (00-99).'); return; }
        if (!isValid(n)) { showWarning(maxLength === 2 ? 'Invalid Digit. Use 00-99.' : 'Invalid number.'); return; }
        const bid = { id: Date.now() + Math.random(), number: inputNumber.toString().trim(), points: String(pts), type: session };
        setBids((prev) => { const next = mergeBids(prev, [bid]); if (openReviewOnAdd) { setReviewRows(next); setIsReviewOpen(true); } return next; });
        setInputNumber(''); setInputPoints('');
    };

    const handleDeleteBid = (id) => setBids((prev) => prev.filter((b) => b.id !== id));

    const handleAddSpecialToList = () => {
        if (specialModeType !== 'jodi' && specialModeType !== 'doublePana' && specialModeType !== 'singlePana') return;
        const toAdd = Object.entries(specialInputs).filter(([, pts]) => Number(pts) > 0).map(([num, pts]) => ({ id: Date.now() + Number(num) + Math.random(), number: num, points: String(pts), type: session }));
        if (!toAdd.length) { const label2 = specialModeType === 'jodi' ? 'Digit (00-99)' : (specialModeType === 'doublePana' ? 'Double Pana' : 'Single Pana'); showWarning(`Please enter points for at least one ${label2}.`); return; }
        setBids((prev) => mergeBids(prev, toAdd));
        if (specialModeType === 'jodi') setSpecialInputs(Object.fromEntries(jodiNumbers.map((n) => [n, ''])));
        else if (isPanaSumMode && validPanasForSumMode.length > 0) setSpecialInputs(Object.fromEntries(validPanasForSumMode.map((n) => [n, ''])));
    };

    const handleSubmitFromSpecial = () => {
        if (specialModeType !== 'jodi' && specialModeType !== 'doublePana' && specialModeType !== 'singlePana') return;
        const toAdd = Object.entries(specialInputs).filter(([, pts]) => Number(pts) > 0).map(([num, pts]) => ({ id: Date.now() + Number(num) + Math.random(), number: num, points: String(pts), type: session }));
        if (!toAdd.length && bids.length === 0) { const label2 = specialModeType === 'jodi' ? 'Digit (00-99)' : (specialModeType === 'doublePana' ? 'Double Pana' : 'Single Pana'); showWarning(`Please enter points for at least one ${label2}.`); return; }
        setBids((prev) => { const next = mergeBids(prev, toAdd); setReviewRows(next); setIsReviewOpen(true); return next; });
        if (specialModeType === 'jodi') setSpecialInputs(Object.fromEntries(jodiNumbers.map((n) => [n, ''])));
        else if (isPanaSumMode && validPanasForSumMode.length > 0) setSpecialInputs(Object.fromEntries(validPanasForSumMode.map((n) => [n, ''])));
    };

    const findPanaBySum = (targetNum) => {
        if (!isPanaSumMode || !validPanasForSumMode || validPanasForSumMode.length === 0) return [];
        const matches = [];
        for (const pana of validPanasForSumMode) { const digits = pana.split('').map(Number); const sum = digits[0] + digits[1] + digits[2]; const unitPlace = sum % 10; if (sum === targetNum || unitPlace === targetNum) matches.push(pana); }
        return matches;
    };

    const handleKeypadClick = (num) => {
        if (!isPanaSumMode) return;
        const pts = Number(inputPoints);
        const matches = findPanaBySum(num);
        setMatchingPanas(matches);
        setSelectedSum(num);
        if (pts && pts > 0) {
            if (matches.length > 0) {
                setBids((prev) => {
                    const bidsMap = new Map(prev.map(b => [b.number, { ...b, points: Number(b.points) || 0 }]));
                    matches.forEach((pana) => {
                        if (bidsMap.has(pana)) { const existingBid = bidsMap.get(pana); existingBid.points = existingBid.points + pts; existingBid.points = String(existingBid.points); }
                        else { bidsMap.set(pana, { id: Date.now() + Math.random() + Math.random() * matches.indexOf(pana), number: pana, points: String(pts), type: session }); }
                    });
                    return Array.from(bidsMap.values());
                });
                showWarning(`Added ${matches.length} ${specialModeType === 'doublePana' ? 'double' : 'single'} pana numbers with sum ${num}`);
            } else { showWarning(`No valid ${specialModeType === 'doublePana' ? 'double' : 'single'} pana numbers found with sum ${num}`); }
        } else {
            if (matches.length > 0) showWarning(`Found ${matches.length} ${specialModeType === 'doublePana' ? 'double' : 'single'} pana numbers with sum ${num}. Enter points to add them.`);
            else showWarning(`No valid ${specialModeType === 'doublePana' ? 'double' : 'single'} pana numbers found with sum ${num}`);
        }
    };

    const walletBefore = useMemo(() => {
        try { const u = JSON.parse(localStorage.getItem('user') || 'null'); const val = u?.wallet || u?.balance || u?.points || u?.walletAmount || u?.wallet_amount || u?.amount || 0; const n = Number(val); return Number.isFinite(n) ? n : 0; } catch (e) { return 0; }
    }, []);

    const handleNumberInputChange = (e) => {
        const val = e.target.value;
        const prevLen = (inputNumber ?? '').toString().length;
        const focusPointsIfComplete = (nextVal) => {
            if (!maxLength) return;
            const nextLen = (nextVal ?? '').toString().length;
            if (nextLen === maxLength && nextLen > prevLen) {
                const ok = isValid(nextVal);
                if (!ok) { showWarning(maxLength === 2 ? 'Invalid Digit. Use 00-99.' : 'Invalid number.'); return; }
                window.requestAnimationFrame(() => { pointsInputRef.current?.focus?.(); });
            }
        };
        if (maxLength === 1) { const digit = val.replace(/\D/g, '').slice(-1); setInputNumber(digit); focusPointsIfComplete(digit); }
        else if (maxLength === 2) { const twoDigits = val.replace(/\D/g, '').slice(0, 2); setInputNumber(twoDigits); focusPointsIfComplete(twoDigits); }
        else if (maxLength === 3) { const threeDigits = val.replace(/\D/g, '').slice(0, 3); setInputNumber(threeDigits); focusPointsIfComplete(threeDigits); }
        else setInputNumber(val);
    };

    const totalPoints = bids.reduce((sum, b) => sum + Number(b.points), 0);
    const labelKey = label?.split(' ').pop() || 'Number';
    const dateText = new Date().toLocaleDateString('en-GB');
    const marketTitle = market?.gameName || market?.marketName || title;
    const todayDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const showInvalidNumberStyle = maxLength === 3;
    const isNumberComplete = !!inputNumber && (!!maxLength ? String(inputNumber).length === maxLength : true);
    const isNumberInvalid = showInvalidNumberStyle && isNumberComplete && !isValid(inputNumber);

    const pointsBySum = useMemo(() => {
        if (!isPanaSumMode || !validPanasForSumMode || validPanasForSumMode.length === 0) return {};
        const sumMap = {}; for (let i = 0; i <= 9; i++) sumMap[i] = 0;
        bids.forEach((bid) => { const pana = bid.number; if (validPanasForSumMode.includes(pana)) { const digits = pana.split('').map(Number); const sum = digits[0] + digits[1] + digits[2]; const unitPlace = sum % 10; const points = Number(bid.points) || 0; if (sum <= 9) sumMap[sum] = (sumMap[sum] || 0) + points; else sumMap[unitPlace] = (sumMap[unitPlace] || 0) + points; } });
        return sumMap;
    }, [bids, isPanaSumMode, validPanasForSumMode]);

    const submitBtnClass = (enabled) => enabled
        ? 'w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 min-h-[48px] rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all active:scale-[0.98]'
        : 'w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 min-h-[48px] rounded-lg shadow-md opacity-50 cursor-not-allowed';

    const modeHeader = showModeTabs ? (
        <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setActiveTab('easy')} className={`min-h-[44px] py-3 rounded-lg font-bold text-sm shadow-sm border active:scale-[0.98] transition-colors ${activeTab === 'easy' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-gray-600 border-blue-200 hover:border-blue-400'}`}>EASY MODE</button>
                <button type="button" onClick={() => setActiveTab('special')} className={`min-h-[44px] py-3 rounded-lg font-bold text-sm shadow-sm border active:scale-[0.98] transition-colors ${activeTab === 'special' ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-gray-600 border-blue-200 hover:border-blue-400'}`}>SPECIAL MODE</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>
                    <input type="text" value={todayDate} readOnly className="w-full pl-12 py-3 sm:py-2.5 min-h-[44px] bg-blue-50 border border-blue-200 text-gray-900 rounded-full text-sm font-bold text-center focus:outline-none" />
                </div>
                <div className="relative">
                    <select value={session} onChange={(e) => setSession(e.target.value)} disabled={isRunning || lockSessionToOpen} className={`w-full appearance-none bg-blue-50 border border-blue-200 text-gray-900 font-bold text-sm py-3 sm:py-2.5 min-h-[44px] px-4 rounded-full text-center focus:outline-none focus:border-blue-500 ${(isRunning || lockSessionToOpen) ? 'opacity-80 cursor-not-allowed' : ''}`}>
                        {lockSessionToOpen ? (<option value="OPEN">OPEN</option>) : isRunning ? (<option value="CLOSE">CLOSE</option>) : (<><option value="OPEN">OPEN</option><option value="CLOSE">CLOSE</option></>)}
                    </select>
                    {!lockSessionToOpen && (<div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-600"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></div>)}
                </div>
            </div>
        </div>
    ) : null;

    const bidsList = showBidsList ? (
        <>
            <div className="grid grid-cols-4 gap-1 sm:gap-2 text-center text-blue-600 font-bold text-xs sm:text-sm mb-2 px-1"><div>{labelKey}</div><div>Point</div><div>Type</div><div>Delete</div></div>
            <div className="h-px bg-blue-100 w-full mb-2"></div>
            <div className="space-y-2">
                {bids.map((bid) => (
                    <div key={bid.id} className="grid grid-cols-4 gap-1 sm:gap-2 text-center items-center py-2.5 px-2 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                        <div className="font-bold text-gray-900">{maxLength === 2 && typeof bid.number === 'string' && bid.number.length === 2 ? (<span className="inline-flex items-center gap-2 justify-center"><span>{bid.number[0]}</span><span>{bid.number[1]}</span></span>) : (bid.number)}</div>
                        <div className="font-bold text-blue-600">{bid.points}</div>
                        <div className="text-sm text-gray-600">{bid.type}</div>
                        <div className="flex justify-center"><button type="button" onClick={() => handleDeleteBid(bid.id)} className="p-2 text-red-400 hover:text-red-600 active:scale-95" aria-label="Delete"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg></button></div>
                    </div>
                ))}
            </div>
        </>
    ) : null;

    const clearAll = () => {
        setBids([]); setInputNumber(''); setInputPoints(''); setMatchingPanas([]); setSelectedSum(null);
        if (specialModeType === 'jodi') setSpecialInputs(Object.fromEntries(jodiNumbers.map((n) => [n, ''])));
        else if (specialModeType === 'doublePana' && validDoublePanas.length > 0) setSpecialInputs(Object.fromEntries(validDoublePanas.map((n) => [n, ''])));
        const today = new Date().toISOString().split('T')[0]; setSelectedDate(today);
        try { localStorage.removeItem('betSelectedDate'); } catch (e) {}
    };

    const handleCancelBet = () => { setIsReviewOpen(false); clearAll(); };

    const handleSubmitBet = async () => {
        const marketId = market?._id || market?.id;
        if (!marketId) throw new Error('Market not found');
        const rows = bids.length ? bids : reviewRows;
        if (!rows.length) throw new Error('No bets to place');
        const betType = specialModeType === 'jodi' ? 'jodi' : (specialModeType === 'singlePana' || specialModeType === 'doublePana' ? 'panna' : 'single');
        const payload = rows.map((r) => ({ betType, betNumber: String(r?.number ?? '').trim(), amount: Number(r?.points) || 0, betOn: lockSessionToOpen ? 'open' : (String(r?.type || session).toUpperCase() === 'CLOSE' ? 'close' : 'open') })).filter((b) => b.betNumber && b.amount > 0);
        if (!payload.length) throw new Error('No valid bets to place');
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const selectedDateObj = new Date(selectedDate); selectedDateObj.setHours(0, 0, 0, 0);
        const scheduledDate = selectedDateObj > today ? selectedDate : null;
        const result = await placeBet(marketId, payload, scheduledDate);
        if (!result.success) throw new Error(result.message || 'Failed to place bet');
        if (result.data?.newBalance != null) updateUserBalance(result.data.newBalance);
        setIsReviewOpen(false); clearAll();
    };

    return (
        <BidLayout market={market} title={title} bidsCount={bids.length} totalPoints={totalPoints} session={session} setSession={setSession} sessionOptionsOverride={lockSessionToOpen ? ['OPEN'] : null} lockSessionSelect={lockSessionToOpen} hideSessionSelectCaret={lockSessionToOpen} hideFooter={!showFooterSubmit} walletBalance={walletBefore} onSubmit={() => { setReviewRows(bids); setIsReviewOpen(true); }} showDateSession={true} extraHeader={null} selectedDate={selectedDate} setSelectedDate={handleDateChange}>
            <div className="px-3 sm:px-4 py-4 sm:py-2 md:max-w-7xl md:mx-auto">
                {showModeTabs && !desktopSplit && <div className="mb-4">{modeHeader}</div>}
                {warning && (<div className="fixed top-16 sm:top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-800/95 border border-blue-600 text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium shadow-xl max-w-[calc(100%-2rem)] sm:max-w-md backdrop-blur-sm">{warning}</div>)}

                {showModeTabs && activeTab === 'special' ? (
                    <>
                        {specialModeType === 'jodi' ? (
                            <>
                                {showModeTabs && desktopSplit && <div className="mb-4">{modeHeader}</div>}
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 xl:grid-rows-10 xl:grid-flow-col xl:gap-2">
                                    {jodiNumbers.map((num) => (
                                        <div key={num} className="flex items-center gap-1.5">
                                            <div className="w-10 h-9 bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center rounded-l-md font-bold text-xs shrink-0"><span className="inline-flex items-center gap-1"><span>{num[0]}</span><span>{num[1]}</span></span></div>
                                            <input type="number" min="0" placeholder="Pts" value={specialInputs[num] || ''} onChange={(e) => setSpecialInputs((p) => ({ ...p, [num]: e.target.value.replace(/\D/g, '').slice(0, 6) }))} className="w-full h-9 bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 rounded-r-md focus:outline-none focus:border-blue-500 px-2 text-xs font-semibold" />
                                        </div>
                                    ))}
                                </div>
                                {showInlineSubmit && (
                                    <div className="md:hidden mt-4">
                                        {(() => { const enabled = bids.length > 0 || Object.values(specialInputs).some((v) => Number(v) > 0); const disabled = bids.length === 0 && !Object.values(specialInputs).some((v) => Number(v) > 0); return (<button type="button" disabled={disabled} onClick={handleSubmitFromSpecial} className={submitBtnClass(enabled)}>Submit Bet</button>); })()}
                                    </div>
                                )}
                            </>
                        ) : (specialModeType === 'doublePana' || specialModeType === 'singlePana') && validPanasForSumMode.length > 0 ? (
                            <>
                                <div className={desktopSplit ? 'md:grid md:grid-cols-2 md:gap-6 md:items-start' : ''}>
                                    <div>
                                        {showModeTabs && desktopSplit && <div className="mb-4">{modeHeader}</div>}
                                        <div className="flex flex-col gap-3 mb-4">
                                            <div className="flex flex-row items-center gap-2"><label className="text-gray-600 text-sm font-medium shrink-0 w-32">Select Game Type:</label><div className="flex-1 min-w-0 bg-blue-50 border border-blue-200 rounded-full py-2.5 min-h-[40px] px-4 flex items-center justify-center text-sm font-bold text-gray-900">{session}</div></div>
                                            <div className="flex flex-row items-center gap-2"><label className="text-gray-600 text-sm font-medium shrink-0 w-32">Enter Points:</label><input ref={pointsInputRef} type="text" inputMode="numeric" value={inputPoints} onChange={(e) => setInputPoints(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Point" className="no-spinner flex-1 min-w-0 bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 rounded-full py-2.5 min-h-[40px] px-4 text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none" /></div>
                                        </div>
                                        <div className="flex gap-4 mb-4">
                                            <div className="flex-1 bg-blue-50 border border-blue-200 rounded-xl p-2">
                                                <h3 className="text-sm font-bold text-blue-600 mb-3 text-center">Select Sum</h3>
                                                <div className="grid grid-cols-5 sm:grid-cols-5 gap-1.5 sm:gap-2 md:gap-3">
                                                    {[0,1,2,3,4,5,6,7,8,9].map((num) => {
                                                        const totalPointsForSum = pointsBySum[num] || 0;
                                                        const hasPoints = Number(inputPoints) > 0;
                                                        return (<button key={num} type="button" disabled={!hasPoints} onClick={(e) => { if (!hasPoints) return; e.preventDefault(); e.stopPropagation(); handleKeypadClick(num); }} className={`relative aspect-square min-h-[40px] sm:min-h-[44px] md:min-h-[48px] text-gray-900 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-all active:scale-90 shadow-lg select-none bg-blue-100 border-2 border-blue-200 ${hasPoints ? 'cursor-pointer hover:border-blue-400' : 'cursor-not-allowed opacity-50'}`} style={{ touchAction: 'manipulation' }}>{num}{totalPointsForSum > 0 && (<span className="absolute top-0.5 right-0.5 bg-blue-600 text-white text-[8px] font-bold rounded-full min-w-[14px] h-3.5 px-0.5 flex items-center justify-center shadow-md">{totalPointsForSum > 999 ? '999+' : totalPointsForSum}</span>)}</button>);
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <button type="button" disabled={(specialModeType === 'jodi' || specialModeType === 'doublePana') ? bids.length === 0 && !Object.values(specialInputs).some((v) => Number(v) > 0) : !bids.length} onClick={(specialModeType === 'jodi' || specialModeType === 'doublePana') ? handleSubmitFromSpecial : () => { setReviewRows(bids); setIsReviewOpen(true); }} className={`py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl shadow-md hover:from-blue-600 hover:to-blue-700 transition-all active:scale-[0.98] ${((specialModeType === 'jodi' || specialModeType === 'doublePana') ? (bids.length === 0 && !Object.values(specialInputs).some((v) => Number(v) > 0)) : !bids.length) ? 'opacity-50 cursor-not-allowed' : ''}`}>Submit Bet</button>
                                            </div>
                                        </div>
                                        {desktopSplit && <div className="md:hidden mt-4">{bidsList}</div>}
                                        {!desktopSplit && bidsList}
                                    </div>
                                    {desktopSplit && <div className="hidden md:block">{bidsList}</div>}
                                </div>
                            </>
                        ) : (
                            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-center text-gray-600"><div className="text-gray-900 font-semibold mb-1">Special Mode</div><div className="text-sm text-gray-600">This bet type uses Easy Mode only.</div></div>
                        )}
                        {showInlineSubmit && (
                            <div className="hidden md:block mt-4">
                                {(() => { const enabled = (specialModeType === 'jodi' || specialModeType === 'doublePana' || specialModeType === 'singlePana') ? bids.length > 0 || Object.values(specialInputs).some((v) => Number(v) > 0) : bids.length > 0; return (<button type="button" disabled={(specialModeType === 'jodi' || specialModeType === 'doublePana') ? bids.length === 0 && !Object.values(specialInputs).some((v) => Number(v) > 0) : !bids.length} onClick={(specialModeType === 'jodi' || specialModeType === 'doublePana' || specialModeType === 'singlePana') ? handleSubmitFromSpecial : () => { setReviewRows(bids); setIsReviewOpen(true); }} className={submitBtnClass(enabled)}>Submit Bet</button>); })()}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <div className={desktopSplit ? 'md:grid md:grid-cols-2 md:gap-6 md:items-start' : ''}>
                            <div>
                                {showModeTabs && desktopSplit && <div className="mb-4">{modeHeader}</div>}
                                <div className="flex flex-col gap-3 mb-4">
                                    <div className="flex flex-row items-center gap-2"><label className="text-gray-600 text-sm font-medium shrink-0 w-32">Select Game Type:</label><div className="flex-1 min-w-0 bg-blue-50 border border-blue-200 rounded-full py-2.5 min-h-[40px] px-4 flex items-center justify-center text-sm font-bold text-gray-900">{session}</div></div>
                                    <div className="flex flex-row items-center gap-2"><label className="text-gray-600 text-sm font-medium shrink-0 w-32">{label}:</label><input type={maxLength === 1 || maxLength === 2 ? 'text' : 'number'} inputMode="numeric" value={inputNumber} onChange={handleNumberInputChange} placeholder={labelKey} maxLength={maxLength} className={`flex-1 min-w-0 bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 rounded-full py-2.5 min-h-[40px] px-4 text-center text-sm focus:ring-2 focus:outline-none ${isNumberInvalid ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'focus:ring-blue-500 focus:border-blue-500'}`} /></div>
                                    <div className="flex flex-row items-center gap-2"><label className="text-gray-600 text-sm font-medium shrink-0 w-32">Enter Points:</label><input ref={pointsInputRef} type="text" inputMode="numeric" value={inputPoints} onChange={(e) => setInputPoints(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Point" className="no-spinner flex-1 min-w-0 bg-blue-50 border border-blue-200 text-gray-900 placeholder-gray-500 rounded-full py-2.5 min-h-[40px] px-4 text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none" /></div>
                                </div>
                                {showInlineSubmit ? (
                                    <div className="grid grid-cols-2 gap-3 mb-5 sm:mb-6 md:grid-cols-1">
                                        <button type="button" onClick={handleAddBid} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 min-h-[48px] rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all active:scale-[0.98]">Add to List</button>
                                        <button type="button" disabled={!bids.length} onClick={() => { setReviewRows(bids); setIsReviewOpen(true); }} className={submitBtnClass(!!bids.length)}>Submit Bet</button>
                                    </div>
                                ) : (
                                    <button type="button" onClick={handleAddBid} className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 min-h-[48px] rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all active:scale-[0.98] mb-5 sm:mb-6">Add to List</button>
                                )}
                                {desktopSplit && <div className="md:hidden">{bidsList}</div>}
                                {!desktopSplit && bidsList}
                            </div>
                            {desktopSplit && <div className="hidden md:block">{bidsList}</div>}
                        </div>
                    </>
                )}
            </div>
            <BidReviewModal open={isReviewOpen} onClose={handleCancelBet} onSubmit={handleSubmitBet} marketTitle={marketTitle} dateText={dateText} labelKey={labelKey} rows={bids} walletBefore={walletBefore} totalBids={bids.length} totalAmount={totalPoints} />
        </BidLayout>
    );
};

export default EasyModeBid;
