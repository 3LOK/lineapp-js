var lineapp = lineapp || {};

lineapp.LoginView = lineapp.LoginView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var wrapper = $("<div></div>", {"class":"lineapp_loginview_wrapper"});

    var login = $("<button></button>").html("Login").appendTo(wrapper);

    login.on("click", function() {
        self.fireEvent("login");
    });

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};

