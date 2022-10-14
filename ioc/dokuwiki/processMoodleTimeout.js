define([
    "ioc/wiki30/Timer",
    "ioc/wiki30/Request",
    'ioc/wiki30/manager/StorageManager'
], function (Timer, Request, storageManager) {

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
    
    _setMoodleToken = function(token) {
        var login = storageManager.getObject('login', storageManager.type.LOCAL);
        login['moodleToken'] = token;
        storageManager.setObject('login', login, storageManager.type.LOCAL);
    };

    var ret = function(params) {
        initTimer(params);
        _setMoodleToken(params.moodleToken);
    };

    return ret;

});

