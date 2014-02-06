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
