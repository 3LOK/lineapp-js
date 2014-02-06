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

    var view = new lineapp.InLineView();

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

var lineapp = lineapp || {};

lineapp.LineAppPresenter = lineapp.LineAppPresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var view = new lineapp.LineAppView();

    var lineManagement = new lineapp.LineManagement();

    var LINEID = "1";

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

            // Login screen?
            lineapp.Facebook.authorize();
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

        /* TODO
        // Get line events
        lineapp.LineAppService.request({
            request:{
                type:"get_events",
                lineId:LINEID
            },
            callback:function(response) {

                if (response.error) {
                    alert(response.error.message);
                }

               onEvents(response.events);
            }
        });
       */

      onEvents([
          {type:"create", vipPrice:10000, israeliMode:false}
      ]);
    }

    function onEvents(events) {

        console.log("onEvents >> Start.", events);

        // Build line management
        lineManagement.init({events:events});

        // See if we're in line.
        var lines = _.values(lineManagement.getLines());
        var inLine = _.chain(lines).flatten().pluck("id").contains(lineapp.Facebook.getUid()).value();

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
            // TODO: send it as an event
            _.defer(function() {
                lineManagement.handleEvents([
                    {type:"join", clientId:lineapp.Facebook.getUid()}
                ])

                onInLine();
            });
        });
    }

    function onInLine() {

        var presenter = new lineapp.InLinePresenter();
        view.showInLineView(presenter.getView());
    }

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};
var lineapp = lineapp || {};

lineapp.GetInLineView = lineapp.GetInLineView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>");

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

lineapp.InLineView = lineapp.InLineView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>");

    $("<div>In Line!</div>").appendTo(wrapper);

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};


var lineapp = lineapp || {};

lineapp.LineAppView = lineapp.LineAppView || function(params) { return (function(params) {
    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>", {"class":"lineapp_lineappview_wrapper"});

    self.showWaiting = function() {
        // TODO;
    };

    self.hideWaiting = function() {
        // TODO;
    };

    self.showLogin = function(view) {
        wrapper.empty();
        wrapper.append(view.getDom());
    };

    self.showGetInLineView = function(view) {
        wrapper.empty();
        wrapper.append(view.getDom());
    };

    self.showInLineView = function(view) {
        wrapper.empty();
        wrapper.append(view.getDom());
    };

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
