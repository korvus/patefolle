import React, {Component} from "react";
import { Text, FuncText } from '../containers/language';
import timerStyles from "../styles/timeline.module.css";
import { ExtractMinutsAndSecondsFromDate, steps, stretchAndFoldDatas, roundMinutes, extractMinutsFromDate } from "../functions/tools.js";
import alarm from "../sounds/alarm.mp3"
let audio = new Audio(alarm);

let officialStep = 0;
let snap = 0;


class Timeline extends Component {
    constructor(props) {
        const startTimeStamp = props.now;
        const endTimeStamp = props.end;
        super(props);
        this.state = {
            start: startTimeStamp.getTime(),
            end: endTimeStamp,
            hoveredStripe: 0,
            shapingPercent: 0,
            preshapingPercent: 0,
            AddLeavinPercent: 0,
            createDoughPercent: 0,
            firstHourPercent: 0,
            firstMinutPercent: 0,
            FirstHour: 0, 
            FirstMinute: 0,
            countDownPercent: 0,
            schedule: []
        };
    }

    componentDidMount = () => {
        this.setup();
    }

    getPercentForTimeline = ( totalScopeTimelineMinuts, startTimeStamp, objDate ) => {
        const timeStamp = objDate.getTime();
        const scopeMinuts = ((timeStamp - startTimeStamp) / 1000) / 60;
        const percent = (scopeMinuts*100)/totalScopeTimelineMinuts;
        return percent;
    }

    roundSeconds = (dateObj) => {
        const neoDate = new Date(dateObj.getTime());
        neoDate.setMinutes(neoDate.getMinutes() + Math.round(neoDate.getSeconds()/60));
        neoDate.setSeconds(0, 0);
        return neoDate;
    }

    getPercentForTimelineInSeconds = ( totalScopeTimelineSeconds, startTimeStamp, objDate ) => {
        const timeStamp = objDate.getTime();
        const scopeSeconds = ((timeStamp - startTimeStamp) / 1000);
        const percent = (scopeSeconds*100)/totalScopeTimelineSeconds;
        return percent;
    }

    totalScope = () => {
        const { now, end } = this.props;
        const start = now.getTime();
        const totalScopeTimelineMinuts = ((end - start) / 1000) / 60;
        const totalScopeTimeSeconds = ((end - start) / 1000);
        return { totalScopeTimelineMinuts, totalScopeTimeSeconds };
    }

    defineCountDown = () => {
        const now = this.props.now ?? new Date();
        const start = new Date(now).getTime();

        const { totalScopeTimeSeconds } = this.totalScope();
        let countDownPercent = this.getPercentForTimelineInSeconds( totalScopeTimeSeconds, start, new Date());
        countDownPercent = countDownPercent > 100 ? 100 : countDownPercent;
        this.setState({ countDownPercent });
    }

