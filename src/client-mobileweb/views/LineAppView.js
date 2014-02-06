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
