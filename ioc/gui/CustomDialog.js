define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/declare',
    'dijit/Dialog',
    'dojo/text!./templates/CustomDialog.html',
    'dojo/dom-construct',
    'dijit/form/Button',


], function (TemplatedMixin, WidgetsInTemplateMixin, declare, Dialog, template, domConstruct) {

    /**
     * Propietats úniques dels CustomDialog
     *
     * Al constructor es passa un objecte que serà mesclat amb el dialog, a banda de les propietats estandar dels
     * dialegs es poden passar les següents:
     *
     *
     * buttons: array d'objectes amb configuració pels botons amb el següent format:
     *
     * buttons: {
     *      id: {string}
     *      description: {string}
     *      callback: {function}[]
     * }
     *
     */
    return declare("ioc.gui.CustomDialog", [Dialog, TemplatedMixin, WidgetsInTemplateMixin], {

        templateString: template,

        style: "width: 300px",


        constructor: function () {
            declare.safeMixin(this, arguments);
        },

        //postCreate: function () {
        //    this.inherited(arugments);
        //},


        //postMixInProperties: function () {
        //    this.inherited(arguments);
        //},
        //

        //buildRendering: function () {
        //    this.inherited(arguments);
        //    this._addButtons();
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
            this._addListerners();
        },

        _addButtons: function () {
            if (!this.buttons) {
                return;
            }

            this.buttonsNode.appendChild(this._createButtons());

        },

        _createButtons: function () {
            var content = '', buttonId;
            for (var i = 0; i < this.buttons.length; i++) {
                buttonId = 'dialogButton_' + this.id + '_' + this.buttons[i].id;
                content += '<button data-dojo-type="dijit/form/Button" type="button" id="'
                    + buttonId + '"'
                    + '\>' + this.buttons[i].description + '</button>';
            }

            return domConstruct.toDom(content);
        },

        /**
         *
         * @protected
         */
        _addListerners: function () {
            var buttonId;
            for (var i = 0; i < this.buttons.length; i++) {
                buttonId = 'dialogButton_' + this.id + '_' + this.buttons[i].id;
                jQuery('#' + buttonId).on('click', this.buttons[i].callback);
                jQuery('#' + buttonId).on('click', function () {
                    this.remove();
                }.bind(this));

            }
        },

        //// TODO[Xavi] Això només cal en la versió tancable
        //onCancel: function () {
        //    console.log("CustomDialog#onCancel");
        //
        //},

        remove: function () {
            this.destroyRecursive();
        }

    });
});
