define([
    'dojo/_base/declare' ,
    'ioc/wiki30/Timer'
], function (declare, Timer) {

    return declare([], {

        constructor: function (args) {
            if(args.timer && args.timer.instance){
                this.timer = args.timer.instance;
            }else{
                this.timer = new Timer();
            }
        },
        
        initTimer: function(timerParams){
            //console.log("TimedDocumentSubclass#initTimer", timerParams);
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
        
        stopTimer: function (){
            if(this.timer){
                this.timer.stop();
            }
        },

        cancelTimer: function () {
            if(this.timer){
                this.timer.cancel();
            }
        },

        onDestroy: function () {
            this.cancelTimer();
            this.inherited(arguments);
        }
    });
});
