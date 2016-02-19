define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/declare',
    'dijit/Dialog',
    "dojo/text!./templates/CustomDialog.html",
    "dijit/form/Button",

], function (TemplatedMixin, WidgetsInTemplateMixin, declare, Dialog, template) {


    return declare("ioc.gui.CustomDialog", [Dialog, TemplatedMixin, WidgetsInTemplateMixin], {

        templateString: template,


        constructor: function () {
            declare.safeMixin(this, arguments);

        },


        //postMixInProperties: function () {
        //    this.inherited(arguments);
        //},
        //
        //buildRendering: function () {
        //    this.inherited(arguments);
        //},
        //
        //postCreate: function () {
        //    this.inherited(arguments);
        //},

        startup: function () {
            this.inherited(arguments);

            // TEST value
            // this.timerID = window.setTimeout(this.onTimeout, this.timeout * 10, this);

            //this.timerID = window.setTimeout(this.onTimeout, this.timeout * 1000, this);
            //
            //console.log("Document:", this.document);
            //console.log("Draft:", this.draft);
            //
            //var documentLabel = "Document (" + this.document.date + ")",
            //    draftLabel = "Esborrany (" + this.draft.date + ")",
            //    diff = jsdifflib.getDiff(this.document.content, this.draft.content, documentLabel, draftLabel);


            this._addButtons();


        },

        _addButtons: function () {
            if (!this.buttons) {
                return;
            }
            this.buttonsNode.appendChild(this._createButtons());
            this._addListerners();
        },

        _createButtons: function () {
            for (var i = 0; i < this.buttons.length; i++) {
                content += '<button data-dojo-type="dijit/form/Button" type="button" id="'
                    + this.id + '_' + this.buttons[i].id + "\">'+this.buttons[i].description+'</button>"
            }
        },

        /**
         *
         * @protected
         */
        _addListerners: function () {
            for (var i = 0; i < this.buttons.length; i++) {
                jQuery('#' + this.id + '_' + this.buttons[i].id).on('click', this.buttons[i].callback);
            }
        },

        // TODO[Xavi] determinar si això cal afegir-lo a qui o el control es fa al DialogManager
        onTimeout: function () {
            console.log("CustomDialog#onTimeout");

        },

        onCancel: function () {
            console.log("CustomDialog#onCancel");

        }

    });
});
