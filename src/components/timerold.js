import React, {Component, Fragment} from "react";
import timerStyles from "../styles/wrapper.module.css"
import Title from "./title"
import Modal from "./modal"
import Note from "./noteinfos";
import Ext from "./ext.js";
import Save from "./save.js";
import { Proofing, Bulkproofing } from "./infos.js";
import { convertMinutsToHuman, extractMinutsFromDate, ExtractMinutsAndSecondsFromDate, twoDigits, decimalToSeconds } from "../functions/tools.js";
import { Text, FuncText } from '../containers/language';

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

/* Minutes between pre shaping and shaping */
const preSetTiming = 1;
let timeWithoutStretchAndFold = 90;
// let temps;

class Timer extends Component {
    constructor(props) {
        super(props);
        const { autolyse, fermentation, proofingMinuts, zenith, saf } = props.schedule;
        this.state = {
            autolyse,
            fermentation,
            proofingMinuts,
            zenith,
            toolate: false,
            now: new Date(),
            startAutolyse: new Date(),
            addLeavin: new Date(),
            humanFermentation: "",
            afterFermentation: new Date(),
            shaping: 0,
            timeAfterFermentation: new Date(),
            preshaping: new Date(),
            displayModal: false,
            safNumber: saf.length,
            timeSliceSaF: [],
            listSaF: saf,
            startProofingHour: new Date(),
            hoveredStripe: 0,
            potentialStart: "",
            currentCountDown: false,
            worker: () => {},
            hourNow: 0
        };
    }

    componentDidMount = () => {
        this.setUpWaitingYeast(this.state.zenith);
        this.setUpAutolyse(this.state.autolyse);
        this.askCountDown();
        this.startTime();
        this.setServiceWorker();
    }

    askCountDown(){
        let countDownExisting = [];
        if(localStorage.getItem("patefolle-cd") !== null){
          countDownExisting = JSON.parse(localStorage.getItem("patefolle-cd"));
          const isRunning = countDownExisting.active;
          this.setState({ currentCountDown: isRunning }, () => {
            this.props.countDownFunc(this.state.currentCountDown);
          });
          if(isRunning){
              // console.log("countDownExisting", );
            const startMoment = countDownExisting.schedule[0];
            this.changeHourWithDate(new Date(startMoment));
          }
        }
        
        // return newExisting;
    }

    startTime = () => {
        // console.log("ça tourne");
        const { startProofingHour, currentCountDown } = this.state;
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        m = checkTime(m);
        if(today > startProofingHour){
            this.setState({ toolate: true, currentCountDown: false });
        } else {
            this.setState({ toolate: false });
        }
        const currentTimeNow = h + ":" + m;

        this.setState({ potentialStart: currentTimeNow });
        // if(this.state.currentCountDown){
        setTimeout(() => {
            this.startTime()
        }, 2000);
        /*} else {
            clearTimeout(temps);
        }*/

    }

    makeReadableFermentation = () => {
        let { fermentation, addLeavin, safNumber } = this.state;
        const humanFermentation = convertMinutsToHuman(fermentation);
        let afterFermentation = new Date(addLeavin.getTime());
        afterFermentation.setMinutes( afterFermentation.getMinutes() + parseInt(fermentation));
        this.setState({ preshaping: afterFermentation });
        afterFermentation = new Date(afterFermentation.getTime());
        const preShaped = new Date(afterFermentation.getTime());
        // Ici se passe le temps entre shaping et pre shaping
        preShaped.setMinutes( preShaped.getMinutes() + preSetTiming);
        this.setState({ timeAfterFermentation: preShaped }, () => {
            // Set timer for next step
            this.makeReadableProofing(this.state.proofingMinuts);
        });
        // }
        this.setState({ humanFermentation, afterFermentation });
        // Stretch & Fold
        this.setNumberOfStretchAndFold(safNumber);
        /* Initialisation de la timeline */
    }

