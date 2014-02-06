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
