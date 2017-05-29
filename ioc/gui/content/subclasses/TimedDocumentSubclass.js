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
            console.log("TimedDocumentSubclass#initTimer", timerParams);
            this.timer.init(timerParams);  
        },

        startTimer: function (timeout, timerParams) {
            console.log("TimedDocumentSubclass#startTimer", timeout);
            if(this.timer){
                this.timer.start(timeout, timerParams);
            }
        },

        refreshTimer: function (timeout, timerParams) {
            console.log("TimedDocumentSubclass#refreshTimer", timeout);
            if(this.timer){
                this.timer.refresh(timeout, timerParams);
            }
        },
        
        stopTimer: function (){
            console.log("TimedDocumentSubclass#stopTimer");
            this.timer.stop();
        },

        cancelTimer: function () {
            // console.log("TimedDocumentSubclass#cancelTimer");
            if(this.timer){
                this.timer.cancel();
            }
        },

        onDestroy: function () {
           // console.log("TimedDocumentSubclass#onDestroy");
            this.cancelTimer();
            this.inherited(arguments);
        },
    });
});
