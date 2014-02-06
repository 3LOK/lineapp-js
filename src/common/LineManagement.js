var lineapp = lineapp || {};

lineapp.LineManagement = lineapp.LineManagement || function(params) { return (function(params) {
    var self = new lineapp.EventHub();

    var DEFAULT_PRICE = 500;

    var lines = {};
    var vipPrice = null;
    var israeliMode = false;
    var lineId = null;
    var lastTimestamp = null;

    self.init = function(params) {
        var events = params.events;
        lineId = params.lineId;
        
        var first = events.shift();

        if (first.type !== "create") {
            alert("First event is not create!");
            return;
        }

        vipPrice = first.vipPrice;
        israeliMode = first.israeliMode;

        lines = {
            NORMAL:[],
            VIP:[]
        };

        _.each(events, handleEvent);
    };

    self.performEvents = function(events) {
        addRequest({events:events});
    };

    self.getLines = function() {
        return lines;
    };

    var shouldUpdate = false;

    self.startMonitoring = function() {

        if (shouldUpdate) return;

        shouldUpdate = true;
        update();
    };

    self.stopMonitoring = function() {
        shouldUpdate = false;
    }

    function handleEvents(events) {

        _.each(events, handleEvent);

        self.fireEvent("changed", {events:events});
    };

    function handleEvent(event) {
        lastTimestamp = event.timestamp;

        switch (event.type) {
            case "join":onJoinEvent(event); break;
            case "leave":onLeaveEvent(event); break;
            case "set_price":onSetPriceEvent(event); break;
            default:console.warn("Unkown event type", event);
        }
    }

    function onJoinEvent(event) {

        // TODO: Check if user is already in line?
        
        lines.NORMAL.push({id:event.clientId.id, ask:DEFAULT_PRICE, joinTimestamp:event.timestamp});
    }

    function onLeaveEvent(event) {
        lines.NORMAL = _.reject(lines.NORMAL, function(p) {
            return (p.id === event.clientId.id);
        });
        lines.VIP = _.reject(lines.VIP, function(p) {
            return (p.id === event.clientId.id);
        });
    }

    function onSetPriceEvent(event) {
        _.each(lines.NORMAL, function(p) {
            if (p.id === event.clientId.id) {
                p.ask = event.price.amount;
            }
        });

        _.each(lines.VIP, function(p) {
            if (p.id === event.clientId.id) {
                p.ask = event.price.amount;
            }
        });
    }

    function update() {
        if (!shouldUpdate) return;

        addRequest({}, function() {
            setTimeout(update, 5000);
        });
    }


    var requests = [];
    var inRequestHandling = false;
    function addRequest(request, callback) {

        requests.push({request:request, callback:callback});

        if (!inRequestHandling) {
            nextRequest();
        }
    }

    function nextRequest() {

        if (requests.length === 0) {
            inRequestHandling = false;
            return;
        }

        inRequestHandling = true;

        var topRequest = requests.shift();

        var request = {
            type:"update",
            lineId:lineId,
            after:lastTimestamp,
            accessToken:lineapp.Facebook.getAccessToken()
        };

        request = _.extend(request, topRequest.request);

        lineapp.LineAppService.request({
            request:request,
            callback:function(response) {

                try {
                    if (response.error) {
                        alert(response.error.message);
                    } else {
                        handleEvents(response.value.events || []);
                    }
                } catch(e) {}

                if (topRequest.callback) topRequest.callback();

                nextRequest();
            }
        });
    }

	return self;
}(params))};
