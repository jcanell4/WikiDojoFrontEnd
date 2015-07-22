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


            constructor: function (docId, dispatcher) {
                this.docId = docId;
                this.dispatcher = dispatcher;
                this.timeout = 0;
                this.draft = false;
                this.msg = {
                    continue: LANG.willexpire1 + "<b>" + docId + "</b>" + LANG.willexpire2,
                    timeout:  LANG.lock_timeout
                };
                this.pageid = '';
                this.contentTool = this.dispatcher.getContentCache(this.docId).getMainContentTool();
                //this.lasttime = new Date();
                //this.showingDialog = false;

                this.changesDetected = false;
            },


            /**
             * Initialize the lock timer
             *
             * @param int    timeout Length of timeout in seconds
             * @param string msg     Deprecated; The expiry message
             * @param bool   draft   Whether to save drafts
             * @param string edid    Optional; ID of an edit object which has to be present
             */
            init: function (timeout, msg, draft, edid) {
                var $edit;

                //switch (arguments.length) {
                //    case 4:
                //        DEPRECATED('Setting the locktimer expiry message is deprecated');
                //        dw_locktimer.msg = msg;
                //        break;
                //    case 3:
                //        edid = draft;
                //    case 2:
                //        TODO[Xavi] En el nostre cas sempre es el 2
                draft = msg;
                //}
                edid = edid || 'wiki__text'; // no es fa servir per a res el edid

                //$edit = jQuery('#' + edid);
                //if ($edit.length === 0 || $edit.attr('readonly')) {
                //    return;
                //}

                // init values
                this.timeoutWarning = timeout * 1000;
                this.timeout = (timeout + 15) * 1000; // 15 es la quantitat de proves, realment es 60s

                this.draft = draft;
                //this.lasttime = new Date();

                // TODO[xavi] En lloc d'agafar la referencia pel jQuery que pot ser erronia establim la del docId

                this.pageid = this.docId;

                this.timersID = {};
                this.dialogs = {};

                // start timer
                this.reset();

                // start refresh timer
                //window.setInterval(this.refresh(this), 1000);
                //this.timerRefreshID = window.setInterval(lang.hitch(this, this.refresh), 1000 * this.draftAutosave);

                //this.contentTool.registerObserverToEvent("document_changed", lang.hitch(this, this.refresh));
                this.contentTool.registerObserverToEvent("document_changed", lang.hitch(this, this.refreshNeeded));
                //this.contentTool.registerObserverToEvent("destroy", lang.hitch(this, this.clear));
                this.contentTool.registerObserverToEvent("destroy", lang.hitch(this, this.destroy));

            },

            /**
             * (Re)start the warning timer
             */
            reset: function () {
                console.log("Cridat el reset, this:", this);
                this.clear();

                this._initWarningTimer();
                this._initTimeoutTimer();
                this._initRefreshTimer();

            },

            /**
             * Display the warning about the expiring lock
             */
            warning: function (context) {
                context.clear('refresh');

                context.msg.continue = context.msg.continue.replace("\\n", "<br>");

                context._generateDialogWarning();

            },


            refreshNeeded: function () {
                this.refreshTimer = true;
            },

            /**
             * Refresh the lock via AJAX
             *
             * Called on keypresses in the edit area
             */
            refresh: function () {
                var now = new Date(),
                    params = 'call=lock&id=' + this.pageid + '&',
                    self = this;

                // Refresca només si hi han canvis
                if (!this.refreshTimer) {
                    console.log("No cal refrescar");
                    return;
                }

                // POST everything necessary for draft saving

                var currentContent = this.contentTool.getCurrentContent();

                if (this.draft && currentContent.length > 0) {
                    params += "&wikitext=" + jQuery.param({wikitext: currentContent});

                    params += jQuery('#dw__editform').find('input[name=prefix], ' +
                            //'textarea[name=wikitext], ' +
                        'input[name=suffix], ' +
                        'input[name=date]').serialize();
                }

                jQuery.post(
                    //DOKU_BASE + 'lib/plugins/ajaxcommand/ajax.php',
                    DOKU_BASE + 'lib/exe/ajax.php',
                    params)
                    .done(function (data) {
                        self.refreshed(data, self);
                    }
                );


                this.refreshTimer = false;
                console.log("refresh!");
            }
            ,

            /**
             * Callback. Resets the warning timer
             */
            refreshed: function (data, context) {
                var error = data.charAt(0),
                    info;
                data = data.substring(1);

                jQuery('#draft__status').html(data);

                // TODO[Xavi] Rehabilitar això amb la resposta? Si es un error s'ha de controlar aquí
                if (error != '1') {

                    info = {
                        type:  "info",
                        value: {
                            duration:  -1,
                            id:        this.docId,
                            message:   "S'ha produit un error, el document no s'ha bloquejat.",
                            timestamp: new Date(Date.now()).toLocaleFormat('%d/%m/%y %H:%M:%S'),
                            type:      "error"
                        }
                    };


                    this.dispatcher.processResponse(info);
                    return; // locking failed
                }

                lang.hitch(context, context.reset());
            },


            cancelEditing: function (keepDraft) {
                this.contentTool.discardChanges(); // Així evitem que demani si volen guardar-se els canvis
                this.clear();


                console.log("context: ", this.contentTool);
                console.log("id: ", this.contentTool.ns);

                var requester;

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
                console.log("Refresh Timer iniciat:", this);
                // Guardem la referencia del timer
                this.timersID.refresh = window.setInterval(lang.hitch(this, this.refresh), 1000 * this.draftAutosave);
                // L'activem

            },

            _initWarningTimer: function () {
                console.log("Warning Timer iniciat:", this);
                // Guardem la referencia del timer
                // L'activem
                this.timersID.warning = window.setTimeout(this.warning, this.timeoutWarning, this);
            },

            _initTimeoutTimer: function () {
                console.log("Timeout Timer iniciat:", this);
                // Guardem la referencia del timer
                // L'activem

                var self = this;

                this.timersID.timeout = window.setTimeout(function () {
                    self.clear();
                    self._cancelDialog('warning');
                    self._generateDialogTimeout();


                }, this.timeout);
            },

            _generateDialogTimeout: function () {
                var self = this;

                this.dialogs.timeout = new Dialog({
                    title:    "Temps d'espera esgotat",
                    content:  self.msg.timeout
                              + "<div class=\"dijitDialogPaneActionBar\">"
                              + "<button data-dojo-type=\"dijit/form/Button\" type=\"button\" id=\"ok-confirmation\">Ok</button>"
                              + "</div>",
                    style:    "width: 300px",
                    closable: false,

                    startup: function () {
                        var okBtn = dom.byId("ok-confirmation");

                        self.cancelEditing(true);

                        on(okBtn, 'click',
                            function (e) {
                                self._cancelDialog('timeout');
                                //this.destroyRecursive();
                            });
                    }
                });

                this.dialogs.timeout.show();
            },

            _generateDialogWarning: function () {
                var self = this;

                this.dialogs.warning = new Dialog({
                    title:   "Continuar editant?",
                    content: self.msg.continue
                             + "<div class=\"dijitDialogPaneActionBar\">"
                             + "<button data-dojo-type=\"dijit/form/Button\" type=\"button\" id=\"save-confirmation\">desar</button>"
                             + "<button data-dojo-type=\"dijit/form/Button\" type=\"button\" id=\"discard-confirmation\">descartar</button>",
                    style:   "width: 300px"
                             + "</div>",

                    startup: function () {
                        var saveBtn = dom.byId("save-confirmation"),
                            cancelBtn = dom.byId("discard-confirmation");

                        on(saveBtn, 'click',
                            function (e) {
                                self.reset();

                                console.log("renovant");
                                self._cancelDialog('warning');

                            });

                        on(cancelBtn, 'click',
                            function (e) {
                                self.clear();
                                self.cancelEditing(false);
                                self._cancelDialog('warning');
                            });

                    },

                    closable: false


                });

                this.dialogs.warning.show();


            },


            _cancelDialog: function (dialog)  {
            console.log("Cancel·lant dialog");
                if (this.dialogs[dialog]) {
                    if (this.dialogs[dialog] != null) {
                        this.dialogs[dialog].destroyRecursive();
                        this.dialogs[dialog] = null;
                    }
                } else {
                    console.error("No es pot eliminar el dialog " + dialog + " perquè no es troba: ", this.dialogs);
                }
            },


            /**
             * Remove the current warning timer
             */
            clear: function (timerName) {
                var clearTimersIDs;

                if (timerName) {
                    clearTimersIDs = {};
                    clearTimersIDs[timerName] = this.timersID[timerName];
                } else {
                    clearTimersIDs = this.timersID;
                }


                console.log("Clear timers: ", clearTimersIDs);

                for (var timerID in clearTimersIDs) {
                    if (this.timersID[timerID] != null) {
                        window.clearTimeout(this.timersID[timerID]); // Comprovar si per l'interval cal window.clearInterval();
                        this.timersID[timerID] = null;
                        console.log("Cleared " + timerID);
                    }
                }
            },

            destroy: function() {
                this.clear();
                if (this.dialogs.warning !==null) {
                    this._cancelDialog('warning');
                }

            }

        })



});


