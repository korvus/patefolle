import React, { Component } from "react";
import Title from "./components/title";
import Note from "./components/noteinfos";
import { Leaven, Hydration } from "./components/infos.js";
import { roundDecimal } from "./functions/tools.js";
import style from "./styles/wrapper.module.css";
import co from "./styles/quantities.module.css";
import Timer from "./components/timer.js";
import Proportions from "./components/proportions.js";
import Menuleavinchoice from "./components/leavintype.js";
import ProportionLeavin from "./components/proportionsLeavin.js";
import { LanguageProvider, Text, FuncText } from "./containers/language";
import { LeavinProvider } from "./containers/leavinChoice";
import LanguageSelector from "./components/languageSelector.js";
import "./styles/global.css";
import Recipes from "./components/recipes.js";

class Home extends Component {
  constructor(props) {
    super(props);
    this.wrapper = React.createRef();
    this.state = {
      value: 0,
      visibilitySchedule: true,
      weight: 840,
      kilo: false,
      kilogram: 1,
      percentS: 16,
      weightS: 0,
      percentH: 66,
      weightW: 0,
      weightF: 0,
      percentSalt: 18,
      weightSalt: 10,
      currentCountDown: false,
      durationDefault: {
        zenith: 300,
        autolyse: 90,
        fermentation: 240,
        proofing: 500,
        saf: 0,
      },
    };
    this.handleScroll = this.handleScroll.bind(this);
  }

  handleScroll() {
    if (
      this.wrapper.current.titleSectionTimer &&
      this.wrapper.current.titleSectionTimer.current.offsetTop > window.scrollY
    ) {
      if (this.state.visibilitySchedule === false) {
        this.setState({ visibilitySchedule: true });
      }
    } else {
      if (this.state.visibilitySchedule === true) {
        this.setState({ visibilitySchedule: false });
      }
    }
  }

