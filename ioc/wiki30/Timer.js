define([
    'dojo/_base/declare',
    'dojo/Evented'
], function (declare, Evented) {

    var TimerException = function (message) {
        this.message = message;
        this.name = "TimerException"
        console.error(this);
    };

    return declare([Evented], {

        /**
         * @param {{onExpire: function}} args conté un objecte que obligatoriament ha de contenir la duració del temporitzador
         */
        constructor: function (args) {
            //console.log('Timer#constructor:args = ', args);
            if(args){
                this.init(args);
            }
        },
        
        init: function(args){
            this.expired = true;
            declare.safeMixin(this, args);
        },
        
        start: function (timeout, params) {
            this.expired = false;
            if(params){
                this.paramsOnExpire=params;
            }else{
                params = this.paramsOnExpire;
            }            
            this.id = setTimeout(this._onExpire.bind(this), timeout, params);
        },

        _onExpire: function (params) {
            if(this.expired){
                return;
            }
            this.expired = true;
            this.onExpire(params);
            this.emit("Expired");
        },

        /**
         * Aquest mètode s'ha de sobrescribir al constructor
         */
        onExpire: function () {
            throw new TimerException("onExpire function not defined");
        },

        cancel: function (params) {
            if(this.expired){
                return;
            }
            this.stop();
            if(!params){
                params = this.paramsOnCancel;
            }
            this.onCancel(params);
        },

        onCancel: function(){            
        },

        refresh: function (timeout, params) {
            if(params){
                this.paramsOnExpire=params;
            }else{
                params = this.paramsOnExpire;
            }
            clearTimeout(this.id);
            this.start(timeout, params);
        },
        
        isExpired: function(){
            return this.expired;
        },
        
        stop: function(){
            this.expired = true;
            clearTimeout(this.id);            
        }

    });
});