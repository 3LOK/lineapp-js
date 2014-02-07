var lineapp = lineapp || {};

lineapp.GetInLineView = lineapp.GetInLineView || function(params) { return (function(params) {
	params = params || {};
	var lineManagement = params.lineManagement || null;

    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>", {"class":"lineapp_getinlineview_wrapper"});
    
    var text = $("<span></span>")
                    .text(lineManagement.getLines().NORMAL.length)
                    .appendTo(wrapper);

    var button = $("<div></div>").appendTo(wrapper);

    button.on("click", function() {
        self.fireEvent("lineup");
    });

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};


