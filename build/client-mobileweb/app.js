var http=http||{};
http.Factory=http.Factory||function(){return{create:function(a){var a=a||{},d=a.timeout||6E4,e=a.onload||function(){},f=a.onerror||function(){},g=a.onprogress||function(){},a=a.ontimeout||function(){};if("undefined"!==typeof XDomainRequest){var b=new XDomainRequest;b.timeout=d;b.onload=function(){b.fix=!0;e()};b.onerror=f;b.onprogress=g;b.ontimeout=a;b.setRequestHeader=function(){};b.setUserAgent=function(){};return b}if("undefined"!==typeof XMLHttpRequest){var c=new XMLHttpRequest;c.timeout=d;c.onload=
e;c.onerror=f;c.onprogress=g;c.ontimeout=a;c.setUserAgent=function(){};return c}if("undefined"!==typeof Ti){var h=Ti.Network.createHTTPClient({timeout:d,onload:e,onerror:f,onprogress:g,ontimeout:a});h.setUserAgent=function(a){h.setRequestHeader("User-Agent",a)};return h}throw Error("Could not find an HttpClient implementation.");}}}();http.create=http.create||http.Factory.create;
var lineapp = lineapp || {};

lineapp.Client = lineapp.Client || function(params) { return (function(params) {
	params = params || {};
	var apiUrl = params.apiUrl || "https://lineapp-prod.appspot.com/v1.0";
	
	var self = {};
	
	var protocol = new lineapp.Protocol();
	
	self.request = function(params) {
		params = params || {};
		var request = params.request || null;
		var callback = params.callback || function(response){};
		
		protocol.post({
			url : apiUrl,
			obj : request,
			callback : callback
		});
	};
	
	return self;
}(params))};
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
var lineapp = lineapp || {};

