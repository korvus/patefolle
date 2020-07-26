import React, {Fragment, useState, useContext} from "react";
import { convertMinutsToHuman } from "../functions/tools.js";
import "../styles/recipes.css";
import { Text, FuncText, LanguageContext } from "../containers/language";

const getAlreadyRegistred = () => {
    let newExisting = [];
    if(localStorage.getItem("patefolle-recipes") !== null){
      newExisting = JSON.parse(localStorage.getItem("patefolle-recipes")).recipes;
    }
    return newExisting;
}

const recipeInsideStorage = getAlreadyRegistred();

const Recipes = (props) => {

    /* Just usefull for refresh the component when lang is changed */
    const { userLanguage } = useContext(LanguageContext);
    const [existing, setExisting] = useState(recipeInsideStorage);

    const deleteRecipe = (e) => {
        const keyId = parseInt(e.target.dataset.index);
        if (window.confirm(FuncText("sureToDelete"))) {
            const nextExisting = existing.filter((item, i) => i !== keyId);
            const initObj = {recipes: nextExisting}
            const toSave = JSON.stringify(initObj);
            localStorage.setItem("patefolle-recipes", toSave);
            setExisting(nextExisting);
        }
    }

    const { trigger } = props;

    const recipe = [];
    
    for (let a = 0; a < existing.length; a++) {

            const title = `${existing[a].title} :
    - ${existing[a].weight}g 
    - ${existing[a].percentHydra}% ${FuncText("hydration")}
    - ${existing[a].percentLeavin}% ${FuncText("leaven")} 
    ●˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗●
    - ${convertMinutsToHuman(existing[a].zenith)} ${FuncText("raisingLeavin")} 
    - ${convertMinutsToHuman(existing[a].autolyse)} ${FuncText("ofAutolyse")}
    - ${convertMinutsToHuman(existing[a].fermentation)} ${FuncText("BulkFermentation")} ${existing[a].saf && existing[a].saf.length > 0  && `${FuncText("including")} ${existing[a].saf.length} ${FuncText("StretchAFold")}`} 
    - ${convertMinutsToHuman(existing[a].proofing)} ${FuncText("proofing")}`;


          recipe.push(
          <li className="recipe" key={a} data-lang={userLanguage}>
            <span data-index={a} role="presentation" onFocus={(e) => trigger(e)} onClick={(e) => trigger(e)} title={title} className="recipe">
                <b>{existing[a].title}</b> - [ {existing[a].weight}g ● {existing[a].percentHydra}% {FuncText("hydration")} ● {existing[a].percentLeavin}% {FuncText("leaven")} ]
                [ {convertMinutsToHuman(existing[a].zenith)} {FuncText("raisingLeavin")} ● {convertMinutsToHuman(existing[a].autolyse)} {FuncText("ofAutolyse")} ● {convertMinutsToHuman(existing[a].fermentation)} {FuncText("BulkFermentation")} ●{` `} 
                {existing[a].saf && existing[a].saf.length > 0 && `${existing[a].saf.length} ${FuncText("StretchAFold")} ● `}
                {convertMinutsToHuman(existing[a].proofing)} {FuncText("proofing")} ]
            </span>
            <span data-index={a} role="presentation" onFocus={(e) => deleteRecipe(e)} onClick={(e) => deleteRecipe(e)} title={FuncText("deleteThisRecipe")} className="trash">Trash</span>
          </li>)
    }

    return (
        <Fragment>
            {existing.length > 0 && <section className="existing">
                <h2>
                    <Text tid="YourRecipes" />
                </h2>
                <ul>
                    {recipe}
                </ul>
            </section>}
        </Fragment>
    )

};

export default Recipes;