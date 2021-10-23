import React, { useState, createContext } from 'react';

export const leavinChoiceContext = createContext();

export function LeavinProvider({ children }) {
    const [displayxp, setDisplayxp] = useState(false);
    const [leavinType, setLeavinType] = useState(0);
    const [percentWaterLeavin, setPercentWaterLeavin] = useState(50);

    const updateRatio = (e) => {
        const percentWaterIntoLeavin = parseInt(e.target.value);
        setPercentWaterLeavin(percentWaterIntoLeavin);
    }

    const switchTypeRatio = (type) => {
        setLeavinType(type);
        if(type === 0){
            setPercentWaterLeavin(50);
        }
        if(type === 1){
            setPercentWaterLeavin(33);
        }
        if(type === 2){
            setDisplayxp(true);
        }
    }

    const provider = {
        leavinType,
        setLeavinType,
        updateRatio,
        displayxp,
        switchTypeRatio,
        percentWaterLeavin
    };

    return (
        <leavinChoiceContext.Provider value={provider}>
            {children}
        </leavinChoiceContext.Provider>
    );
};