lineapp.LineAppService = lineapp.LineAppService || (function() {
	var self = new lineapp.EventHub();

	var client = null;
	var searchCache = null;

    var requests = {};
	
	self.request = function(params) {
		params = params || {};
		var request = params.request || {};
        var promise = params.promise || new utils.Promise();
        if (params.callback) {
            var callback = params.callback;
            promise.done(function(/* args... */) {
                callback.apply(this, arguments);
            });
        };

		client.request({
			request : request,
			callback : function(response) {
                promise.resolve(response);
			}
		});
	};
	
	self.init = function(params) {
		params = params || {};
		client = params.client || null;
	};
	
	return self;
}());
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
            case "swap":onSwapEvent(event); break;
            default:console.warn("Unkown event type", event);
        }
    }

    function onJoinEvent(event) {

        // TODO: Check if user is already in line?
        
        lines.NORMAL.push({id:event.clientId.id, clientId:event.clientId, ask:null, joinTimestamp:event.timestamp});
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
                p.ask = event.price;
            }
        });

        _.each(lines.VIP, function(p) {
            if (p.id === event.clientId.id) {
                p.ask = event.price;
            }
        });
    }

    function onSwapEvent(event) {
        var clientId = event.clientId;
        var clientIds = event.clientIds;

        _.each(clientIds, function(otherId) {

            var clientPos;
            var theirPos;

            _.each(lines, function(line, lineId) {

                _.each(line, function(person, index) {
                    if (_.isEqual(person.clientId, clientId)) {
                        clientPos = {lineId:lineId, pos:index};
                    }
                    if (_.isEqual(person.clientId, otherId)) {
                        theirPos = {lineId:lineId, pos:index};
                    }
                });
            });

            var temp = lines[theirPos.lineId][theirPos.pos];
            lines[theirPos.lineId][theirPos.pos] = lines[clientPos.lineId][clientPos.pos];
            lines[clientPos.lineId][clientPos.pos] = temp;
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
var lineapp = lineapp || {};

lineapp.getDefaultUserAgent = function() {
	return "lineapp4js (gzip)";  // required to enable AppEngine gzip compression on Titanium
};

lineapp.Protocol = lineapp.Protocol || function(params) { return (function(params) {
	params = params || {};
	var userAgent = params.userAgent || lineapp.getDefaultUserAgent();

	var self = {};
	
	self.post = function(params) {
		var url = params.url || null;
		var obj = params.obj || null;
		var callback = params.callback || function(e){};
		var timeout = params.timeout || 60000;
		
		var client = http.create({
			onload : function(e) {
				callback(JSON.parse(client.responseText));
			},
			onerror : function(e) {
				callback({
					error : {
						code : "protocol",
						message : "protocol error"
					}
				});
			},
			timeout : timeout
		});
	
		client.open("POST", url);
		client.setUserAgent(userAgent);
		client.setRequestHeader("Content-Type", "application/json");
		client.setRequestHeader("Accept", "application/json");
		
		client.send(JSON.stringify(obj));
	};

	return self;
}(params))};
var utils = utils || {};

utils.Promise = utils.Promise || (function() {
    var resolved = false;
    var callbacks = [];
    var value;

    function checkCallbacks() {
        if (!resolved) return;
        while (callbacks.length > 0) {
            callbacks.pop().apply(this, value);
        }
    };

    this.done = function(callback) {
        callbacks.push(callback);
        checkCallbacks();
        return this;
    };

    this.resolve = function(/* values */) {
        value = _.toArray(arguments);
        resolved = true;
        checkCallbacks();
    };

    this.isResolved = function() {
        return resolved;
    };

    this.getValue = function() {
        return value;
    };

    return this;
});

/*
 * Usage:
 *
 * function f1(promise) { 
 *   do_stuff();
 *   promise.resolve("f1_done");
 * }
 * function f2() {
 *   var myPromise = new utils.Promise();
 *   do_stuff_with_callback(function () {
 *      myPromise.resolve("f2_done");
 *   });
 *   
 *   return myPromise;
 * }
 * when(f1, f2).done(function(f1_value, f2_value) {
 *   console.log(f1_value, f2_value);
 * })
 */
utils.Promise.when = function (/* callbacks... */) {
    var count = arguments.length, resolved = false, subPromises = [],
        promise = new utils.Promise();

    function checkDone() {
        if (resolved) return;
        if (_.all(_.invoke(subPromises, 'isResolved'))) {
            promise.resolve.apply(this,
                _.map(subPromises, function (subPromise) { return subPromise.getValue()[0]; }));
        }
    }
    _.each(arguments, function(callback, index) {
        var subPromise = new utils.Promise().done(checkDone);
        subPromises.push(subPromise);
        var ret = callback(subPromise);
        // If got a promise, pipe it to resolve subPromise
        if (ret instanceof utils.Promise) {
            ret.done(function (value) {
                subPromise.resolve(value);
            });
        }
    });
    return promise;
};
var lineapp = lineapp || {};

if (typeof(FB) !== "undefined")
{
    lineapp.Facebook = lineapp.Facebook || (function() {
        var self = new lineapp.EventHub();

        var accessToken = null;
        var uid = null;
        var dontUseFB = false;
        var appId = null;

        self.init = function(params) {
        	params = params || {};
            var channelUrl = params.channelUrl || null;
            appId = params.appId || null;
            dontUseFB = params.dontUseFB || false;

            if (!dontUseFB)
            {
                FB.init({appId:appId, channelUrl:channelUrl, status: true, cookie: true, xfbml: true, oauth: true});
                FB.getLoginStatus(function(response) {
                    if (response.authResponse) {
                        onlogin(response.authResponse);
                    } else {
                        onlogout();
                    }
                });
            }
        };

        self.getLoggedIn = function()
        {
            return accessToken !== null;
        };

        self.getAccessToken = function()
        {
            return accessToken;
        }

        self.authorize = function()
        {
            if (dontUseFB) return;

            FB.login(function(response) {
                    if (response.authResponse)
                    {
                        onlogin(response.authResponse);
                    }
                    else
                    {
                        onlogout();
                    }
                },
                undefined
            );
        };

        self.getUid = function()
        {
            return uid;
        };

        self.logout = function()
        {
            if (dontUseFB)
            {
                onlogout();
            }
            else
            {
                FB.logout();
            }
        };

        self.getGraphPath = function(path, params, callback)
        {
            var client = http.create({
                onload:function(e) {
                    callback({success:true, result:client.responseText});
                },

                onerror:function(e) {
                    callback({error:true, event:e});
                }
            });
            var url = "https://graph.facebook.com/"+path;

            var query = new lineapp.QueryStringBuilder(params);
            query.append("access_token", self.getAccessToken());

            url += query.toString();

            client.autoEncodeUrl = false; 
            client.open("GET", url);
            client.send();
        };

        self.login = function(_uid, _accessToken)
        {
            accessToken = _accessToken;
            uid = _uid;
        
            self.fireEvent("login", {success:true}); 
            lineapp.LineAppService.request({
                request:{
                    type:"extend",
                    accessToken:accessToken,
                    fbAppId:appId
                },
                callback:function(r)
                {
                    if (r.error) return;
                    accessToken = r.value.accessToken;
                }
            });
        }


        function onlogout()
        {
            accessToken = null; uid = null;

            self.fireEvent("logout");
        }

        function onlogin(authResponse)
        {
            self.login(authResponse.userID, authResponse.accessToken);
        }

        FB.Event.subscribe('auth.login', function(response)
                {
                    onlogin(response.authResponse);
                });
        FB.Event.subscribe('auth.logout', function(response)
                {
                    onlogout();
                });

        return self;
    }());
}
else
{
    lineapp.Facebook = lineapp.Facebook || (function() {
        var self = new lineapp.EventHub();

        self.init = function(params) {}
        self.getLoggedIn = function() { return false; };
        self.getAccessToken = function() { return null; }
        self.authorize = function() { }; 
        self.getUid = function() { return null; };
        self.logout = function() { };
        self.getGraphPath = function(path, params, callback) { callback({error:true}); };

        return self;
    }());
}
var lineapp = lineapp || {};

lineapp.GetInLinePresenter = lineapp.GetInLinePresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var view = new lineapp.GetInLineView();

    view.addEventListener("lineup", function(e) {
        self.fireEvent("lineup", e);
    });

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

var lineapp = lineapp || {};

lineapp.InLinePresenter = lineapp.InLinePresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var lineManagement = params.lineManagement;

    var config = new lineapp.InLineConfigPresenter({lineManagement:lineManagement});
    var line = new lineapp.InLineLinePresenter({lineManagement:lineManagement});

    var view = new lineapp.InLineView();

    view.addConfigView(config.getView());
    view.addLineView(line.getView());

    config.addEventListener("leave", function() {
        self.fireEvent("leave");
    });

    line.addEventListener("swap", function(e) {
        var theirId = e.partner;

        var myPos;
        var theirPos;

        var lines = lineManagement.getLines();

        var clientIds = {};

        _.each(lines, function(line, lineId) {
            clientIds[lineId] = []

            _.each(line, function(person, index) {

                clientIds[lineId].push(person);

                if (person.id === lineapp.Facebook.getUid()) {
                    myPos = {lineId:lineId, pos:index};
                }
                if (person.id === theirId) {
                    theirPos = {lineId:lineId, pos:index};
                }
            });
        });

        if (myPos.lineId !== theirPos.lineId) return; // Don't let swapping between lines (TODO: move to VIP?)
        if (myPos.pos < theirPos.pos) return; // Don't swap back

        var clientIds = clientIds[myPos.lineId];

        clientIds = _.first(clientIds, myPos.pos);

        if (theirPos.pos > 0) clientIds = _.rest(clientIds, theirPos.pos);

        clientIds.reverse();

        var prices = _.pluck(clientIds, "ask");
        var clientIds = _.pluck(clientIds, "clientId");

        console.log(clientIds, prices);

        /*
        lineapp.LineAppService.request({
            request:{
                "type":"create_payment",
                "paymentRequests":prices,
            },
            callback:function(e) {
                console.log(e);
            }
        });
       */

        /*

        lineManagement.performEvents([{type:"swap", 
                                     clientId:{ns:"com.facebook", id:lineapp.Facebook.getUid()}, 
                                     clientIds:clientIds,
                                     payKey:"TODO"}]);
                                    */
    });

    self.close = function() {
        config.close();
        line.close();
    }

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

var lineapp = lineapp || {};

lineapp.InLineConfigPresenter = lineapp.InLineConfigPresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var lineManagement = params.lineManagement;

    var view = new lineapp.InLineConfigView();

    self.update = function() {
        var lines = lineManagement.getLines();

        _.each(lines, function(line) {
            _.each(line, function(person, index) {

                if (person.id === lineapp.Facebook.getUid()) {

                    view.setPosition(index+1);
                    view.setTimeInLine(person.joinTimestamp);
                    view.setAsk(person.ask);

                    view.setEta(1000); // TODO!
                    view.setTotalEarned(0); // TODO!

                }
            });
        });
    };

    self.update();

    view.addEventListener("leave", function() {
        self.fireEvent("leave");
    });

    view.addEventListener("setprice", function(e) {
        lineManagement.performEvents([{type:"set_price", 
                                     price:{destination:"yoavamit@yahoo.com", currency:"USD", amount:e.value}, 
                                     clientId:{ns:"com.facebook", id:lineapp.Facebook.getUid()}}]);
    });

    self.close = function() {
        view.close();
    };

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

lineapp.InLineLinePresenter = lineapp.InLineLinePresenter || function(params) { return (function(params) {

    var DEFAULT_PRICE = 500;

    var self = new lineapp.EventHub();

    var lineManagement = params.lineManagement;

    var view = new lineapp.InLineLineView();

    view.initLines(lineManagement.getLines());

    var onChanged = function(e) {
        var events = e.events;
        _.each(events, function(event) {
            console.log("Handling", event.type);
            switch (event.type) {
                case "join":
                    view.onJoinEvent({person:{id:event.clientId.id, clientId:event.clientId, ask:null, joinTimestamp:event.timestamp}}); 
                    break;
                case "leave":
                    view.onLeaveEvent({person:{id:event.clientId.id, clientId:event.clientId}}); 
                    break;
                case "set_price":
                    view.onSetPriceEvent({person:{id:event.clientId.id, clientId:event.clientId}, amount:event.price.amount}); 
                    break;
                case "swap":
                    view.onSwapEvent({clientId:event.clientId, clientIds:event.clientIds}); 
                    break;
            }
        });
    }

    lineManagement.addEventListener("changed", onChanged);

    view.addEventListener("swap", function(e) {
        self.fireEvent("swap", e);
    });

    self.getView = function() {
        return view;
    };

    self.close = function() {
        lineManagement.removeEventListener("changed", onChanged);
    };
    
	return self;
}(params))};
var lineapp = lineapp || {};

lineapp.LineAppPresenter = lineapp.LineAppPresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var view = new lineapp.LineAppView();

    var lineManagement = new lineapp.LineManagement();

    var LINEID = "5629499534213120"; // No VIP, No Israeli
    // var LINEID = "5707702298738688"; // VIP ($50), No Israeli
    // var LINEID = "5668600916475904"; // VIP ($50), Israeli
    

    self.open = function() {
        
        console.log("open >> Start.")

        if (lineapp.Facebook.getLoggedIn()) {
            console.log("open >> Already logged in.")
            onLogin();
        } else {
            console.log("open >> Logging in.")

            lineapp.Facebook.addEventListener("login", function(e) {
                console.log("open >> Logged in.", e)
                onLogin();
            });

            var login = new lineapp.LoginPresenter();
            view.showLogin(login.getView())
        }
    };

    var loginCalled = false;
    function onLogin() {
        if (loginCalled) {
            console.warn("onLogin >> called twice.");
            return;
        }
        loginCalled = true;

        console.log("onLogin >> Start.");

        // Get line events
        lineapp.LineAppService.request({
            request:{
                type:"update",
                lineId:LINEID
            },
            callback:function(response) {

                if (response.error) {
                    alert(response.error.message);
                }

                onEvents(response.value.events || []);
            }
        });
    }

    function amIInLine() {
        var lines = _.values(lineManagement.getLines());
        return _.chain(lines).flatten().pluck("id").contains(lineapp.Facebook.getUid()).value();
    }

    function onEvents(events) {

        console.log("onEvents >> Start.", events);

        // Build line management
        lineManagement.init({events:events, lineId:LINEID});
        lineManagement.startMonitoring();

        // See if we're in line.
        var inLine = amIInLine();

        console.log("onEvents >> inLine", inLine);

        if (inLine) {
            // if so, display main screen
            onInLine();
        } else {
            // otherwise, display waiting in line screen
            onNotInLine();
        }
    }

    function onNotInLine() {
        var presenter = new lineapp.GetInLinePresenter();
        view.showGetInLineView(presenter.getView());

        // Listen to join line request
        presenter.addEventListener("lineup", function() {

            view.showWaiting();

            lineManagement.performEvents([
                {type:"join", clientId:{ns:"com.facebook", id:lineapp.Facebook.getUid()}} // TODO: friendClientId
            ]);
        });

        var checkChanged = function() {
            console.log("onNotInLine >> Checking if inline");
            if (amIInLine()) {
                lineManagement.removeEventListener("changed", checkChanged);
                onInLine();
            }
        };

        lineManagement.addEventListener("changed", checkChanged);
        view.hideWaiting();
    }

    function onInLine() {
        console.log("onInLine >> Start");

        var presenter = new lineapp.InLinePresenter({lineManagement:lineManagement});
        view.showInLineView(presenter.getView());

        // Listen to join line request
        presenter.addEventListener("leave", function() {

            view.showWaiting();

            lineManagement.performEvents([{type:"leave", clientId:{ns:"com.facebook", id:lineapp.Facebook.getUid()}}]);
        });

        var checkChanged = function() {
            console.log("onNotInLine >> Checking if not inline");
            if (!amIInLine()) {
                lineManagement.removeEventListener("changed", checkChanged);
                presenter.close();
                onNotInLine();
            }
        };

        lineManagement.addEventListener("changed", checkChanged);

        view.hideWaiting();
    }

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};
var lineapp = lineapp || {};

lineapp.LoginPresenter = lineapp.LoginPresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var view = new lineapp.LoginView();

    view.addEventListener("login", function() {
        lineapp.Facebook.authorize();
    });

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};
var lineapp = lineapp || {};

lineapp.GetInLineView = lineapp.GetInLineView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>", {"class":"lineapp_getinlineview_wrapper"});

    var button = $("<button></button>")
                    .html("Get In Line!")
                    .appendTo(wrapper);

    button.on("click", function() {
        self.fireEvent("lineup");
    });

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};


