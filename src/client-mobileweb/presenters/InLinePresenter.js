var lineapp = lineapp || {};

lineapp.InLinePresenter = lineapp.InLinePresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var lineManagement = params.lineManagement;

    /*
    var me = _.chain(lineManagement.getLines()).flatten().find(function(position) {
        return position.id === lineapp.Facebook.getUid();
    }).value();

    consonle.log(me);
   */

    var config = new lineapp.InLineConfigPresenter({lineManagement:lineManagement});
    var line = new lineapp.InLineLinePresenter({lineManagement:lineManagement});

    var view = new lineapp.InLineView();

    view.addConfigView(config.getView());
    view.addLineView(line.getView());

    config.addEventListener("leave", function() {
        self.fireEvent("leave");
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
                    view.onJoinEvent({person:{id:event.clientId.id, ask:DEFAULT_PRICE, joinTimestamp:event.timestamp}}); 
                    break;
                case "leave":
                    view.onLeaveEvent({person:{id:event.clientId.id}}); 
                    break;
                case "set_price":
                    view.onSetPriceEvent({person:{id:event.clientId.id}, amount:event.price.amount}); 
                    break;
            }
        });
    }

    lineManagement.addEventListener("changed", onChanged);

    self.getView = function() {
        return view;
    };

    self.close = function() {
        lineManagement.removeEventListener("changed", onChanged);
    };
    
	return self;
}(params))};