    findClosestStep = (arrayOfSteps) => {
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

            if(now > new Date(arrayOfSteps[arrayOfSteps.length - 1])){
                snap = arrayOfSteps.length - 1;
            }
            i++;
        });

        return snap;
    }

    displayPush = (step, arrayOfSteps) => {
        const stepsSentences = steps();
        if(officialStep === arrayOfSteps.length - 1){
            // Doit faire la dernière notif;
            this.notifyMe(stepsSentences[step]);
            officialStep = 0;
            snap = 0;
            this.fullFillSchedule();
        } else {
            this.notifyMe(stepsSentences[step]);
            return;
        }
        officialStep++;
    }

    
    notifyMe = (words) => {
        if (!("Notification" in window)) {
          console.warn("this browser or device don't support notifications");
        } else if (Notification.permission === "granted") {
            // Si c'est ok, créons une notification
            audio.currentTime = 0;
            audio.play();
            new Notification(words[0], {
                body:words[1],
                icon:words[2]
            });
        } else if (Notification.permission !== 'denied') {

          Notification.requestPermission(function (permission) {
            if(!('permission' in Notification)) {
              Notification.permission = permission;
            }

            if (permission === "granted") {
                audio.play();
                new Notification(words, {icon: "./notifs/watch.svg", body: "./notifs/watch.svg"});
            }
          });
        }
    }

    countDownLoop = () => {
        const { schedule } = this.state;
        this.defineCountDown();

        // as long we don't get the schedule, we loop on it.
        if(schedule.length === 0){
            this.fullFillSchedule();
        } else {
            const currentStep = this.findClosestStep(schedule);
            // Stay lock to 0 - 0 after despite reinit
            // console.log("officialStep & currentStep", officialStep, currentStep);
            // console.log("------------");
            if(officialStep !== currentStep){
                // console.log("diff");
                officialStep = currentStep;
                this.displayPush(currentStep, schedule);
            }
        }

        setTimeout(() => {
            if(this.props.currentCountDown){
                this.countDownLoop()
            } else {
                officialStep = 0;
                snap = 0;
            }
        }, 1000);
    }

    fullFillSchedule = () => {
        if(localStorage.getItem("patefolle-cd") !== null){
            let countDownExisting = JSON.parse(localStorage.getItem("patefolle-cd"));
            if(countDownExisting.active){
                const stepsSentences = steps();
                if(countDownExisting.saf.length > 0){
                    const safSentences = stretchAndFoldDatas();
                    if(countDownExisting.milestones.length === 6){
                        countDownExisting.milestones.splice(3, 0, ...countDownExisting.saf);
                    }
                    if(stepsSentences.length === 6){
                        const alertSaF = Array.from({ length: countDownExisting.saf.length }).fill(safSentences).flat();
                        stepsSentences.splice(3, 0, ...alertSaF);
                    }
                }
                this.setState({schedule: countDownExisting.milestones});
            }
        }
    }

    definePercent = () => {
        const now = this.props.now ?? new Date();
        const start = new Date(now).getTime();
        const { dateRest, dateFermentation, dateZenith, dateAutolyse } = this.props.milestones;

        const { totalScopeTimelineMinuts } = this.totalScope();

        const shapingPercent     = this.getPercentForTimeline( totalScopeTimelineMinuts, start, dateRest );
        const preshapingPercent  = this.getPercentForTimeline( totalScopeTimelineMinuts, start, dateFermentation );
        const AddLeavinPercent   = this.getPercentForTimeline( totalScopeTimelineMinuts, start, dateZenith );
        const createDoughPercent = this.getPercentForTimeline( totalScopeTimelineMinuts, start, dateAutolyse );

        const closestHour = roundMinutes(now);
        const closestMinut = this.roundSeconds(now);

        // const closestHour = roundMinutes(now);
        if(closestHour.getTime() < start){
            closestHour.setHours(closestHour.getHours() + 1);
        }
        const FirstHour = closestHour.getHours();
        
        // const closestMinut = this.roundSeconds(now);
        if(closestMinut.getTime() < start){
            closestMinut.setMinutes(closestMinut.getMinutes() + 1);
        }
        const FirstMinute = closestMinut.getMinutes();

        this.setState({ FirstHour, FirstMinute, shapingPercent, preshapingPercent, AddLeavinPercent, createDoughPercent });
    }

    showHour = step => {
        this.setState({hoveredStripe: step})
    }

    componentDidUpdate(prevProps){
        if(JSON.stringify(prevProps.milestones) !== JSON.stringify(this.props.milestones)){
            this.setup();
        }
        if(prevProps.currentCountDown !== this.props.currentCountDown) {
            this.displaySplice();// The display of minuts in bottom
            this.fullFillSchedule();
            this.countDownLoop();
        }
    }

    setup = () => {
        const now = this.props.now ?? new Date();
        const start = now.getTime();

        const { totalScopeTimelineMinuts, totalScopeTimeSeconds } = this.totalScope();
        const closestMinut = this.roundSeconds(now);

        const firstHourPercent  = this.getPercentForTimeline( totalScopeTimelineMinuts, start, closestMinut );
        const firstMinutPercent  = this.getPercentForTimelineInSeconds( totalScopeTimeSeconds, start, closestMinut );
        this.setState({ firstHourPercent, firstMinutPercent }, () => {
            this.definePercent();
        });
    }

    displaySplice = () => {
        /* Hours */
        const now = this.props.now ?? new Date();
        const start = now.getTime();

        const { totalScopeTimelineMinuts, totalScopeTimeSeconds } = this.totalScope();
        const closestMinut = this.roundSeconds(now);

        const scopeNumberHours = Math.ceil((totalScopeTimelineMinuts+15)/60);
        const scopeNumberMinuts = Math.ceil(totalScopeTimeSeconds+1000)/60;

        const closestHour = roundMinutes(now);

        const items = [];

        if( totalScopeTimelineMinuts > 120 ){
            for (let a = 1; a < scopeNumberHours; a++) {
                closestHour.setHours(closestHour.getHours() + 1);
                const hour = closestHour.getHours();
                const percentHour = this.getPercentForTimeline( totalScopeTimelineMinuts, start, closestHour );
                items.push(<div style={{"left": `${Math.round(percentHour)}%`}} className={timerStyles.grid} key={a}>{hour}h</div>)
            }
        } else {
            for (let a = 1; a < scopeNumberMinuts; a++) {
                closestMinut.setMinutes(closestMinut.getMinutes() + 1);
                const minute = closestMinut.getMinutes();
                const percentMinut = this.getPercentForTimelineInSeconds( totalScopeTimeSeconds, start, closestMinut );
                items.push(<div style={{"left": `${Math.round(percentMinut)}%`}} className={timerStyles.grid} key={a}>{minute}</div>)
            }
        }

        return items;
    }

    defineSaF = () => {
        const { totalScopeTimelineMinuts } = this.totalScope();
        const { listSaF } = this.props.milestones;
        const start = new Date(this.props.now).getTime();
        
        const saf = [];
        // console.log("SAF timeline definition --- ");
        for (let b = 0; b < listSaF.length; b++) {
            const safMinut = listSaF[b];
            const safMoment = extractMinutsFromDate(safMinut);
            const percentSaF = this.getPercentForTimeline( totalScopeTimelineMinuts, start, safMinut );
            saf.push(<div style={{"left": `${percentSaF}%`}} title={safMoment} className={timerStyles.saf} key={b}></div>)
        }
        return saf;
    }

    render() {
        const {
            firstHourPercent,
            firstMinutPercent,
            shapingPercent, 
            preshapingPercent, 
            AddLeavinPercent, 
            createDoughPercent,
            hoveredStripe,
            FirstHour,
            FirstMinute,
            countDownPercent
        } = this.state;

        const { totalScopeTimelineMinuts } = this.totalScope();
        const { currentCountDown, hrHour, timeTotal } = this.props;
        const { hourNow, minutesNow } = hrHour;
        const { dateProofing, dateRest, dateFermentation, dateZenith, dateAutolyse } = this.props.milestones;

        return (
            <div className={`${timerStyles.board} ${this.props.visibility ? timerStyles.Scheduleinvisible : timerStyles.Schedulevisible}`}>
                <div className={`${timerStyles.timeline} ${timerStyles[`hover${hoveredStripe}`]}`}>
                    <div className={timerStyles.marker}>{`${hourNow}:${minutesNow}`}</div>
                    <div className={`${timerStyles.marker} ${timerStyles.marker1}`}>
                        <ExtractMinutsAndSecondsFromDate objDate={dateProofing} />
                    </div>
                    <div className={`${timerStyles.marker} ${timerStyles.marker2}`} style={{"left": `${createDoughPercent}%`}}>
                        <ExtractMinutsAndSecondsFromDate objDate={dateAutolyse} />
                    </div>
                    <div className={`${timerStyles.marker} ${timerStyles.marker3}`} style={{"left": `${AddLeavinPercent}%`}}>
                        <ExtractMinutsAndSecondsFromDate objDate={dateZenith} />
                    </div>
                    <div className={`${timerStyles.marker} ${timerStyles.marker4}`} style={{"left": `${preshapingPercent}%`}}>
                        <ExtractMinutsAndSecondsFromDate objDate={dateFermentation} />
                    </div>
                    <div className={`${timerStyles.marker} ${timerStyles.marker5}`} style={{"left": `${shapingPercent}%`}}>
                        <ExtractMinutsAndSecondsFromDate objDate={dateRest} /></div>
                    {this.defineSaF()}
  
                    {currentCountDown && <div className={`${timerStyles.countdown}`} style={{"left": `${countDownPercent}%`}}></div>}

                    <div 
                        title={FuncText("Proofing")} 
                        onMouseOver={() => this.showHour(5)} 
                        className={`${timerStyles.stripe} ${timerStyles.stripe1}`}
                        style={{"width": "100%"}}
                    >
                        <Text tid="Proofing" />
                    </div>
                    <div 
                        title={FuncText("doughRest")} 
                        onMouseOver={() => this.showHour(4)} 
                        className={`${timerStyles.stripe} ${timerStyles.stripe2}`} 
                        style={{"width": `${shapingPercent}%`}}
                    >
                        <Text tid="doughRest" />
                    </div>
                    <div 
                        title={FuncText("bulkFermentation")}
                        onMouseOver={() => this.showHour(3)}
                        className={`${timerStyles.stripe} ${timerStyles.stripe3}`}
                        style={{"width": `${preshapingPercent}%`}}
                    >
                        <Text tid="bulkFermentation" />
                    </div>
                    <div title={FuncText("autolyse")}
                        onMouseOver={() => this.showHour(2)}
                        className={`${timerStyles.stripe} ${timerStyles.stripe4}`}
                        style={{"width": `${AddLeavinPercent}%`}}
                    >
                        <Text tid="autolyse" />
                    </div>
                    <div title={FuncText("leavin")}
                        onMouseOver={() => this.showHour(1)}
                        className={`${timerStyles.stripe} ${timerStyles.stripe5}`}
                        style={{"width": `${createDoughPercent}%`}}
                    >
                        <Text tid="leavin" />
                    </div>

                    <span>{timeTotal}</span>
                
                </div>
                {totalScopeTimelineMinuts > 120 ?
                <div className={timerStyles.cycle}>
                    <div className={timerStyles.grid} style={{"left": `${firstHourPercent}%`}}>{FirstHour}h</div>
                    {this.displaySplice()}
                </div>
                    : 
                <div className={timerStyles.cycle}>
                    <div className={timerStyles.grid} style={{"left": `${firstMinutPercent}%`}}>{FirstMinute}</div>
                    {this.displaySplice()}
                </div>
                }
            </div>)
    }

}

export default Timeline;