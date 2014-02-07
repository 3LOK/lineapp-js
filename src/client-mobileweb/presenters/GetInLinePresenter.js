var lineapp = lineapp || {};

lineapp.GetInLinePresenter = lineapp.GetInLinePresenter || function(params) { return (function(params) {
	params = params || {};
	var lineManagement = params.lineManagement || null;

    var self = new lineapp.EventHub();

    var view = new lineapp.GetInLineView({
    	lineManagement : lineManagement
    });

    view.addEventListener("lineup", function(e) {
        self.fireEvent("lineup", e);
    });

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

