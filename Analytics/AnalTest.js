// analytics.js

(function(global) {
    var Analytics = function() {
        this.init();
    };

    Analytics.prototype.init = function() {
        //this.clearStoredEvent();
        //this.getCurrentUserName();
        this.trackPageLoadTime();
        this.trackPageView();
        this.trackBrowser();
        this.getReferrer();
        //this.trackClicks();
        //this.trackErrors();
        this.trackSessionDuration();
    };

    Analytics.prototype.storeEvent = function(eventType, data) {
        // Store event data in localStorage
        var events = JSON.parse(localStorage.getItem('analyticsData')) || [];
        events.push({ eventType: eventType, data: data });
        localStorage.setItem('analyticsData', JSON.stringify(events));
    };

    Analytics.prototype.clearStoredEvent = function(eventType, data) {
        // Clear stored event data in localStorage
        localStorage.clear('analyticsData');
    };

    Analytics.prototype.trackPageView = function() {
        var data = {
            url: window.location.href,
            title: document.title
        };
        this.storeEvent('pageView', data);
    };

    Analytics.prototype.trackClicks = function() {
        document.addEventListener('click', function(event) {
            var data = {
                element: event.target.tagName,
                id: event.target.id,
                className: event.target.className
            };
            this.storeEvent('click', data);
        }.bind(this));
    };

    Analytics.prototype.trackErrors = function() {
        window.addEventListener('error', function(event) {
            var data = {
                message: event.message,
                source: event.filename,
                line: event.lineno,
                column: event.colno
            };
            this.storeEvent('error', data);
        }.bind(this));
    };

    // Analytics.prototype.trackSessionDuration = function() {
    //     var startTime = Date.now();
    //     window.addEventListener('beforeunload', function() {
    //         var sessionDuration = Date.now() - startTime;
    //         var data = { duration: sessionDuration };
    //         this.storeEvent('sessionDuration', data);

    //         //Test -- Send data to the server
    //         localStorage.getItem('analyticsData');
            
    //     }.bind(this));
    // };

    // Analytics.prototype.getCurrentUserName = function() {
    //     // Example: Fetch user info from a global variable or API
    //     return window.currentUserName || "Anonymous";
    // };

    Analytics.prototype.getReferrer = function() {
        var newReferrer = document.referrer || "No Referrer";

        var data = { 'referrer': newReferrer };
        this.storeEvent('docReferrer', data);
    };
   

    Analytics.prototype.trackSessionDuration = function() {
        var startTime = Date.now();
        var sessionStartKey = 'sessionStartTime';
        
        // The session start time is stored in localStorage to handle cases 
        // where the page is unexpectedly closed or the browser crashes.
        localStorage.setItem(sessionStartKey, startTime);
    
        // The session duration is updated and sent to the server every
        // 60 seconds, ensuring periodic updates.
        var intervalId = setInterval(function() {
            var currentTime = Date.now();
            var sessionDuration = Math.floor((currentTime - startTime) / 1000); // Convert to seconds
            var data = { duration: sessionDuration };
            //var data = { user: userName, duration: sessionDuration };
            this.storeEvent('sessionDurationUpdate', data);
        }.bind(this), 60000); // Every 60 seconds
    
        // The interval is paused when the page becomes hidden 
        // (ex. the user switches tabs) and resumed when it becomes visible again.
        document.addEventListener('visibilitychange', function() {
            if (document.hidden) {
                clearInterval(intervalId);
            } else {
                intervalId = setInterval(function() {
                    var currentTime = Date.now();
                    var sessionDuration = Math.floor((currentTime - startTime) / 1000); // Convert to seconds
                    var data = { duration: sessionDuration };
                    //var data = { user: userName, duration: sessionDuration };
                    this.storeEvent('sessionDurationUpdate', data);
                }.bind(this), 60000);
            }
        }.bind(this));
    
        // The final session duration is sent when the user is about to 
        // leave the page, and the session start time is removed from local storage
        window.addEventListener('beforeunload', function() {
            var sessionDuration = Math.floor((Date.now() - startTime) / 1000); // Convert to seconds
            var data = { duration: sessionDuration };
            //var data = { user: userName, duration: sessionDuration };
            this.storeEvent('sessionDuration', data);
    
            // Remove the session start time from local storage
            localStorage.removeItem(sessionStartKey);
        }.bind(this));
    };
    
    // Analytics.prototype.storeEvent = function(eventName, data) {
    //     // Example implementation of sending data to the server
    //     var xhr = new XMLHttpRequest();
    //     xhr.open("POST", "/trackEvent", true);
    //     xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    //     xhr.send(JSON.stringify({
    //         event: eventName,
    //         data: data
    //     }));
    // };
    
    
    Analytics.prototype.trackBrowser = function() {
        const userAgent = navigator.userAgent;
        let browserName;
    
        if (userAgent.match(/chrome|chromium|crios/i)) {
            browserName = "Chrome";
        } else if (userAgent.match(/firefox|fxios/i)) {
            browserName = "Firefox";
        } else if (userAgent.match(/safari/i)) {
            browserName = "Safari";
        } else if (userAgent.match(/opr\//i)) {
            browserName = "Opera";
        } else if (userAgent.match(/edg/i)) {
            browserName = "Edge";
        } else if (userAgent.match(/trident/i)) {
            browserName = "Internet Explorer";
        } else {
            browserName = "Other";
        }

        var data = {browser: browserName};
        this.storeEvent('browser', data);
    }

    Analytics.prototype.trackPageLoadTime = function() {
        window.addEventListener('load', function() {
            // Use the PerformanceNavigationTiming interface
            var [navigation] = performance.getEntriesByType("navigation");
            
            if (navigation) {
                // Calculate page load time in seconds
                var pageLoadTime = (navigation.loadEventEnd - navigation.startTime) / 1000;
    
                // Create data object
                var data = {
                    loadTime: pageLoadTime
                    //user: this.getCurrentUserName() // Assuming getCurrentUserName method exists
                };
    
                this.storeEvent('pageLoadTime', data);
            }
        }.bind(this));
    };

    function sendDataToServer() {
        // Retrieve data from local storage
        var localStorageData = localStorage.getItem('analyticsData');
        
        // Ensure there's data to send
        if (localStorageData) {
            // Send data to the server via AJAX
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "YourPage.aspx/SaveData", true); // Adjust URL as needed
            xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    
            // Prepare the data to send
            var data = {
                localStorageData: localStorageData
            };
    
            xhr.send(JSON.stringify(data));
    
            // Handle the response
            xhr.onload = function() {
                if (xhr.status === 200) {
                    console.log("Data sent successfully.");
                } else {
                    console.error("Error sending data.");
                }
            };
        } else {
            console.log("No data in local storage to send.");
        }
    }
    
    // Call this function when you need to send the data, for example, on a button click or page unload
    //sendDataToServer();

    // in vb.net:
//     Imports System.Web.Services
// Imports System.Web.Script.Services
// Partial Class YourPage
//     Inherits System.Web.UI.Page

//     <WebMethod()>
//     <ScriptMethod(ResponseFormat:=ResponseFormat.Json)>
//     Public Shared Function SaveData(ByVal localStorageData As String) As String
//         ' Process the data (e.g., save to database)
//         ' For demonstration, we'll just log it to the server console
//         System.Diagnostics.Debug.WriteLine("Received data: " & localStorageData)

//         ' Return a response
//         Return "Data received successfully."
//     End Function
// End Class


    

    global.Analytics = Analytics;
})(window);
