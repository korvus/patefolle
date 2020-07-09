import React, {Component, Fragment} from "react";
import { convertMinutsToHuman } from "../functions/tools.js";
import "../styles/recipes.css";

class Recipes extends Component {
    constructor(props) {
        super(props);
        this.state = {
            existing: []
        };
    }

    componentDidMount(){
        this.getAlreadyRegistred();
    }

    getAlreadyRegistred = () => {
        if(localStorage.getItem("recipes") !== null){
          const existing = JSON.parse(localStorage.getItem("recipes")).recipes;
          this.setState({existing});
        }
    }

    deleteRecipe = (e) => {
        const { existing } = this.state;
        const keyId = e.target.dataset.index;
        if (window.confirm("Are you sure to delete this recipe?")) { 
            existing.splice(keyId, 1);
            // existing
            const initObj = {recipes: existing}
            const toSave = JSON.stringify(initObj);
            localStorage.setItem("recipes", toSave);
            this.setState({ existing });
        }
    }

    render() {

        const { existing } = this.state;
        const { trigger }= this.props;

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
            <span data-index={a} role="presentation" onFocus={(e) => this.deleteRecipe(e)} onClick={(e) => this.deleteRecipe(e)} title="delete this recipe" className="trash">Trash</span>
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
    }
};

export default Recipes;