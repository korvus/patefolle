import React, {Component} from "react"
import Title from "./components/title"
import Note from "./components/noteinfos";
import { Leaven, Hydration, Salt } from "./components/infos.js";
import { roundDecimal } from "./functions/tools.js";
import style from "./styles/wrapper.module.css";
import co from "./styles/quantities.module.css";
import Timer from "./components/timer.js";
import { LanguageProvider, Text, FuncText } from './containers/language';
import LanguageSelector from "./components/languageSelector.js";
import "./styles/global.css";
import Recipes from "./components/recipes.js";


class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      weight: 840,
      kilo: false,
      kilogram: 1,
      percentS: 16,
      weightS: 0,
      percentH: 66,
      weightW: 0,
      weightF: 0,
      percentSalt: 2,
      weightSalt: 10,
      ratioFlourAbsolute: 0,
      currentCountDown: false,
      lockedWeight: true,
      durationDefault: {
        zenith: 300,
        autolyse: 90,
        fermentation: 240,
        proofing: 500,
        saf: []
      }
    };
  }

  componentDidMount(){
    const paramsUrl = window.location.hash;
    // this.setServiceWorker();
    if(paramsUrl.length > 0){
      this.checkUrlParams(paramsUrl);
    } else {
      this.calculateSourdough();
    }
  }

  checkUrlParams = (params) => {
    const regex = /^#\([0-9]{1,4}-[0-9]{1,4}-[0-9]{1,4}-[0-9/.]{1,8}\)\([0-9]{1,4}-[0-9]{1,4}-[0-9]{1,4}\([0-9]{1,2}\)-[0-9]{1,4}\)/gm;
    const fit = regex.test(params);
    if(fit){
      const maskValues = /[0-9/.]{1,5}/g;;
      let arrayIterator = [...params.matchAll(maskValues)];
      this.setData(arrayIterator);
    } else {
      this.calculateSourdough();
    }
  }

  /* setServiceWorker = () => {} */

  isRunning = (cdRunning) => {
    this.setState({ currentCountDown: cdRunning });
  }
  
  calculateWaterWeight = () => {
    const { percentH, weightF } = this.state;
    const halfSoudrough = this.state.weightS/2;
    // console.log("this.state.weightS", this.state.weightS);
    let weightFlourTotal = halfSoudrough + weightF;
    let weightW = Math.round((weightFlourTotal * percentH) / 100 - halfSoudrough);
    this.setState({ weightW },() => {
      this.displayKilogram();
      document.body.style = `background: #eee; background: linear-gradient(180deg, #a4d7f1 0%, #a4d7f1 ${percentH}%, #ceb192 ${parseInt(percentH) + 5}%, #ceb192 100%) fixed`;
      //this.calculateTotalWeight();
    });
  }

  calculateSourdough = () => {
    const {weight, weightSalt, percentS, percentH, percentSalt} = this.state;
    const weightWithoutSalt = weight - weightSalt;
    const weightFlourTotal = weightWithoutSalt * 100 / (100 + parseInt(percentH));
    const newWeightS = weightFlourTotal * percentS / 100;
    const newWeightSalt = roundDecimal(weightFlourTotal * (percentSalt / 100), 2);
    const newWeightF = Math.round(weightFlourTotal - newWeightS/2);
    this.setState({ weightS: newWeightS, weightF: newWeightF, weightSalt: newWeightSalt}, () => {
      this.calculateWaterWeight()
    });
  }

  setUpFlour = (e) => {
    const newWeightF = parseInt(e.target.value);
    this.setState({
      weightF: newWeightF
    }, () => {
      this.calculateFromLeavin();
    })
  }

  calculateFromFlour = () => {
    const {weightS, weightF, percentH, percentSalt} = this.state;
    const halfWeightLeavin = Math.round(weightS/2);
    const weightFlourAbsolute = weightF + halfWeightLeavin;
    const weightWaterAbsolute = (weightFlourAbsolute * percentH) / 100;
    const weightW = Math.round(weightWaterAbsolute - halfWeightLeavin);
    const weightSalt = (weightF + halfWeightLeavin)*percentSalt/100;
    const WeightTotal = Math.round(weightW + weightF + weightS + weightSalt);
    this.setState({
      weightW, weight: WeightTotal, weightSalt
    });
  }

  calculateFromLeavin = () => {
    const { percentS, weightF } = this.state;
    const percentToUse = percentS/2;
    const weightS = Math.round((weightF*percentToUse) / (100 - percentToUse));
    this.setState({ weightS: weightS*2 }, () => {
      this.calculateFromFlour();
    });
  }

  setUpLockedWeight = () => {
    this.setState({ lockedWeight: !this.state.lockedWeight })
  }

  setUpValue = (e, field) => {
    if(field === "sourdough"){
      this.setState({
        percentS: e.target.value,
      }, () => {
        if(this.state.lockedWeight){
          this.calculateSourdough();
        } else {
          this.calculateFromLeavin();
        }
      })
    }

    if(field === "hydration"){
      this.setState({
        percentH: e.target.value,
      }, () => {
        if(this.state.lockedWeight){
          this.calculateSourdough();
        } else {
          this.calculateFromFlour();
        }
      })
    }

  }

  displayKilogram = () => {
    const gramm = this.state.weight;
    if(gramm > 1000){
      let kilogram = gramm/1000
      kilogram = roundDecimal(kilogram,2);
      this.setState({kilo: true, kilogram: kilogram});
    } else {
      this.setState({kilo: false});
    }
  }

  setUpByWeight = (e) => {
    this.setState({ weight: e.target.value }, () => {
      this.displayKilogram();
      this.calculateSourdough();
    })

  }

  setData = (params) => {
    this.setState({
      weight: parseInt(params[0][0]),
      percentS: parseInt(params[1][0]),
      percentH: parseInt(params[2][0]),
      weightSalt: parseInt(params[3][0]),
      durationDefault: {
        zenith: parseInt(params[4][0]),
        autolyse: parseInt(params[5][0]),
        fermentation: parseInt(params[6][0]),
        saf: new Array(parseInt(params[7][0])),
        proofing: parseInt(params[8][0])
      }
    }, () => {
      this.calculateSourdough();
    })
  }

  clickSavedRecipe = (e) => {
    const { currentCountDown } = this.state;
    // console.log("currentCountDown", currentCountDown);
    const keyIndex = e.target.dataset.index;
    const recipesRegistered = JSON.parse(localStorage.getItem("patefolle-recipes")).recipes;
    const datas = recipesRegistered[keyIndex];

    const url = `(${datas.weight}-${datas.percentLeavin}-${datas.percentHydra}-${datas.weightSalt})(${datas.zenith}-${datas.autolyse}-${datas.fermentation}(${datas.saf.length})-${datas.proofing})`;
    window.location.hash = url;
    // url

    if(currentCountDown === true){
      if(!window.confirm(FuncText("countdownRunning"))){
        return;
      } else {
        navigator.serviceWorker.controller.postMessage({
          type: "CANCEL"
        });
      }
    }

    this.setState({
      weight: datas.weight,
      percentS: datas.percentLeavin,
      percentH: datas.percentHydra,
      weightSalt: datas.weightSalt,
      durationDefault: {
        zenith: datas.zenith,
        autolyse: datas.autolyse,
        fermentation: datas.fermentation,
        proofing: datas.proofing,
        saf: datas.saf
      }      
    }, () => {
      this.calculateSourdough();
    })
  }

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
      durationDefault,
      lockedWeight
    } = this.state;
    weightS = Math.round(weightS);

    const data = {
      weight,
      percentH,
      percentS,
      weightSalt
    }

    return (
      <LanguageProvider>
        
        <LanguageSelector />
        
        <Recipes trigger={this.clickSavedRecipe} />
        <section>
          <Title content="Balance" class="balance" />
          <div className={style.balance}>
            <div className={style.label}>
              <label htmlFor="weight">
                > <Text tid="labelWeight" />
              </label>
              <input type="number" value={weight} min="0" max="10000" step="10" aria-labelledby="weight" onChange={(e) => this.setUpByWeight(e)} id="weight" className={style.weight} />
              <sup onClick={e => this.setUpLockedWeight()} className={`${co.lockIcon} ${lockedWeight ? co.locked : co.unlocked}`}>lock</sup>
              g<Text tid="toBake" />.
              {kilo && <small>{`(${kilogram}kg)`}</small>}
            </div>
            <div className={style.main}>
              <div className={style.range}>
                <label htmlFor="sourdough">
                  {percentS}% <Text tid="leaven" /> <Note content={<Leaven />} />
                </label>
                <input value={percentS} type="range" aria-labelledby="sourdough" onChange={(e) => this.setUpValue(e, "sourdough")} id="sourdough" min="0" max="100" />
                <span><b>{weightS}g</b></span>
              </div>
              <div className={style.range}>
                <label htmlFor="hydration">
                    {percentH}% <Text tid="hydration" /> <Note content={<Hydration />} />
                </label>
                <input value={percentH} type="range" aria-labelledby="hydration" onChange={(e) => this.setUpValue(e, "hydration")} id="hydration" min="0" max="100" />
                <div className={co.blocks}>
                  <span className={co.flour}>
                    <span>
                    <b className={style.flour}>{weightF}g</b>
                    <sup onClick={e => this.setUpLockedWeight()} className={`${co.lockIconFlour} ${lockedWeight ? co.unlocked : co.locked}`}>lock</sup>
                    <Text tid="Flour" />
                    </span>
                    {!lockedWeight &&
                      <input value={weightF} type="range" aria-labelledby="sourdough" onChange={(e) => this.setUpFlour(e)} id="flour" min="0" max="1500" step="10" />
                    }
                  </span>
                  <span><b className={style.water}>{weightW}ml</b> <Text tid="Water" /></span>
                  <span><b>{weightSalt}g</b> <Text tid="Salt" /> <Note content={<Salt />} /></span>
                </div> 
              </div>
            </div>
            </div>

        </section>
        <Timer composition={data} countDownFunc={this.isRunning} schedule={durationDefault} />
      </LanguageProvider>
    );
  }
}

export default Home;