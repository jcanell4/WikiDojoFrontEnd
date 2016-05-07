define([
    'dojo/_base/declare'
], function (declare) {

    var TimerException = function (message) {
        this.message = message;
        this.name = "TimerException"
    };

    return declare(null, {

        // args conté un objecte que obligatoriament ha de contenir la duració del temporitzador
        /**
         *
         * @param {{onExpire: function}} args
         */
        constructor: function (args) {
            declare.safeMixin(this, args);
            this.expired = false;
        },

        start: function (timeout, params) {
            //console.log('Timer#start', timeout, params);
            this.expired = false;
            this.id = setTimeout(this._onExpire.bind(this), timeout, params);
        },

        _onExpire: function (params) {
            //console.log("Timer#_onExpire", params);
            this.expired = true;
            this.onExpire(params)
        },

        /**
         * Aquest mètode s'ha de sobrescribir al constructor
         */
        onExpire: function () {
            throw new TimerException("onExpire function not defined");
        },

        cancel: function () {
            //console.log('Timer#cancel', this.id);
            this.expired = false;
            clearTimeout(this.id);
        },

        refresh: function (timeout, params) {
            console.log('Timer#refresh', timeout, params);
            this.cancel();
            this.start(timeout, params);
        }

    });
});