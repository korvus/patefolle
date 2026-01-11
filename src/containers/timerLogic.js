import React, { useState, createContext } from "react";
import { checkTime } from "../functions/tools";

export const timerContext = createContext();

const getNowHumanWay = () => {
  const today = new Date();
  const h = today.getHours();
  let m = today.getMinutes();
  m = checkTime(m);
  return h + ":" + m;
};

export const getPercentForTimeline = (
  totalScopeTimelineMinuts,
  startTimeStamp,
  objDate
) => {
  const timeStamp = objDate.getTime();
  const scopeMinuts = (timeStamp - startTimeStamp) / 1000 / 60;
  const percent = (scopeMinuts * 100) / totalScopeTimelineMinuts;
  return percent;
};

export const roundSeconds = (dateObj) => {
  const neoDate = new Date(dateObj.getTime());
  neoDate.setMinutes(
    neoDate.getMinutes() + Math.round(neoDate.getSeconds() / 60)
  );
  neoDate.setSeconds(0, 0);
  return neoDate;
};

export function TimerProvider({ children }) {
  const [currentCountDown, setCurrentCountDown] = useState(false);
  const [now, setNow] = useState(new Date());
  const [toolate, setToolate] = useState(false);
  const [potentialStart, setPotentialStart] = useState(getNowHumanWay());
  const [durationDefault, setDurationDefault] = useState([
    { label: "frasage", duration: 10, max: 30 },
    { label: "autolyse", i10label: "autolysisTimer", duration: 90, max: 300 },
    { label: "pétrissage", duration: 10, max: 30 },
    {
      label: "pointage",
      i10label: "bulkFermentationDuration",
      duration: 120,
      max: 1200,
    },
    { label: "boulage", duration: 5, max: 60 },
    {
      label: "apprêt",
      i10label: "Proofing",
      duration: 480,
      max: 1200,
      min: 60,
    },
    { label: "cuisson", duration: 20, max: 120 },
  ]);

  const triggerCountDown = (cdRunning) => {
    setCurrentCountDown(cdRunning);
  };

  const modifySchedule = (e, label) => {
    // console.log("e.target", e.target.value, label);
    setDurationDefault(
      durationDefault.map((obj) => {
        if (obj.label === label) obj.duration = parseInt(e.target.value);
        return obj;
      })
    );
  };

  const modifyHour = (e) => {
    const [hours, minuts] = e.target.value.split(":");
    let changedTime = new Date();
    changedTime.setHours(hours, minuts);
    // changeHourWithDate(changedTime);
  };

  const startTime = (start) => {
    const today = new Date();
    const h = today.getHours();
    const allSteps = setupAll(start);
    let m = today.getMinutes();
    m = checkTime(m);

    if (today > allSteps[allSteps.length-1]) {
      setToolate(true);
      cancelCountdown();
    } else {
      setToolate(false);
    }

    const currentTimeNow = h + ":" + m;

    setPotentialStart(currentTimeNow);

    // if(this.state.currentCountDown){
    setTimeout(() => {
      if (!toolate) {
        startTime();
      }
    }, 2000);
  };

  /* Check if a countdown exist already or not */
  const askCountDown = () => {
    let countDownExisting = [];
    if (localStorage.getItem("patefolle-cd") !== null) {
      console.log("bookl", countDownExisting);
      countDownExisting = JSON.parse(localStorage.getItem("patefolle-cd"));
      const isRunning = countDownExisting.active;
      setCurrentCountDown(isRunning);

      // Callback
      // props.countDownFunc(currentCountDown);
      // setCurrentCountDown(currentCountDown);

      if (isRunning) {
        console.info("is running (timerLogic)");
        // const startMoment = countDownExisting.milestones[0];
        // const schedule = countDownExisting.schedule;

        // Callback
        startTime();
        // changeHourWithDate(new Date(startMoment));
      } else {
        console.info("not running (timerLogic)");
        // redispatchValues();
      }
    } else {
      /* initialisation */
      // changeHourWithDate(new Date());
    }

    // return newExisting;
  };

  const launchWW = (start) => {
    setNow(start);
    const allSteps = setupAll(start);

    const arrMilestones = [start, ...allSteps];

    const durations = durationDefault.map((action, i) => action.duration);
    const schedule = [...durations];

    const initObj = { active: true, arrMilestones, schedule };
    const toSave = JSON.stringify(initObj);
    localStorage.setItem("patefolle-cd", toSave);

    // Callback
    startTime(start);
  };

  const setupAll = (start) => {
    const step0 = new Date(start);
    let sumTime = 0;

    const allDates = durationDefault.map((action, i) => {
      sumTime += action.duration;
      return new Date(step0.setMinutes(step0.getMinutes() + sumTime));
    });
    return allDates;
  };

  const momentByAction = (start, toAdd) => {
    const startFrom = new Date(start);
    // console.log("startFrom", startFrom.getMinutes());
    return new Date(
      startFrom.setMinutes(startFrom.getMinutes() + parseInt(toAdd))
    );
  };

  const resetSessionCountDown = () => {
    const setToFalse = JSON.stringify({ active: false });
    triggerCountDown(false);
    // props.countDownFunc(false);
    localStorage.setItem("patefolle-cd", setToFalse);
  };

  const cancelCountdown = () => {
    setCurrentCountDown(false);
    // Callback
    resetSessionCountDown();
  };

  const provider = {
    triggerCountDown,
    currentCountDown,
    durationDefault,
    setDurationDefault,
    now,
    setNow,
    modifyHour,
    potentialStart,
    launchWW,
    toolate,
    cancelCountdown,
    modifySchedule,
    momentByAction,
    askCountDown,
  };

  return (
    <timerContext.Provider value={provider}>{children}</timerContext.Provider>
  );
}
