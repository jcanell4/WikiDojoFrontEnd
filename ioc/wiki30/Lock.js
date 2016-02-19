/**
 * Una vegada es crea el lock s'enviarà una petició de bloqueig, els timers s'inicialitzaran quan es rebi
 * aquesta petició de bloqueig amb el valor de timeout corresponent enviat des del servidor.
 */
define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/Timer',
], function (declare, EventObserver, Timer) {

    return declare([EventObserver], {

        timers: {},

        THROTTLE: 1 * 1000, // Temps en ms mínim per fer un refresc
        WARNING_DIFF: 5 * 1000, // El warning es mostra aquest nombre de ms abans del timeout

        constructor: function (dispatcher, id, ns) {
            this.dispatcher = dispatcher;
            this.id = id;
            this.ns = ns;
            this.lastRefresh = Date.now();
            this._init();
        },

        _init: function () {
            this._registerToEvents();
            this._initTimers();
            this.lock();
        },

        lock: function () {
            this._doLock();
        },

        unlock: function () {
            this._doUnlock();
        },

        refresh: function (timeout) {
            this._doRefresh(timeout);
        },


        update: function (timeout) {
            console.log('Lock#update', timeout);
            this._refreshTimers(timeout);
        },

        _registerToEvents: function () {
            this.eventManager = this.dispatcher.getEventManager();

            this.eventManager.registerEventForBroadcasting(this, "lock_" + this.id, this._doLock.bind(this));
            this.eventManager.registerEventForBroadcasting(this, "unlock_" + this.id, this._doUnlock.bind(this));

            // TODO[Xavi] aquest ha de ser un enregistrament normal, no de broadcasting
            //this.eventManager.registerEventForBroadcasting(this, "refesh_lock_" + this.id, this._doRefresh.bind(this));
            this.eventManager.registerToEvent(this.eventManager, "documet_changed_" + this.id, this._doRefresh.bind(this));
        },


        _doLock: function () {
            //console.error('Lock#_doLock');
            this.lastRefresh = Date.now();
            var dataToSend = this._getQueryLock();

            this.eventManager.dispatchEvent("lock_document", {
                id: this.id, // TODO: determinar si aquesta id es correcta o s'ha d'afegir algun prefix, per exemple lock_
                dataToSend: dataToSend
            })
        },

        /**
         *
         * @returns {{id: string, do: string}}
         * @protected
         */
        _getQueryLock: function () {
            //console.log('Lock#_getQueryLock');
            var dataToSend = {
                id: this.ns, //this.contentTool.ns,
                do: 'lock'
            };

            // TODO[Xavi] El draft s'ha d'enviar per una altre banda independent del lock
            //if (data && data.draft) {
            //    //var draftQuery = this.contentTool.generateDraft();
            //    dataToSend.draft = JSON.stringify(data.draft);
            //}

            console.log('Lock#_getQueryLock data to send:', dataToSend);

            return dataToSend;
        },

        _doUnlock: function () {
            //console.log("Lock#_doUnlock");

            // Envia petició de desbloqueig al servidor
            this.eventManager.dispatchEvent('unlock_document', this._getQueryUnlock());
            this._cancelTimers();
        },


        // Alerta[Xavi] data no es fa servir per a res, però podria utilitzar-se a les subclasses
        _getQueryUnlock: function () {
            return {
                id: this.id,
                dataToSend: 'do=unlock&id=' + this.ns
            }

        },

        _doRefresh: function (timeout) {
            console.log('Lock#_doRefresh', timeout);
            //d'aquest no cal fer el getQuery perquè en realitat es tracta d'un Lock
            var now = Date.now(),
                elapsedTime = now - this.lastRefresh;

            if (elapsedTime >= this.THROTTLE) { // En aquest punt el timer sempre ha de haver-se exahurit
                //this._refreshTimers(timeout);
                this._doLock();
                //this.timers.refresh.cancel(); // TODO[Xavi] això no ha de fer falta
            } else {
                console.log('Throttle!)');
                this._setPendingRefresh(this.THROTTLE - elapsedTime);
            }

        },

        _setPendingRefresh: function (timeout) {
            console.log('Lock#_setPendingRefresh', timeout);
            if (this.timers.refresh.expired) {
                this.timers.refresh.start(timeout); //TODO[Xavi] fem serir el params en algun moment pels locks?
            } else {
                console.log('No ha expirat, hi ha un refresc en funcionament');
            }
        },

        _initTimers: function () {
            //console.log('Lock#_initTimers');
            this.timers = {
                warning: new Timer({onExpire: this._showWarningDialog.bind(this)}), // TODO[Xavi] segurament cal afegir el bind
                timeout: new Timer({onExpire: this._showTimeoutDialog.bind(this)}), // TODO[Xavi] segurament cal afegir el bind
                refresh: new Timer({onExpire: this._doRefresh.bind(this)})
            };
            this.timers.refresh.expired = true;
        },

        _refreshTimers: function (timeout) {
            console.log('Lock#_refresthTimers', timeout);
            this.timers.warning.refresh(timeout - this.WARNING_DIFF);
            this.timers.timeout.refresh(timeout);
        },

        _cancelTimers: function () {
            //console.log('Lock#_cancelTimers', this.timers);
            for (var timer in this.timers) {
                this.timers[timer].cancel();
            }
        },

        _showWarningDialog: function () {
            alert("Warning!");

        },

        _showTimeoutDialog: function () {
            this._doUnlock();
            this._doCancel();
            alert("Timeout!");

        },

        _doCancel: function () {
            this.eventManager.dispatchEvent("cancel_" + this.id, {
                id: this.id,
                name: 'cancel_' + this.id,
                discardChanges: true
            });
        }

    });

});