    makeReadableProofing = (proofing) => {
        var { timeAfterFermentation, startProofingHour } = this.state;
        startProofingHour = new Date(timeAfterFermentation.getTime());
        startProofingHour.setMinutes( startProofingHour.getMinutes() + parseInt(proofing));
        this.setState({ startProofingHour });
    }

    changeProofing = (e) => {
        this.makeReadableProofing(e.target.value);
        this.setState({ proofingMinuts: e.target.value })
    }

    changeHourWithDate = (dateObj) => {
        this.setState({now: dateObj}, () => {
            this.setUpAutolyse(this.state.autolyse);
            // this.setUpWaitingYeast(this.state.zenith);
        });
    }

    changeHour = (e) => {
        const [hours, minuts] = e.target.value.split(":");
        let changedTime = new Date();
        changedTime.setHours(hours, minuts);
        this.changeHourWithDate(changedTime);
    }

    changeFermentationDuration = (e) => {
        const newValue = e.target.value;
        this.setState({ fermentation: e.target.value }, () => {
            this.makeReadableFermentation(newValue);
        });
    }

    rangeYeast = (e) => {
        this.setUpWaitingYeast(e.target.value);
    }

    setUpAutolyse = (mins) => {
        const { zenith, now } = this.state;
        const startAutolyse = new Date(now.getTime());
        const diff = parseInt(zenith) - parseInt(mins);
        startAutolyse.setMinutes( startAutolyse.getMinutes() + diff );
        this.setState({ autolyse: mins, startAutolyse })
    }

    setUpWaitingYeast = (zenith) => {
        const start = new Date(this.state.now.getTime());
        start.setMinutes( start.getMinutes() + parseInt(zenith) );
        this.setState({zenith, addLeavin: start}, () => {
            this.setUpAutolyse(this.state.autolyse);
            this.makeReadableFermentation();
        })
    }

    displayModalHowLong = () => {
        this.setState({
            display: !this.state.display
        })
    }

    setNumberOfStretchAndFold = (nbSaF) => {
        if(this.state.fermentation < 120){
            timeWithoutStretchAndFold = (25*this.state.fermentation)/100;
        }
        const scopeAuthorised = this.state.fermentation - timeWithoutStretchAndFold;
        const timeSlice = scopeAuthorised/parseInt(nbSaF);

        const safMinuts = [];
        for (let a = 0; a < nbSaF; a++) {
            let gapsaf = timeSlice+(a*(timeSlice));
            gapsaf = decimalToSeconds(gapsaf);
            const datesaf = new Date(this.state.addLeavin);
            datesaf.setSeconds( datesaf.getSeconds() + gapsaf);
            safMinuts.push(datesaf);
        }
        this.setState({ safNumber: nbSaF, timeSliceSaF: timeSlice, listSaF: safMinuts });
    }

    getPercentForTimeline = ( totalScopeTimelineMinuts, startTimeStamp, objDate ) => {
        const timeStamp = objDate.getTime();
        const scopeMinuts = ((timeStamp - startTimeStamp) / 1000) / 60;
        const percent = (scopeMinuts*100)/totalScopeTimelineMinuts;
        return percent;
    }

    getPercentForTimelineInSeconds = ( totalScopeTimelineSeconds, startTimeStamp, objDate ) => {
        const timeStamp = objDate.getTime();
        const scopeSeconds = ((timeStamp - startTimeStamp) / 1000);
        const percent = (scopeSeconds*100)/totalScopeTimelineSeconds;
        return percent;
    }

    roundMinutes = (dateObj) => {
        const neoDate = new Date(dateObj.getTime());
        neoDate.setHours(neoDate.getHours() + Math.round(neoDate.getMinutes()/60));
        neoDate.setMinutes(0, 0, 0);
        return neoDate;
    }

    roundSeconds = (dateObj) => {
        const neoDate = new Date(dateObj.getTime());
        neoDate.setMinutes(neoDate.getMinutes() + Math.round(neoDate.getSeconds()/60));
        neoDate.setSeconds(0, 0);
        return neoDate;
    }

