import React, { useContext, useEffect, useState } from "react";
import { Text, FuncText } from "../containers/language";
import timerStyles from "../styles/timeline.module.css";
import { writeStorage } from '@rehooks/local-storage';
import {
  ExtractMinutsAndSecondsFromDate,
  steps,
  // stretchAndFoldDatas,
  roundMinutes,
  // extractMinutsFromDate,
} from "../functions/tools.js";
import alarm from "../sounds/alarm.mp3";
import {
  timerContext,
  roundSeconds,
  getPercentForTimeline,
} from "../containers/timerLogic";

let audio = new Audio(alarm);

let officialStep = 0;
let snap = 0;

const Timeline = (props) => {
  const { now, momentByAction, durationDefault, currentCountDown } = useContext(timerContext);

  const [hoveredStripe, setHoveredStripe] = useState(0);
  const [countDownPercent, setCountDownPercent] = useState(0);
  const [firstHourPercent, setFirstHourPercent] = useState(0);
  const [firstMinutPercent, setFirstMinutPercent] = useState(0);
  const [FirstHour, setFirstHour] = useState(0);
  const [FirstMinute, setFirstMinute] = useState(0);

  const getPercentForTimelineInSeconds = (
    totalScopeTimelineSeconds,
    startTimeStamp,
    objDate
  ) => {
    const timeStamp = objDate.getTime();
    const scopeSeconds = (timeStamp - startTimeStamp) / 1000;
    const percent = (scopeSeconds * 100) / totalScopeTimelineSeconds;
    return percent;
  };

  const totalScope = () => {
    const totalSum = durationDefault.reduce((sum, x) => sum + x.duration, 0);
    let lastHour = momentByAction(now, totalSum);
    const end = lastHour.getTime();
    const start = now.getTime();
    const totalScopeTimelineMinuts = (end - start) / 1000 / 60;
    const totalScopeTimeSeconds = (end - start) / 1000;
    return { totalScopeTimelineMinuts, totalScopeTimeSeconds };
  };

  const defineCountDown = () => {
    const currentMoment = now ?? new Date();
    const start = new Date(currentMoment).getTime();

    const { totalScopeTimeSeconds } = totalScope();
    let countDownPercent = getPercentForTimelineInSeconds(
      totalScopeTimeSeconds,
      start,
      new Date()
    );
    countDownPercent = countDownPercent > 100 ? 100 : countDownPercent;
    setCountDownPercent(countDownPercent);
  };

  const findClosestStep = (arrayOfSteps) => {
    const now = new Date();
    let closest = Infinity;

    Array.prototype.forEach.call(arrayOfSteps, (dateStocked, i) => {
      const d = new Date(dateStocked);
      // On boucle sur le tableau d'instants. Si maintenant est avant l'evenement ET si l'evenement est avant l'infini (pour le premier at least);
      if (d >= now && d < closest) {
        // console.log("loop at : ", i ,"datestocked is : ",d.getHours(),":",d.getMinutes(), "now is : ", now.getHours(),":", now.getMinutes(), "closest is : ", closest);
        closest = d;
        snap = i - 1;
      }

      if (now > new Date(arrayOfSteps[arrayOfSteps.length - 1])) {
        snap = arrayOfSteps.length - 1;
      }
      i++;
    });

    return snap;
  };

  const displayPush = (step, arrayOfSteps) => {
    const stepsSentences = steps();
    if (officialStep === arrayOfSteps.length - 1) {
      // Doit faire la dernière notif;
      notifyMe(stepsSentences[step]);
      officialStep = 0;
      snap = 0;
      fullFillMilestones();
    } else {
      notifyMe(stepsSentences[step]);
      return;
    }
    officialStep++;
  };

  const notifyMe = (words) => {
    if (!("Notification" in window)) {
      console.warn("this browser or device don't support notifications");
    } else if (Notification.permission === "granted") {
      // Si c'est ok, créons une notification
      audio.currentTime = 0;
      audio.play();
      new Notification(words[0], {
        body: words[1],
        icon: words[2],
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission(function (permission) {
        if (!("permission" in Notification)) {
          Notification.permission = permission;
        }

        if (permission === "granted") {
          audio.play();
          new Notification(words, {
            icon: "./notifs/watch.svg",
            body: "./notifs/watch.svg",
          });
        }
      });
    }
  };

  const countDownLoop = () => {
    const { schedule } = this.state;
    defineCountDown();

    // as long we don't get the schedule, we loop on it.
    if (schedule.length === 0) {
        fullFillMilestones();
    } else {
      const currentStep = findClosestStep(schedule);
      // Stay lock to 0 - 0 after despite reinit
      // console.log("officialStep & currentStep", officialStep, currentStep);
      // console.log("------------");
      if (officialStep !== currentStep) {
        // console.log("diff");
        officialStep = currentStep;
        displayPush(currentStep, schedule);
      }
    }

    setTimeout(() => {
      if (currentCountDown) {
        countDownLoop();
      } else {
        officialStep = 0;
        snap = 0;
      }
    }, 1000);
  };

  const fullFillMilestones = () => {
    if (localStorage.getItem("patefolle-cd") !== null) {
      let countDownExisting = JSON.parse(localStorage.getItem("patefolle-cd"));
      if (countDownExisting.active && countDownExisting.milestones) {
        //console.log("plop", milestones, countDownExisting.milestones);
        // setMilestones(countDownExisting.milestones);
      }
    }
  };

  const definePercent = () => {
    const currentTime = now ?? new Date();
    const start = new Date(currentTime).getTime();
    // const { dateRest, dateFermentation, dateZenith, dateAutolyse } = durationDefault;

    const { totalScopeTimelineMinuts } = totalScope();

    const closestHour = roundMinutes(currentTime);
    const closestMinut = roundSeconds(currentTime);

    // const closestHour = roundMinutes(currentTime);
    if (closestHour.getTime() < start) {
      closestHour.setHours(closestHour.getHours() + 1);
    }
    const FirstHour = closestHour.getHours();

    // const closestMinut = this.roundSeconds(currentTime);
    if (closestMinut.getTime() < start) {
      closestMinut.setMinutes(closestMinut.getMinutes() + 1);
    }
    const FirstMinute = closestMinut.getMinutes();

      setFirstHour(FirstHour);
      setFirstMinute(FirstMinute);

  };

   const setup = () => {
        const startFromNow = now ?? new Date();
        const start = now.getTime();

        const { totalScopeTimelineMinuts, totalScopeTimeSeconds } = totalScope();
        const closestMinut = roundSeconds(startFromNow);

        const firstHourPercent  = getPercentForTimeline( totalScopeTimelineMinuts, start, closestMinut );
        const firstMinutPercent  = getPercentForTimelineInSeconds( totalScopeTimeSeconds, start, closestMinut );
        setFirstHourPercent(firstHourPercent);
        setFirstMinutPercent(firstMinutPercent);
        definePercent();
    }

  const displaySplice = () => {
    /* Hours */
    const startTime = now ?? new Date();
    const start = startTime.getTime();

    const { totalScopeTimelineMinuts, totalScopeTimeSeconds } = totalScope();
    const closestMinut = roundSeconds(startTime);

    const scopeNumberHours = Math.ceil((totalScopeTimelineMinuts + 15) / 60);
    const scopeNumberMinuts = Math.ceil(totalScopeTimeSeconds + 1000) / 60;

    const closestHour = roundMinutes(startTime);

    const items = [];

    if (totalScopeTimelineMinuts > 120) {
      for (let a = 1; a < scopeNumberHours; a++) {
        closestHour.setHours(closestHour.getHours() + 1);
        const hour = closestHour.getHours();
        const percentHour = getPercentForTimeline(
          totalScopeTimelineMinuts,
          start,
          closestHour
        );
        items.push(
          <div
            style={{ left: `${Math.round(percentHour)}%` }}
            className={timerStyles.grid}
            key={a}
          >
            {hour}h
          </div>
        );
      }
    } else {
      for (let a = 1; a < scopeNumberMinuts; a++) {
        closestMinut.setMinutes(closestMinut.getMinutes() + 1);
        const minute = closestMinut.getMinutes();
        const percentMinut = getPercentForTimelineInSeconds(
          totalScopeTimeSeconds,
          start,
          closestMinut
        );
        items.push(
          <div
            style={{ left: `${Math.round(percentMinut)}%` }}
            className={timerStyles.grid}
            key={a}
          >
            {minute}
          </div>
        );
      }
    }

    return items;
  };

  const { totalScopeTimelineMinuts } = totalScope();
  const { hrHour, timeTotal } = props;
  const { hourNow, minutesNow } = hrHour;
  // const { dateProofing, dateRest, dateFermentation, dateZenith, dateAutolyse } = durationDefault;
  let sumTime = 0;

  const sum = durationDefault.reduce((sum, x) => sum + x.duration, 0);

  let schedule = durationDefault.map((action, i) => {
    sumTime += action.duration;
    const timeFormatDate = momentByAction(now, sumTime);

    const percent = getPercentForTimeline(sum, now, timeFormatDate);

    return {
      order: i,
      moment: timeFormatDate,
      percent: percent,
      label: action.label,
      i10label: action.i10label,
    };
  });

  const reversedSchedule = Object.assign([], schedule).reverse();


  /*
    componentDidUpdate(prevProps){
        if(JSON.stringify(prevProps.milestones) !== JSON.stringify(this.props.milestones)){
            this.setup();
        }
        if(prevProps.currentCountDown !== this.props.currentCountDown) {
            this.displaySplice();// The display of minuts in bottom
            this.fullFillMilestones();
            this.countDownLoop();
        }
    }
    */

    useEffect(() => {
        setup();
        displaySplice();
        fullFillMilestones();
    },[]);

  // const lastSchedule = schedule.pop();
  // console.log("schedule", schedule);

  return (
    <div
      className={`${timerStyles.board} ${
        props.visibility
          ? timerStyles.Scheduleinvisible
          : timerStyles.Schedulevisible
      }`}
    >
      <div className={timerStyles.timeline}>
        <div
          className={`${timerStyles.marker} ${
            hoveredStripe === 0 ? timerStyles.hovered : timerStyles.neutral
          }`}
        >{`${hourNow}:${minutesNow}`}</div>

        {schedule.map((dateTime, i) => {
          const positionLeft =
            i === schedule.length - 1 ? "auto" : dateTime.percent + "%";
          return (
            <div
              key={"label" + i}
              className={`${timerStyles.marker} ${
                i + 1 === hoveredStripe && timerStyles.hovered
              } ${
                i === schedule.length - 1
                  ? timerStyles.reversedMarker
                  : timerStyles.neutral
              }`}
              style={{ left: positionLeft }}
            >
              <ExtractMinutsAndSecondsFromDate objDate={dateTime.moment} />
            </div>
          );
        })}

        {currentCountDown && (
          <div
            className={`${timerStyles.countdown}`}
            style={{ left: `${countDownPercent}%` }}
          ></div>
        )}

        <div className={timerStyles.wrapperStripe}>
          {reversedSchedule.map((action, i) => {
            const txt = action.i10label
              ? FuncText(action.i10label)
              : action.label;
            return (
              <div
                key={"stripe" + i}
                title={txt}
                onMouseOver={() => setHoveredStripe(action.order)}
                className={`${timerStyles.stripe}`}
                style={{ width: `${action.percent}%` }}
              >
                {action.i10label ? (
                  <Text tid={action.i10label} />
                ) : (
                  action.label
                )}
              </div>
            );
          })}
        </div>

        <span>{timeTotal}</span>
      </div>
      {totalScopeTimelineMinuts > 120 ? (
        <div className={timerStyles.cycle}>
          <div
            className={timerStyles.grid}
            style={{ left: `${firstHourPercent}%` }}
          >
            {FirstHour}h
          </div>
          {displaySplice()}
        </div>
      ) : (
        <div className={timerStyles.cycle}>
          <div
            className={timerStyles.grid}
            style={{ left: `${firstMinutPercent}%` }}
          >
            {FirstMinute}
          </div>
          {displaySplice()}
        </div>
      )}
    </div>
  );
};

export default Timeline;
