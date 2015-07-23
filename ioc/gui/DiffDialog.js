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

            // Start timer


            //this.timerID = window.setTimeout(this.ontimeout, this.timeout);

            console.log("Inici del timer");
            this.timerID = window.setTimeout(this.onTimeout, 5000, this);

            console.log("Afegim el diff");

            var documentLabel = "Document (" + this.document.date + ")";
            var draftLabel = "Esborrany (" + this.draft.date + ")";

            var diff = jsdifflib.getDiff(this.document.content, this.draft.content, documentLabel, draftLabel);


            this.diffNode.appendChild(diff);

            //console.log(jsdifflib.getDiff(currentContent, draft));


            jQuery(this.diffNode).animate({scrollTop: (0)});

        },

        clearTimer: function () {
            window.clearTimeout(this.timerID);

        },

        onOpenDocument: function () {
            //alert("obrir el document");
            isShown = false;
            this.clearTimer();
            this.loadDocument(false);
            this.destroyRecursive();
        },

        onOpenDraft: function () {
            //alert("obrir el draft");
            isShown = false;
            this.clearTimer();
            this.loadDocument(true);
            this.destroyRecursive();
        },

        onTimeout: function (context) {
            // Ajaxcomand call cancel conservant el draft

            console.log("Timeout");
            // Canviem el missatge per informar
            context.clearTimer();

            console.log("Button: ", dom.byId("ok-timeout"));


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


        loadDocument: function (recoverDraft) {
            var requester;

            require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                requester = new Request();

                requester.updateSectok = function (sectok) {
                    this.sectok = sectok;
                };

                requester.sectok = requester.dispatcher.getSectok();
                requester.dispatcher.toUpdateSectok.push(requester);
            }));


            var id = this.docId.replace('_', ':')


            requester.urlBase = DOKU_BASE + 'lib/plugins/ajaxcommand/ajax.php?call=edit'
                + '&id=' + id
                + (this.rev ? '&rev=' + this.rev : '')
                + '&recover_draft=' + recoverDraft;


            requester.setStandbyId(requester.dispatcher.containerNodeId);
            requester.sendRequest();
        },

        onCancel: function() {
            isShown = false;
            this.clearTimer();
        }

    });
});
