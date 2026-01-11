import React, { useContext } from "react";
import { leavinChoiceContext } from "../containers/leavinChoice";
import co from "../styles/quantities.module.css";
import { Text } from "../containers/language";
import { ingredientsContext } from "../containers/ingredients";
import { calculateWeights } from "../functions/percents.js";

const ProportionsLeavin = (props) => {

    const { percentWaterLeavin, updateRatio, displayxp } = useContext(leavinChoiceContext);
    const { measures } = useContext(ingredientsContext);

    const { weightSourdough } = calculateWeights(measures, percentWaterLeavin);
    const weightWater = percentWaterLeavin*weightSourdough/100;

    return (
            <section className={`${displayxp ? "" : "hide"} ${co.ratioWater}`}>
                    <span className={co.ratiosLeavin}>
                      <span>
                      <b>{percentWaterLeavin}% <Text tid="Water" /></b>
                        ({weightWater}gr)
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


