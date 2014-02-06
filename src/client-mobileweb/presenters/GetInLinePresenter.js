var lineapp = lineapp || {};

lineapp.GetInLinePresenter = lineapp.GetInLinePresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var view = new lineapp.GetInLineView();

    view.addEventListener("lineup", function(e) {
        self.fireEvent("lineup", e);
    });

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

