var lineapp = lineapp || {};

lineapp.InLineApprovePayPresenter = lineapp.InLineApprovePayPresenter || function(params) { return (function(params) {

    var payKey = params.payKey;
    var requests = params.requests;

    var self = new lineapp.EventHub();

    var view = new lineapp.InLineApprovePayView({payKey:payKey, requests:requests});

    view.addEventListener("close", function() {
        self.fireEvent("close");
    });

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

