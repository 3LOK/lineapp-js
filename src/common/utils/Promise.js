var utils = utils || {};

utils.Promise = utils.Promise || (function() {
    var resolved = false;
    var callbacks = [];
    var value;

    function checkCallbacks() {
        if (!resolved) return;
        while (callbacks.length > 0) {
            callbacks.pop().apply(this, value);
        }
    };

    this.done = function(callback) {
        callbacks.push(callback);
        checkCallbacks();
        return this;
    };

    this.resolve = function(/* values */) {
        value = _.toArray(arguments);
        resolved = true;
        checkCallbacks();
    };

    this.isResolved = function() {
        return resolved;
    };

    this.getValue = function() {
        return value;
    };

    return this;
});

/*
 * Usage:
 *
 * function f1(promise) { 
 *   do_stuff();
 *   promise.resolve("f1_done");
 * }
 * function f2() {
 *   var myPromise = new utils.Promise();
 *   do_stuff_with_callback(function () {
 *      myPromise.resolve("f2_done");
 *   });
 *   
 *   return myPromise;
 * }
 * when(f1, f2).done(function(f1_value, f2_value) {
 *   console.log(f1_value, f2_value);
 * })
 */
utils.Promise.when = function (/* callbacks... */) {
    var count = arguments.length, resolved = false, subPromises = [],
        promise = new utils.Promise();

    function checkDone() {
        if (resolved) return;
        if (_.all(_.invoke(subPromises, 'isResolved'))) {
            promise.resolve.apply(this,
                _.map(subPromises, function (subPromise) { return subPromise.getValue()[0]; }));
        }
    }
    _.each(arguments, function(callback, index) {
        var subPromise = new utils.Promise().done(checkDone);
        subPromises.push(subPromise);
        var ret = callback(subPromise);
        // If got a promise, pipe it to resolve subPromise
        if (ret instanceof utils.Promise) {
            ret.done(function (value) {
                subPromise.resolve(value);
            });
        }
    });
    return promise;
};
