import React, { useState, useContext, createContext, useCallback } from "react";
// import { roundDecimal } from "../functions/tools.js";
import { leavinChoiceContext } from "../containers/leavinChoice";
import { timerContext } from "../containers/timerLogic";
import {
  getMaxPercentWater,
  getNewSizeEtalonWeight,
  newTotalWeightFromFlour,
  resetWeightBy,
  calculateWeights,
} from "../functions/percents.js";
import { FuncText } from "./language";

export const ingredientsContext = createContext();

export function IngredientsProvider({ children }) {
  const { percentWaterLeavin } = useContext(leavinChoiceContext);
  const { currentCountDown, setDurationDefault } = useContext(timerContext);

  const [measures, setMeasures] = useState({
    originChange: "weight",
    weight: 840,
    percentH: 66,
    percentS: 16,
    percentSalt: 20,
  });


  const setUpByWeight = (e) => {
    setMeasures({
      ...measures,
      weight: e.target.value,
      originChange: "weight",
    });
  };

  const setUpFlour = (e) => {
    const newWeightFlourEtalon = parseInt(e.target.value);
    const newEtalon = getNewSizeEtalonWeight(
      measures,
      newWeightFlourEtalon,
      percentWaterLeavin
    );
    const newWeight = Math.round(
      newTotalWeightFromFlour(measures, newEtalon, percentWaterLeavin)
    );
    setMeasures({ ...measures, weight: newWeight });
  };

  const setUpSalt = (e) => {
    const newPercentSalt = parseInt(e.target.value);
    const newWeight = Math.round(
      resetWeightBy(measures, {factor:"salt", percent:newPercentSalt}, percentWaterLeavin)
    );
    setMeasures({
      ...measures,
      percentSalt: newPercentSalt,
      weight: newWeight,
    });
  };

  const setUpValue = (e, field) => {
    if (field === "sourdough") {
      const valuePercentSourdough = parseInt(e.target.value);
      const newWeight = Math.round(
        resetWeightBy(measures, {factor: "sourdough", percent: valuePercentSourdough}, percentWaterLeavin)
      );
      const percentW = getMaxPercentWater({
        weight: newWeight,
        percentH: measures.percentH,
        percentS: valuePercentSourdough,
        percentSalt: measures.percentSalt,
      }, percentWaterLeavin);
      setMeasures({
        ...measures,
        percentS: valuePercentSourdough,
        percentH: percentW,
        weight: newWeight,
      });
    }

    if (field === "hydration") {
      const valuePercentH = parseInt(e.target.value);
      const newWeight = resetWeightBy(measures, {factor: "water", percent: valuePercentH}, percentWaterLeavin);
      const { weightWater } = calculateWeights({
        weight: newWeight,
        percentH: valuePercentH,
        percentS: measures.percentS,
        percentSalt: measures.percentSalt,
      }, percentWaterLeavin);
      if (weightWater < 0) return;
      setMeasures({ ...measures, percentH: valuePercentH, weight: newWeight });
    }
  };

  const clickSavedRecipe = (e) => {
    const keyIndex = e.target.dataset.index;
    const recipesRegistered = JSON.parse(
      localStorage.getItem("patefolle-recipes")
    ).recipes;
    const datas = recipesRegistered[keyIndex];

    const url = `(${datas.weight}-${datas.percentLeavin}-${datas.percentHydra}-${datas.weightSalt})(${datas.zenith}-${datas.autolyse}-${datas.fermentation}(${datas.saf.length})-${datas.proofing})`;
    window.location.hash = url;
    // url

    if (currentCountDown === true) {
      if (!window.confirm(FuncText("countdownRunning"))) {
        return;
      }
    }

    setMeasures({
      ...measures,
      weight: datas.weight,
      percentS: datas.percentLeavin,
      percentH: datas.percentHydra,
      weightSalt: datas.weightSalt,
    });
    setDurationDefault({
      zenith: datas.zenith,
      autolyse: datas.autolyse,
      fermentation: datas.fermentation,
      proofing: datas.proofing,
      saf: datas.saf.length,
    });
  };

  const formateData_old = useCallback((params) => {
    const maskValues = /[0-9/.]{1,5}/g;
    let arrayIterator = [...params.matchAll(maskValues)];
    console.log("arrayIterator", params);

    setMeasures((measures) => {
      return {
        ...measures,
        weight: parseInt(arrayIterator[0][0]),
        percentH: parseInt(arrayIterator[2][0]),
        percentS: parseInt(arrayIterator[1][0]),
        percentSalt: 18,
      };
    });
    setDurationDefault([
      { label: "frasage", duration: 10, max: 30 },
      { label: "autolyse", i10label: "autolysisTimer", duration: parseInt(arrayIterator[5][0]), max: 300 },
      { label: "pétrissage", duration: 10, max: 30 },
      {
        label: "pointage",
        i10label: "bulkFermentationDuration",
        duration: parseInt(arrayIterator[6][0]),
        max: 1200,
      },
      { label: "boulage", duration: 5, max: 60 },
      {
        label: "apprêt",
        i10label: "Proofing",
        duration: 480,
        max: 1200,
        min: 60,
      },
      { label: "cuisson", duration: 20, max: 120 }
    ]);

    /*
      zenith: parseInt(params[4][0]),
      fermentation: parseInt(params[6][0]),
      saf: parseInt(params[7][0]),
      proofing: parseInt(params[8][0])
    */

  }, [setDurationDefault]);

  const formateData = useCallback((params) => {
    console.log("params", params);

    setMeasures(params.ingredients);
    setDurationDefault(params.timing);

    // calculateSourdough();
  }, [setDurationDefault, setMeasures]);

  const checkUrlParams = useCallback(
    (params) => {
      const regexOld = /^#\([0-9]{1,4}-[0-9]{1,4}-[0-9]{1,4}-[0-9/.]{1,8}\)\([0-9]{1,4}-[0-9]{1,4}-[0-9]{1,4}\([0-9]{1,2}\)-[0-9]{1,4}\)/gm;
      const regexBase64 = /^#(?:[A-Za-z\d+/]{4})*(?:[A-Za-z\d+/]{3}=|[A-Za-z\d+/]{2}==)?$/;

      console.log("params : ", params);

      const fitV1 = regexOld.test(params);
      const fitV2 = regexBase64.test(params);

      if (fitV1) {
        formateData_old(params);
      }
      if(fitV2) {
        formateData(JSON.parse(atob(params.slice(1))));
      }
    },
    [formateData, formateData_old]
  );

  const provider = {
    measures,
    setUpSalt,
    setUpFlour,
    setUpValue,
    setUpByWeight,
    checkUrlParams,
    clickSavedRecipe,
  };

  return (
    <ingredientsContext.Provider value={provider}>
      {children}
    </ingredientsContext.Provider>
  );
}
