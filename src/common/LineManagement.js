var lineapp = lineapp || {};

lineapp.LineManagement = lineapp.LineManagement || function(params) { return (function(params) {
    var self = new lineapp.EventHub();

    var DEFAULT_PRICE = 500;

    var lines = {};
    var vipPrice = null;
    var israeliMode = false;

    self.init = function(params) {
        var events = params.events;
        
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

    self.handleEvents = function(events) {

        _.each(events, handleEvent);

        self.fireEvent("changed", {events:events});

    };

    function handleEvent(event) {
        switch (event.type) {
            case "join":onJoinEvent(event); break;
            default:console.warn("Unkown event type", event);
        }
    }

    function onJoinEvent(event) {

        // TODO: Check if user is already in line?
        
        lines.NORMAL.push({id:event.clientId, ask:DEFAULT_PRICE});
    }

    self.getLines = function() {
        return lines;
    };

	return self;
}(params))};
