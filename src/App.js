import React, {Component} from "react"
import Title from "./components/title"
import Note from "./components/noteinfos";
import { Leaven, Hydration, Salt } from "./components/infos.en.js";
import { roundDecimal } from "./functions/tools.js";
import style from "./styles/wrapper.module.css";
import Timer from "./components/timer.js";
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
      durationDefault: {
        zenith: 300,
        autolyse: 90,
        fermentation: 240,
        proofingMinuts: 500,
        saf: []
      }
    };
  }

  componentDidMount(){
    const paramsUrl = window.location.hash;
    this.setServiceWorker();
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

  calculateTotalWeight = () => {
    const { weightSalt, weightW, weightF, weightS } = this.state;
    const weightTotal = Math.round(weightSalt + weightW + weightF + weightS);

    this.displayKilogram(weightTotal);

  }

  setServiceWorker = () => {
    if ('serviceWorker' in navigator) {
        Notification.requestPermission(permission => {
            if(!('permission' in Notification)) {
                Notification.permission = permission;
            }
            return permission;
        })
        .then(() => navigator.serviceWorker.register('/sw.js'))
        .catch(console.error);
        /* Listen to service Worker */
        navigator.serviceWorker.onmessage = (event) => {
            if (event.data) {
              if(event.data.status === "RUNNING"){
                this.setState({ currentCountDown: true });
              }
              if(event.data.status === "ENDING"){
                this.setState({ currentCountDown: false });
              }
            }
          };
    } else {
        console.warn('browser don\'t use services workers');
    }
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
    // On calcule d'abord le poid total des ingrédients, en retirant l'eau du levain
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

  setUpValue = (e, field) => {
    if(field === "sourdough"){
      this.setState({
        percentS: e.target.value,
        // changeRatio: true,
      }, () => {
        this.calculateSourdough()
      })
    }

    if(field === "hydration"){
      this.setState({
        percentH: e.target.value,
        // changeRatio: true,
      }, () => {
        this.calculateSourdough()
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
        proofingMinuts: parseInt(params[8][0])
      }      
    }, () => {
      this.calculateSourdough();
    })
  }

  clickSavedRecipe = (e) => {
    const { currentCountDown } = this.state;
    const keyIndex = e.target.dataset.index;
    const recipesRegistered = JSON.parse(localStorage.getItem("recipes")).recipes;
    const datas = recipesRegistered[keyIndex];

    const url = `(${datas.weight}-${datas.percentLeavin}-${datas.percentHydra}-${datas.weightSalt})(${datas.zenith}-${datas.autolyse}-${datas.fermentation}(${datas.saf.length})-${datas.proofing})`;
    window.location.hash = url;
    // url

    if(currentCountDown === true){
      if(!window.confirm("There is currently a countdown. By confirming, you will cancel it.")){
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
        proofingMinuts: datas.proofing,
        saf: datas.saf
      }      
    }, () => {
      this.calculateSourdough();
    })
  }

  render() {
    var {
      weight,
      kilo,
      kilogram,
      percentS,
      weightS,
      percentH,
      weightW,
      weightF,
      weightSalt,
      durationDefault
    } = this.state;
    weightS = Math.round(weightS);

    const data = {
      weight,
      percentH,
      percentS,
      weightSalt
    }

    return (
      <div>
        {/*
        <Helmet
          bodyAttributes={{
              style: `background: #eee; background: linear-gradient(180deg, #a4d7f1 0%, #a4d7f1 ${percentH}%, #ceb192 ${parseInt(percentH) + 5}%, #ceb192 100%) fixed;`
          }}
        />
        */}
        <Recipes trigger={this.clickSavedRecipe} />
        <section>
          <Title content="Balance" class="balance" />
          <div className={style.balance}>
            <div className={style.label}>
              <label htmlFor="weight">
                > For a total dough weight of
              </label>
              <input type="number" value={weight} min="0" max="10000" step="10" aria-labelledby="weight" onChange={(e) => this.setUpByWeight(e)} id="weight" className={style.weight} />g to bake.
              {kilo && <small>{`(${kilogram}kg)`}</small>}
            </div>
            <div className={style.main}>
              <div className={style.range}>
                <label htmlFor="sourdough">
                  {percentS}% Leaven <Note content={<Leaven />} />
                </label>
                <input value={percentS} type="range" aria-labelledby="sourdough" onChange={(e) => this.setUpValue(e, "sourdough")} id="sourdough" min="0" max="100" />
                <span><b>{weightS}g</b></span>
              </div>
              <div className={style.range}>
                <label htmlFor="hydration">
                    {percentH}% Hydration <Note content={<Hydration />} />
                </label>
                <input value={percentH} type="range" aria-labelledby="hydration" onChange={(e) => this.setUpValue(e, "hydration")} id="hydration" min="0" max="100" />
                <span>
                   <b className={style.flour}>{weightF}g</b> Flour <br />
                   <b className={style.water}>{weightW}ml</b> water<br />
                   <b>{weightSalt}g</b> salt <Note content={<Salt />} />
                </span> 
              </div>
            </div>
            </div>

        </section>
        <Timer composition={data} schedule={durationDefault} />
      </div>
    );
  }
}

export default Home;