    showHour = step => {
        this.setState({hoveredStripe: step})
    }

    componentDidUpdate(prevProps){
        if(JSON.stringify(prevProps.schedule) !== JSON.stringify(this.props.schedule)){
            this.refreshState();
        }
    }

    refreshState = () => {
        const { autolyse, fermentation, proofingMinuts, zenith, saf} = this.props.schedule;
        this.setState({
            autolyse,
            fermentation,
            proofingMinuts,
            zenith
        }, () => {
            this.setUpAutolyse(autolyse);
            this.setUpWaitingYeast(zenith);
            this.setNumberOfStretchAndFold(saf.length);
        });
    }

    setTimeOfSaF = (nbSaF, addLeavin) => {
        if(this.state.fermentation < 120){
            timeWithoutStretchAndFold = (25*this.state.fermentation)/100;
        }
        const scopeAuthorised = this.state.fermentation - timeWithoutStretchAndFold;
        const timeSlice = scopeAuthorised/parseInt(nbSaF);

        const safMinuts = [];
        for (let a = 0; a < nbSaF; a++) {
            let gapsaf = timeSlice+(a*(timeSlice));
            gapsaf = decimalToSeconds(gapsaf);
            const addLeavinStep = new Date(addLeavin);
            addLeavinStep.setSeconds( addLeavinStep.getSeconds() + gapsaf);
            safMinuts.push(addLeavinStep);
        }
        return safMinuts;
    }

    launchWW = (start) => {
        // this.changeHourWithDate(start);
        this.setState({now: start, currentCountDown: true}, () => {

            const { zenith, autolyse, listSaF, fermentation, proofingMinuts } = this.state;
            const step0 = new Date(start);
            const step2 = new Date(step0.setMinutes(step0.getMinutes() + parseInt(zenith)));
            const tmpStep2 = new Date(step2);
            const tmpStep2bis = new Date(step2);
            const tmpStep2bisbis = new Date(step2);
            const step1 = new Date(tmpStep2.setMinutes(tmpStep2.getMinutes() - autolyse));
            const step3 = new Date(tmpStep2bisbis.setMinutes(tmpStep2bisbis.getMinutes() + parseInt(fermentation)));
            const tmpStep3 = new Date(step3);
            const step4 = new Date(tmpStep3.setMinutes(tmpStep3.getMinutes() + preSetTiming));
            const tmpStep4 = new Date(step4);
            const step5 = new Date(tmpStep4.setMinutes(tmpStep4.getMinutes() + parseInt(proofingMinuts)));

            const listSaf = this.setTimeOfSaF(listSaF.length, tmpStep2bis);

            const milestones = [start, step1, step2, step3, step4, step5];
            
            // console.log("milestones", milestones);

            this.state.worker.active.postMessage({
                type: "LAUNCH",
                milestones: milestones,
                saf: listSaf
            })

            const initObj = {active: true, schedule: milestones}
            const toSave = JSON.stringify(initObj);
            localStorage.setItem("patefolle-cd", toSave);

            this.startTime();
        });
    }

    setServiceWorker = () => {
        // const countDown = this.props.countDown;

        if ('serviceWorker' in navigator) {
            Notification.requestPermission(permission => {
                if(!('permission' in Notification)) {
                    Notification.permission = permission;
                }
                return permission;
            })
            .then(() => navigator.serviceWorker.register('/sw.js')).then((worker) => {
                this.setState({ worker });
            })
            .catch(console.error);
            /* Listen to service Worker *//*
            navigator.serviceWorker.onmessage = (event) => {
                if (event.data) {
                  if(event.data.status === "RUNNING"){
                    this.changeHourWithDate(event.data.startMoment);
                    this.setState({ currentCountDown: true }, () => {
                        // function from parent component for setting a boolean (and know if countdown active or not)
                        this.props.countDownFunc(this.state.currentCountDown);
                        this.startTime();
                    });
                  }
                  if(event.data.status === "ENDING"){
                    this.setState({ currentCountDown: false, toolate: true }, () => {
                        this.props.countDownFunc(this.state.currentCountDown);
                    });
                  }
                }
              };
              */
        } else {
            console.warn('browser don\'t use services workers');
        }
    }

