const getWeightAllFlour = (weight, percentH, percentSalt) => {
  return (weight * 100) / (100 + percentH + percentSalt / 10);
};

const getWeight = (totalWeight, percent) => {
  return (totalWeight * percent) / 100;
};

const getPercent = (total, weight) => {
  return (100 * weight) / total;
};

const getProportionsInSourdough = (weightSourdough, percentWaterLeavin) => {
  const waterWeight = getWeight(weightSourdough, percentWaterLeavin);
  const sourdoughWeight = weightSourdough - waterWeight;
  return { waterInS: waterWeight, flourInS: sourdoughWeight };
};

// Utiliser pour recalculer le poid de levain
const getWeightSourdoughFromFlour = (percentS, weightF) => {
  return Math.round((weightF * percentS) / 100);
  // const percentToUse = percentS / 2; // Les proportions seront à corriger
};

export const getMaxPercentWater = (measures, percentWaterLeavin) => {
  const { weightWater, weightFlour, weightSourdough } =
    calculateWeights(measures, percentWaterLeavin);
    // Proportions à adapter
  const partFlour = weightSourdough / 2;
  const partWater = weightSourdough / 2;
  let percentW = measures.percentH;
  if (weightWater < 0 || weightWater === 0) {
    percentW = getPercent(weightFlour + partFlour, partWater);
  }
  return Math.ceil(percentW);
};

const getWeightFlour = (weightEtalon, flourInS) => {
  return weightEtalon - flourInS;
};

const getWeightWater = (weightEtalon, percentH, waterInS) => {
  const weightWaterAll = getWeight(weightEtalon, percentH);
  return weightWaterAll - waterInS;
};

export const getNewSizeEtalonWeight = ({ percentS }, newWeightFlour, percentWaterLeavin) => {
  const weightSourdough = getWeightSourdoughFromFlour(percentS, newWeightFlour);
  const { flourInS } = getProportionsInSourdough(weightSourdough, percentWaterLeavin);
  return flourInS + newWeightFlour;
  // return 500;
};

export const newTotalWeightFromFlour = (
  { percentH, percentS, percentSalt},
  newEtalon,
  percentWaterLeavin
) => {
  const weightSourdough = Math.round(
    getWeightSourdoughFromFlour(percentS, newEtalon)
  );
  const weightSalt = getWeight(newEtalon, percentSalt / 10);
  const { waterInS, flourInS } = getProportionsInSourdough(weightSourdough, percentWaterLeavin);
  const weightFlour = getWeightFlour(newEtalon, flourInS);
  const weightWater = getWeightWater(newEtalon, percentH, waterInS);
  return weightSourdough + weightSalt + weightFlour + weightWater;
};

const WeightBasedOnFlourWeight = (
  percentS,
  weightEtalon,
  newPercentSourdough,
  newPercentSalt,
  newPercentWater, 
  percentWaterLeavin,
) => {
  const oldWeightSourdough = getWeightSourdoughFromFlour(
    percentS,
    weightEtalon
  );
  const oldProportions = getProportionsInSourdough(oldWeightSourdough, percentWaterLeavin);
  // A adapter si changement de proportions dans le levain
  const percentToUse = newPercentSourdough / 2;

  let weightFlour = Math.round(
    getWeightFlour(weightEtalon, oldProportions.flourInS)
  );
  weightEtalon = (weightFlour / (100 - percentToUse)) * 100;
  let weightSourdough = Math.round(
    getWeightSourdoughFromFlour(newPercentSourdough, weightEtalon)
  );

  let { waterInS } = getProportionsInSourdough(weightSourdough, percentWaterLeavin);
  let weightSalt = getWeight(weightEtalon, newPercentSalt / 10);
  let weightWater = getWeightWater(weightEtalon, newPercentWater, waterInS);

  return weightSourdough + weightSalt + weightFlour + weightWater;
};

export const resetWeightBy = (
  { percentH, weight, percentS, percentSalt },
  {factor, percent},
  percentWaterLeavin,
) => {
  let newPercentSalt = factor === "salt" ? percent : percentSalt;
  let newPercentWater = factor === "water" ? percent : percentH;
  let newPercentSourdough = factor === "sourdough" ? percent : percentS;
  let weightEtalon = getWeightAllFlour(weight, percentH, percentSalt);
  let weightSourdough = Math.round(
    getWeightSourdoughFromFlour(newPercentSourdough, weightEtalon)
  );
  let weightSalt = getWeight(weightEtalon, newPercentSalt / 10);
  // console.log("resetWeightBy called");
  let { waterInS, flourInS } = getProportionsInSourdough(weightSourdough);
  let weightFlour = getWeightFlour(weightEtalon, flourInS);
  let weightWater = getWeightWater(weightEtalon, newPercentWater, waterInS);

  if (factor === "salt" || "sourdough") {
    return WeightBasedOnFlourWeight(
      percentS,
      weightEtalon,
      newPercentSourdough,
      newPercentSalt,
      newPercentWater,
      percentWaterLeavin,
    );
  }

  return weightSourdough + weightSalt + weightFlour + weightWater;
};

export const calculateWeights = ({
  weight,
  percentH,
  percentS,
  percentSalt,
}, percentWaterLeavin) => {
  
  const weightEtalon = getWeightAllFlour(weight, percentH, percentSalt);
  const weightSourdough = Math.round(getWeight(weightEtalon, percentS));
  const weightSalt = Math.round(getWeight(weightEtalon, percentSalt) / 10);
  const { waterInS, flourInS } = getProportionsInSourdough(weightSourdough, percentWaterLeavin);
  const weightFlour = Math.round(getWeightFlour(weightEtalon, flourInS));
  const weightWater = Math.round(
    getWeightWater(weightEtalon, percentH, waterInS)
  );

  return {
    weightSalt: weightSalt,
    weightFlour: weightFlour,
    weightSourdough: weightSourdough,
    weightWater: weightWater,
  };
};
