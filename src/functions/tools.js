import React, {Fragment} from "react";
import { getCurrentLanguage } from "../containers/language";

export const twoDigits = (num) => {
    return ("0" + num).slice(-2);
}

export const convertMinutsToHuman = (mins) => {
    const num = mins;
    const hours = (num / 60);
    const rhours = Math.floor(hours);
    let minutes = (hours - rhours) * 60;
    let rminutes = Math.round(minutes);
    rminutes = twoDigits(rminutes);
    const timeToRead = rhours === 0 ? `${minutes} minute${minutes > 1 ? 's' : ''}` : rhours+"h"+rminutes;
    return timeToRead;
}

export const extractMinutsFromDate = (dateObj) => {
    const hours = dateObj.getHours();
    let minuts = dateObj.getMinutes();
    minuts = twoDigits(minuts);
    minuts = twoDigits(minuts);
    return hours+":"+minuts;
    // IF you want the seconds on the stretch & fold step discomment next line.
    // return hours+":"+minuts+":"+twoDigits(dateObj.getSeconds());
}

export const roundMinutes = (dateObj) => {
    const neoDate = new Date(dateObj.getTime());
    neoDate.setHours(neoDate.getHours() + Math.round(neoDate.getMinutes()/60));
    neoDate.setMinutes(0, 0, 0);
    return neoDate;
}

export const decimalToSeconds = (minutes) => {
    var min = Math.floor(Math.abs(minutes));
    var sec = Math.floor((Math.abs(minutes) * 60) % 60);
    return sec + (min*60);
}

export function ExtractMinutsAndSecondsFromDate(props) {
    const dateObj = props.objDate;
    const hours = dateObj.getHours();
    let minuts = dateObj.getMinutes();
    let seconds = dateObj.getSeconds();
    minuts = twoDigits(minuts);
    seconds = twoDigits(seconds);
    return <Fragment>{hours}:{minuts}<span>:{seconds}</span></Fragment>;
}

export function checkTime(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }

const randomInt = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min) + min);
}

// Ensure we always return a language key that exists in the provided map
const resolveLanguageKey = (langMap) => {
    const lang = getCurrentLanguage();
    return langMap[lang] ? lang : "en";
}

const adj = {
    "en": ["First", "Cool", "My", "mad", "crazy", "Awesome", "Sweet", "Incredible", "Custom", "Pimped", "French"],
    "fr": ["Recette", "Pâte", "Boule", "Baguette"]
    };
const noun = {
    "en": ["Recipe", "Dough", "Bread", "Pâte", "Boule", "Sourdough", "Baguette"],
    "fr": ["Première du nom", "Soyeuse", "Fraîche", "Folle", "Terrible", "Génial", "Doux", "Incroyable", "Personnalisé", "", "Française"]
};

const stepsLangs = {
    "en": [
        ["You probably just prepared the yeast.", "", "./notifs/step0.png"],
        ["Time to prepare the first dough.", "Mix the flour and the water.", "./notifs/step1.png"],
        ["Time to add your leavin to the dough", "And don't forget to mix it strongly", "./notifs/step2.png"],
        ["Time to pre-shape", "serious things starting!", "./notifs/step3.png"],
        ["Time to shape", "Add some tension into the dough", "./notifs/step4.png"],
        ["Bring it to the hoven!", "it's ready to cook, according to your settings!", "./notifs/step5.png"]
    ],
    "fr": [
        ["Vous venez probablement juste de nourrir le levain.","Attendez pour la prochaine étape", "./notifs/step0.png"],
        ["Préparez le pâton.", "Le pâton est juste un mélange d'eau et de farine", "./notifs/step1.png"],
        ["Ajoutez le levain dans le pâton.","Ajoutez la dose que vous avez définit dans la pâte.", "./notifs/step2.png"],
        ["Boulage","Façonnez la pâte de manière à lui donner de la force, et laissez-la se reposer.", "./notifs/step3.png"],
        ["Façonnage","Cette étape consiste simplement à lui marqué sa forme de boule. Le repos qui suit est considéré comme l'apprêt.", "./notifs/step4.png"],
        ["Mettez le pain au four !", "C'est l'étape qu'on appelle tout simplement l'enfournement ;)", "./notifs/step5.png"]
    ]
};

const stretchTranslations = {
    "en": [
        ["Stretch and Fold!", "quick & dirty!", "./notifs/saf.png"]
    ],
    "fr": [
        ["Rabat", "opérez un rabat rapide sur la pate", "./notifs/saf.png"]
    ]
}

export const stretchAndFoldDatas = () => {
    const lang = resolveLanguageKey(stretchTranslations);
    return stretchTranslations[lang];
}

export const steps = () => {
    const lang = resolveLanguageKey(stepsLangs);
    return stepsLangs[lang];
}

export const randomName = () => {
    const lang = resolveLanguageKey(adj);
    const lengthAdj = adj[lang].length;
    const lengthNoun = noun[lang].length;
    const randomAdj = randomInt(0, lengthAdj);
    const randomNoun = randomInt(0, lengthNoun);
    return `${adj[lang][randomAdj]} ${noun[lang][randomNoun]}`;
}

export const  roundDecimal = (nombre, precision) => {
    precision = precision || 2;
    var tmp = Math.pow(10, precision);
    return Math.round( nombre*tmp )/tmp;
}
