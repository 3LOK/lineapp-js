var lineapp = lineapp || {};

lineapp.PayDialogView = lineapp.PayDialogView || function(params) { return (function(params) {
	params = params || {};
	var payKey = params.payKey || null;
	
    var self = new lineapp.EventHub();
    
    var wrapperDiv = $("<div></div>");
    wrapperDiv.hide();
    
    self.getDom = function() {
    	return wrapperDiv;
    }
    
    var form = $('<form action="https://www.sandbox.paypal.com/webapps/adaptivepayment/flow/pay" class="paypal-hidden-form" target="PPDGFrame">');
    form.append($('<input type="submit" id="paypal-submit"></button>'));
    form.append($('<input id="type" type="hidden" name="expType" value="light">'));
    form.append($('<input id="paypal-key" type="hidden" name="paykey" value="' + payKey + '">'))
    wrapperDiv.append(form);
    
    var dgFlow = new PAYPAL.apps.DGFlow({ trigger: "paypal-submit", expType: "light" });
    form.submit();
    
	$("body").append(wrapperDiv);

	return self;
}(params))};