    resetSessionCountDown = () => {
        const setToFalse = JSON.stringify({active: false});
        this.props.countDownFunc(false);
        localStorage.setItem("patefolle-cd", setToFalse);
    }

    cancelCountdown = () => {
        this.setState({currentCountDown: false});
        navigator.serviceWorker.controller.postMessage({
            type: "CANCEL"
        });
        this.resetSessionCountDown();
    }

    /* {/*onMouseLeave={() => this.closeTooltip()}} */
    render() {
        const {
            now,
            zenith,
            autolyse,
            fermentation,
            proofingMinuts,
            startAutolyse,
            humanFermentation,
            afterFermentation,
            preshaping, 
            display,
            addLeavin,
            timeAfterFermentation,
            safNumber,
            timeSliceSaF,
            startProofingHour,
            hoveredStripe,
            listSaF,
            potentialStart,
            currentCountDown,
            toolate
        } = this.state;

        const hourNow = twoDigits(now.getHours());
        const minutesNow = twoDigits(now.getMinutes());
        const limitAutolyse = zenith > 300 ? 300 : zenith;
        const data = {
            safNumber: safNumber,
            setNumberOfStretchAndFold: this.setNumberOfStretchAndFold,
            timeFermentation: humanFermentation,
            timeFermentationMin: fermentation,
            timeSlice: timeSliceSaF,
            convertMinuts: convertMinutsToHuman
        }
        
        const endTimeStamp = startProofingHour.getTime();
        const startTimeStamp = now.getTime();

        const closestHour = this.roundMinutes(now);
        if(closestHour.getTime() < startTimeStamp){
            closestHour.setHours(closestHour.getHours() + 1);
        }
        const FirstHour = closestHour.getHours();
        
        const closestMinut = this.roundSeconds(now);
        if(closestMinut.getTime() < startTimeStamp){
            closestMinut.setMinutes(closestMinut.getMinutes() + 1);
        }
        const FirstMinute = closestMinut.getMinutes();

        const totalScopeTimelineMinuts = ((endTimeStamp - startTimeStamp) / 1000) / 60;
        const totalScopeTimeSeconds = ((endTimeStamp - startTimeStamp) / 1000);

        /* Hours */
        const firstHourPercent  = this.getPercentForTimeline( totalScopeTimelineMinuts, startTimeStamp, closestMinut );
        const firstMinutPercent  = this.getPercentForTimelineInSeconds( totalScopeTimeSeconds, startTimeStamp, closestMinut );
        const scopeNumberHours = Math.ceil(totalScopeTimelineMinuts/60);
        const scopeNumberMinuts = Math.ceil(totalScopeTimeSeconds)/60;

        const items = [];

        if( totalScopeTimelineMinuts > 120 ){
            for (let a = 1; a < scopeNumberHours; a++) {
                closestHour.setHours(closestHour.getHours() + 1);
                const hour = closestHour.getHours();
                const percentHour = this.getPercentForTimeline( totalScopeTimelineMinuts, startTimeStamp, closestHour );
                items.push(<div style={{"left": `${Math.round(percentHour)}%`}} className={timerStyles.grid} key={a}>{hour}h</div>)
            }
        } else {
            for (let a = 1; a < scopeNumberMinuts; a++) {
                closestMinut.setMinutes(closestMinut.getMinutes() + 1);
                const minute = closestMinut.getMinutes();
                const percentMinut = this.getPercentForTimelineInSeconds( totalScopeTimeSeconds, startTimeStamp, closestMinut );
                items.push(<div style={{"left": `${Math.round(percentMinut)}%`}} className={timerStyles.grid} key={a}>{minute}</div>)
            }
        }

        const saf = [];
        for (let b = 0; b < listSaF.length; b++) {
            const safMinut = listSaF[b];
            const safMoment = extractMinutsFromDate(safMinut);
            const percentSaF = this.getPercentForTimeline( totalScopeTimelineMinuts, startTimeStamp, safMinut );
            saf.push(<div style={{"left": `${percentSaF}%`}} title={safMoment} className={timerStyles.saf} key={b}></div>)
        }

        /* Steps */
        /* In minuts */
        const shapingPercent     = this.getPercentForTimeline( totalScopeTimelineMinuts, startTimeStamp, timeAfterFermentation );
        const preshapingPercent  = this.getPercentForTimeline( totalScopeTimelineMinuts, startTimeStamp, preshaping );
        const AddLeavinPercent   = this.getPercentForTimeline( totalScopeTimelineMinuts, startTimeStamp, addLeavin );
        const createDoughPercent = this.getPercentForTimeline( totalScopeTimelineMinuts, startTimeStamp, startAutolyse );

        /* Is live */
        let countDownPercent   = this.getPercentForTimelineInSeconds( totalScopeTimeSeconds, startTimeStamp, new Date());
        countDownPercent = countDownPercent > 100 ? 100 : countDownPercent;
        // if(countDownPercent >= 100){ clearTimeout(temps); }

        const timeTotal = convertMinutsToHuman(totalScopeTimelineMinuts);
        // totalScopeTimelineMinuts

        const composition = this.props.composition;

        const dataForSave = {
            timeTotal,
            composition,
            zenithLeavin: zenith,
            autolyse,
            fermentation,
            proofingMinuts,
            listSaF
        }

        return (
            <Fragment>
            <section id="defineSchedule">
                <Title content="Schedule" class="timer" />
                <div className={`${timerStyles.wrapper} ${timerStyles.schedule} ${currentCountDown ? `${timerStyles.runningCountDown}` : ""}`}>
                    <div className={timerStyles.label}>
                        <label htmlFor="moment">
                            <Text tid="countdownStart" />
                        </label>
                        <input type="time" value={`${hourNow}:${minutesNow}`} aria-labelledby="moment" onChange={(e) => this.changeHour(e)} id="moment" className={timerStyles.moment} />
                        <Text tid="whenStartCD" />
                    </div>
                    <div className={timerStyles.main}>
                        <div className={timerStyles.range}>
                            <div className="left">
                                <label htmlFor="autolyse">
                                    <Text tid="autolysisTimer" />
                                    <Ext title={FuncText("autolyseTtl")} link={FuncText("autolyseYoutube")} />
                                </label>
                                <input value={autolyse} disabled={currentCountDown} type="range" aria-labelledby="autolyse" onChange={(e) => this.setUpAutolyse(e.target.value)} id="autolyse" min="0" max={limitAutolyse} />
                                <span><u>{convertMinutsToHuman(autolyse)}</u></span> 
                            </div>
                            <div className={timerStyles.right}>
                                <b>{extractMinutsFromDate(startAutolyse)}</b>
                            </div>
                        </div>
                        <div className={timerStyles.range}>
                            <div className="left">
                                <label htmlFor="yeast">
                                    <Text tid="yeastTopReached" />
                                    <Ext title={FuncText("YeastTtl")} link={FuncText("yeastTopYoutube")} />
                                </label>
                                <input disabled={currentCountDown} value={zenith} type="range" aria-labelledby="sourdough" onChange={(e) => this.rangeYeast(e)} id="sourdough" min="30" max="720" step="5" />
                                <span><u>{convertMinutsToHuman(zenith)}</u></span>
                            </div>
                            <div className={timerStyles.right}>
                                <b>{extractMinutsFromDate(addLeavin)}</b>
                            </div>
                        </div>
                        <div className={timerStyles.range}>
                            <div className="left">
                                <label htmlFor="fermentation">
                                    <Text tid="bulkFermentationDuration" />
                                    <Ext title={FuncText("bulkFermentationttl")} link={FuncText("bulkFermentationLink")} />
                                    <Note content={<Bulkproofing />} />
                                </label>
                                <input disabled={currentCountDown} value={fermentation} type="range" aria-labelledby="fermentation" onChange={(e) => this.changeFermentationDuration(e)} id="fermentation" min="120" max="1200" step="5" />
                                <span><u>{humanFermentation}</u> <span>-></span>
                                    <Text tid="startPreShaping" />
                                </span><br />
                                <label className={timerStyles.noPadding} htmlFor="fermentation">
                                    <span role="presentation" onClick={() => this.displayModalHowLong()} className={timerStyles.modalHowLong}>
                                        <Text tid="addSomeSaF" />
                                        <Ext title={FuncText("StretchAndFoldttl")} link={FuncText("safLink")} />
                                    </span> 
                                    {safNumber > 0 && <span className={timerStyles.saf}><b>{safNumber}</b></span>}
                                </label>
                            </div>
                            <div className={timerStyles.right}>
                                <b>{extractMinutsFromDate(afterFermentation)}</b><br />
                            </div>
                        </div>
                        <div className={`${timerStyles.range} ${timerStyles.alignCenter}`}>
                            <div>
                                <span className={timerStyles.label}>
                                    <Text tid="restDough" />
                                    <span> -> </span> 
                                    <Text tid="shapingStart" />
                                    </span><Ext title={FuncText("shapingAndPreshappingttl")} link={FuncText("shapingLink")} />
                            </div>
                            <div className={timerStyles.right}>
                                <b className={timerStyles.noMargin}>{extractMinutsFromDate(timeAfterFermentation)}</b>
                            </div>
                        </div>
                        <div className={timerStyles.range}>
                            <div className="left">  
                                <label htmlFor="proofing">
                                    <Text tid="Proofing" />
                                    <Ext title={FuncText("fermentedTtl")} link={FuncText("fermentedLink")} />
                                    <Note content={<Proofing />}/>
                                </label>
                                <input disabled={currentCountDown} value={proofingMinuts} type="range" aria-labelledby="proofing" onChange={(e) => this.changeProofing(e)} id="proofing" min="120" max="1200" step="5" />
                                <span><u>{convertMinutsToHuman(proofingMinuts)}</u> <span>-></span> 
                                <Text tid="startBakeAt" />
                                </span>
                            </div>
                            <div className={timerStyles.right}>
                            <b>{extractMinutsFromDate(startProofingHour)}</b>
                            </div>
                        </div>
                        {currentCountDown === false && 
                            <div className={timerStyles.starter}>
                                <div className={timerStyles.launcher}>
                                    <div className={timerStyles.basicTxt}><Text tid="LaunchTimerFrom" /></div>
                                    <div className={timerStyles.wrapperPlay}>
                                        <span><Text tid="now" /> <span>({potentialStart})</span></span>
                                        <div role="presentation" aria-labelledby="launch" id="launch" onClick={() => this.launchWW(new Date())} className={timerStyles.buttonStart} />
                                    </div>
                                    {toolate === false && <Fragment>
                                        <div className={timerStyles.basicTxt}> <Text tid="or" /> </div>
                                        <div className={timerStyles.wrapperPlay}> 
                                            <span><a href="#defineSchedule">{`${hourNow}:${minutesNow}`}</a></span>
                                            <div role="presentation" aria-labelledby="launch" id="launch" onClick={() => this.launchWW(now)} className={timerStyles.buttonStart} />
                                        </div>
                                    </Fragment>
                                    }
                                </div>
                            </div>
                        }
                        {currentCountDown !== false && 
                            <div className={timerStyles.starter}>
                                <div className={timerStyles.launcher}>
                                    <div className={timerStyles.basicTxt}>Countdown launched. <span className={timerStyles.lnk} onClick={() => this.cancelCountdown()}>Cancel the countdown</span>.</div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <Modal display={display} close={this.displayModalHowLong} data={data} />
            </section>
            <Save data={dataForSave} />
            <div className={timerStyles.board}>
                <div className={`${timerStyles.timeline} ${timerStyles[`hover${hoveredStripe}`]}`}>
                    <div className={timerStyles.marker}>{`${hourNow}:${minutesNow}`}</div>
                    <div className={`${timerStyles.marker} ${timerStyles.marker1}`}><ExtractMinutsAndSecondsFromDate objDate={startProofingHour} /></div>
                    <div className={`${timerStyles.marker} ${timerStyles.marker2}`} style={{"left": `${createDoughPercent}%`}}><ExtractMinutsAndSecondsFromDate objDate={startAutolyse} /></div>
                    <div className={`${timerStyles.marker} ${timerStyles.marker3}`} style={{"left": `${AddLeavinPercent}%`}}><ExtractMinutsAndSecondsFromDate objDate={addLeavin} /></div>
                    <div className={`${timerStyles.marker} ${timerStyles.marker4}`} style={{"left": `${preshapingPercent}%`}}><ExtractMinutsAndSecondsFromDate objDate={afterFermentation} /></div>
                    <div className={`${timerStyles.marker} ${timerStyles.marker5}`} style={{"left": `${shapingPercent}%`}}><ExtractMinutsAndSecondsFromDate objDate={timeAfterFermentation} /></div>
                    {saf}
                
                    {currentCountDown && <div className={`${timerStyles.countdown}`} style={{"left": `${countDownPercent}%`}}></div>}

                    <div title={FuncText("Proofing")} onMouseOver={() => this.showHour(5)} onFocus={() => this.showHour(5)} className={`${timerStyles.stripe} ${timerStyles.stripe1}`} style={{"width": "100%"}}>
                        <Text tid="Proofing" />
                    </div>
                    <div title={FuncText("doughRest")} onMouseOver={() => this.showHour(4)} onFocus={() => this.showHour(4)} className={`${timerStyles.stripe} ${timerStyles.stripe2}`} style={{"width": `${shapingPercent}%`}}>
                        <Text tid="doughRest" />
                    </div>
                    <div title={FuncText("bulkFermentation")} onMouseOver={() => this.showHour(3)} onFocus={() => this.showHour(3)} className={`${timerStyles.stripe} ${timerStyles.stripe3}`} style={{"width": `${preshapingPercent}%`}}>
                        <Text tid="bulkFermentation" />
                    </div>
                    <div title={FuncText("autolyse")} onMouseOver={() => this.showHour(2)} onFocus={() => this.showHour(2)} className={`${timerStyles.stripe} ${timerStyles.stripe4}`} style={{"width": `${AddLeavinPercent}%`}}>
                        <Text tid="autolyse" />
                    </div>
                    <div title={FuncText("leavin")} onMouseOver={() => this.showHour(1)} onFocus={() => this.showHour(1)} className={`${timerStyles.stripe} ${timerStyles.stripe5}`} style={{"width": `${createDoughPercent}%`}}>
                        <Text tid="leavin" />
                    </div>

                    <span>{timeTotal}</span>
                
            </div>
            {totalScopeTimelineMinuts > 120 ?
            <div className={timerStyles.cycle}>
                <div className={timerStyles.grid} style={{"left": `${firstHourPercent}%`}}>{FirstHour}h</div>
                {items}
            </div>
                : 
            <div className={timerStyles.cycle}>
                <div className={timerStyles.grid} style={{"left": `${firstMinutPercent}%`}}>{FirstMinute}</div>
                {items}
            </div>
            }
          </div>
        </Fragment>
        )
    }
};


export default Timer;