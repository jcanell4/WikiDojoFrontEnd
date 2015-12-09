define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/declare',
    'dijit/Dialog',
    "dojo/_base/lang",
    'dojo/on',
    'dojo/dom',
    'ioc/gui/jsdifflib/jsdifflib-amd',
    "dojo/text!./templates/DiffDialog.html",
    "dijit/form/Button",

], function (TemplatedMixin, WidgetsInTemplateMixin, declare, Dialog, lang, on, dom, jsdifflib, template) {


    // TODO[Xavi] Solució temporal per evitar duplicacións a pantalla si es clica multiples vegades el botó d'editar. S'hauria de refactoritzar i convetir en un singleton.
    var isShown = false;

    return declare([Dialog, TemplatedMixin, WidgetsInTemplateMixin], {

        templateString: template,

        /** @type int */
        timeout: null,

        /** @type int */
        timerId: null,

        constructor: function () {
            declare.safeMixin(this, arguments);

            this._createRequest();
        },

        _createRequest: function () {
            var that = this;

            require(["ioc/wiki30/Request"], function (Request) {
                var requester = new Request();

                console.log("requester:", requester);
                requester.updateSectok = function (sectok) {
                    this.sectok = sectok;
                };

                requester.sectok = requester.dispatcher.getSectok();
                requester.dispatcher.toUpdateSectok.push(requester);

                that.requester = requester;
                console.log("that:", that);
                console.log("that.requester:", requester);
            });
        },

        /** @override */
        show: function () {
            if (!isShown) {
                isShown = true;
                this.inherited(arguments);
            }
        },

        postMixInProperties: function () {
            this.inherited(arguments);
        },

        buildRendering: function () {
            this.inherited(arguments);
        },

        postCreate: function () {
            this.inherited(arguments);
        },

        startup: function () {
            this.inherited(arguments);

            // TEST value
            // this.timerID = window.setTimeout(this.onTimeout, this.timeout * 10, this);

            this.timerID = window.setTimeout(this.onTimeout, this.timeout * 1000, this);

            console.log("Document:", this.document);
            console.log("Draft:", this.draft);

            var documentLabel = "Document (" + this.document.date + ")",
                draftLabel = "Esborrany (" + this.draft.date + ")",
                diff = jsdifflib.getDiff(this.document.content, this.draft.content, documentLabel, draftLabel);

            this.diffNode.appendChild(diff);

            jQuery(this.diffNode).animate({scrollTop: (0)});

        },

        // TODO[Xavi] delegar al LockTimer
        clearTimer: function () {
            window.clearTimeout(this.timerID);

        },

        onOpenDocument: function () {
            alert("obrir el document");
            isShown = false;
            this.clearTimer();
            this.loadDocument(false);
            this.destroyRecursive();
        },

        onOpenDraft: function () {
            alert("obrir el draft");
            isShown = false;
            this.clearTimer();
            this.loadDocument(true);
            this.destroyRecursive();
        },

        // TODO[Xavi] delegar al LockTimer
        onTimeout: function (context) {
            // Canviem el missatge per informar
            context.clearTimer();
            context.unlock();
            context.set('title', "Document desbloquejat");
            context.set('content', "El temps de bloqueig s'ha exhaurit i el document ha estat desbloquejat."
                + "<div class=\"dijitDialogPaneActionBar\">"
                + "<button data-dojo-type=\"dijit/form/Button\" type=\"button\" id=\"ok-timeout\">Ok</button>"
                + "</div>");

            var okBtn = dom.byId("ok-timeout");


            on(okBtn, 'click', function () {
                context.destroyRecursive();
                isShown = false;
            });

        },

        //TODO[Xavi] Delegar al locktimer
        unlock: function () {

            var requester;

            require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                requester = new Request();

                requester.updateSectok = function (sectok) {
                    this.sectok = sectok;
                };

                requester.sectok = requester.dispatcher.getSectok();
                requester.dispatcher.toUpdateSectok.push(requester);
            }));


            requester.urlBase = DOKU_BASE + 'lib/plugins/ajaxcommand/ajax.php?call=cancel&id=' + this.ns
                + '&keep_draft=true';

            requester.setStandbyId(this.dispatcher.containerNodeId);
            requester.sendRequest();
        },

        /**
         * @abstract
         * @param {bool} recoverDraft cert si es vol recuperar el draft o fals per recuperar el document
         */
        loadDocument: function (recoverDraft) {
            var query = this.query
                + '&recover_draft=' + recoverDraft;


            console.log("PASANDO EL QUERY: ", query);
            this.requester.urlBase = this.base;
            this.requester.setStandbyId(this.requester.dispatcher.containerNodeId);
            this.requester.sendRequest(query);
        },


        onCancel: function () {
            isShown = false;

            // TODO[Xavi] delegar a Locktimer
            this.unlock();
            this.clearTimer();
        }

    });
});