var lineapp = lineapp || {};

lineapp.InLineConfigView = lineapp.InLineConfigView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var joinTimestamp = null;

    var wrapper = $("<div></div>", {"class":"lineapp_inlineconfigview_wrapper"});

    var pos = $("<div></div>", {"class":"position"}).appendTo(wrapper);
    var timeInLine = $("<div></div>", {"class":"timeinline"}).appendTo(wrapper);
    var timeEta = $("<div></div>", {"class":"timeeta"}).appendTo(wrapper);
    var ask = $("<select></select>").appendTo(wrapper);
    var totalEarned = $("<div></div>").appendTo(wrapper);
    var leave = $("<button></button>").html("Leave").appendTo(wrapper);

    leave.on("click", function() {
        self.fireEvent("leave");
    });

    $("<option></option>", {"value":100, "html":"$1"}).appendTo(ask);
    $("<option></option>", {"value":200, "html":"$2"}).appendTo(ask);
    $("<option></option>", {"value":300, "html":"$3"}).appendTo(ask);
    $("<option></option>", {"value":400, "html":"$4"}).appendTo(ask);
    $("<option></option>", {"value":500, "html":"$5"}).appendTo(ask);
    $("<option></option>", {"value":1000, "html":"$10"}).appendTo(ask);
    $("<option></option>", {"value":1500, "html":"$15"}).appendTo(ask);
    $("<option></option>", {"value":2000, "html":"$20"}).appendTo(ask);

    ask.change(function() {
        self.fireEvent("setprice", {value:ask.val()});
    });

    function updateTimeInLine() {
        if (!joinTimestamp) return;

        var diff = new Date().getTime() - joinTimestamp;

        var seconds = parseInt(diff/1000);

        var hours = parseInt(seconds/60/60);
        var minutes = parseInt(seconds/60) - hours*60;
        seconds = seconds - minutes*60 - hours*60*60;

        timeInLine.html(pad(hours)+":"+pad(minutes)+":"+pad(seconds));
    };

    function pad(num) {
        var str = ""+num;

        if (str.length === 1) str = "0"+str;

        return str;
    }

    var internalId = setInterval(updateTimeInLine, 1000);

    self.setPosition = function(val) {
        pos.html(val);
    };

    self.setTimeInLine = function(_joinTimestamp) {
        joinTimestamp = _joinTimestamp;
        updateTimeInLine();
    };

    self.setEta = function(val) {
        timeEta.html(val);
    };

    self.setAsk = function(val) {
        ask.val(val);
    };

    self.setTotalEarned = function(val) {
        totalEarned.val(val);
    };

    self.getDom = function() {
        return wrapper;
    };

    self.close = function() {
        clearInterval(internalId);
        intervalId = null;
    };
    
	return self;
}(params))};


