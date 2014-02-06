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
