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
