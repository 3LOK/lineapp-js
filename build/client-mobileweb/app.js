var http=http||{};
http.Factory=http.Factory||function(){return{create:function(a){var a=a||{},d=a.timeout||6E4,e=a.onload||function(){},f=a.onerror||function(){},g=a.onprogress||function(){},a=a.ontimeout||function(){};if("undefined"!==typeof XDomainRequest){var b=new XDomainRequest;b.timeout=d;b.onload=function(){b.fix=!0;e()};b.onerror=f;b.onprogress=g;b.ontimeout=a;b.setRequestHeader=function(){};b.setUserAgent=function(){};return b}if("undefined"!==typeof XMLHttpRequest){var c=new XMLHttpRequest;c.timeout=d;c.onload=
e;c.onerror=f;c.onprogress=g;c.ontimeout=a;c.setUserAgent=function(){};return c}if("undefined"!==typeof Ti){var h=Ti.Network.createHTTPClient({timeout:d,onload:e,onerror:f,onprogress:g,ontimeout:a});h.setUserAgent=function(a){h.setRequestHeader("User-Agent",a)};return h}throw Error("Could not find an HttpClient implementation.");}}}();http.create=http.create||http.Factory.create;
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

lineapp.LineManagement = lineapp.LineManagement || function(params) { return (function(params) {
    var self = new lineapp.EventHub();

    var lines = {};

    self.init = function(events) {
        // TODO
    };

    self.handleEvents = function(events) {
    };

    function handleEvent(event) {
    }

    self.getLines = function(params) {
        // TODO
    };

	return self;
}(params))};
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

lineapp.LineAppPresenter = lineapp.LineAppPresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var view = new lineapp.LineAppView();

    var lineManagement = new lineapp.LineManagement();

    var LINEID = "1";

    self.open = function() {

        if (lineapp.Facebook.getLoggedIn()) {
            onLogin();
        } else {
            // Login screen?
            lineapp.Facebook.authorize();
        }
    };

    function onLogin() {
        // TODO: 1. Get line events
        // TODO: 2. Build line management
        // TODO: 3. See if we're in line.
        // TODO:   if so, display main screen
        // TODO:   otherwise, display waiting in line screen
    };

    function onNotInLine() {
    }

    function onInLine() {
    }

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};
var lineapp = lineapp || {};

lineapp.LineAppView = lineapp.LineAppView || function(params) { return (function(params) {
    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>");

    self.showWaiting = function() {
        // TODO;
    };

    self.hideWaiting = function() {
        // TODO;
    };

    self.showLogin = function(view) {
        wrapper.empty();
        wrapper.add(view.getDom());
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

/*
var client = new lineapp.Client({
	apiUrl : spiceApiUrl
});
*/

function init(params) {
	var fbAppId = "136436869735932";
    lineapp.Facebook.init({
        appId : fbAppId,
        channelUrl : localurl + "/static/channel.html",
    });

    var presenter = lineapp.LineAppPresenter();
    $(body).append(presenter.getView());
    presenter.open();
}


init();
