import React, {Component, Fragment} from "react";
import timerStyles from "../styles/wrapper.module.css"
import Title from "./title"
import Modal from "./modal"
import Note from "./noteinfos";
import Ext from "./ext.js";
import Save from "./save.js";
import { Proofing, Bulkproofing } from "./infos.en.js";
import { convertMinutsToHuman, extractMinutsFromDate, ExtractMinutsAndSecondsFromDate, twoDigits, decimalToSeconds } from "../functions/tools.js";

function checkTime(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

/* Minutes between pre shaping and shaping */
const preSetTiming = 30;
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
            currentCountDown: false
        };
    }

    componentDidMount = () => {
        this.setUpWaitingYeast(this.state.zenith);
        this.setUpAutolyse(this.state.autolyse);
        this.startTime();
        this.setServiceWorker();
    }

    startTime = () => {
        const { startProofingHour } = this.state;
        var today = new Date();
        var h = today.getHours();
        var m = today.getMinutes();
        m = checkTime(m);
        if(today > startProofingHour){
            this.setState({ toolate: true });
        } else {
            this.setState({ toolate: false });
        }
        const currentTimeNow = h + ":" + m;
        this.setState({ potentialStart: currentTimeNow });
        // if(this.state.currentCountDown){
        setTimeout(() => {
            this.startTime()
        }, 500);
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
            this.setUpWaitingYeast(this.state.zenith);
            this.setUpAutolyse(this.state.autolyse);
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
        startAutolyse.setMinutes( startAutolyse.getMinutes() + diff);
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
            // this.state.addLeavin
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
        // https://stackoverflow.com/questions/7293306/how-to-round-to-nearest-hour-using-javascript-date-object
        const neoDate = new Date(dateObj.getTime());
        neoDate.setHours(neoDate.getHours() + Math.round(neoDate.getMinutes()/60));
        neoDate.setMinutes(0, 0, 0); // Resets also seconds and milliseconds
        return neoDate;
    }

    roundSeconds = (dateObj) => {
        const neoDate = new Date(dateObj.getTime());
        neoDate.setMinutes(neoDate.getMinutes() + Math.round(neoDate.getSeconds()/60));
        neoDate.setSeconds(0, 0); // Resets also seconds and milliseconds
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
            fermentation,
            proofingMinuts,
            zenith
        }, () => {
            this.setUpWaitingYeast(this.state.zenith);
            this.setNumberOfStretchAndFold(saf.length);
            this.setUpAutolyse(autolyse);
        });
    }

    setTimeOfSaF = (nbSaF, addLeavin) => {
        if(this.state.fermentation < 120){
            timeWithoutStretchAndFold = (25*this.state.fermentation)/100;
        }
        const scopeAuthorised = this.state.fermentation - timeWithoutStretchAndFold;
        // console.log("scopeAuthorised", scopeAuthorised);
        const timeSlice = scopeAuthorised/parseInt(nbSaF);

        const safMinuts = [];
        for (let a = 0; a < nbSaF; a++) {
            let gapsaf = timeSlice+(a*(timeSlice));
            gapsaf = decimalToSeconds(gapsaf);
            const addLeavinStep = new Date(addLeavin);
            addLeavinStep.setSeconds( addLeavinStep.getSeconds() + gapsaf);
            /*
            const datesaf = new Date(this.state.addLeavin);
            datesaf.setSeconds( datesaf.getSeconds() + gapsaf);
            */
            safMinuts.push(addLeavinStep);
        }
        return safMinuts;
    }

    launchWW = (start) => {
        this.setState({now: start, currentCountDown: true}, () => {
            /*
            this.setUpWaitingYeast(this.state.zenith);
            this.setNumberOfStretchAndFold(this.state.listSaF.length);
            this.setUpAutolyse();
            */

            const { zenith, autolyse, listSaF, fermentation, proofingMinuts } = this.state;
            const step0 = new Date(start);
            const step2 = new Date(step0.setMinutes(step0.getMinutes() + zenith));
            const tmpStep2 = new Date(step2);
            const tmpStep2bis = new Date(step2);
            const tmpStep2bisbis = new Date(step2);
            const step1 = new Date(tmpStep2.setMinutes(tmpStep2.getMinutes() - autolyse));
            const step3 = new Date(tmpStep2bisbis.setMinutes(tmpStep2bisbis.getMinutes() + fermentation));
            const tmpStep3 = new Date(step3);
            const step4 = new Date(tmpStep3.setMinutes(tmpStep3.getMinutes() + preSetTiming));
            const tmpStep4 = new Date(step4);
            const step5 = new Date(tmpStep4.setMinutes(tmpStep4.getMinutes() + proofingMinuts));

            const listSaf = this.setTimeOfSaF(listSaF.length, tmpStep2bis);

            const milestones = [start, step1, step2, step3, step4, step5];
            navigator.serviceWorker.controller.postMessage({
                type: "LAUNCH",
                milestones: milestones,
                saf: listSaf
            });

            this.startTime();
        });
    }

    setServiceWorker = () => {
        if ('serviceWorker' in navigator) {
            Notification.requestPermission(permission => {
                if(!('permission' in Notification)) {
                    Notification.permission = permission;
                }
                return permission;
            })
            .then(() => navigator.serviceWorker.register('/sw.js'))
            .catch(console.error);
            /* Listen to service Worker */
            navigator.serviceWorker.onmessage = (event) => {
                if (event.data) {
                  if(event.data.status === "RUNNING"){
                    this.changeHourWithDate(event.data.startMoment);
                    this.setState({ currentCountDown: true }, () => {
                        this.startTime();
                    });
                  }
                  if(event.data.status === "ENDING"){
                    this.setState({ currentCountDown: false, toolate: true });
                  }
                }
              };
        } else {
            console.warn('browser don\'t use services workers');
        }
    }

    cancelCountdown = () => {
        this.setState({currentCountDown: false});
        navigator.serviceWorker.controller.postMessage({
            type: "CANCEL"
        });
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
                            Countdown start
                        </label>
                        <input type="time" value={`${hourNow}:${minutesNow}`} aria-labelledby="moment" onChange={(e) => this.changeHour(e)} id="moment" className={timerStyles.moment} />when you feed your leaven.
                    </div>
                    <div className={timerStyles.main}>
                        <div className={timerStyles.range}>
                            <div className="left">
                                <label htmlFor="autolyse">
                                    autolysis timer
                                    <Ext title="autolyse or not autolyse" link="https://www.youtube.com/watch?v=XIaAQRJW9n8" />
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
                                    Yeast top is reached after...
                                    <Ext title="How to prove your yeast" link="https://www.youtube.com/watch?v=Z9HIWK08J3E" />
                                </label>
                                <input disabled={currentCountDown} value={zenith} type="range" aria-labelledby="sourdough" onChange={(e) => this.rangeYeast(e)} id="sourdough" min="30" max="600" step="5" />
                                <span><u>{convertMinutsToHuman(zenith)}</u></span>
                            </div>
                            <div className={timerStyles.right}>
                                <b>{extractMinutsFromDate(addLeavin)}</b>
                            </div>
                        </div>
                        <div className={timerStyles.range}>
                            <div className="left">
                                <label htmlFor="fermentation">
                                    Bulk Fermentation duration... 
                                    <Ext title="When is Dough Fully Fermented" link="https://www.youtube.com/watch?v=5nrASfyphpU" />
                                    <Note content={<Bulkproofing />} />
                                </label>
                                <input disabled={currentCountDown} value={fermentation} type="range" aria-labelledby="fermentation" onChange={(e) => this.changeFermentationDuration(e)} id="fermentation" min="120" max="1200" step="5" />
                                <span><u>{humanFermentation}</u> <span>-></span> Start pre-shaping at </span><br />
                                <label className={timerStyles.noPadding} htmlFor="fermentation">
                                    <span role="presentation" onClick={() => this.displayModalHowLong()} className={timerStyles.modalHowLong}>
                                        Add some Stretch &amp; Fold steps
                                        <Ext title="Stretch &amp; Fold" link="https://www.youtube.com/watch?v=Lz9CO1PJ0sM" />
                                    </span> 
                                    {safNumber > 0 && <span className={timerStyles.saf}><b>{safNumber}</b> stretch &amp; fold</span>}
                                </label>
                            </div>
                            <div className={timerStyles.right}>
                                <b>{extractMinutsFromDate(afterFermentation)}</b><br />
                            </div>
                        </div>
                        <div className={`${timerStyles.range} ${timerStyles.alignCenter}`}>
                            <div>
                                <span>+ 30 minutes rests <span>-></span> shape at...</span><Ext title="shaping &amp; PreShaping" link="https://www.youtube.com/watch?v=8uz97MZZmRg" />
                            </div>
                            <div className={timerStyles.right}>
                                <b className={timerStyles.noMargin}>{extractMinutsFromDate(timeAfterFermentation)}</b>
                            </div>
                        </div>
                        <div className={timerStyles.range}>
                            <div className="left">  
                                <label htmlFor="proofing">
                                    Proofing 
                                    <Ext title="When is Dough Fully Fermented" link="https://www.youtube.com/watch?v=6oAfl1u0fIw" />
                                    <Note content={<Proofing />}/>
                                </label>
                                <input disabled={currentCountDown} value={proofingMinuts} type="range" aria-labelledby="proofing" onChange={(e) => this.changeProofing(e)} id="proofing" min="120" max="1200" step="5" />
                                <span><u>{convertMinutsToHuman(proofingMinuts)}</u> <span>-></span> Start bake at...</span>
                            </div>
                            <div className={timerStyles.right}>
                            <b>{extractMinutsFromDate(startProofingHour)}</b>
                            </div>
                        </div>
                        {currentCountDown === false && 
                            <div className={timerStyles.starter}>
                                <div className={timerStyles.launcher}>
                                    <div className={timerStyles.basicTxt}>Launch the timer from </div>
                                    <div className={timerStyles.wrapperPlay}>
                                        <span>now <span>({potentialStart})</span></span>
                                        <div role="presentation" aria-labelledby="launch" id="launch" onFocus={() => this.launchWW(new Date())} onClick={() => this.launchWW(new Date())} className={timerStyles.buttonStart} />
                                    </div>
                                    {toolate === false && <Fragment>
                                        <div className={timerStyles.basicTxt}> or </div>
                                        <div className={timerStyles.wrapperPlay}> 
                                            <span><a href="#defineSchedule">{`${hourNow}:${minutesNow}`}</a></span>
                                            <div role="presentation" aria-labelledby="launch" id="launch" onFocus={() => this.launchWW(now)} onClick={() => this.launchWW(now)} className={timerStyles.buttonStart} />
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

                    <div onMouseOver={() => this.showHour(5)} onFocus={() => this.showHour(5)} className={`${timerStyles.stripe} ${timerStyles.stripe1}`} title="proofing" style={{"width": "100%"}}>Proofing</div>
                    <div onMouseOver={() => this.showHour(4)} onFocus={() => this.showHour(4)} className={`${timerStyles.stripe} ${timerStyles.stripe2}`} title="dough rest" style={{"width": `${shapingPercent}%`}}>Dough rest</div>
                    <div onMouseOver={() => this.showHour(3)} onFocus={() => this.showHour(3)} className={`${timerStyles.stripe} ${timerStyles.stripe3}`} title="bulk fermentatio" style={{"width": `${preshapingPercent}%`}}>Bulk fermentation</div>
                    <div onMouseOver={() => this.showHour(2)} onFocus={() => this.showHour(2)} className={`${timerStyles.stripe} ${timerStyles.stripe4}`} title="autolyse" style={{"width": `${AddLeavinPercent}%`}}>Autolyse</div>
                    <div onMouseOver={() => this.showHour(1)} onFocus={() => this.showHour(1)} className={`${timerStyles.stripe} ${timerStyles.stripe5}`} title="leavin" style={{"width": `${createDoughPercent}%`}}>Leavin</div>

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