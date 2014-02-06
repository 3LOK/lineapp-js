var lineapp = lineapp || {};

lineapp.LineAppService = lineapp.LineAppService || (function() {
	var self = new lineapp.EventHub();

	var client = null;
	var searchCache = null;

    var requests = {};
	
	self.request = function(params) {
		params = params || {};
		var request = params.request || {};
        var promise = params.promise || new utils.Promise();
        if (params.callback) {
            var callback = params.callback;
            promise.done(function(/* args... */) {
                callback.apply(this, arguments);
            });
        };

		client.request({
			request : request,
			callback : function(response) {
                promise.resolve(response);
			}
		});
	};
	
	self.init = function(params) {
		params = params || {};
		client = params.client || null;
	};
	
	return self;
}());
