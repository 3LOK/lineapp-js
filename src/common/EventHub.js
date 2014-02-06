var lineapp = lineapp || {};

lineapp.EventHub = lineapp.EventHub || function() { return (function() {
	var self = {};
	var listenersMap = {};
	
	self.addEventListener = function(name, callback) {
		var listeners = listenersMap[name];
		if (typeof(listeners) === "undefined") {
			listeners = [];
			listenersMap[name] = listeners;
		}
		
		listeners.push(callback);
	};
	
	self.removeEventListener = function(name, callback) {
		var listeners = listenersMap[name];
		if (typeof(listeners) !== "undefined") {
			var idx = listeners.indexOf(callback);
			if (idx !== -1) {
				listeners.splice(idx, 1);
			}
			if (listeners.length == 0) {
				delete listenersMap[name];
			}
		}
	};

    self.removeAllListeners = function()
    {
        listenersMap = {};
    };

    self.addGeneralEventListener = function(callback)
    {
        self.addEventListener("__all__", callback);
    };

    self.removeGeneralEventListener = function(callback)
    {
        self.removeEventListener("__all__", callback);
    };
	
	self.fireEvent = function(name, event) {
		var listeners = listenersMap[name];
		if (typeof(listeners) !== "undefined") {
			for (var i = 0, l = listeners.length; i < l; ++i) {
				listeners[i](event);
			}
		}

        var listeners = listenersMap["__all__"];
        if (typeof(listeners) !== "undefined") {
            for (var i = 0, l = listeners.length; i < l; ++i) {
                listeners[i](name, event);
            }
        }
	};
	
	self.getNumListeners = function() {
		var numListeners = 0;
		for (var name in listenersMap) {
			numListeners += listenersMap[name].length;
		}
		return numListeners;
	};

	return self;
}())};
