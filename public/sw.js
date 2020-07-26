/* eslint-disable no-restricted-globals */
const version = 0;
let timeout;
let stop = false;
let officialStep = 0;

let steps = [
    "You probably just prepared the yeast.",
    "Time to prepare the first dough.",
    "Time to add your leavin to the dough",
    "Time to pre-shape",
    "Time to shape",
    "Bring it to the hoven!"
];

self.addEventListener('install', () => {
    return self.skipWaiting();
});

self.addEventListener('activate', () => {});



const displayPush = (i) => {
    // console.log("display a notif");
    const title = "Pâte Folle";
    const options = {
      body: steps[i],
      icon: './logo192.png',
      badge: './logo512.png'
    };

    self.registration.showNotification(title, options);
    self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window',
    }).then((clients) => {
        if (clients && clients.length) {
            clients[0].postMessage({
              status: "NOTIFSPUSHED"
            });
        }
    });
}

const findClosestStep = (arrayOfSteps) => {
    const now = new Date();
    let snap = 0;
    let closest = Infinity;

    Array.prototype.forEach.call(arrayOfSteps, (d, i) => {
        // const date = new Date(d);
        if (d >= now && d < closest) {
           closest = d;
           snap = i - 1;
        }
        // console.log("arrayOfSteps", arrayOfSteps, arrayOfSteps[arrayOfSteps.length - 1]);
        if(now > arrayOfSteps[arrayOfSteps.length - 1]){
            snap = arrayOfSteps.length - 1;
        }
        i++;
    });

    return snap;
}


const autoCountDown = (arrayOfSteps) => {

    const currentStep = findClosestStep(arrayOfSteps);
    const nbSteps = steps.length;

    self.clients.matchAll({
        includeUncontrolled: true,
        type: 'window',
    }).then((clients) => {
        if (clients && clients.length) {
            clients[0].postMessage({
              status: "RUNNING",
              startMoment: arrayOfSteps[0]
            });
        }
    });

    // console.log(officialStep, currentStep);
    if(officialStep !== currentStep){
        displayPush(currentStep);
        officialStep++;
        if(officialStep === arrayOfSteps.length - 1){
            self.clients.matchAll({
                includeUncontrolled: true,
                type: 'window',
            }).then((clients) => {
                clearTimeout(timeout);
                clients[0].postMessage({
                    status: "ENDING"
                });
            });
            stop = true;
        }
    }

    // When countdown launched too late
    if(currentStep === -1 && officialStep === -1){
        stop = true;
        clearTimeout(timeout);
    }

    if(officialStep <= nbSteps && !stop){
        timeout = setTimeout(() => {
            autoCountDown(arrayOfSteps);
        }, 1000);
    } else {
        officialStep = 1;
        clearTimeout(timeout);
        self.clients.matchAll({
            includeUncontrolled: true,
            type: 'window',
        }).then((clients) => {
            if (clients && clients.length) {
              // Send a response - the clients
              // array is ordered by last focused
                clients[0].postMessage({
                    status: "ENDING"
                });
            }
        });
    }

}

self.addEventListener('message', (event) => {
    steps = [
        "You probably just prepared the yeast.",
        "Time to prepare the first dough.",
        "Time to add your leavin to the dough",
        "Time to pre-shape",
        "Time to shape",
        "Bring it to the hoven!"
    ];
    stop = false;

    if (event.data) {
        // Get array

        if(event.data.type==="LAUNCH"){
            console.log("event.data.milestones", event.data.milestones);
            officialStep = findClosestStep(event.data.milestones);
            if(event.data.saf.length > 0){
                event.data.milestones.splice(3, 0, ...event.data.saf);
                const alertsSaF = Array.from({ length: event.data.saf.length }).fill(["Stretch and Fold!"]).flat()
                steps.splice(3, 0, ...alertsSaF);
            }
            /* Cancel previous countdonw if exists. */
            clearTimeout(timeout);
            autoCountDown(event.data.milestones);
        } else {
            console.info("you canceled the countdown");
            officialStep = 1;
            clearTimeout(timeout);
        }
        // self.registration.showNotification(title, options);
        // return self.registration.showNotification("notif", notificationOptions);
    }
});