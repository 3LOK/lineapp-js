var lineapp = lineapp || {};

lineapp.InLineView = lineapp.InLineView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>");

    $("<div>In Line!</div>").appendTo(wrapper);

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};