var lineapp = lineapp || {};

lineapp.InLineLineView = lineapp.InLineLineView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var peopleDivs = {};

    var wrapper = $("<div></div>", {"class":"lineapp_inlinelineview_wrapper"});

    var waitingLine = $("<div></div>", {"class":"waitingline"}).appendTo(wrapper);
    $("<div></div>", {"class":"desk"}).appendTo(waitingLine);

    var vipLine = $("<div></div>", {"class":"vipline"}).appendTo(waitingLine);
    var normalLine = $("<div></div>", {"class":"normalline"}).appendTo(waitingLine);

    var CREATOR_WIDTH_AND_MARGIN = 78;

    var lineWidth = CREATOR_WIDTH_AND_MARGIN;

    self.initLines = function(lines) {
        vipLine.empty();
        normalLine.empty();
        peopleDivs = {};

        _.each(lines.VIP, function(person) {
            addPerson(person, vipLine);
        })

        _.each(lines.NORMAL, function(person) {
            addPerson(person, normalLine);
        })

    };

    function addPerson(person, line) {
        lineWidth += CREATOR_WIDTH_AND_MARGIN;
        waitingLine.css({"width":lineWidth});

        var spot = $("<div></div>", {"class":"spotsaver"}).appendTo(line);
        _.defer(function() {
            var dom = $("<div></div>", {"class":"person"})
                .css({left:spot.position().left+5})
                .hide()
                .appendTo(line)
                .fadeIn({complete:nextAnimation});

            var face = $("<img />", {"class":"face"}).appendTo(dom);
            face.attr("src", "http://graph.facebook.com/"+person.id+"/picture?type=square");

            var ask = $("<div></div>", {"class":"info"})
                .html((person.ask || {}).amount || "N/A")
                .appendTo(dom);

            dom.addClass("creature"+((person.id % 3) +1));

            peopleDivs[person.id] = {dom:dom, spot:spot, ask:ask};

            if (person.id !== lineapp.Facebook.getUid()) {
                dom.on("click", function() {
                    self.fireEvent("swap", {partner:person.id});
                });
            }
        });
    }

    self.onJoinEvent = function(params) {
        addAnimation({type:"join", params:params})
    };

    self.onLeaveEvent = function(params) {
        addAnimation({type:"leave", params:params})
    };

    self.onSetPriceEvent = function(params) {
        var person = params.person;
        var amount = params.amount;

        peopleDivs[person.id].ask.html(amount);
    };

    self.onSwapEvent = function(params) {
        var clientId = params.clientId;
        var clientIds = params.clientIds;

        _.each(clientIds, function(otherId) {
            addAnimation({"type":"swap", params:{clientId1:clientId, clientId2:otherId}});
        });
    };

    var animations = [];
    var inAnimations = false;

    function addAnimation(params) {
        animations.push(params);
        if (!inAnimations) {
            nextAnimation();
        }
    }

    function nextAnimation() {
        if (animations.length === 0) {
            inAnimations = false;
            return;
        }

        inAnimations = true;

        var topAnimation = animations.shift();

        console.log("Animating", topAnimation.type);

        switch(topAnimation.type) {
            case "join":
                onJoinEventInner(topAnimation.params);
            break;
            case "leave":
                onLeaveEventInner(topAnimation.params);
            break;
            case "set_price":
                // Nothing to do, set price is not animated
            break;
            case "swap":
                onSwapEventInner(topAnimation.params);
            break;
        }

    }

    function onJoinEventInner(params) {
        var person = params.person;
        console.log(person);
        addPerson(person, normalLine);
    }

    function onLeaveEventInner(params) {
        var person = params.person;

        var startLeft = parseInt(peopleDivs[person.id].dom.css("left"));
        console.log(startLeft);

        var numAnimations = 0;

        function onAnimationDone() {
            numAnimations--;
            if (numAnimations <= 0) {
                peopleDivs[person.id].dom.remove();
                peopleDivs[person.id].spot.remove();
                delete peopleDivs[person.id];
                lineWidth -= CREATOR_WIDTH_AND_MARGIN;
                waitingLine.css({"width":lineWidth});
                nextAnimation();
            }
        }

        _.each(peopleDivs, function(personDiv) {
            var left = parseInt(personDiv.dom.css("left"));

            if (left > startLeft) {
                numAnimations++;
                personDiv.dom.animate({left:left-CREATOR_WIDTH_AND_MARGIN}, onAnimationDone)
            }
        });

        numAnimations++;
        peopleDivs[person.id].dom.fadeOut({complete:onAnimationDone});
        numAnimations++;
        peopleDivs[person.id].spot.fadeOut({complete:onAnimationDone});
    };

    function onSwapEventInner(params) {
        var clientId1 = params.clientId1;
        var clientId2 = params.clientId2;

        var dom1 = peopleDivs[clientId1.id].dom;
        var dom2 = peopleDivs[clientId2.id].dom;

        var completed = 0;

        dom1.animate({left:dom2.css("left"), duration:1000}, function() {
            completed++;
            if (completed === 2) nextAnimation();
        });
        dom2.animate({left:dom1.css("left"), duration:1000}, function() {
            completed++;
            if (completed === 2) nextAnimation();
        });
    };

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};


