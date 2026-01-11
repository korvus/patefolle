import React, { useContext } from "react";
import { leavinChoiceContext } from "../containers/leavinChoice";
import { ingredientsContext } from "../containers/ingredients";
import { calculateWeights } from "../functions/percents.js";
import proportionStyle from "../styles/proportions.module.css";
import { Text } from "../containers/language";

const Proportions = (props) => {

    const { measures } = useContext(ingredientsContext);
    const { percentWaterLeavin } = useContext(leavinChoiceContext);

    const { weightSalt, weightFlour, weightSourdough, weightWater } = calculateWeights(measures, percentWaterLeavin);

    const percentS = weightSourdough*100/measures.weight;
    const percentW = weightWater*100/measures.weight;
    const percentF = weightFlour*100/measures.weight;
    const percentSalt = weightSalt*100/measures.weight;

    return (
      <section
        className={`${proportionStyle.board} ${
          props.visibilitySchedule
            ? proportionStyle.Schedulevisible
            : proportionStyle.Scheduleinvisible
        }`}
      >
        <div className={proportionStyle.band}>
          <div
            className={`${proportionStyle.ingredient} ${proportionStyle.leavin}`}
            style={{ width: `${percentS}%`, display: `${percentS === 0 ? "none" : "inline-block"}` }}
          >
            <div className={proportionStyle.containerLeavin}>
                <div
                    className={`${proportionStyle.ingredientLeavin} ${proportionStyle.water}`}
                    style={{ width: `${percentWaterLeavin}%` }}
                ></div>
                
            </div>
            <span>
                <Text tid="leavenLabel" />
            </span>
          </div>
          <div
            className={`${proportionStyle.ingredient} ${proportionStyle.water}`}
            style={{ width: `${percentW}%` }}
          >
            <span><Text tid="WaterLabel" /></span>
          </div>
          <div
            className={`${proportionStyle.ingredient} ${proportionStyle.farine}`}
            style={{ width: `${percentF}%` }}
          >
            <span><Text tid="FlourLabel" /></span>
          </div>
          <div
            className={`${proportionStyle.ingredient} ${proportionStyle.salt}`}
            style={{ width: `${percentSalt}%` }}
          >
            <span><Text tid="SaltLabel" /></span>
          </div>
        </div>
      </section>
    );
}

export default Proportions;
