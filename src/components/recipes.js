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

    const displayRecipeV1 = (obj, a) => {
        const title = `${obj.title} :
        - ${obj.weight}g 
        - ${obj.percentHydra}% ${FuncText("hydration")}
        - ${obj.percentLeavin}% ${FuncText("leaven")} 
        ●˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗●
        - ${convertMinutsToHuman(obj.zenith)} ${FuncText("raisingLeavin")} 
        - ${convertMinutsToHuman(obj.autolyse)} ${FuncText("ofAutolyse")}
        - ${convertMinutsToHuman(obj.fermentation)} ${FuncText("BulkFermentation")} ${obj.saf && obj.saf.length > 0  && `${FuncText("including")} ${obj.saf.length} ${FuncText("StretchAFold")}`} 
        - ${convertMinutsToHuman(obj.proofing)} ${FuncText("proofing")}`;
    
        return <li className="recipe" key={a} data-lang={userLanguage}>
              <span data-index={a} role="presentation" onFocus={(e) => trigger(e)} onClick={(e) => trigger(e)} title={title} className="recipe">
                  <b>{obj.title}</b> - [ {obj.weight}g ● {obj.percentHydra}% {FuncText("hydration")} ● {obj.percentLeavin}% {FuncText("leaven")} ]
                  [ {convertMinutsToHuman(obj.zenith)} {FuncText("raisingLeavin")} ● {convertMinutsToHuman(obj.autolyse)} {FuncText("ofAutolyse")} ● {convertMinutsToHuman(obj.fermentation)} {FuncText("BulkFermentation")} ●{` `} 
                  {obj.saf && obj.saf.length > 0 && `${obj.saf.length} ${FuncText("StretchAFold")} ● `}
                  {convertMinutsToHuman(obj.proofing)} {FuncText("proofing")} ]
              </span>
              <span data-index={a} role="presentation" onFocus={(e) => deleteRecipe(e)} onClick={(e) => deleteRecipe(e)} title={FuncText("deleteThisRecipe")} className="trash">Trash</span>
        </li>;
    }
    

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


        if(!Object.hasOwn(existing[a], "ingredients")){
            recipe.push(displayRecipeV1(existing[a], a));
        } else {
            console.log("recipe is V2");
        }




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