import React, {Component, Fragment} from "react";
import timerStyles from "../styles/wrapper.module.css"
import Title from "./title"
import Modal from "./modalSandF"
import Note from "./noteinfos";
import Timeline from "./timeline.js";
import Ext from "./ext.js";
import Save from "./save.js";
import { Proofing, Bulkproofing } from "./infos.js";
import { convertMinutsToHuman, extractMinutsFromDate, twoDigits, decimalToSeconds, checkTime } from "../functions/tools.js";
import { Text, FuncText } from '../containers/language';


/* Minutes between pre shaping and shaping */
const preSetTiming = 1;
let timeWithoutStretchAndFold = 90;
// let temps;

class Timer extends Component {
    constructor(props) {
        super(props);
        const { autolyse, fermentation, proofing, zenith, saf } = props.schedule;
        this.state = {
            autolyse,
            fermentation,
            proofing,
            zenith,
            toolate: false,
            now: new Date(),
            dateAutolyse: new Date(),
            dateZenith: new Date(),
            dateFermentation: new Date(),
            shaping: 0,
            dateRest: new Date(),
            displayModal: false,
            safNumber: saf.length,
            timeSliceSaF: [],
            listSaF: saf,
            dateProofing: new Date(),
            potentialStart: "",
            currentCountDown: false,
            worker: () => {},
            hourNow: 0
        };
    }

    componentDidMount = () => {
        this.askCountDown();
    }

    /* Check if a countdown exist already or not */
    askCountDown(){
        let countDownExisting = [];
        if(localStorage.getItem("patefolle-cd") !== null){
          countDownExisting = JSON.parse(localStorage.getItem("patefolle-cd"));
          const isRunning = countDownExisting.active;
          this.setState({ currentCountDown: isRunning }, () => {
            this.props.countDownFunc(this.state.currentCountDown);
          });
          if(isRunning){
            const startMoment = countDownExisting.schedule[0];
            this.startTime();
            // Doit changer également avec le schedule stocké en théorie sur le cookie 
            // plutot que le schedule fournit par le component d'au dessus
            this.changeHourWithDate(new Date(startMoment));
          } else {                
                this.redispatchValues();
          }
        }
        
        // return newExisting;
    }

    startTime = () => {
        const { dateProofing, toolate } = this.state;
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        m = checkTime(m);
        if(today > dateProofing){
            this.cancelCountdown();
            this.setState({ toolate: true, currentCountDown: false }, () => {
                this.cancelCountdown();
            });
        } else {
            this.setState({ toolate: false });
        }
        const currentTimeNow = h + ":" + m;

        this.setState({ potentialStart: currentTimeNow });
        
        // if(this.state.currentCountDown){
        setTimeout(() => {
            if(!toolate){
                this.startTime()
            }
        }, 2000);
        /*} else {
            clearTimeout(temps);
        }*/

    }

    changeHourWithDate = (dateObj) => {
        this.setState({now: dateObj}, () => {
            this.redispatchValues();
        });
    }

    modifyHour = (e) => {
        const [hours, minuts] = e.target.value.split(":");
        let changedTime = new Date();
        changedTime.setHours(hours, minuts);
        this.changeHourWithDate(changedTime);
    }

    modifyAutolyse = (mins) => {
        this.setState({autolyse: mins},() => {this.redispatchValues();})
    }

    modifyZenith = (e) => {
        this.setState({zenith: e.target.value},() => {this.redispatchValues();})
    }

    modifyFermentation = (e) => {
        this.setState({fermentation: e.target.value},() => {this.redispatchValues();})
    }

    modifyProofing = (e) => {
        this.setState({proofing: e.target.value},() => {this.redispatchValues();})
    }

    displayModalHowLong = () => {
        this.setState({ display: !this.state.display })
    }

