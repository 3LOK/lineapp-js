var lineapp = lineapp || {};

lineapp.WallAppPresenter = lineapp.WallAppPresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var view = new lineapp.WallAppView();
    
    self.getView = function() {
        return view;
    };
    

    var lineManagement = new lineapp.LineManagement();

    var LINEID = "5741031244955648"; // No VIP, No Israeli
    // var LINEID = "5707702298738688"; // VIP ($50), No Israeli
    // var LINEID = "5668600916475904"; // VIP ($50), Israeli
    

    self.open = function() {
        
        console.log("open >> Start.")

        // Get line events
        lineapp.LineAppService.request({
            request:{
                type:"update",
                lineId:LINEID
            },
            callback:function(response) {

                if (response.error) {
                    alert(response.error.message);
                }

                onEvents(response.value.events || []);
            }
        });
    };
    
    view.addEventListener("join", function(e) {
    	console.log("JOIN PRESSED!");
    });

    function onEvents(events) {

        console.log("onEvents >> Start.", events);

        // Build line management
        lineManagement.init({events:events, lineId:LINEID});
        lineManagement.startMonitoring();
       	view.reset(lineManagement);
        
        lineManagement.addEventListener("changed", function() {
        	view.reset(lineManagement);
        });
    }
    
	return self;
}(params))};
