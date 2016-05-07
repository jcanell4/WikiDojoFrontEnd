/**
 * Una vegada es crea el lock s'enviarà una petició de bloqueig, els timers s'inicialitzaran quan es rebi
 * aquesta petició de bloqueig amb el valor de timeout corresponent enviat des del servidor.
 */
define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/Timer'
], function (declare, EventObserver, Timer) {

    return declare([EventObserver], {


        AUTOSAVE_LOCAL: 1 * 1000, // Temps en ms mínim per fer un refresc
        WARNING_DIFF: 60 * 1000, // El warning es mostra aquest nombre de ms abans del timeout

        constructor: function (dispatcher, id, ns, showDialogs) {
            this.dispatcher = dispatcher;
            this.eventManager = this.dispatcher.getEventManager();
            this.dialogManager = this.dispatcher.getDialogManager();


            this.id = id;
            this.ns = ns;
            this.lastRefresh = Date.now();
            this.dialogs = {};
            this.timers = {};
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
            //console.log("Lock#unlock");
            this._doUnlock();
        },

        refresh: function (timeout) {
            this._doRefresh(timeout);
        },


        update: function (timeout) {
            //console.log('Lock#update', timeout);
            this._refreshTimers(timeout);
        },

        _registerToEvents: function () {
            //console.log("Lock#_registerToEvents");

            this.eventManager.registerToEvent(this, this.eventNameCompound.LOCK + this.id, this._doLock.bind(this));
            this.eventManager.registerToEvent(this, this.eventNameCompound.UNLOCK + this.id, this._doUnlockAndCancelDocument.bind(this));

            this.eventManager.registerToEvent(this.eventManager, this.eventNameCompound.DOCUMENT_REFRESHED + this.id, this._doRefresh.bind(this));
            this.eventManager.registerToEvent(this.eventManager, this.eventNameCompound.LOCK + this.id, this._doLock.bind(this));
        },


        _doLock: function () {
            //console.log('Lock#_doLock', this.id);
            this.lastRefresh = Date.now(); // ALERTA[Xavi] Això no s'està controlat quan es fa click al dialog
            var dataToSend = this._getQueryLock();

            this.eventManager.dispatchEvent(this.eventName.LOCK_DOCUMENT, {
                id: this.id, // TODO: determinar si aquesta id es correcta o s'ha d'afegir algun prefix, per exemple lock_
                dataToSend: dataToSend
            });
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

            return dataToSend;
        },

        _doUnlockAndCancelDocument: function () {
            //console.log("Lock#_doUnlockAndCancelDocument");
            this._doUnlock();
            this._doCancelDocument();
        },

        /**
         * S'ha de controlar si el document ja s'ha desbloquejat perquè pot ser que es demani fer un unlock per un document que no estigui bloquejat, per exemple en el cas de passar entre vistes d'un mateix document
         * @private
         */
        _doUnlock: function () {
            //console.log("Lock#_doUnlock");
            this.destroy();
        },

        // Alerta[Xavi] data no es fa servir per a res, però podria utilitzar-se a les subclasses
        _getQueryUnlock: function () {
            return 'do=unlock&id=' + this.ns;
        },

        _getQueryCancel: function () {
            return {
                id: this.id,
                name: 'cancel_' + this.id,
                discardChanges: true,
                keep_draft: true
            }
        },

        _doRefresh: function () {
            //console.log('Lock#_doRefresh');

            var now = Date.now(),
                elapsedTime = now - this.lastRefresh;

            if (elapsedTime >= this.AUTOSAVE_LOCAL) {
                this._doLock();
            } else {
                //console.log('Throttle!)');
                this._setPendingRefresh(this.AUTOSAVE_LOCAL - elapsedTime + 1);
            }

        },

        _setPendingRefresh: function (timeout) {
            //console.log('Lock#_setPendingRefresh', timeout);

            if (this.timers.refresh.expired) {
                this.timers.refresh.start(timeout);
            } else {
                //console.log('No ha expirat, hi ha un refresc en funcionament');
            }
        },

        _initTimers: function () {
            //console.log('Lock#_initTimers');
            this.timers = {
                warning: new Timer({onExpire: this._showWarningDialog.bind(this)}),
                refresh: new Timer({onExpire: this._doRefresh.bind(this)})
            };
            this.timers.refresh.expired = true;
        },

        _refreshTimers: function (timeout) {
            //console.log('Lock#_refreshTimers', timeout);
            this.timers.warning.refresh(timeout - this.WARNING_DIFF);
        },

        _cancelTimers: function () {
            //console.log('Lock#_cancelTimers', this.timers);
            for (var timer in this.timers) {
                this.timers[timer].cancel();
            }
        },

        // TODO[Xavi] Localitzar els texts
        // Encara que es faci el destroyRecursive, el dialog anterior continua existint perquè es guarda una referencia en aquesta propietat. Si es visible llavors no farem res, i si no ho es crearem un de nou que elimina la referencia a l'antic al mateix temps
        _showWarningDialog: function () {

            //var timeout = 5000; // ALERTA[Xavi] Valor per fer proves

            var alertParams = {
                id: 'timeout_' + this.id,
                message: 'El bloqueig ha expirat i ha sigut alliberat. Si havien canvis al document es conservan com a esborrany, i poden ser recuperats la proxima vegada que editis el document.',
                title: 'El bloqueig ha expirat'
            };

            var infoDialog = this.dialogManager.getDialog(this.dialogManager.type.INFO, this.id, alertParams);

            var dialogParams = {
                id: 'warning',
                ns: this.ns,
                //timeout: timeout,
                timeout: this.WARNING_DIFF,
                title: 'El temps de bloqueig es a punt d\'exhaurir-se',
                message: 'El temps de bloqueig del document es a punt d\'exhaurirse\nVols mantenir el bloqueig o alliberar-lo (es conservarà l\'esborrany)?',
                infoDialog: infoDialog,
                buttons: [
                    {
                        id: 'refrescar-bloqueig',
                        description: 'Refrescar bloqueig',

                        extra: {
                            eventType: this.eventName.LOCK_DOCUMENT,
                            dataToSend: this._getQueryLock()
                        }
                    },
                    {
                        id: 'alliberar-document',
                        description: 'Alliberar el document',
                        extra: [
                            {
                                eventType: this.eventName.UNLOCK_DOCUMENT,
                                dataToSend: this._getQueryUnlock()
                            },
                            {
                                eventType: this.eventNameCompound.CANCEL + this.id,
                                dataToSend: this._getQueryCancel()
                            }
                        ]
                    }

                ]
            };

            this.dialogs.warning = this.dialogManager.getDialog(this.dialogManager.type.LOCK_WARNING, this.id, dialogParams);
            this.dialogs.warning.show();
        },

        _doCancelDocument: function () {
            //console.log("Lock#_doCancelDocument");
            this.eventManager.dispatchEvent(this.eventNameCompound.CANCEL + this.id, {
                id: this.id,
                name: 'cancel_' + this.id,
                discardChanges: true,
                keep_draft: true
            });
        },

        destroy: function () {
            this.onDestroy();

        },

        onDestroy: function () {
            //console.log("Lock#onDestroy");
            this._cancelTimers();
            this.eventManager.unregisterFromEvent(this.eventNameCompound.LOCK + this.id);
            this.eventManager.unregisterFromEvent(this.eventNameCompound.UNLOCK + this.id);
            this.eventManager.unregisterFromEvent(this.eventNameCompound.DOCUMENT_REFRESHED + this.id);
            this.dispatchEvent(this.eventName.DESTROY, {id: this.id});
        }

    });

});