import React, { useContext } from "react";
import { leavinChoiceContext } from "../containers/leavinChoice";
import co from "../styles/quantities.module.css";
import { Text } from "../containers/language";

const ProportionsLeavin = (props) => {

    const { percentWaterLeavin, updateRatio, displayxp } = useContext(leavinChoiceContext);

    const {weightS} = props.dataLeavin;
    const weightWater = percentWaterLeavin*weightS/100;

    return (
            <section className={`${displayxp ? "" : "hide"} ${co.ratioWater}`}>
                    <span className={co.ratiosLeavin}>
                      <span>
                        {percentWaterLeavin}% <Text tid="Water" />
                        <b>({weightWater}gr)</b>
                      </span>
                      <input
                        value={percentWaterLeavin}
                        type="range"
                        aria-labelledby="leavin"
                        onChange={(e) => updateRatio(e)}
                        id="salt"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </span>
            </section>
    );
}

export default ProportionsLeavin;


