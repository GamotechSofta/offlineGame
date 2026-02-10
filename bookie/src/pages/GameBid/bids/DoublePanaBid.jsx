import React from 'react';
import EasyModeBid from './EasyModeBid';

const validatePana = (n) => {
    if (!n) return false;
    const str = n.toString().trim();
    if (!/^[0-9]{3}$/.test(str)) return false;
    const digits = str.split('').map(Number);
    const [first, second, third] = digits;
    const hasConsecutiveSame = (first === second) || (second === third);
    if (!hasConsecutiveSame) return false;
    if (first === 0) return false;
    if (second === 0 && third === 0) return true;
    if (first === second && third === 0) return true;
    if (third <= first) return false;
    return true;
};

const getAllValidDoublePana = () => {
    const validPanas = [];
    for (let i = 0; i <= 999; i++) {
        const str = String(i).padStart(3, '0');
        if (validatePana(str)) validPanas.push(str);
    }
    return validPanas;
};

const DoublePanaBid = (props) => (
    <EasyModeBid
        {...props}
        label="Enter Pana"
        maxLength={3}
        validateInput={validatePana}
        showBidsList
        openReviewOnAdd={false}
        showInlineSubmit
        showModeTabs
        desktopSplit
        specialModeType="doublePana"
        validDoublePanas={getAllValidDoublePana()}
    />
);

export default DoublePanaBid;