    setNumberOfStretchAndFold = (nbSaF) => {
        // Si on est en dessous de 120 minutes, on retires 25%
        let { dateZenith, fermentation } = this.state;
        fermentation = parseInt(fermentation);
        if(fermentation < 120){
            timeWithoutStretchAndFold = (25*fermentation)/100;
        } else {
            // Défined on top
            timeWithoutStretchAndFold = 90;
        }
        const scopeAuthorised = fermentation - timeWithoutStretchAndFold;
        const timeSlice = scopeAuthorised/(parseInt(nbSaF)+1);
        // console.log("this.state.fermentation", this.state.fermentation, "timeWithoutStretchAndFold", timeWithoutStretchAndFold, "timeSlice", timeSlice, "scopeAuthorised", scopeAuthorised);

        const safMinuts = [];
        for (let a = 0; a < nbSaF; a++) {
            let gapsaf = timeSlice+(a*timeSlice);
            gapsaf = decimalToSeconds(gapsaf);
            const datesaf = new Date(dateZenith);
            datesaf.setSeconds( datesaf.getSeconds() + gapsaf);
            safMinuts.push(datesaf);
        }
        this.setState({ safNumber: nbSaF, timeSliceSaF: timeSlice, listSaF: safMinuts });
    }

    componentDidUpdate(prevProps){
        if(JSON.stringify(prevProps.schedule) !== JSON.stringify(this.props.schedule)){
            /* To check if script running or not */
            this.reinitSchedule();
        }
    }

    reinitSchedule = () => {
        const { autolyse, fermentation, proofing, zenith, saf} = this.props.schedule;
        this.setState({autolyse, fermentation, proofing, zenith, saf}, () => {
            this.redispatchValues();
        })
    }

    setupAll = (start) => {
        const { zenith, autolyse, fermentation, proofing } = this.state;
        const step0 = new Date(start);
        const step2 = new Date(step0.setMinutes(step0.getMinutes() + parseInt(zenith)));
        const tmpStep2 = new Date(step2);
        const tmpStep2bisbis = new Date(step2);
        const step1 = new Date(tmpStep2.setMinutes(tmpStep2.getMinutes() - autolyse));
        const step3 = new Date(tmpStep2bisbis.setMinutes(tmpStep2bisbis.getMinutes() + parseInt(fermentation)));
        const tmpStep3 = new Date(step3);
        const step4 = new Date(tmpStep3.setMinutes(tmpStep3.getMinutes() + preSetTiming));
        const tmpStep4 = new Date(step4);
        const step5 = new Date(tmpStep4.setMinutes(tmpStep4.getMinutes() + parseInt(proofing)));
        return [step1, step2, step3, step4, step5];
    }    

    redispatchValues = () => {
        const { safNumber, now } = this.state;
        const [step1, step2, step3, step4, step5] = this.setupAll(now);
        this.setState({
            dateAutolyse: step1,
            dateZenith: step2,
            dateFermentation: step3,
            dateRest: step4,
            dateProofing: step5
        }, () => {
            this.setNumberOfStretchAndFold(safNumber);
        })

    }

    launchWW = (start) => {
        // this.changeHourWithDate(start);
        this.setState({now: start, currentCountDown: true}, () => {

            const allSteps = this.setupAll(start);

            const milestones = [start, ...allSteps];

            const initObj = {active: true, schedule: milestones}
            const toSave = JSON.stringify(initObj);
            localStorage.setItem("patefolle-cd", toSave);

            const [step1, step2, step3, step4, step5] = this.setupAll(start);
            this.setState({
                dateAutolyse: step1,
                dateZenith: step2,
                dateFermentation: step3,
                dateRest: step4,
                dateProofing: step5
            }, () => {
                this.startTime();
            })
            // this.startTime();
        });
    }

    resetSessionCountDown = () => {
        const setToFalse = JSON.stringify({active: false});
        this.props.countDownFunc(false);
        localStorage.setItem("patefolle-cd", setToFalse);
    }

    cancelCountdown = () => {
        this.setState({currentCountDown: false});
        this.resetSessionCountDown();
    }

