import React from "react";
import ModaleStyle from "../styles/modal.module.css";
import { Text } from '../containers/language';

export default function Modale(props) {
    const {display, close, data} = props;
    const safNumber = data.safNumber ?? "0";
    // console.log("props data", data);
    const items = [];

    const fermentation = data.timeFermentationMin;
    
    let percentToRemove = Math.round(9000/fermentation);
    if(fermentation < 120){
        percentToRemove = 25;
    }

    // const scopeInMinutes = Math.round(fermentation - 90);
    const TotalPercentToDivide = 100-percentToRemove;

    const slicePercent = TotalPercentToDivide/(parseInt(safNumber)+1);

    for (let a = 0; a < safNumber; a++) {
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
                            <Text tid="settingsaf" />
                        </label>

                        <input value={safNumber} type="range" aria-labelledby="number" onChange={(e) => data.setNumberOfStretchAndFold(e.target.value)} id="number" min="0" max="10" step="1" />
                        <div className={ModaleStyle.scope}>
                            {items}
                            <div style={{"left": `${TotalPercentToDivide}%`}} className={ModaleStyle.limit}></div>
                            {data.timeFermentation}
                        </div>
                        <span>
                            <Text tid="automaticDispatch" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
};