import React, { useState, useContext, useEffect, useCallback } from "react";
import style from "../styles/wrapper.module.css";
import Title from "./title.js";
import { convertMinutsToHuman, randomName } from "../functions/tools.js";
import { ingredientsContext } from "../containers/ingredients";
import { timerContext } from "../containers/timerLogic";
import { leavinChoiceContext } from "../containers/leavinChoice";
import { calculateWeights } from "../functions/percents.js";
import ModalValid from "./modalValid.js";
import { Text, FuncText } from "../containers/language";

function createEmptyRecipe() {
  const initObj = { recipes: [] };
  const toSave = JSON.stringify(initObj);
  localStorage.setItem("patefolle-recipes", toSave);
}

function testLocalStorageOnce() {
  if (localStorage.getItem("patefolle-recipes") === null) {
    createEmptyRecipe();
  }
}

const Save = () => {
  const [title, setTitle] = useState("");
  const [errorempty, setErrorempty] = useState(false);
  const [errorAlready, setErrorAlready] = useState(false);
  const [display, setDisplay] = useState(false);
  const [placeholder, setPlaceholder] = useState("choose a cool name");

  const { measures } = useContext(ingredientsContext);
  const { durationDefault } = useContext(timerContext);

  const manageNameSuggestion = useCallback(() => {
    if (localStorage.getItem("recipes") === null) {
      generateDefault();
    } else {
      const stringRecipes = localStorage.getItem("recipes");
      const arrayRecipes = JSON.parse(stringRecipes);
      const allRecipes = arrayRecipes.recipes;
      if (allRecipes.length === 0) {
        generateDefault();
      } else {
        getLastNameRecipe(allRecipes[allRecipes.length - 1].title);
      }
    }
  }, []);

  useEffect(() => {
    manageNameSuggestion();
    testLocalStorageOnce();
  }, [manageNameSuggestion]);

  const getLastNameRecipe = (title) => {
    const regex = /^[0-9]*$/gm;
    const words = title.split(" ");
    const lastWord = words[words.length - 1];
    const found = regex.test(lastWord);
    if (found) {
      let lastNumber = parseInt(lastWord); 
      lastNumber++;
      words.pop();
      words.push(lastNumber);
      title = words.join(" ");
    } else {
      title = title + " 2";
    }
    this.setState({ title });
  };

  const generateDefault = () => {
    setPlaceholder(randomName());
  };

  const initLocalStorageObject = () => {
    createEmptyRecipe();
  };

  const checkIfRecipeExist = (name) => {
    const stringRecipes = localStorage.getItem("patefolle-recipes");
    const arrayRecipes = JSON.parse(stringRecipes);
    const allRecipes = arrayRecipes.recipes;
    if (allRecipes.length === 0) {
      return arrayRecipes;
    } else {
      let err = 0;
      allRecipes.forEach((r) => {
        if (r.title === name) {
          err++;
        }
      });
      if (err > 0) {
        return true;
      } else {
        return arrayRecipes;
      }
      // return false;
      // Ou retourn true si ça existe déjà
    }
  };

  const submitSave = (e) => {
    e.preventDefault(e);
    // const { zenithLeavin, autolyse, fermentation, proofing, listSaF } = props.data;
    const inputVal = title.trim();
    if (inputVal.length > 0) {
      if (localStorage.getItem("patefolle-recipes") === null) {
        initLocalStorageObject();
      } else {
        const exist = checkIfRecipeExist(inputVal);
        if (exist === true) {
          setErrorAlready(true);
        } else {
          const newRecipe = {
            title: inputVal,
            weight: measures.weight,
            percentHydra: measures.percentH,
            percentLeavin: measures.percentS
          };
          exist.recipes.push(newRecipe);
          const newRecipes = JSON.stringify(exist);
          localStorage.setItem("patefolle-recipes", newRecipes);
          setDisplay(true);
        }
        // console.log("session storage already exist");
      }
      // localStorage.setItem('recipes', "");
    } else {
      setErrorempty(true);
    }
  };

  const editTitle = (e) => {
    setTitle(e.target.value);
    setErrorempty(false);
    setErrorAlready(false);
  };

  const displayModal = () => {
    setDisplay(!display);
  };

  const Timing = () => {
    return <dd>
        <ul>
          {durationDefault.map((action, i) => {
              return (
                <li key={i}>
                  {convertMinutsToHuman(action.duration)} {action.i10label ? <Text tid={action.i10label} /> : action.label}
                </li>
              );
          })}
        </ul>
    </dd>
  }

  const copypaste = () => {
    var copyText = document.querySelector("#share");
    copyText.select();
    document.execCommand("copy");
  };

  // const { timeTotal, zenithLeavin, autolyse, fermentation, proofing, listSaF } = props.data;

  let sumTime = 0;
  const timeTotal = durationDefault.reduce((sum, x) => sum + x.duration, 0);


  //   const anchor = `#(${measures.weight}-${measures.percentS}-${measures.percentH}-${weightSalt})(${zenithLeavin}-${autolyse}-${fermentation}(${listSaF.length})-${proofing})`;
  const anchor = btoa(`{"title":${JSON.stringify(title)},"ingredients":${JSON.stringify(measures)},"timing":${JSON.stringify(durationDefault)}}`);
  const url =
    typeof document !== `undefined`
      ? `${document.location.origin}/#${anchor}`
      : null;

  // const { title, errorempty, errorAlready, display, placeholder } = this.state;

  /*
  manageNameSuggestion();
  
*/

  return (
    <section>
      <Title content="Save" class="save" />
      <div className={`${style.wrapper} ${style.save}`}>
        <div className={style.main}>
          <div className={style.range}>
            <form onSubmit={(e) => submitSave(e)}>
              <label htmlFor="title">
                <Text tid="nameYourRecipe" />
              </label>
              <input
                className={`${style.text} ${errorempty && style.error} ${
                  errorAlready && style.error
                }`}
                value={title}
                placeholder={placeholder}
                type="text"
                aria-labelledby="title"
                onChange={(e) => editTitle(e)}
                id="title"
              />
              {errorAlready && (
                <span className={style.errorAlready}>
                  <Text tid="errorAlreadyRecipeName" />
                </span>
              )}

              <dl>
                <dt>
                  <Text tid="compositionTotaleOf" /> {measures.weight}g
                </dt>
                <dd>
                  <ul>
                    <li>
                      {measures.percentS}% <Text tid="ofLeaven" />
                    </li>
                    <li>
                      {measures.percentH}% <Text tid="hydration" />
                    </li>
                  </ul>
                </dd>
                <dt>
                  <Text tid="ScheduleTotalOf" /> {convertMinutsToHuman(timeTotal)}
                </dt>
                <Timing />
              </dl>
              
              <input
                className={style.submit}
                value={FuncText("Save")}
                type="submit"
                aria-labelledby="submit"
                id="submit"
              />
            </form>
          </div>
          <hr />
          <div className={style.link}>
            <label
              htmlFor="share"
              role="presentation"
              onFocus={(e) => copypaste(e)}
              onClick={(e) => copypaste(e)}
              title="copy in paperclip"
              className={style.copy}
            >
              <Text tid="copy" />
            </label>
            <input
              className={style.linkField}
              value={url}
              type="url"
              readOnly
              id="share"
              aria-labelledby="share"
            />
          </div>
        </div>
      </div>
      <ModalValid display={display} close={() => displayModal()} />
    </section>
  );
};

export default Save;
