import React, { useState, useEffect, useContext, Fragment } from "react";
import timerStyles from "../styles/wrapper.module.css";
import Title from "./title";
import Modal from "./modalSandF";
import Note from "./noteinfos";
import Timeline from "./timeline.js";
import Ext from "./ext.js";
import Save from "./save.js";
import { Proofing, Bulkproofing } from "./infos.js";
import {
  convertMinutsToHuman,
  extractMinutsFromDate,
  twoDigits,
  decimalToSeconds,
  checkTime,
} from "../functions/tools.js";
import { timerContext } from "../containers/timerLogic";
import { Text } from "../containers/language";
import About from "./about.js";

/* Minutes between pre shaping and shaping */
const preSetTiming = 30;
let timeWithoutStretchAndFold = 90;
// let temps;

const getNowHumanWay = () => {
  const today = new Date();
  const h = today.getHours();
  let m = today.getMinutes();
  m = checkTime(m);
  return h + ":" + m;
};

const Timer = React.forwardRef((props, ref) => {
  //    super(props);

  const {
    triggerCountDown,
  } = useContext(timerContext);

  // const { autolyse, fermentation, proofing, zenith, saf } = props.schedule;
  const [autolyse, setAutolyse] = useState(props.schedule.autolyse);
  const [fermentation, setFermentation] = useState(props.schedule.fermentation);
  const [proofing, setProofing] = useState(props.schedule.proofing);
  const [zenith, setZenith] = useState(props.schedule.zenith);
  const [toolate, setToolate] = useState(false);
  const [now, setNow] = useState(new Date());
  const [dateAutolyse, setDateAutolyse] = useState(new Date());
  const [dateZenith, setDateZenith] = useState(new Date());
  const [dateFermentation, setDateFermentation] = useState(new Date());
  // const [shaping, setShaping] = useState(0);
  const [dateRest, setDateRest] = useState(new Date());
  const [displayModal, setDisplayModal] = useState(false);
  const [safNumber, setSafNumber] = useState(props.schedule.saf);
  const [timeSliceSaF, setTimeSliceSaF] = useState([]);
  const [listSaF, setListSaF] = useState(props.schedule.saf);
  const [dateProofing, setDateProofing] = useState(
    new Date(new Date().setMinutes(new Date().getMinutes() + 1))
  );
  const [potentialStart, setPotentialStart] = useState(getNowHumanWay());
  const [currentCountDown, setCurrentCountDown] = useState(false);
  // const [worker, setWorker] = useState(() => {});
  // const [hourNow, setHourNow] = useState(0);
  // }

  /* Check if a countdown exist already or not */
  const askCountDown = () => {
    let countDownExisting = [];
    if (localStorage.getItem("patefolle-cd") !== null) {
      countDownExisting = JSON.parse(localStorage.getItem("patefolle-cd"));
      const isRunning = countDownExisting.active;
      setCurrentCountDown(isRunning);

      // Callback
      // props.countDownFunc(currentCountDown);
      triggerCountDown(currentCountDown);

      if (isRunning) {
        const startMoment = countDownExisting.milestones[0];
        const schedule = countDownExisting.schedule;
        // autolyse, zenith, fermentation, proofing, saf
        setAutolyse(schedule[0]);
        setZenith(schedule[1]);
        setFermentation(schedule[2]);
        setProofing(schedule[3]);
        // Callback
        startTime();
        changeHourWithDate(new Date(startMoment));
      } else {
        redispatchValues();
      }
    } else {
      /* initialisation */
      changeHourWithDate(new Date());
    }

    // return newExisting;
  };

  // https://stackoverflow.com/questions/55840294/how-to-fix-missing-dependency-warning-when-using-useeffect-react-hook
  useEffect(() => {
        askCountDown();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startTime = () => {
    const today = new Date();
    const h = today.getHours();
    let m = today.getMinutes();
    m = checkTime(m);
    // console.log(" timer running ", new Date(today).getMinutes(), new Date(dateProofing).getMinutes(), today > dateProofing, this.state.toolate);
    if (today > dateProofing) {
      setToolate(true);
      // callback
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

  const changeHourWithDate = (dateObj) => {
    setNow(dateObj);
    // callback
    redispatchValues();
  };

  const modifyHour = (e) => {
    const [hours, minuts] = e.target.value.split(":");
    let changedTime = new Date();
    changedTime.setHours(hours, minuts);
    changeHourWithDate(changedTime);
  };

  const modifyAutolyse = (mins) => {
    setAutolyse(mins);
    // Faire un callback
    redispatchValues();
  };

  const modifyZenith = (e) => {
    const zenithValue = e.target.value;
    let autolyseTmp = autolyse;
    if (parseInt(zenithValue) < parseInt(autolyseTmp)) {
        autolyseTmp = zenithValue;
    }
    setZenith(zenithValue);
    setAutolyse(autolyseTmp);
    // A faire en callback
    redispatchValues();
  };

  const modifyFermentation = (e) => {
    setFermentation(e.target.value);
    // Callback
    redispatchValues();
  };

  const modifyProofing = (e) => {
    setProofing(e.target.value);
    // Callback
    redispatchValues();
  };

  const displayModalHowLong = () => {
    setDisplayModal(!displayModal);
  };

  const setNumberOfStretchAndFold = (nbSaF) => {
    // Si on est en dessous de 120 minutes, on retires 25%
    const fermentationTmp = parseInt(fermentation);
    if (fermentationTmp < 120) {
      timeWithoutStretchAndFold = (25 * fermentationTmp) / 100;
    } else {
      // Défined on top
      timeWithoutStretchAndFold = 90;
    }
    const scopeAuthorised = fermentationTmp - timeWithoutStretchAndFold;
    const timeSlice = scopeAuthorised / (parseInt(nbSaF) + 1);
    // console.log("this.state.fermentation", this.state.fermentation, "timeWithoutStretchAndFold", timeWithoutStretchAndFold, "timeSlice", timeSlice, "scopeAuthorised", scopeAuthorised);

    const safMinuts = [];
    for (let a = 0; a < nbSaF; a++) {
      let gapsaf = timeSlice + a * timeSlice;
      gapsaf = decimalToSeconds(gapsaf);
      const datesaf = new Date(dateZenith);
      datesaf.setSeconds(datesaf.getSeconds() + gapsaf);
      safMinuts.push(datesaf);
    }
    setSafNumber(nbSaF);
    setTimeSliceSaF(timeSlice);
    setListSaF(safMinuts);
  };

  /*
    componentDidUpdate(prevProps){
        if(JSON.stringify(prevProps.schedule) !== JSON.stringify(this.props.schedule)){
            // To check if script running or not
            this.reinitSchedule();
        }
    }
    */

    /*
  const reinitSchedule = () => {
    const { autolyse, fermentation, proofing, zenith, saf } = props.schedule;
    this.setState(
      { autolyse, fermentation, proofing, zenith, saf, safNumber: saf },
      () => {
        if (saf !== safNumber) {
          reinitSchedule();
        }
        redispatchValues();
      }
    );
  };
  */

  const setupAll = (start) => {
    const step0 = new Date(start);
    const step2 = new Date(
      step0.setMinutes(step0.getMinutes() + parseInt(zenith))
    );
    const tmpStep2 = new Date(step2);
    const tmpStep2bisbis = new Date(step2);
    const step1 = new Date(
      tmpStep2.setMinutes(tmpStep2.getMinutes() - autolyse)
    );
    const step3 = new Date(
      tmpStep2bisbis.setMinutes(
        tmpStep2bisbis.getMinutes() + parseInt(fermentation)
      )
    );
    const tmpStep3 = new Date(step3);
    const step4 = new Date(
      tmpStep3.setMinutes(tmpStep3.getMinutes() + preSetTiming)
    );
    const tmpStep4 = new Date(step4);
    const step5 = new Date(
      tmpStep4.setMinutes(tmpStep4.getMinutes() + parseInt(proofing))
    );
    return [step1, step2, step3, step4, step5];
  };

  const redispatchValues = () => {
    const [step1, step2, step3, step4, step5] = setupAll(now);
    const today = new Date();
    const toolate = today > new Date(step5).getTime() ? true : false;
    // if(step5 > )
    setToolate(toolate);
    setDateAutolyse(step1);
    setDateZenith(step2);
    setDateFermentation(step3);
    setDateRest(step4);
    setDateProofing(step5);
    // Callback
    setNumberOfStretchAndFold(safNumber);
  };

  const launchWW = (start) => {
    // this.changeHourWithDate(start);
    // this.setState({ now: start }, () => {
    setNow(start);
      setSafNumber(safNumber);

      // const { autolyse, zenith, fermentation, proofing, listSaF } = this.state;
      const durations = [autolyse, zenith, fermentation, proofing];
      const allSteps = setupAll(start);

      const milestones = [start, ...allSteps];
      const schedule = [...durations];

      const initObj = { active: true, milestones, schedule, saf: listSaF };
      const toSave = JSON.stringify(initObj);
      localStorage.setItem("patefolle-cd", toSave);

      // Should be : autolyse, zenith, fermentation, proofing, saf
      const [step1, step2, step3, step4, step5] = allSteps;

      setDateAutolyse(step1);
      setDateZenith(step2);
      setDateFermentation(step3);
      setDateRest(step4);
      setDateProofing(step5);
      setToolate(false);
      setCurrentCountDown(true);

      // Callback
      setNumberOfStretchAndFold(safNumber);
      startTime();
      /*
      this.setState(
        {
          dateAutolyse: step1,
          dateZenith: step2,
          dateFermentation: step3,
          dateRest: step4,
          dateProofing: step5,
          toolate: false,
          currentCountDown: true,
        },
        () => {
          setNumberOfStretchAndFold(safNumber);
          this.startTime();
        }
        */
      // );
    // });
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

  const milestones = {
    listSaF,
    dateProofing,
    dateAutolyse,
    dateZenith,
    dateFermentation,
    dateRest,
  };

  const hourNow = twoDigits(now.getHours());
  const minutesNow = twoDigits(now.getMinutes());
  const limitAutolyse = zenith > 300 ? 300 : zenith;
  const data = {
    safNumber: safNumber,
    setNumberOfStretchAndFold: setNumberOfStretchAndFold,
    timeFermentation: convertMinutsToHuman(fermentation),
    timeFermentationMin: fermentation,
    timeSlice: timeSliceSaF,
    convertMinuts: convertMinutsToHuman,
  };

  const endTimeStamp = dateProofing.getTime();
  const startTimeStamp = now.getTime();

  const totalScopeTimelineMinuts = (endTimeStamp - startTimeStamp) / 1000 / 60;
  const timeTotal = convertMinutsToHuman(totalScopeTimelineMinuts);

  const classBool = props.visibilitySchedule;

  const dataForSave = {
    timeTotal,
    zenithLeavin: zenith,
    autolyse,
    fermentation,
    proofing,
    listSaF,
  };

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
          <div className={timerStyles.main}>
            <div className={timerStyles.range}>
              <div className="left">
                <label htmlFor="yeast">
                  <Text tid="yeastTopReached" />
                  <Ext title="YeastTtl" link="yeastTopYoutube" />
                </label>
                <input
                  onChange={(e) => modifyZenith(e)}
                  value={zenith}
                  aria-labelledby="sourdough"
                  id="sourdough"
                  min="30"
                  max="720"
                  step="5"
                  type="range"
                  disabled={currentCountDown}
                />
                <span>
                  <u>{convertMinutsToHuman(zenith)}</u>
                </span>
              </div>
              <div className={timerStyles.right}>
                <b>{extractMinutsFromDate(dateZenith)}</b>
              </div>
            </div>
            <div className={timerStyles.range}>
              <div className="left">
                <label htmlFor="autolyse">
                  <Text tid="autolysisTimer" />
                  <Ext title="autolyseTtl" link="autolyseYoutube" />
                </label>
                <input
                  value={autolyse}
                  onChange={(e) => modifyAutolyse(e.target.value)}
                  aria-labelledby="autolyse"
                  type="range"
                  id="autolyse"
                  min="0"
                  max={limitAutolyse}
                  disabled={currentCountDown}
                />
                <span>
                  <u>{convertMinutsToHuman(autolyse)}</u>
                </span>
              </div>
              <div className={timerStyles.right}>
                <b>{extractMinutsFromDate(dateAutolyse)}</b>
              </div>
            </div>
            <div className={timerStyles.range}>
              <div className="left">
                <label htmlFor="fermentation">
                  <Text tid="bulkFermentationDuration" />
                  <Ext
                    title="bulkFermentationttl"
                    link="bulkFermentationLink"
                  />
                  <Note content={<Bulkproofing />} />
                </label>
                <input
                  onChange={(e) => modifyFermentation(e)}
                  value={fermentation}
                  type="range"
                  aria-labelledby="fermentation"
                  id="fermentation"
                  min="120"
                  max="1200"
                  step="5"
                  disabled={currentCountDown}
                />
                <span>
                  <u>{convertMinutsToHuman(fermentation)}</u> <span>-></span>
                  <Text tid="startPreShaping" />
                </span>
                <br />
                <label className={timerStyles.noPadding} htmlFor="fermentation">
                  <span
                    role="presentation"
                    onClick={() => displayModalHowLong()}
                    className={timerStyles.modalHowLong}
                  >
                    <Text tid="addSomeSaF" />
                    <Ext title="StretchAndFoldttl" link="safLink" />
                  </span>
                  {safNumber > 0 && (
                    <span className={timerStyles.saf}>
                      <b>{safNumber}</b>
                    </span>
                  )}
                </label>
              </div>
              <div className={timerStyles.right}>
                <b>{extractMinutsFromDate(dateFermentation)}</b>
                <br />
              </div>
            </div>
            <div className={`${timerStyles.range} ${timerStyles.alignCenter}`}>
              <div>
                <span className={timerStyles.label}>
                  <Text tid="restDough" />
                  <span> -> </span>
                  <Text tid="shapingStart" />
                </span>
                <Ext title="shapingAndPreshappingttl" link="shapingLink" />
              </div>
              <div className={timerStyles.right}>
                <b className={timerStyles.noMargin}>
                  {extractMinutsFromDate(dateRest)}
                </b>
              </div>
            </div>
            <div className={timerStyles.range}>
              <div className="left">
                <label htmlFor="proofing">
                  <Text tid="Proofing" />
                  <Ext title="fermentedTtl" link="fermentedLink" />
                  <Note content={<Proofing />} />
                </label>
                <input
                  onChange={(e) => modifyProofing(e)}
                  value={proofing}
                  type="range"
                  aria-labelledby="proofing"
                  id="proofing"
                  min="5"
                  max="1200"
                  step="5"
                  disabled={currentCountDown}
                />
                <span>
                  <u>{convertMinutsToHuman(proofing)}</u> <span>-></span>
                  <Text tid="startBakeAt" />
                </span>
              </div>
              <div className={timerStyles.right}>
                <b>{extractMinutsFromDate(dateProofing)}</b>
              </div>
            </div>
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
        <Modal
          display={displayModal}
          close={() => displayModalHowLong()}
          data={data}
        />
      </section>
      <Save data={dataForSave} />
      <About />
      <Timeline
        visibility={classBool}
        milestones={milestones}
        currentCountDown={currentCountDown}
        hrHour={{ hourNow, minutesNow }}
        timeTotal={timeTotal}
        now={now}
        end={endTimeStamp}
      />
    </Fragment>
  );
  // }
});

export default Timer;
