var DEFAULT_INTERVAL = 1000; //interval time in ms
var DEFAULT_TIMEOUT_VALUE = 7000; //idle timeout in ms
var DEFAULT_NOTIFICATION_VALUE = 3000; //time in ms when notification is displayed


//help variables
var settings = {}

var intervalID;
var notificationID;


init();

function init() {
    settings.interval = DEFAULT_INTERVAL;
    settings.timeout = DEFAULT_TIMEOUT_VALUE;
    settings.notificationTimeout = DEFAULT_NOTIFICATION_VALUE;
    chrome.browserAction.setBadgeText({"text":'X'});
}

//------------------------------------------------
//
//          TIMER - START & CLEAR
//
//------------------------------------------------
chrome.windows.onCreated.addListener(function (window) {
    if (window.incognito && !intervalID) {
        intervalID = setInterval(tick, settings.interval);
    }

})

chrome.windows.onRemoved.addListener(function (window) {
        chrome.windows.getAll(function (windows) {
            var anyIncognito;
            windows.forEach(function (win) {
                anyIncognito |= win.incognito;
            })
            if (!anyIncognito) {
                clearInterval(intervalID);
                intervalID = undefined;
            }
        });
    }
)
//------------------------------------------------
//
//          CLOSE ALL WINDOWS
//
//------------------------------------------------
function closeAllIncognito() {

    chrome.windows.getAll(function (windows) {
        windows.forEach(function (win) {
            if (win.incognito) {
                chrome.windows.remove(win.id);
                //console.log('close NOT')
            }
        })
    });

}

//------------------------------------------------
//
//          TIMER - RESET
//
//------------------------------------------------

function reset() {
    console.log('reset time');
    timer.reset();
    chrome.browserAction.setBadgeText({"text":(DEFAULT_TIMEOUT_VALUE / 1000 << 0).toString()});
}

chrome.tabs.onUpdated.addListener(function (tabId, info, tab) {
    if (tab.incognito) {
        reset();
    }
});


chrome.windows.onFocusChanged.addListener(function (winID) {

    chrome.windows.getLastFocused(function (window) {
        if (window.incognito) {
            reset();
        }
    })

});

chrome.runtime.onConnect.addListener(function (port) {
    var tab = port.sender.tab;
    if (tab.incognito) {
        reset();
        // This will get called by the content script we execute in
        // the tab as a result of the user pressing the browser action.
        port.onMessage.addListener(function (info) {
            console.log("woooooow.... reset()");
        });
    }
})
chrome.browserAction.onClicked.addListener(function () {
    reset();
})

//------------------------------------------------
//
//          TIMER - TICKER
//
//------------------------------------------------


function tick() {
    console.log('tick!');
    timer.tick();

    //calculate time left
    var countdown = (settings.timeout - timer.elapsed);
    var countdownPrettyPrint = countdown / 1000 << 0;

    //we are at the end, close everything
    if (timer.elapsed > settings.timeout) {
        //clearNotification();
        //closeAllIncognito();
        return;
    }


    var timestamp = timer.last + countdown + 1000;
    if (countdown < settings.notificationTimeout) {
        var options = {
            type:"list",
            title:"Autoclose all incognito windows",
            message:"Primary message to display",
            iconUrl:"cross-24.png",
            eventTime:0,
            items:[
                {title:"hello", message:"world"}
            ],
            buttons:[
                { title:"Reset now"}
            ]

        }
        if (notificationID) {
            options.message = "autoclose in: " + countdownPrettyPrint + "s"
            chrome.notifications.update(notificationID, options, function () {
            })
        } else {
            chrome.notifications.create('', options, function (id) {
                notificationID = id;
                console.log('notificationId: ' + id)

            });

        }
    }

    countdownPrettyPrint = Math.max(0, countdownPrettyPrint);
    chrome.browserAction.setBadgeText({"text":countdownPrettyPrint.toString()});
}

chrome.notifications.onButtonClicked.addListener(function (nid, bid) {
        console.log('nid:' + nid + ", bid: " + bid)
        console.log(nid);
        console.log(bid)
        if (nid == notificationID && bid == 0) {
            reset();
        }

    }
)
chrome.notifications.onClosed.addListener(function (n) {
    console.log(n)
    notificationID = undefined
})

function clearNotification() {
    if (notificationID) {
        chrome.notifications.clear(notificationID, function () {/*do nothing*/
        })
    }
}


