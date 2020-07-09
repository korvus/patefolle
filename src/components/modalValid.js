import React from "react";
import ModaleStyle from "./modal.module.css";

export default function Modale(props) {
        const {display, close} = props;

        return (
            <div className={`${ModaleStyle.backgroundModal} ${display ? "" : "hide"}`} role="presentation" onClick={() => close()}>
                <div role="presentation" onClick={e => e.stopPropagation()} className={ModaleStyle.modal}>
                    <span role="presentation" className={ModaleStyle.cross} onKeyDown={() => close} onClick={() => close()}>x</span>
                    <div>
                        <div className={ModaleStyle.saved}>
                            Saved!
                            <span role="presentation" onFocus={() => console.log("do you want to refresh?")} onClick={() => document.location.reload()}>Refresh the page if you want it appear on top of the page!</span>
                        </div>
                    </div>
                </div>
            </div>
        )
};