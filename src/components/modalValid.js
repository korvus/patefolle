import React from "react";
import ModaleStyle from "../styles/modal.module.css";
import { Text } from "../containers/language.js";

export default function Modale(props) {
        const {display, close} = props;

        return (
            <div className={`${ModaleStyle.backgroundModal} ${display ? "" : "hide"}`} role="presentation" onClick={() => close()}>
                <div role="presentation" onClick={e => e.stopPropagation()} className={ModaleStyle.modal}>
                    <span role="presentation" className={ModaleStyle.cross} onKeyDown={() => close} onClick={() => close()}>x</span>
                    <div>
                        <div className={ModaleStyle.saved}>
                            <Text tid="Saved" />
                            <span role="presentation" onFocus={() => console.log("do you want to refresh?")} onClick={() => document.location.reload()}>
                                <Text tid="RefreshThePage" />
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
};