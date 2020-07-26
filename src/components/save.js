import React, {Component} from "react";
import style from "../styles/wrapper.module.css";
import Title from "./title.js";
import { convertMinutsToHuman, randomName } from "../functions/tools.js";
import ModalValid from "./modalValid.js";
import { Text, FuncText } from '../containers/language';

class Save extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: "",
            errorempty: false,
            errorAlready: false,
            display: false,
            placeholder: "choose a cool name"
        };
    }

    componentDidMount(){
        this.manageNameSuggestion();
    }

    manageNameSuggestion = () => {
        if(localStorage.getItem("recipes") === null){
            this.generateDefault();
        }else{
            const stringRecipes = localStorage.getItem("recipes");
            const arrayRecipes = JSON.parse(stringRecipes);
            const allRecipes = arrayRecipes.recipes;
            if(allRecipes.length === 0){
                this.generateDefault();
            } else {
                this.getLastNameRecipe(allRecipes[allRecipes.length-1].title);
            }
        }
    }

    getLastNameRecipe = (title) => {
        const regex = /^[0-9]*$/gm;
        const words = title.split(' ');
        const lastWord = words[words.length - 1];
        const found = regex.test(lastWord);
        if(found){
            let lastNumber = parseInt(lastWord);
            lastNumber++;
            words.pop();
            words.push(lastNumber);
            title = words.join(" ");
        } else {
            title = title+" 2";
        }
        this.setState({title});
    }

    generateDefault = () => {
        this.setState({placeholder: randomName() });
    }

    initLocalStorageObject = () => {
        const initObj = {recipes: []}
        const toSave = JSON.stringify(initObj);
        localStorage.setItem("patefolle-recipes", toSave);
        console.info("localstorage initialised");
    }

    checkIfRecipeExist = (name) => {
        const stringRecipes = localStorage.getItem("patefolle-recipes");
        const arrayRecipes = JSON.parse(stringRecipes);
        const allRecipes = arrayRecipes.recipes;
        if(allRecipes.length === 0){
            return arrayRecipes;
        } else {
            let err = 0;
            allRecipes.forEach(
                (r) => {
                    if(r.title === name){
                        err++;
                    }
                }
            )
            if (err > 0){
                return true;
            } else {
                return arrayRecipes;
            }
            // return false;
            // Ou retourn true si ça existe déjà
        }
    }

    submitSave = (e) => {
        e.preventDefault(e);
        const { composition, zenithLeavin, autolyse, fermentation, proofing, listSaF } = this.props.data;
        const title = this.state.title;
        const inputVal = title.trim();
        if(inputVal.length > 0){

            if(localStorage.getItem("patefolle-recipes") === null){
                this.initLocalStorageObject();
            } else {
                const exist = this.checkIfRecipeExist(inputVal);
                if(exist === true){
                    this.setState({ errorAlready: true })
                } else {
                    const newRecipe = {
                        "title": inputVal,
                        "weight": composition.weight,
                        "percentHydra": composition.percentH,
                        "percentLeavin": composition.percentS,
                        "weightSalt": composition.weightSalt,
                        "zenith": parseInt(zenithLeavin),
                        "autolyse": parseInt(autolyse),
                        "fermentation": parseInt(fermentation),
                        "proofing": parseInt(proofing),
                        "saf": listSaF
                    };
                    exist.recipes.push(newRecipe);
                    const newRecipes = JSON.stringify(exist);
                    localStorage.setItem('patefolle-recipes', newRecipes);
                    this.setState({display: true});
                }
                // console.log("session storage already exist");
            }
            // localStorage.setItem('recipes', "");
        } else {
            this.setState({ errorempty: true })
        }
    }

    editTitle = (e) => {
        this.setState({title: e.target.value, errorempty: false, errorAlready: false});
    }

    displayModal = () => {
        this.setState({
            display: !this.state.display
        })
    }

    copypaste = () => {
        var copyText = document.querySelector("#share");
        copyText.select();
        document.execCommand("copy");
    }


    render() {
        const { 
            timeTotal,
            composition,
            zenithLeavin,
            autolyse,
            fermentation,
            proofing,
            listSaF
        } = this.props.data;

        const anchor = `#(${composition.weight}-${composition.percentS}-${composition.percentH}-${composition.weightSalt})(${zenithLeavin}-${autolyse}-${fermentation}(${listSaF.length})-${proofing})`;
        const url = typeof document !== `undefined` ? `${document.location.origin}/${anchor}` : null

        const {
            title,
            errorempty,
            errorAlready,
            display,
            placeholder
        } = this.state;
        
        return (
            <section>
                <Title content="Save" class="save" />
                <div className={`${style.wrapper} ${style.save}`}>
                    <div className={style.main}>
                        <div className={style.range}>
                            <form onSubmit={(e) => this.submitSave(e)}>
                                <label htmlFor="title"><Text tid="nameYourRecipe" /></label>
                                <input className={`${style.text} ${errorempty && style.error} ${errorAlready && style.error}`} value={title} placeholder={placeholder} type="text" aria-labelledby="title" onChange={(e) => this.editTitle(e)} id="title" />
                                {errorAlready && <span className={style.errorAlready}><Text tid="errorAlreadyRecipeName" /></span>}
                                <dl>
                                    <dt><Text tid="compositionTotaleOf" /> {composition.weight}g</dt>
                                    <dd>
                                        <ul>
                                            <li>{composition.percentS}% <Text tid="ofLeaven" /></li>
                                            <li>{composition.percentH}% <Text tid="hydration" /></li>
                                        </ul>
                                    </dd>
                                    <dt><Text tid="ScheduleTotalOf" /> {timeTotal}</dt>
                                    <dd>
                                        <ul>
                                            <li>{convertMinutsToHuman(autolyse)} <Text tid="ofAutolyse" /></li>
                                            <li>{convertMinutsToHuman(zenithLeavin)} <Text tid="ofRaisingLeavin" /></li>
                                            <li>{convertMinutsToHuman(fermentation)} <Text tid="ofBulkFermentation" /> 
                                                {listSaF.length > 0 && <span><Text tid="including" /> {listSaF.length} <Text tid="StretchAFold" /></span>}</li>
                                            <li>{convertMinutsToHuman(proofing)} <Text tid="ofProofing" /></li>
                                        </ul>
                                    </dd>
                                </dl>
                                    <input className={style.submit} value={FuncText('Save')} type="submit" aria-labelledby="submit" onChange={(e) => this.rangeYeast(e)} id="submit" />
                            </form>
                        </div>
                        <hr />
                        <div className={style.link}>
                            <label htmlFor="share" role="presentation" onFocus={(e) => this.copypaste(e)} onClick={(e) => this.copypaste(e)} title="copy in paperclip" className={style.copy}>
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
                <ModalValid display={display} close={this.displayModal} />
            </section>
        )
    }
};

export default Save;