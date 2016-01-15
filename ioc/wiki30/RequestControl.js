define([
    "dojo/_base/declare", // declare
    'dojo/_base/lang',
    "ioc/wiki30/Request",
    "ioc/wiki30/manager/EventObserver"
], function (declare, lang, Request, EventObserver) {
    var ret = declare(null,
        /**
         * @class RequestControl
         */
        {
            constructor: function (/*String*/ eventToControl, 
                                    /*String*/ urlBase,
                                    /*boolean*/ post) {
               this.EventObserver = new EventObserver();
               this.request = new Request();
               this.request.set("urlBase", urlBase);
               this.post = post;
               if(post){
                   var self = this;
                   this.request.getPostData = function(){
                       return self.dataToSend;
                   };
               }
            },
            
            sendRequest: function(dataTosend, standbyId){
                this.dataToSend = dataTosend;
                this.request.setStandbyId(standbyId);
                if(this.post){
                    this.request.sendRequest();
                }
                
            }
        });
    return ret;
});