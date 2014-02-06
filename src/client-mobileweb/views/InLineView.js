var lineapp = lineapp || {};

lineapp.InLineView = lineapp.InLineView || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var baseUrl = window.location.href;
    baseUrl = baseUrl.substr(0, baseUrl.lastIndexOf("/") + 1);
    
    self.getSuccessUrl = function() {
    	return baseUrl + "paypal_success.html";
    };
    
    self.getErrorUrl = function() {
    	return baseUrl + "paypal_error.html";
    };

    var wrapper = $("<div></div>", {"class":"lineapp_inlineview_wrapper"});

    var config = $("<div></div>", {"class":"config"}).appendTo(wrapper);
    var line = $("<div></div>", {"class":"line"}).appendTo(wrapper);
    var approvePaymentMask = $("<div></div>", {"class":"approvepaymentmask"}).appendTo(wrapper);
    var approvePayment = $("<div></div>", {"class":"approvepayment"}).appendTo(wrapper);

    approvePayment.append($("<i class='icon-spin icon-spinner'></i>"))

    self.showApprovePay = function() {
        approvePaymentMask.show();
        approvePayment.show();
    };

    self.fillApprovePay = function(view) {
        approvePayment.empty();
        approvePayment.append(view.getDom());
    };

    self.closeApprovePay = function() {
        approvePayment.hide();
        approvePaymentMask.hide();
        approvePayment.empty();
        approvePayment.append($("<i class='icon-spin icon-spinner'></i>"))
    };

    self.approvePayment = function(params) {
        var payKey = params.payKey;
        var callback = params.callback;
    };

    self.addConfigView = function(view) {
        config.append(view.getDom());
    };

    self.addLineView = function(view) {
        line.append(view.getDom());
    };

    self.getDom = function() {
        return wrapper;
    };
    
	return self;
}(params))};


