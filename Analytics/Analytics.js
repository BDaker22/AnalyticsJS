// analytics.js

(function(global) {
    var Analytics = function(apiUrl) {
        this.apiUrl = apiUrl;
        this.init();
    };

    Analytics.prototype.init = function() {
        this.trackPageView();
        this.trackClicks();
        this.trackErrors();
        this.trackSessionDuration();
    };

    Analytics.prototype.sendEvent = function(eventType, data) {
        fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ eventType: eventType, data: data })
        }).catch(function(error) {
            console.error('Error sending event:', error);
        });
    };

    Analytics.prototype.trackPageView = function() {
        var data = {
            url: window.location.href,
            title: document.title
        };
        this.sendEvent('pageView', data);
    };

    Analytics.prototype.trackClicks = function() {
        document.addEventListener('click', function(event) {
            var data = {
                element: event.target.tagName,
                id: event.target.id,
                className: event.target.className
            };
            this.sendEvent('click', data);
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
            this.sendEvent('error', data);
        }.bind(this));
    };

    Analytics.prototype.trackSessionDuration = function() {
        var startTime = Date.now();
        window.addEventListener('beforeunload', function() {
            var sessionDuration = Date.now() - startTime;
            var data = { duration: sessionDuration };
            this.sendEvent('sessionDuration', data);
        }.bind(this));
    };

    global.Analytics = Analytics;
})(window);
