import React, { useContext } from "react";
import { leavinChoiceContext } from "../containers/leavinChoice";
import proportionStyle from "../styles/proportions.module.css";
import { Text } from "../containers/language";

const Proportions = (props) => {

    const { weight, weightW, weightF, weightSalt, weightS } = props.composition;
    const { percentWaterLeavin } = useContext(leavinChoiceContext);

    const percentS = weightS*100/weight;
    const percentW = weightW*100/weight;
    const percentF = weightF*100/weight;
    const percentSalt = weightSalt*100/weight;

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
