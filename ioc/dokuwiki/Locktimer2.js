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

            /** @type int temps en milisegond del últim update*/
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
            WARNING_TIMER: 60,

            /** @type int temps entre auto saves del esborrany, temps en segons */
            AUTOSAVE_TIME: 1,


            constructor: function (docId, dispatcher, contentTool) {
                this.docId = docId;
                this.dispatcher = dispatcher;
                this.timeout = 0;
                this.draft = false;
                this.msg = { // TODO[Xavi] Pendent de canviar, el missatge el passarem per paràmetre
                    continue: LANG.template['ioc-template'].willexpire1 + "<b>" + docId + "</b>" + LANG.template['ioc-template'].willexpire2,
                    timeout: LANG.template['ioc-template'].lock_timeout
                };
                this.pageid = '';

                this.contentTool = contentTool;
                //this.contentTool = this.dispatcher.getContentCache(this.docId).getMainContentTool();

                this.changesDetected = false;

                this.stop = false;
            },


            init: function (draft) {


                this.draft = draft;

                this.pageid = this.docId;

                this.timersID = {};
                this.dialogs = {};

                this.lasttime = Date.now();
                this.contentTool.registerObserverToEvent("document_changed", lang.hitch(this, this.refreshNeeded));
                this.contentTool.registerObserverToEvent("destroy", lang.hitch(this, this.destroy));

                if (this.timeout) {
                    this.reset();
                } else {
                    this.lock(false);
                }

            },

            refreshed: function (timeout) {
                if ((!timeout && !this.inTime()) || timeout < 0) {
                    this._timeout(this);
                } else if (!timeout) {
                    this.reset();
                } else {
                    this.timeout = timeout * 1000;
                    this.timeoutWarning = (timeout - this.WARNING_TIMER) * 1000;
                    this.reset();

                }
            },

            inTime: function () {
                return this.lasttime + this.timeout >= Date.now()
            },

            /**
             * (Re)start the warning timer
             */
            reset: function () {
                //console.log("Locktimer#reset", this.stop);
                this.lasttime = Date.now();

                this.clear();

                if (this.stop) {
                    this.unlock();
                } else {
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
                //console.log("Locktimer#refresh");

                // Refresca només si hi han canvis
                if (!this.refreshTimer) {
                    return;
                }

                this.refreshTimer = false;
                this.lock(this.draft);
            },

            lock: function (draft) {

                this.contentTool.requester.urlBase = 'lib/plugins/ajaxcommand/ajax.php?call=lock';
                var query = 'do=lock'
                    + '&id=' + this.contentTool.id;

                if (draft) {
                    var draftQuery = this.contentTool.generateDraft();
                    query += '&draft=' + JSON.stringify(draftQuery);
                }

                this.contentTool.requester.setStandbyId(false);
                this.contentTool.requester.sendRequest(query);
            },

            unlock: function () {
                //console.log("Locktimer#unlock");
                this.contentTool.requester.urlBase = 'lib/plugins/ajaxcommand/ajax.php?call=unlock';
                var query = 'do=unlock'
                    + '&id=' + this.contentTool.id;

                this.contentTool.requester.sendRequest(query);
            },

            cancelEditing: function (keepDraft) {

                // TODO[Xavi]
                this.contentTool.forceReset(); // Així evitem que demani si volen guardar-se els canvis
                this.clear();

                // TODO[Xavi] això s'ha de arreglar, funciona però no cal generar al request ja que l'obtenim del content tool i s'ha de modificar el tema del draft

                var requester;

                // TODO[Xavi] Aquest bloc de codi està repetit al DiffDialog
                require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                    requester = new Request();
                }));

//                requester.updateSectok = function (sectok) {
//                    this.sectok = sectok;
//                };
//
//                requester.sectok = requester.dispatcher.getSectok();
//                requester.dispatcher.toUpdateSectok.push(requester);

                requester.urlBase = DOKU_BASE + 'lib/plugins/ajaxcommand/ajax.php?call=cancel&id=' + this.contentTool.ns;

                if (keepDraft) {
                    requester.urlBase += '&keep_draft=true';
                }

                requester.setStandbyId(this.dispatcher.containerNodeId);
                requester.sendRequest();

//                requester.dispatcher.toUpdateSectok.pop();

            },

            timersID: null,

            _initRefreshTimer: function () {
                //console.log("Refresh Timer iniciat:", this);
                // Guardem la referencia del timer i l'activem
                this.timersID.refresh = window.setInterval(lang.hitch(this, this.refresh), 1000 * this.AUTOSAVE_TIME);
            },

            _initWarningTimer: function () {
                //console.log("Warning Timer iniciat:", this);
                // Guardem la referencia del timer i l'activem
                this.timersID.warning = window.setTimeout(this.warning, this.timeoutWarning, this);
            },

            _initTimeoutTimer: function () {
                //console.log("Timeout Timer iniciat:", this);
                // Guardem la referencia del timer i l'activem
                this.timersID.timeout = window.setTimeout(this._timeout, this.timeout, this);
            },

            _timeout: function (context) {
                context.clear();
                context._generateDialogTimeout();
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
                            });
                    }
                });

                this.dialogs.timeout.show();
            },

            _generateDialogWarning: function () {
                //console.log("Locktimer#_generateDialogWarning");
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
                            });

                        on(cancelBtn, 'click',
                            function () {
                                self.clear();
                                self.cancelEditing(false);
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

                    if (this.timersID[timerID] != null) {
                        window.clearTimeout(this.timersID[timerID]); // Comprovar si per l'interval cal window.clearInterval();
                        this.timersID[timerID] = null;
                    }

                }
            },

            destroy: function () {
                //console.log("Locktimer#destroy");
                this.stop = true;

                this.clear();
                if (this.dialogs.warning !== null) {
                    this._cancelDialog('warning');
                }
            }
        });
});


