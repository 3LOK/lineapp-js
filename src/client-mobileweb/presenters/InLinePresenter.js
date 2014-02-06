var lineapp = lineapp || {};

lineapp.InLinePresenter = lineapp.InLinePresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var lineManagement = params.lineManagement;

    var config = new lineapp.InLineConfigPresenter({lineManagement:lineManagement});
    var line = new lineapp.InLineLinePresenter({lineManagement:lineManagement});

    var view = new lineapp.InLineView();

    view.addConfigView(config.getView());
    view.addLineView(line.getView());

    config.addEventListener("leave", function() {
        self.fireEvent("leave");
    });

    line.addEventListener("swap", function(e) {
        var theirId = e.partner;

        var myPos;
        var theirPos;

        var lines = lineManagement.getLines();

        var clientIds = {};

        _.each(lines, function(line, lineId) {
            clientIds[lineId] = []

            _.each(line, function(person, index) {

                clientIds[lineId].push(person);

                if (person.id === lineapp.Facebook.getUid()) {
                    myPos = {lineId:lineId, pos:index};
                }
                if (person.id === theirId) {
                    theirPos = {lineId:lineId, pos:index};
                }
            });
        });

        if (myPos.lineId !== theirPos.lineId) return; // Don't let swapping between lines (TODO: move to VIP?)
        if (myPos.pos < theirPos.pos) return; // Don't swap back

        var clientIds = clientIds[myPos.lineId];

        clientIds = _.first(clientIds, myPos.pos);

        if (theirPos.pos > 0) clientIds = _.rest(clientIds, theirPos.pos);

        clientIds.reverse();

        var requests = _.pluck(clientIds, "ask");
        var clientIds = _.pluck(clientIds, "clientId");

        view.showApprovePay();

        lineapp.LineAppService.request({
            request:{
                "type":"create_payment",
                "paymentRequests":requests,
                successUrl : view.getSuccessUrl(),
                errorUrl : view.getErrorUrl()
            },
            callback:function(e) {
                if (e.error) {
                    alert(e.error.message);
                    return;
                }

                var presenter = lineapp.InLineApprovePayPresenter({payKey:e.value.payKey, requests:requests});
                view.fillApprovePay(presenter.getView());

                /*
                view.approvePayment({payKey:e.value.payKey, callback:function(response) {
                }});
               */
            }
        });

        /*

        lineManagement.performEvents([{type:"swap", 
                                     clientId:{ns:"com.facebook", id:lineapp.Facebook.getUid()}, 
                                     clientIds:clientIds,
                                     payKey:"TODO"}]);
                                    */
    });

    self.close = function() {
        config.close();
        line.close();
    }

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

var lineapp = lineapp || {};

lineapp.InLineConfigPresenter = lineapp.InLineConfigPresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var lineManagement = params.lineManagement;

    var view = new lineapp.InLineConfigView();

    self.update = function() {
        var lines = lineManagement.getLines();

        _.each(lines, function(line) {
            _.each(line, function(person, index) {

                if (person.id === lineapp.Facebook.getUid()) {

                    view.setPosition(index+1);
                    view.setTimeInLine(person.joinTimestamp);
                    view.setAsk(person.ask);

                    view.setEta(1000); // TODO!
                    view.setTotalEarned(0); // TODO!

                }
            });
        });
    };

    self.update();

    view.addEventListener("leave", function() {
        self.fireEvent("leave");
    });

    view.addEventListener("setprice", function(e) {
        lineManagement.performEvents([{type:"set_price", 
                                     price:{destination:"yoavamit@yahoo.com", currency:"USD", amount:e.value}, 
                                     clientId:{ns:"com.facebook", id:lineapp.Facebook.getUid()}}]);
    });

    self.close = function() {
        view.close();
    };

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

lineapp.InLineLinePresenter = lineapp.InLineLinePresenter || function(params) { return (function(params) {

    var DEFAULT_PRICE = 500;

    var self = new lineapp.EventHub();

    var lineManagement = params.lineManagement;

    var view = new lineapp.InLineLineView();

    view.initLines(lineManagement.getLines());

    var onChanged = function(e) {
        var events = e.events;
        _.each(events, function(event) {
            console.log("Handling", event.type);
            switch (event.type) {
                case "join":
                    view.onJoinEvent({person:{id:event.clientId.id, clientId:event.clientId, ask:null, joinTimestamp:event.timestamp}}); 
                    break;
                case "leave":
                    view.onLeaveEvent({person:{id:event.clientId.id, clientId:event.clientId}}); 
                    break;
                case "set_price":
                    view.onSetPriceEvent({person:{id:event.clientId.id, clientId:event.clientId}, amount:event.price.amount}); 
                    break;
                case "swap":
                    view.onSwapEvent({clientId:event.clientId, clientIds:event.clientIds}); 
                    break;
            }
        });
    }

    lineManagement.addEventListener("changed", onChanged);

    view.addEventListener("swap", function(e) {
        self.fireEvent("swap", e);
    });

    self.getView = function() {
        return view;
    };

    self.close = function() {
        lineManagement.removeEventListener("changed", onChanged);
    };
    
	return self;
}(params))};
