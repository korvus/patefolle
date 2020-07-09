import React, {Fragment} from "react";

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
    const timeToRead = rhours === 0 ? `${minutes}minute${minutes > 1 ? 's' : ''}` : rhours+"h"+rminutes;
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

const randomInt = (min, max) => { // min and max included 
    return Math.floor(Math.random() * (max - min) + min);
}

const adj = ["First", "Cool", "My", "mad", "crazy", "Awesome", "Sweet", "Incredible", "Custom", "Pimped", "French"];
const noun = ["Recipe", "Dough", "Bread", "Pâte", "Boule", "Sourdough", "Baguette"];

export const randomName = () => {
    const lengthAdj = adj.length;
    const lengthNoun = noun.length;
    const randomAdj = randomInt(0, lengthAdj);
    const randomNoun = randomInt(0, lengthNoun);
    return `${adj[randomAdj]} ${noun[randomNoun]}`;
}

export const  roundDecimal = (nombre, precision) => {
    precision = precision || 2;
    var tmp = Math.pow(10, precision);
    return Math.round( nombre*tmp )/tmp;
}