import React, {Fragment, useState} from "react";
import { convertMinutsToHuman } from "../functions/tools.js";
import "../styles/recipes.css";

const getAlreadyRegistred = () => {
    let newExisting = [];
    if(localStorage.getItem("recipes") !== null){
      newExisting = JSON.parse(localStorage.getItem("recipes")).recipes;
    }
    return newExisting;
}

const Recipes = (props) => {

    const recipeInsideStorage = getAlreadyRegistred();

    const [existing, setExisting] = useState(recipeInsideStorage);

    const deleteRecipe = (e) => {
        const keyId = e.target.dataset.index;
        if (window.confirm("Are you sure to delete this recipe?")) { 
            existing.splice(keyId, 1);
            const initObj = {recipes: existing}
            const toSave = JSON.stringify(initObj);
            localStorage.setItem("recipes", toSave);
            setExisting(existing);
        }
    }

    const { trigger } = props;

    const recipe = [];
    
    for (let a = 0; a < existing.length; a++) {

            const title = `${existing[a].title} :
    - ${existing[a].weight}g 
    - ${existing[a].percentHydra}% hydratation
    - ${existing[a].percentLeavin}% leavin 
    ●˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗˗●
    - ${convertMinutsToHuman(existing[a].zenith)} raising leavin 
    - ${convertMinutsToHuman(existing[a].autolyse)} autolyse 
    - ${convertMinutsToHuman(existing[a].fermentation)} bulk fermentation ${existing[a].saf && existing[a].saf.length > 0  && `ìncluding ${existing[a].saf.length} stretch & fold`} 
    - ${convertMinutsToHuman(existing[a].proofing)} proofing]`;


          recipe.push(
          <li className="recipe" key={a}>
            <span data-index={a} role="presentation" onFocus={(e) => trigger(e)} onClick={(e) => trigger(e)} title={title} className="recipe">
                <b>{existing[a].title}</b> - [ {existing[a].weight}g ● {existing[a].percentHydra}% hydratation ● {existing[a].percentLeavin}% leavin ]
                [ {convertMinutsToHuman(existing[a].zenith)} raising leavin ● {convertMinutsToHuman(existing[a].autolyse)} autolyse ● {convertMinutsToHuman(existing[a].fermentation)} bulk fermentation ●{` `} 
                {existing[a].saf && existing[a].saf.length > 0  && `${existing[a].saf.length} stretch & fold ● `}
                {convertMinutsToHuman(existing[a].proofing)} proofing ]
            </span>
            <span data-index={a} role="presentation" onFocus={(e) => deleteRecipe(e)} onClick={(e) => deleteRecipe(e)} title="delete this recipe" className="trash">Trash</span>
          </li>)
    }

    return (
        <Fragment>
            {existing.length > 0 && <section className="existing">
                <h2>Your recipes:</h2>
                <ul>
                    {recipe}
                </ul>
            </section>}
        </Fragment>
    )

};

export default Recipes;