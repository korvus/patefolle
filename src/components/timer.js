import React, { useEffect, useContext, Fragment } from "react";
import timerStyles from "../styles/wrapper.module.css";
import Title from "./title";
//import Modal from "./modalSandF";
//import Note from "./noteinfos";
import Timeline from "./timeline.js";
// import Ext from "./ext.js";
import Save from "./save.js";
// import { Proofing, Bulkproofing } from "./infos.js";
import {
  convertMinutsToHuman,
  extractMinutsFromDate,
  twoDigits//,
  // decimalToSeconds,
  // checkTime,
} from "../functions/tools.js";
import { timerContext } from "../containers/timerLogic";
import { Text } from "../containers/language";
import About from "./about.js";

const Action = ({ details, currentCountDown, action, sumTime }) => (
  <div className={timerStyles.range}>
    <div className="left">
      <label htmlFor="yeast">
        {details.i10label ? <Text tid={details.i10label} /> : details.label}
      </label>
      <input
        onChange={(e) => action(e, details.label)}
        value={details.duration}
        aria-labelledby={details.label}
        id={details.label}
        min={details.min ? details.min : 0}
        max={details.max ? details.max : 500}
        step="5"
        type="range"
        disabled={currentCountDown}
      />
      <span>
        <u>{convertMinutsToHuman(details.duration)}</u>
      </span>
    </div>
    <div className={timerStyles.right}>
      <b>{extractMinutsFromDate(sumTime)}</b>
    </div>
  </div>
);

const Timer = React.forwardRef((props, ref) => {
  //    super(props);

  const {
    toolate,
    currentCountDown,
    durationDefault,
    now,
    modifyHour,
    potentialStart,
    launchWW,
    cancelCountdown,
    modifySchedule,
    momentByAction,
    askCountDown,
  } = useContext(timerContext);

  const hourNow = twoDigits(now.getHours());
  const minutesNow = twoDigits(now.getMinutes());

  const classBool = props.visibilitySchedule;

  let sumTime = 0;

  useEffect(() => {
    askCountDown();
  }, [askCountDown]);

  return (
    <Fragment>
      <section ref={ref} id="defineSchedule">
        <Title content="Schedule" class="timer" />
        <div
          className={`${timerStyles.wrapper} ${timerStyles.schedule} ${
            currentCountDown ? `${timerStyles.runningCountDown}` : ""
          }`}
        >
          <div className={timerStyles.label}>
            <label htmlFor="moment">
              <Text tid="countdownStart" />
            </label>
            <input
              value={`${hourNow}:${minutesNow}`}
              aria-labelledby="moment"
              onChange={(e) => modifyHour(e)}
              className={timerStyles.moment}
              type="time"
              id="moment"
              disabled={currentCountDown}
            />
            <Text tid="whenStartCD" />
          </div>

          {/* loop on differents steps of baking */}
          <div className={timerStyles.main}>
            {console.log("durationDefault", durationDefault)}
            {durationDefault.map((action, i) => {
              sumTime += action.duration;
              let hour = momentByAction(now, sumTime);
              return (
                <Action
                  key={i}
                  details={action}
                  sumTime={hour}
                  currentCountDown={currentCountDown}
                  action={modifySchedule}
                />
              );
            })}

            {currentCountDown === false && (
              <div className={timerStyles.starter}>
                <div className={timerStyles.launcher}>
                  <div className={timerStyles.basicTxt}>
                    <Text tid="LaunchTimerFrom" />
                  </div>
                  <div className={timerStyles.wrapperPlay}>
                    <span>
                      <Text tid="now" /> <span>({potentialStart})</span>
                    </span>
                    <div
                      role="presentation"
                      aria-labelledby="launch"
                      id="launch"
                      onClick={() => launchWW(new Date())}
                      className={timerStyles.buttonStart}
                    />
                  </div>
                  {toolate === false && (
                    <Fragment>
                      <div className={timerStyles.basicTxt}>
                        {" "}
                        <Text tid="or" />{" "}
                      </div>
                      <div className={timerStyles.wrapperPlay}>
                        <span>
                          <a href="#defineSchedule">{`${hourNow}:${minutesNow}`}</a>
                        </span>
                        <div
                          role="presentation"
                          aria-labelledby="launch"
                          id="launch"
                          onClick={() => launchWW(now)}
                          className={timerStyles.buttonStart}
                        />
                      </div>
                    </Fragment>
                  )}
                </div>
              </div>
            )}
            {currentCountDown !== false && (
              <div className={timerStyles.starter}>
                <div className={timerStyles.launcher}>
                  <div className={timerStyles.basicTxt}>
                    <Text tid="cdLaunched" />
                    .&nbsp;
                    <span
                      className={timerStyles.lnk}
                      onClick={() => cancelCountdown()}
                    >
                      <Text tid="cancelcd" />
                    </span>
                    .
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* 
        <Modal
          display={displayModal}
          close={() => displayModalHowLong()}
          data={data}
        />
        */}
      </section>
      <Save />
      <About />

      <Timeline
        visibility={classBool}
        // milestones={milestones}
        hrHour={{ hourNow, minutesNow }}
        // timeTotal={timeTotal}
        now={now}
        // end={endTimeStamp}
      />

    </Fragment>
  );
  // }
});

export default Timer;
