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
    
    return declare([EventObserver], {


        AUTOSAVE_LOCAL: 1 * 1000, // Temps en ms mínim per fer un refresc
        WARNING_DIFF: 60 * 1000, // El warning es mostra aquest nombre de ms abans del timeout

        constructor: function (dispatcher, id, ns, showDialogs) {
            this.dispatcher = dispatcher;
            this.id = id;
            this.ns = ns;
            this.lastRefresh = Date.now();
            this.dialogs = {};
            this.timers = {};
            this._init();
            this.showDialogs = (showDialogs !== false);  // Per defecte es sempre true
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
            this.eventManager = this.dispatcher.getEventManager();

            this.eventManager.registerToEvent(this, this.eventNameCompound.LOCK + this.id, this._doLock.bind(this));
            this.eventManager.registerToEvent(this, this.eventNameCompound.UNLOCK + this.id, this._doUnlockAndCancelDocument.bind(this));

            this.eventManager.registerToEvent(this.eventManager, this.eventNameCompound.DOCUMENT_REFRESHED + this.id, this._doRefresh.bind(this));
        },


        _doLock: function () {
            //console.log('Lock#_doLock', this.id);
            this.lastRefresh = Date.now();
            var dataToSend = this._getQueryDraft();

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
        _getQueryDraft: function () {
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

            // Envia petició de desbloqueig al servidor
            this.eventManager.dispatchEvent(this.eventName.UNLOCK_DOCUMENT, this._getQueryUnlock());
            this.destroy();
        },

        // Alerta[Xavi] data no es fa servir per a res, però podria utilitzar-se a les subclasses
        _getQueryUnlock: function () {
            return {
                id: this.id,
                dataToSend: 'do=unlock&id=' + this.ns
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
                warning: new Timer({onExpire: this._showWarningDialog.bind(this)}), // TODO[Xavi] segurament cal afegir el bind
                timeout: new Timer({onExpire: this._showTimeoutDialog.bind(this)}), // TODO[Xavi] segurament cal afegir el bind
                refresh: new Timer({onExpire: this._doRefresh.bind(this)})
            };
            this.timers.refresh.expired = true;
        },

        _refreshTimers: function (timeout) {
            //console.log('Lock#_refreshTimers', timeout);
            this.timers.warning.refresh(timeout - this.WARNING_DIFF);
            this.timers.timeout.refresh(timeout);
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

            // TODO[Xavi] Si el timeout a expirat aquest dialog no es mostrarà
            if (!this.showDialogs || this.timers.timeout.expired) { // TODO[Xavi] Mètode ràpid per afegir la opció de no mostrar els dialegs
                return;
            }

            if (!this.dialogs.warning || !this.dialogs.warning.isShowing) {
                this.dialogs.warning = new CustomDialog({
                    id: 'warning_' + this.id,
                    content: 'El temps de bloqueig del document es a punt d\'exhaurirse\nVolds mantenir el bloqueig o alliberar-lo (es conservarà l\'esborrany)?',
                    title: 'El temps de bloqueig es a punt d\'exhaurir-se',
                    closable: false,
                    buttons: [
                        {
                            id: 'refrescar-bloqueig',
                            description: 'Refrescar bloqueig',
                            callback: function () {
                                this._doLock();
                            }.bind(this)
                        },
                        {
                            id: 'alliberar-document',
                            description: 'Alliberar el document',
                            callback: function () {
                                this._doUnlockAndCancelDocument();
                            }.bind(this)
                        }

                    ]
                });

                this.dialogs.warning.show();
            }


        },

        // TODO[Xavi] Localitzar els textos. Duplicat practicament igual al gestor del DiffDialog
        _showTimeoutDialog: function () {

            this._doUnlockAndCancelDocument(); // TODO[Xavi] Això no permet generalitzar

            if (!this.showDialogs) { // TODO[Xavi] Mètode ràpid per afegir la opció de no mostrar els dialegs
                return;
            }

            this.dialogs.timeout = new CustomDialog({
                id: 'timeout_' + this.id,
                content: 'El bloqueig ha expirat i ha sigut alliberat. Si havien canvis al document es conservan com a esborrany, i poden ser recuperats la proxima vegada que editis el document.',
                title: 'El bloqueig ha expirat',
                closable: true,
                buttons: [
                    {
                        id: 'acceptar',
                        description: 'Acceptar',
                        callback: function () {
                            this._cancelDialogs();
                        }.bind(this)
                    }
                ]
            });

            this.dialogs.timeout.show();
        },

        _cancelDialogs: function () {

            for (var dialog in this.dialogs) {
                this._cancelDialog(dialog);
            }
            this.dialogs = {};
        },

        _cancelDialog: function (dialog) {
            if (this.dialogs[dialog]) {
                this.dialogs[dialog].remove();
            }
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
            this._cancelDialog('warning');
            this.eventManager.unregisterFromEvent(this.eventNameCompound.LOCK + this.id);
            this.eventManager.unregisterFromEvent(this.eventNameCompound.UNLOCK + this.id);
            this.eventManager.unregisterFromEvent(this.eventNameCompound.DOCUMENT_REFRESHED + this.id);
            this.dispatchEvent(this.eventName.DESTROY, {id: this.id});
        },

        setDialogVisibility: function (showDialogs) {
            this.showDialogs = (showDialogs !== false);
        }

    });

});