    /* {/*onMouseLeave={() => this.closeTooltip()}} */
    render() {
        const {
            now,
            zenith,
            autolyse,
            fermentation,
            proofing,
            dateAutolyse,
            dateFermentation,
            display,
            dateZenith,
            dateRest,
            safNumber,
            timeSliceSaF,
            dateProofing,
            listSaF,
            potentialStart,
            currentCountDown,
            toolate
        } = this.state;

        const schedule = { listSaF, dateProofing, dateAutolyse, dateZenith, dateFermentation, dateRest };

        const hourNow = twoDigits(now.getHours());
        const minutesNow = twoDigits(now.getMinutes());
        const limitAutolyse = zenith > 300 ? 300 : zenith;
        const data = {
            safNumber: safNumber,
            setNumberOfStretchAndFold: this.setNumberOfStretchAndFold,
            timeFermentation: convertMinutsToHuman(fermentation),
            timeFermentationMin: fermentation,
            timeSlice: timeSliceSaF,
            convertMinuts: convertMinutsToHuman
        }

        const endTimeStamp = dateProofing.getTime();
        const startTimeStamp = now.getTime();

        const totalScopeTimelineMinuts = ((endTimeStamp - startTimeStamp) / 1000) / 60;
        const timeTotal = convertMinutsToHuman(totalScopeTimelineMinuts);

        const composition = this.props.composition;

        const dataForSave = {
            timeTotal,
            composition,
            zenithLeavin: zenith,
            autolyse,
            fermentation,
            proofing,
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
                        <input value={`${hourNow}:${minutesNow}`} aria-labelledby="moment" onChange={(e) => this.modifyHour(e)} className={timerStyles.moment} type="time" id="moment" />
                        <Text tid="whenStartCD" />
                    </div>
                    <div className={timerStyles.main}>
                        <div className={timerStyles.range}>
                            <div className="left">
                                <label htmlFor="autolyse">
                                    <Text tid="autolysisTimer" />
                                    <Ext title={FuncText("autolyseTtl")} link={FuncText("autolyseYoutube")} />
                                </label>
                                <input value={autolyse} onChange={(e) => this.modifyAutolyse(e.target.value)} aria-labelledby="autolyse" type="range" id="autolyse" min="0" max={limitAutolyse} disabled={currentCountDown} />
                                <span><u>{convertMinutsToHuman(autolyse)}</u></span> 
                            </div>
                            <div className={timerStyles.right}>
                                <b>{extractMinutsFromDate(dateAutolyse)}</b>
                            </div>
                        </div>
                        <div className={timerStyles.range}>
                            <div className="left">
                                <label htmlFor="yeast">
                                    <Text tid="yeastTopReached" />
                                    <Ext title={FuncText("YeastTtl")} link={FuncText("yeastTopYoutube")} />
                                </label>
                                <input onChange={(e) => this.modifyZenith(e)} value={zenith} aria-labelledby="sourdough" id="sourdough" min="30" max="720" step="5" type="range" disabled={currentCountDown} />
                                <span><u>{convertMinutsToHuman(zenith)}</u></span>
                            </div>
                            <div className={timerStyles.right}>
                                <b>{extractMinutsFromDate(dateZenith)}</b>
                            </div>
                        </div>
                        <div className={timerStyles.range}>
                            <div className="left">
                                <label htmlFor="fermentation">
                                    <Text tid="bulkFermentationDuration" />
                                    <Ext title={FuncText("bulkFermentationttl")} link={FuncText("bulkFermentationLink")} />
                                    <Note content={<Bulkproofing />} />
                                </label>
                                <input onChange={(e) => this.modifyFermentation(e)} value={fermentation} type="range" aria-labelledby="fermentation" id="fermentation" min="120" max="1200" step="5" disabled={currentCountDown} />
                                <span><u>{convertMinutsToHuman(fermentation)}</u> <span>-></span>
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
                                <b>{extractMinutsFromDate(dateFermentation)}</b><br />
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
                                <b className={timerStyles.noMargin}>{extractMinutsFromDate(dateRest)}</b>
                            </div>
                        </div>
                        <div className={timerStyles.range}>
                            <div className="left">  
                                <label htmlFor="proofing">
                                    <Text tid="Proofing" />
                                    <Ext title={FuncText("fermentedTtl")} link={FuncText("fermentedLink")} />
                                    <Note content={<Proofing />}/>
                                </label>
                                <input onChange={(e) => this.modifyProofing(e)} value={proofing} type="range" aria-labelledby="proofing" id="proofing" min="120" max="1200" step="5" disabled={currentCountDown} />
                                <span><u>{convertMinutsToHuman(proofing)}</u> <span>-></span> 
                                <Text tid="startBakeAt" />
                                </span>
                            </div>
                            <div className={timerStyles.right}>
                            <b>{extractMinutsFromDate(dateProofing)}</b>
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
            <Timeline
                schedule={schedule}
                currentCountDown={currentCountDown}
                hrHour={{hourNow, minutesNow}}
                timeTotal={timeTotal}
                now={now}
                end={endTimeStamp}
            />

        </Fragment>
        )
    }
};

export default Timer;