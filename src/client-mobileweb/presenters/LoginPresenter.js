var lineapp = lineapp || {};

lineapp.LoginPresenter = lineapp.LoginPresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var view = new lineapp.LoginView();

    view.addEventListener("login", function() {
        lineapp.Facebook.authorize();
    });

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};
