define([
    'dojo/_base/declare' ,
    'ioc/wiki30/Timer'
], function (declare, Timer) {

//    var TimedDocumentSubclassException = function (message) {
//        this.message = message;
//        this.name = "TimedDocumentSubclassException"
//    };

    return declare([], {

        constructor: function (args) {
            if(args.timer && args.timer.instance){
                this.timer = args.timer.instance;
            }else{
                this.timer = new Timer();
            }
        },
        
        initTimer: function(timerParams){
            this.timer.init(timerParams);  
        },

        startTimer: function (timeout, timerParams) {
            if(this.timer){
                this.timer.start(timeout, timerParams);
            }
        },

        refreshTimer: function (timeout, timerParams) {
            if(this.timer){
                this.timer.refresh(timeout, timerParams);
            }
        },

        cancelTimer: function () {
            if(this.timer){
                this.timer.cancel();
            }
        },

        onDestroy: function () {
            console.log("LocktimedDocumentSubclass#onDestroy");
            this.cancelTimer();
            this.inherited(arguments);
        },
    });
});
