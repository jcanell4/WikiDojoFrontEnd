define([
    "dojo/_base/declare", // declare
    'dojo/_base/lang',
    "ioc/wiki30/Request",
    "ioc/wiki30/manager/EventObserver"
], function (declare, lang, Request, EventObserver) {
    var ret = declare([EventObserver],
        /**
         * @class RequestControl
         */
        {
            constructor: function (/*String*/ eventToControl,
                                   /*String*/ urlBase,
                                   /*boolean*/ post) {
                this.request = new Request();
                this.request.set("urlBase", urlBase);
                this.post = post;

                if (post) {
                    var self = this;

                    this.request.getPostData = function () {
                        return self.dataToSend;
                    };
                }

                this.id = 'RequestControl#' + eventToControl;

                var eventManager = this.request.dispatcher.getEventManager();
                //eventManager.registerEventForBroadcasting(this, eventToControl, this._sendRequest.bind(this)); // Alerta [Xavi] No cal fer broadcasting, aquest objecte només escolta
                this.registerToEvent(eventManager, eventToControl, this._sendRequest.bind(this));
            },

            _sendRequest: function (data) {
                //console.log('RequestControl#_sendRequest', data);
                this.dataToSend = data.dataToSend;
                this.request.setStandbyId(data.standbyId);

                if (this.post) {
                    this.request.sendRequest();
                } else {
                    this.request.sendRequest(data.dataToSend);
                }
            }
        });
    return ret;
});