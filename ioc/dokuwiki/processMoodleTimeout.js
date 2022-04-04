define([
    "ioc/wiki30/Timer",
    "ioc/wiki30/Request"
], function (Timer, Request) {

    var request = new Request();
    var timeout = 60 * 60 * 1000;

    initTimer = function(params) {
        this.timer = {
            refresh: new Timer({onExpire: this._doRefresh.bind(this)})
        };
        this.timer.refresh.expired = true;
        this.timer.refresh.start(timeout, params);
    };

    _doRefresh = function(params) {
        var queryString = getQueryString(params.moodleToken);
        request.urlBase = params.urlBase;
        request.sendRequest(queryString);

        this.timer.refresh.start(timeout);
    };

    getQueryString = function(data) {
        return "moodleToken="+data;
    };

    var ret = function(params) {
        _doRefresh(params);
        initTimer(params);
    };

    return ret;

});
