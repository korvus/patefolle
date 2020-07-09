import React from "react";
import ModaleStyle from "./modal.module.css";

export default function Modale(props) {
    const {display, close, data} = props;
    const items = [];

    const fermentation = data.timeFermentationMin;
    
    let percentToRemove = Math.round(9000/fermentation);
    if(fermentation < 120){
        percentToRemove = 0;
    }
    // const scopeInMinutes = Math.round(fermentation - 90);
    const TotalPercentToDivide = 100-percentToRemove;

    const slicePercent = TotalPercentToDivide/(parseInt(data.safNumber)+1);

    for (let a = 0; a < data.safNumber; a++) {
        const timeToHuman = data.convertMinuts(Math.round(data.timeSlice+(a*(data.timeSlice))));
        items.push(<div style={{"left": `${slicePercent+(a*slicePercent)}%`}} title={timeToHuman} className={ModaleStyle.saf} key={a}></div>)
    }

    return (
        <div className={`${ModaleStyle.backgroundModal} ${display ? "" : "hide"}`} role="presentation" onClick={() => close()}>
            <div role="presentation" onClick={e => e.stopPropagation()} className={ModaleStyle.modal}>
                <span role="presentation" className={ModaleStyle.cross} onKeyDown={() => close} onClick={() => close()}>x</span>
                <div>
                    <div className={ModaleStyle.range}>
                        <label htmlFor="number">
                            Set a number of Stretch &amp; Fold between 0 and 10:
                        </label>

                        <input value={data.safNumber} type="range" aria-labelledby="number" onChange={(e) => data.setNumberOfStretchAndFold(e.target.value)} id="number" min="0" max="10" step="1" />
                        <div className={ModaleStyle.scope}>
                            {items}
                            <div style={{"left": `${TotalPercentToDivide}%`}} className={ModaleStyle.limit}></div>
                            {data.timeFermentation}
                        </div>
                        <span>
                            They will be automatically dispatched in the time scope minus 90 minuts for letting the dough working.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
};