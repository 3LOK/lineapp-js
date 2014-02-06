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
          {type:"create", vipPrice:10000, israeliMode:false},
          {type:"join", clientId:lineapp.Facebook.getUid(), timestamp:1391694080889},
          {type:"join", clientId:1, timestamp:1391694080889},
          {type:"join", clientId:2, timestamp:1391694080889},
          {type:"join", clientId:3, timestamp:1391694080889},
          {type:"join", clientId:4, timestamp:1391694080889}
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
                    {type:"join", clientId:lineapp.Facebook.getUid(), timestamp:1391694080889}
                ])

                onInLine();
            });
        });
    }

    function onInLine() {

        var presenter = new lineapp.InLinePresenter({lineManagement:lineManagement});
        view.showInLineView(presenter.getView());
    }

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};
