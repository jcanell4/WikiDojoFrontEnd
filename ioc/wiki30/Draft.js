/**
 * Una vegada es crea el lock s'enviarà una petició de bloqueig, els timers s'inicialitzaran quan es rebi
 * aquesta petició de bloqueig amb el valor de timeout corresponent enviat des del servidor.
 */
define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/Timer',
    'ioc/gui/CustomDialog'
], function (declare, EventObserver, Timer, CustomDialog) {

    var DraftException = function (message) {
        this.message = message;
        this.name = "DraftException"
    };

    return declare([EventObserver], {


        THROTTLE: 5 * 1000, // Temps en ms mínim per fer un refresc

        constructor: function (dispatcher, contentTool) {
            this.dispatcher = dispatcher;
            this.contentTool = contentTool;
            this.id = contentTool.id;
            this.lastRefresh = Date.now();
            this.timers = {};
            this._init();
        },

        _init: function () {
            console.log("Draft#_init");
            this._registerToEvents();
            this._initTimers();
        },

        save: function () {
            console.log("Draft#save");
            this._doSave();
        },

        _registerToEvents: function () {
            // TODO[Xavi] no cal registrar-se al event manager, hauria de ser suficient registrar-se al contentTool
            console.log("Draft#_registerToEvents");
            this.eventManager = this.dispatcher.getEventManager();
            this.eventManager.registerToEvent(this.eventManager, "document_refreshed_" + this.contentTool.id, this._doRefresh.bind(this));
            this.eventManager.registerToEvent(this.eventManager, "cancel_" + this.contentTool.id, this.destroy.bind(this));
        },

        _doSave: function () {
            console.log('Draft#_doSave');
            this.lastRefresh = Date.now();

            var dataToSend = this._getQueryDraft();

            this.eventManager.dispatchEvent("save_draft", {
                id: this.id,
                dataToSend: dataToSend
            });
        },

        _getQueryDraft: function () {
            console.log('Draft#_getQueryDraft');
            var dataToSend = {
                id: this.contentTool.ns,
                do: 'save_draft',
                draft: JSON.stringify(this.contentTool.generateDraft())
            };


            return dataToSend;
        },

        _doRefresh: function () {
            console.log('Draft#_doRefresh');

            var now = Date.now(),
                elapsedTime = now - this.lastRefresh;

            if (elapsedTime >= this.THROTTLE) {
                this._doSave();
            } else {
                console.log('Throttle!)');
                this._setPendingRefresh(this.THROTTLE - elapsedTime + 1);
            }

        },

        _setPendingRefresh: function (timeout) {
            console.log('Draft#_setPendingRefresh', timeout);

            if (this.timers.refresh.expired) {
                this.timers.refresh.start(timeout);
            } else {
                //console.log('No ha expirat, hi ha un refresc en funcionament');
            }
        },

        _initTimers: function () {
            console.log('Draft#_initTimers');
            this.timers = {
                refresh: new Timer({onExpire: this._doRefresh.bind(this)})
            };
            this.timers.refresh.expired = true;
        },

        _cancelTimers: function () {
            console.log('Draft#_cancelTimers', this.timers);
            for (var timer in this.timers) {
                this.timers[timer].cancel();
            }
        },

        destroy: function () {
            this.onDestroy();

        },

        onDestroy: function () {
            console.log("Draft#onDestroy");
            this._cancelTimers();
            this.eventManager.unregisterFromEvent("document_refreshed_" + this.contentTool.id);
            this.eventManager.unregisterFromEvent("cancel_" + this.contentTool.id);
            this.dispatchEvent("destroyed", {id: this.id});
        }

    });

});