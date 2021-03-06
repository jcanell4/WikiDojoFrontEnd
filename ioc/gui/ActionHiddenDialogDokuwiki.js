define([
    "dojo/_base/declare",
    "dojo/text!./templates/ActionHiddenDialogDokuwiki.html",
    "dijit/TooltipDialog",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/_TemplatedMixin",
    "dijit/_Templated",
    "dijit/popup",
    "ioc/wiki30/Request",
    "dijit/registry",
    "dojo/dom-form",
    "dijit/form/Form", //cridat per ActionHiddenDialogDokuwiki.html
    "dijit/form/Button" //cridat per ActionHiddenDialogDokuwiki.html
], function (declare, template, TooltipDialog, _WidgetsInTemplateMixin, _TemplatedMixin, _Templated, popup, Request, registry, domForm) { 

    var ret = declare("ioc.gui.ActionHiddenDialogDokuwiki", [TooltipDialog,  Request, _TemplatedMixin, _WidgetsInTemplateMixin],
        /**
         * Aquest widget afegeix un dialog ocult que inclou la validacio de les dades abans d'enviar-les,
         * i l'enviament via ajax al servidor. En cas de que la resposta sigui correcte amaga aquest dialog.
         *
         * @class ActionHiddenDialogDokuwiki
         * @extends dijit.TooltipDialog
         * @extends dijit._WidgetsInTemplateMixin
         * @extends Request
         */
        {
            templateString: template,
            widgetsInTemplate: true, // TODO[Xavi] No es necessari en la versió que fem servir de Dojo

            construct: function (){
//                console.log("ActionHiddenDialogDokuwiki");
            },
            
            /** @override */
            startup: function () {
                this.inherited(arguments);
                /*TO DO: */
                var formDialog = registry.byId(this.id + "_form");
                var hiddenDialog = this;

                formDialog.on('submit', function () {
                    if (formDialog.validate()) {
                        //enviar
                        var query = domForm.toQuery(this.id);
                        hiddenDialog.sendRequest(query);
                    } else {
                        alert('Les dades no són correctes');
                        return false;
                    }
                    return false;
                });
            },

            /**
             * Es cridat quan rep la resposta del servidor i passa les dades al dispatcher per processar-les.
             * El type es el tipus de comanda i value es un objecte amb les dades necessaries per processar
             * la comanda.
             *
             * Si s'està mostrant el standby l'amaguem.
             *
             * @param {Array.<{type: string, value}>} data dades per processar.
             * @override
             */
            responseHandler: function (data) {
                this.inherited(arguments); //this.dispatcher.processResponse(data); // TODO[Xavi] substituir aquesta part per this.inherited(arguments)?
                if (this._standby) {
                    this._standby.hide();
                }
                this.reset();
                popup.close(this);
            }
        });
    return ret;
});
