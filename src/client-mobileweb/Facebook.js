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
