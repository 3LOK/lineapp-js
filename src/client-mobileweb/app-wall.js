if (typeof(console) === "undefined") {
    var console = {
    	log : function() {},
    	warn : function() {}
    };
}

// Note: 'organizationFull' var is initialized externally
var localurl = window.location.protocol + "//"+window.location.host;

var client = new lineapp.Client();

function init(params) {

    lineapp.LineAppService.init({client:client});

	var fbAppId = "471521269618702";
    lineapp.Facebook.init({
        appId : fbAppId,
        channelUrl : localurl + "/static/channel.html",
    });

    var presenter = lineapp.WallAppPresenter();
    $(body).append(presenter.getView().getDom());
    presenter.open();
}


init();
