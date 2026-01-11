import React, {
  useContext,
  useRef,
  useState,
  useEffect,
  Fragment,
} from "react";
import Title from "./components/title";
import Note from "./components/noteinfos";
import { Leaven, Hydration } from "./components/infos.js";
import style from "./styles/wrapper.module.css";
import co from "./styles/quantities.module.css";
import Timer from "./components/timer.js";
import Proportions from "./components/proportions.js";
import Menuleavinchoice from "./components/leavintype.js";
import ProportionLeavin from "./components/proportionsLeavin.js";
import { Text } from "./containers/language";
import { ingredientsContext } from "./containers/ingredients";
import { leavinChoiceContext } from "./containers/leavinChoice";
import { calculateWeights } from "./functions/percents";
import LanguageSelector from "./components/languageSelector.js";
import Recipes from "./components/recipes.js";

const setBackground = (measures) => {
    document.body.style = `background: #eee; background: linear-gradient(180deg, #a4d7f1 0%, #a4d7f1 ${measures.percentH}%, #ceb192 ${
        parseInt(measures.percentH) + 5
      }%, #ceb192 100%) fixed`;
}

function Recipe() {
  const [visibilitySchedule, setVisibilitySchedule] = useState(true);

  const {
    clickSavedRecipe,
    measures,
    setUpSalt,
    setUpValue,
    setUpByWeight,
    setUpFlour,
    kilo,
    kilogram,
    checkUrlParams,
  } = useContext(ingredientsContext);

  const { percentWaterLeavin } = useContext(leavinChoiceContext);

  const timingSection = useRef();

  useEffect(() => {
    const handleScroll = () => {
      setVisibilitySchedule(timingSection.current?.offsetTop > window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);


  useEffect(() => {
    const paramsUrl = window.location.hash;
    if (paramsUrl.length > 0) {
      checkUrlParams(paramsUrl);
    }
  }, [checkUrlParams]);

  const { weightSalt, weightFlour, weightSourdough, weightWater } = calculateWeights(measures, percentWaterLeavin);

  // display proportions in background
  setBackground(measures);

  return (
    <Fragment>
      <LanguageSelector />

      <Recipes trigger={clickSavedRecipe} />

      <section>
        <Title content="Balance" class="balance" />
        <div className={style.balance}>
          <div className={style.main}>
            <div className={style.range}>
              <div className={co.blocks}>
                <span className={co.flour}>
                  <span>
                    <b className={style.flour}>{weightFlour}g</b>
                    <Text tid="Flour" />
                  </span>
                  <input
                    value={weightFlour}
                    type="range"
                    aria-labelledby="sourdough"
                    onChange={(e) => setUpFlour(e)}
                    id="flour"
                    min="0"
                    max="1500"
                    step="1"
                  />
                </span>
                <span className={co.flour}>
                  <span>
                    <b>{weightSalt}g</b>
                    <Text tid="Salt" /> ({measures.percentSalt / 10} %)
                  </span>
                  <input
                    value={measures.percentSalt}
                    type="range"
                    aria-labelledby="salt"
                    onChange={(e) => setUpSalt(e)}
                    id="salt"
                    min="0"
                    max="100"
                    step="1"
                  />
                </span>
              </div>
              <label htmlFor="hydration">
                {measures.percentH}% <Text tid="hydration" />{" "}
                <Note content={<Hydration />} />
              </label>
              <input
                value={measures.percentH}
                type="range"
                aria-labelledby="hydration"
                onChange={(e) => setUpValue(e, "hydration")}
                id="hydration"
                min="0"
                max="100"
              />
              <div className={co.blocks}>
                <span>
                  <b className={style.water}>{weightWater}ml</b>{" "}
                  <Text tid="Water" />
                </span>
              </div>
            </div>

            {/* percent leavin */}
            <div className={`${style.range} ${co.leavin}`}>
              <label htmlFor="sourdough">
                {measures.percentS}% <Text tid="leaven" />{" "}
                <Note content={<Leaven />} />
              </label>
              <input
                value={measures.percentS}
                type="range"
                aria-labelledby="sourdough"
                onChange={(e) => setUpValue(e, "sourdough")}
                id="sourdough"
                min="0"
                max="100"
              />
              <span>
                <b>{weightSourdough}g</b>
              </span>
              <Menuleavinchoice />
              <ProportionLeavin />
            </div>

            {/* total weight */}
            <div className={style.label}>
              <label htmlFor="weight">
                &gt; <Text tid="labelWeight" />
              </label>
              <input
                type="number"
                value={measures.weight}
                min="0"
                max="10000"
                step="10"
                aria-labelledby="weight"
                onChange={(e) => setUpByWeight(e)}
                id="weight"
                className={style.weight}
              />
              g<Text tid="toBake" />.
              {kilo && <small>{`(${kilogram}kg)`}</small>}
            </div>
          </div>
        </div>
      </section>
      <Timer
        ref={timingSection}
        visibilitySchedule={visibilitySchedule}
      />
      <Proportions
        visibilitySchedule={visibilitySchedule}
      />
    </Fragment>
  );
  // }
}

export default Recipe;
