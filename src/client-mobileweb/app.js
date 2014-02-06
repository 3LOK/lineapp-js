if (typeof(console) === "undefined") {
    var console = {
    	log : function() {},
    	warn : function() {}
    };
}

// Note: 'organizationFull' var is initialized externally
var localurl = window.location.protocol + "//"+window.location.host;

var client = new lineapp.Client({
	apiUrl : "http://";
});

function init(params) {

    lineapp.LineAppService.init({client:client});

	var fbAppId = "136436869735932";
    lineapp.Facebook.init({
        appId : fbAppId,
        channelUrl : localurl + "/static/channel.html",
    });

    var presenter = lineapp.LineAppPresenter();
    $(body).append(presenter.getView());
    presenter.open();
}


init();
