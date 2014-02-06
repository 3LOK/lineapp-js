var lineapp = lineapp || {};

lineapp.InLinePresenter = lineapp.InLinePresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var view = new lineapp.InLineView();

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