  componentDidMount() {
    const paramsUrl = window.location.hash;
    // this.setServiceWorker();
    if (paramsUrl.length > 0) {
      this.checkUrlParams(paramsUrl);
    } else {
      this.calculateSourdough();
    }
    window.addEventListener("scroll", this.handleScroll);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  checkUrlParams = (params) => {
    const regex =
      /^#\([0-9]{1,4}-[0-9]{1,4}-[0-9]{1,4}-[0-9/.]{1,8}\)\([0-9]{1,4}-[0-9]{1,4}-[0-9]{1,4}\([0-9]{1,2}\)-[0-9]{1,4}\)/gm;
    const fit = regex.test(params);
    if (fit) {
      const maskValues = /[0-9/.]{1,5}/g;
      let arrayIterator = [...params.matchAll(maskValues)];
      this.setData(arrayIterator);
    } else {
      this.calculateSourdough();
    }
  };

  /* setServiceWorker = () => {} */

  isRunning = (cdRunning) => {
    this.setState({ currentCountDown: cdRunning });
  };

  calculateWaterWeight = () => {
    const { percentH, weightF } = this.state;
    const halfSoudrough = this.state.weightS / 2;
    // console.log("this.state.weightS", this.state.weightS);
    let weightFlourTotal = halfSoudrough + weightF;
    let weightW = Math.round(
      (weightFlourTotal * percentH) / 100 - halfSoudrough
    );
    this.setState({ weightW }, () => {
      this.displayKilogram();
      document.body.style = `background: #eee; background: linear-gradient(180deg, #a4d7f1 0%, #a4d7f1 ${percentH}%, #ceb192 ${
        parseInt(percentH) + 5
      }%, #ceb192 100%) fixed`;
      //this.calculateTotalWeight();
    });
  };

  calculateSourdough = () => {
    const { weight, weightSalt, percentS, percentH, percentSalt } = this.state;
    const weightWithoutSalt = weight - weightSalt;
    const weightFlourTotal =
      (weightWithoutSalt * 100) / (100 + parseInt(percentH));
    const newWeightS = (weightFlourTotal * percentS) / 100;
    const newWeightSalt = roundDecimal(
      roundDecimal(weightFlourTotal * (percentSalt / 100), 2) / 10
    );
    const newWeightF = Math.round(weightFlourTotal - newWeightS / 2);
    this.setState(
      { weightS: newWeightS, weightF: newWeightF, weightSalt: newWeightSalt },
      () => {
        this.calculateWaterWeight();
      }
    );
  };

  setUpSalt = (e) => {
    const newPercentSalt = parseInt(e.target.value);
    this.setState(
      {
        percentSalt: newPercentSalt,
      },
      () => {
        this.calculateFromFlour();
      }
    );
  };

  setUpFlour = (e) => {
    const newWeightF = parseInt(e.target.value);
    this.setState(
      {
        weightF: newWeightF,
      },
      () => {
        this.calculateFromLeavin();
      }
    );
  };

  calculateFromFlour = () => {
    const { weightS, weightF, percentH, percentSalt } = this.state;
    const halfWeightLeavin = Math.round(weightS / 2);
    const weightFlourAbsolute = weightF + halfWeightLeavin;
    let weightWaterAbsolute = (weightFlourAbsolute * parseInt(percentH)) / 100;
    let weightW = Math.round(weightWaterAbsolute - halfWeightLeavin);
    const weightSalt =
      ((weightF + halfWeightLeavin) * (percentSalt / 10)) / 100;
    let WeightTotal = Math.round(weightW + weightF + weightS + weightSalt);

    if(weightW < 0){
      const waterSourdoughPrct = halfWeightLeavin*100/WeightTotal;
      weightWaterAbsolute = (WeightTotal * waterSourdoughPrct) / 100;
      weightW = Math.round(weightWaterAbsolute - halfWeightLeavin);
      WeightTotal = Math.round(weightW + weightF + weightS + weightSalt);
      this.setState({
        percentH: Math.round(waterSourdoughPrct)        
      });
    }

    this.setState({
      weightW,
      weight: WeightTotal,
      weightSalt,
    });


  };

  calculateFromLeavin = () => {
    const { percentS,  weightF } = this.state;
    const percentToUse = percentS / 2;
    const weightS = Math.round((weightF * percentToUse) / (100 - percentToUse));

    this.setState({ weightS: weightS * 2 }, () => {
      this.calculateFromFlour();
    });

    /* Check if Water into sourdough is more than */

  };

  /*
  setUpLockedWeight = () => {
    this.setState({ lockedWeight: !this.state.lockedWeight })
  }
  */

  estimateWeightWater = (percentH) => {
    const { weightS, weightF } = this.state;
    const halfWeightLeavin = Math.round(weightS / 2);
    const weightFlourAbsolute = weightF + halfWeightLeavin;
    const weightWaterAbsolute = (weightFlourAbsolute * parseInt(percentH)) / 100;
    const weightW = Math.round(weightWaterAbsolute - halfWeightLeavin);
    return weightW;
  }

  setUpValue = (e, field) => {
    if (field === "sourdough") {
      this.setState(
        {
          percentS: e.target.value,
        },
        () => {
          this.calculateFromLeavin();
        }
      );
    }

    if (field === "hydration") {
      let valuePercentH = 0;
      /*
      // lock when 0 water to add, consider water inside leavin
      if (this.estimateWeightWater(e.target.value) < 0 ) {
        if(this.estimateWeightWater(e.target.value) > 0){
          valuePercentH = e.target.value;
        } else {
          // console.log("negatif", e.target.value, this.state.percentH, this.estimateWeightWater(this.state.percentH), this.estimateWeightWater(this.state.percentH-1));
          valuePercentH = this.state.percentH;
        }
      } else {
      */
        valuePercentH = e.target.value;
      // }

      // Updating the state with value previously calculated
      this.setState(
        {
          percentH: valuePercentH,
        },
        () => {
          this.calculateFromFlour();
        }
      );
    }
  };

  displayKilogram = () => {
    const gramm = this.state.weight;
    if (gramm > 1000) {
      let kilogram = gramm / 1000;
      kilogram = roundDecimal(kilogram, 2);
      this.setState({ kilo: true, kilogram: kilogram });
    } else {
      this.setState({ kilo: false });
    }
  };

  setUpByWeight = (e) => {
    this.setState({ weight: e.target.value }, () => {
      this.displayKilogram();
      this.calculateSourdough();
    });
  };

  setData = (params) => {
    this.setState(
      {
        weight: parseInt(params[0][0]),
        percentS: parseInt(params[1][0]),
        percentH: parseInt(params[2][0]),
        weightSalt: parseInt(params[3][0]),
        durationDefault: {
          zenith: parseInt(params[4][0]),
          autolyse: parseInt(params[5][0]),
          fermentation: parseInt(params[6][0]),
          saf: parseInt(params[7][0]),
          proofing: parseInt(params[8][0]),
        },
      },
      () => {
        this.calculateSourdough();
      }
    );
  };

  clickSavedRecipe = (e) => {
    const { currentCountDown } = this.state;
    // console.log("currentCountDown", currentCountDown);
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

    this.setState(
      {
        weight: datas.weight,
        percentS: datas.percentLeavin,
        percentH: datas.percentHydra,
        weightSalt: datas.weightSalt,
        durationDefault: {
          zenith: datas.zenith,
          autolyse: datas.autolyse,
          fermentation: datas.fermentation,
          proofing: datas.proofing,
          saf: datas.saf.length,
        },
      },
      () => {
        this.calculateSourdough();
      }
    );
  };

  render() {
    let {
      weight,
      kilo,
      kilogram,
      percentS,
      weightS,
      percentH,
      weightW,
      weightF,
      weightSalt,
      percentSalt,
      durationDefault,
      visibilitySchedule,
    } = this.state;
    weightS = Math.round(weightS);

    const propors = {
      weight,
      weightW,
      weightS,
      weightF,
      weightSalt,
    };

    const dataLeavin = {
      weightS,
    };

    const data = {
      weight,
      percentH,
      percentS,
      weightSalt,
    };

    return (
      <LanguageProvider>
        <LeavinProvider>
          <LanguageSelector />

          <Recipes trigger={this.clickSavedRecipe} />
          <section>
            <Title content="Balance" class="balance" />
            <div className={style.balance}>
              <div className={style.main}>
                <div className={style.range}>
                  <div className={co.blocks}>
                    <span className={co.flour}>
                      <span>
                        <b className={style.flour}>{weightF}g</b>
                        <Text tid="Flour" />
                      </span>
                      <input
                        value={weightF}
                        type="range"
                        aria-labelledby="sourdough"
                        onChange={(e) => this.setUpFlour(e)}
                        id="flour"
                        min="0"
                        max="1500"
                        step="10"
                      />
                    </span>
                    <span className={co.flour}>
                      <span>
                        <b>{Math.round(weightSalt)}g</b>
                        <Text tid="Salt" /> ({percentSalt / 10} %)
                      </span>
                      <input
                        value={percentSalt}
                        type="range"
                        aria-labelledby="salt"
                        onChange={(e) => this.setUpSalt(e)}
                        id="salt"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </span>
                  </div>
                  <label htmlFor="hydration">
                    {percentH}% <Text tid="hydration" />{" "}
                    <Note content={<Hydration />} />
                  </label>
                  <input
                    value={percentH}
                    type="range"
                    aria-labelledby="hydration"
                    onChange={(e) => this.setUpValue(e, "hydration")}
                    id="hydration"
                    min="0"
                    max="100"
                  />
                  <div className={co.blocks}>
                    <span>
                      <b className={style.water}>{weightW}ml</b>{" "}
                      <Text tid="Water" />
                    </span>
                  </div>
                </div>

                {/* percent leavin */}
                <div className={`${style.range} ${co.leavin}`}>
                  <label htmlFor="sourdough">
                    {percentS}% <Text tid="leaven" />{" "}
                    <Note content={<Leaven />} />
                  </label>
                  <input
                    value={percentS}
                    type="range"
                    aria-labelledby="sourdough"
                    onChange={(e) => this.setUpValue(e, "sourdough")}
                    id="sourdough"
                    min="0"
                    max="100"
                  />
                  <span>
                    <b>{weightS}g</b>
                  </span>
                  <Menuleavinchoice />
                  <ProportionLeavin dataLeavin={dataLeavin} />
                </div>

                {/* total weight */}
                <div className={style.label}>
                  <label htmlFor="weight">
                    > <Text tid="labelWeight" />
                  </label>
                  <input
                    type="number"
                    value={weight}
                    min="0"
                    max="10000"
                    step="10"
                    aria-labelledby="weight"
                    onChange={(e) => this.setUpByWeight(e)}
                    id="weight"
                    className={style.weight}
                  />
                  {/*
                  <sup onClick={e => this.setUpLockedWeight()} className={`${co.lockIcon} ${lockedWeight ? co.locked : co.unlocked}`}>lock</sup>
                */}
                  g<Text tid="toBake" />.
                  {kilo && <small>{`(${kilogram}kg)`}</small>}
                </div>
              </div>
            </div>
          </section>
          <Timer
            ref={this.wrapper}
            visibilitySchedule={visibilitySchedule}
            composition={data}
            countDownFunc={this.isRunning}
            schedule={durationDefault}
          />
          <Proportions
            visibilitySchedule={visibilitySchedule}
            composition={propors}
          />
        </LeavinProvider>
      </LanguageProvider>
    );
  }
}

export default Home;
