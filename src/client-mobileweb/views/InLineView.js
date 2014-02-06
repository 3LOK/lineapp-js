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


