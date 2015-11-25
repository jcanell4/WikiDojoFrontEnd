define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dijit/Dialog',
    "dojo/dom",
    "dojo/on"
], function (declare, lang, Dialog, dom, on) {

    return declare(null,
        /**
         * Classe per gestionar els temporitzadors de bloqueig dels documents
         *
         * @class Locktimer
         * @author Xavier García <xaviergaro.dev@gmail.com>
         */
        {

            /** @type int nombre de segons per fer un guardat automàtic del esborrany en segons, es el mateix per totes les instancies*/
            draftAutosave: 1,

            /** @type int */
            timeout: null,

            /** @type int */
            timeoutWarning: null,

            /** @type bool */
            draft: null,

            /** @type int */
            timerID: null,

            /** @type int */
            timerTimeoutID: null,

            /** @type int */
            timerRefreshID: null,


            /** @type Date @deprecated no es fa servir, em canviat el sistema*/
            lasttime: null,

            /** @type string */
            msg: null,

            /** @type string */
            docId: null,

            /** @type string */
            pageid: null,

            /** @type ContentTool */
            contentTool: null,

            /** @type Dispatcher */
            dispatcher: null,

            /** @type bool */
            showingDialog: null,

            /** @type bool */
            changesDetected: null,

            /** @type Dialog */
            continueDialog: null,

            /** @type Dialog */
            timeoutDialog: null,

            /** @type int diferencia real entre el timer enviat per la dokuwiki pel warning i el desbloqueig,
             * temps en segons */
            REAL_TIMEOUT_DIFF: 60,

            /** @type int temps entre auto saves del esborrany, temps en segons */
            AUTOSAVE_TIME: 1,

            constructor: function (docId, dispatcher) {
                this.docId = docId;
                this.dispatcher = dispatcher;
                this.timeout = 0;
                this.draft = false;
                this.msg = { // TODO[Xavi] Pendent de canviar, el missatge el passarem per paràmetre
                    continue: LANG.template['ioc-template'].willexpire1 + "<b>" + docId + "</b>" + LANG.template['ioc-template'].willexpire2,
                    timeout: LANG.template['ioc-template'].lock_timeout
                };
                this.pageid = '';
                this.contentTool = this.dispatcher.getContentCache(this.docId).getMainContentTool();

                this.changesDetected = false;

                this.stop = false;
            },


            /**
             * Initialize the lock timer
             *
             * @param {int}    timeout Length of timeout in seconds
             * @param {bool}   draft   Whether to save drafts
             */
            init: function (timeout, draft) {

                // Init values
                //this.timeoutWarning = timeout * 1000;
                //this.timeout = (timeout + this.REAL_TIMEOUT_DIFF) * 1000;

                // TEST Values
                this.timeoutWarning = timeout * 100;
                this.timeout = (timeout + this.REAL_TIMEOUT_DIFF) * 100;


                //console.log("Warning: ", this.timeoutWarning);
                //console.log("Timeout: ", this.timeout);


                this.draft = draft;

                // TODO[xavi] En lloc d'agafar la referencia pel jQuery que pot ser erronia establim la del docId
                this.pageid = this.docId;

                this.timersID = {};
                this.dialogs = {};

                this.reset();

                this.contentTool.registerObserverToEvent("document_changed", lang.hitch(this, this.refreshNeeded));
                this.contentTool.registerObserverToEvent("document_changes_reset", lang.hitch(this, this.refreshReset));
                this.contentTool.registerObserverToEvent("destroy", lang.hitch(this, this.destroy));

            },

            refreshed: function (timeout) {
                //console.log("Locktimer#refresh",timeout);
                    // Init values
                    //this.timeoutWarning = timeout * 1000;
                    //this.timeout = (timeout + this.REAL_TIMEOUT_DIFF) * 1000;

                    // TEST Values
                    this.timeoutWarning = timeout * 100;
                    this.timeout = (timeout + this.REAL_TIMEOUT_DIFF) * 200;

                this.reset();
            },

            /**
             * (Re)start the warning timer
             */
            reset: function () {
                //console.log("Locktimer#reset", this.stop);

                this.clear();

                if (!this.stop) {
                    this._initWarningTimer();
                    this._initTimeoutTimer();
                    this._initRefreshTimer();
                }
            },

            /**
             * Display the warning about the expiring lock
             */
            warning: function (context) {

                context.msg.continue = context.msg.continue.replace("\\n", "<br>");

                context._generateDialogWarning();

            },


            refreshNeeded: function () {
                this.refreshTimer = true;
            },

            refreshReset: function () {
                this.refreshTimer = false;
            },

            /**
             * Refresh the lock via AJAX
             *
             * Called on keypresses in the edit area
             */
            refresh: function () {

                // Refresca només si hi han canvis
                if (!this.refreshTimer) {
                    return;
                }

                this.refreshTimer = false;

                this.contentTool.requester.urlBase = 'lib/plugins/ajaxcommand/ajax.php?call=lock';
                var query = '&do=lock'
                    + '&id=' + this.contentTool.id;

                this.contentTool.requester.sendRequest(query);
            },

            cancelEditing: function (keepDraft) {
                this.contentTool.forceReset(); // Així evitem que demani si volen guardar-se els canvis
                //this.contentTool.discardChanges(); // Així evitem que demani si volen guardar-se els canvis
                this.clear();

                var requester;

                // TODO[Xavi] Aquest bloc de codi està repetit al DiffDialog
                require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                    requester = new Request();

                    requester.updateSectok = function (sectok) {
                        this.sectok = sectok;
                    };

                    requester.sectok = requester.dispatcher.getSectok();
                    requester.dispatcher.toUpdateSectok.push(requester);
                }));

                requester.urlBase = DOKU_BASE + 'lib/plugins/ajaxcommand/ajax.php?call=cancel&id=' + this.contentTool.ns;


                if (keepDraft) {
                    requester.urlBase += '&keep_draft=true';
                }

                requester.setStandbyId(this.dispatcher.containerNodeId);
                requester.sendRequest();

            },

            timersID: null,

            _initRefreshTimer: function () {
                //console.log("Refresh Timer iniciat:", this);
                // Guardem la referencia del timer
                this.timersID.refresh = window.setInterval(lang.hitch(this, this.refresh), 1000 * this.AUTOSAVE_TIME);
                // L'activem

            },

            _initWarningTimer: function () {
                //console.log("Warning Timer iniciat:", this);
                // Guardem la referencia del timer
                // L'activem
                this.timersID.warning = window.setTimeout(this.warning, this.timeoutWarning, this);
            },

            _initTimeoutTimer: function () {
                //console.log("Timeout Timer iniciat:", this);
                 //Guardem la referencia del timer
                // L'activem

                var self = this;

                this.timersID.timeout = window.setTimeout(function () {
                    self.clear();
                    self._generateDialogTimeout();


                }, this.timeout);


            },

            _generateDialogTimeout: function () {
                var that = this;

                this.dialogs.timeout = new Dialog({
                    title: "Temps d'espera esgotat",
                    content: that.msg.timeout
                    + "<div class=\"dijitDialogPaneActionBar\">"
                    + "<button data-dojo-type=\"dijit/form/Button\" type=\"button\" id=\"ok-confirmation-" + this.docId + "\">Ok</button>"
                    + "</div>",
                    style: "width: 300px",
                    closable: false,

                    startup: function () {
                        var okBtn = dom.byId("ok-confirmation-" + that.docId);

                        that.cancelEditing(true);

                        on(okBtn, 'click',
                            function (e) {
                                that._cancelDialog('timeout');
                                //this.destroyRecursive();
                            });
                    }
                });

                this.dialogs.timeout.show();
            },

            _generateDialogWarning: function () {
                var self = this;

                this.dialogs.warning = new Dialog({
                    title: "Continuar editant?",
                    content: self.msg.continue
                    + "<div class=\"dijitDialogPaneActionBar\">"
                    + "<button data-dojo-type=\"dijit/form/Button\" type=\"button\" id=\"save-confirmation-" + self.docId + "\">desar</button>"
                    + "<button data-dojo-type=\"dijit/form/Button\" type=\"button\" id=\"discard-confirmation-" + self.docId + "\">descartar</button>",
                    style: "width: 300px"
                    + "</div>",

                    startup: function () {

                        var saveBtn = dom.byId("save-confirmation-" + self.docId),
                            cancelBtn = dom.byId("discard-confirmation-" + self.docId);

                        on(saveBtn, 'click',
                            function () {
                                self.refreshNeeded();
                                self.refresh();
                                //self.reset();
                                //self._cancelDialog('warning');

                            });

                        on(cancelBtn, 'click',
                            function () {
                                self.clear();
                                self.cancelEditing(false);
                                //self._cancelDialog('warning');
                            });

                    },

                    closable: false


                });

                this.dialogs.warning.show();


            },


            _cancelDialog: function (dialog) {
                //console.log("Locktimer#_cancelDialog", dialog);
                if (this.dialogs[dialog]) {
                    if (this.dialogs[dialog] != null) {
                        this.dialogs[dialog].destroyRecursive();
                        this.dialogs[dialog] = null;
                    }
                }
            },

            /**
             * Remove the current warning timer
             */
            clear: function (timerName) {
                //console.log("Locktimer#clear", timerName);

                var clearTimersIDs;

                if (timerName) {
                    clearTimersIDs = {};
                    clearTimersIDs[timerName] = this.timersID[timerName];
                } else {
                    clearTimersIDs = this.timersID;
                }

                this._cancelDialog('warning');

                for (var timerID in clearTimersIDs) {

                    //console.log("Esborrant timer: ", timerID);
                    if (this.timersID[timerID] != null) {
                        window.clearTimeout(this.timersID[timerID]); // Comprovar si per l'interval cal window.clearInterval();
                        this.timersID[timerID] = null;
                    }

                }
            },

            destroy: function () {
                this.stop = true;

                this.clear();
                if (this.dialogs.warning !== null) {
                    this._cancelDialog('warning');
                }

            }

        });


});


