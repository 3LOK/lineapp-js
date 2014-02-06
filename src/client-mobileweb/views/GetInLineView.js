var lineapp = lineapp || {};

lineapp.GetInLineView = lineapp.GetInLineView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>", {"class":"lineapp_getinlineview_wrapper"});

    var button = $("<button></button>")
                    .html("Get In Line!")
                    .appendTo(wrapper);

    button.on("click", function() {
        self.fireEvent("lineup");
    });

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};


