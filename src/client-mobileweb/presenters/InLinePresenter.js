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

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};

lineapp.InLineLinePresenter = lineapp.InLineLinePresenter || function(params) { return (function(params) {

    var self = new lineapp.EventHub();

    var lineManagement = params.lineManagement;

    var view = new lineapp.InLineLineView();

    view.initLines(lineManagement.getLines());

    self.getView = function() {
        return view;
    };
    
	return self;
}(params))};
