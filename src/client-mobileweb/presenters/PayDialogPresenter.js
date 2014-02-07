var lineapp = lineapp || {};

lineapp.PayDialogPresenter = lineapp.PayDialogPresenter || function(params) { return (function(params) {
	params = params || {};
	var payKey = params.payKey || null;
	
    var self = new lineapp.EventHub();

    var view = new lineapp.PayDialogView({
    	payKey : payKey
    });
    
    // HACK: poll for result. DAMN YOU PAYPAL FOR FORCING ME TO DO THIS!
    var intervalId = setInterval(function() {
	    lineapp.LineAppService.request({
	    	request : {
	    		type : "get_payment_status",
	    		payKey : payKey
	    	},
	    	callback : function(response) {
	    		if (response.error) {
	    			self.fireEvent("error", {});
	    			clearInterval(intervalId);
	    			return;
	    		}
	    		
	    		var paymentStatus = response.value;
	    		if (paymentStatus.status !== "pending") {
	    			clearInterval(intervalId);
					self.fireEvent("done", paymentStatus);
	    		}
	    	}
	    });
    }, 1000);

	return self;
}(params))};