var lineapp = lineapp || {};

lineapp.InLineView = lineapp.InLineView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>", {"class":"lineapp_inlineview_wrapper"});

    var config = $("<div></div>", {"class":"config"}).appendTo(wrapper);
    var line = $("<div></div>", {"class":"line"}).appendTo(wrapper);

    self.addConfigView = function(view) {
        config.append(view.getDom());
    };

    self.addLineView = function(view) {
        line.append(view.getDom());
    };

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};


var lineapp = lineapp || {};

lineapp.LineAppView = lineapp.LineAppView || function(params) { return (function(params) {
    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>", {"class":"lineapp_lineappview_wrapper"});

    var waiting = $("<div></div>", {"class":"waiting"}).appendTo(wrapper);
    $("<i class='icon-spin icon-spinner'></i>").appendTo(waiting);
    waiting.hide();

    self.showWaiting = function() {
        waiting.show();
    };

    self.hideWaiting = function() {
        waiting.hide();
    };

    self.showLogin = function(view) {
        wrapper.empty();
        wrapper.append(waiting);
        wrapper.append(view.getDom());
    };

    self.showGetInLineView = function(view) {
        wrapper.empty();
        wrapper.append(waiting);
        wrapper.append(view.getDom());
    };

    self.showInLineView = function(view) {
        wrapper.empty();
        wrapper.append(waiting);
        wrapper.append(view.getDom());
    };

    self.getDom = function() {
        return wrapper;
    };

	return self;
}(params))};
var lineapp = lineapp || {};

lineapp.LoginView = lineapp.LoginView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>", {"class":"lineapp_loginview_wrapper"});

    var login = $("<button></button>").html("Login").appendTo(wrapper);

    login.on("click", function() {
        self.fireEvent("login");
    });

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};

if (typeof(console) === "undefined") {
    var console = {
    	log : function() {},
    	warn : function() {}
    };
}

// Note: 'organizationFull' var is initialized externally
var localurl = window.location.protocol + "//"+window.location.host;

var client = new lineapp.Client();

function init(params) {

    lineapp.LineAppService.init({client:client});

	var fbAppId = "471521269618702";
    lineapp.Facebook.init({
        appId : fbAppId,
        channelUrl : localurl + "/static/channel.html",
    });

    var presenter = lineapp.LineAppPresenter();
    $(body).append(presenter.getView().getDom());
    presenter.open();
}


init();
