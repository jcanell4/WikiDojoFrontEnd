define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/declare',
    'dijit/Dialog',
    'dojo/text!./templates/CustomDialog.html',
    'dojo/dom-construct',
    'ioc/wiki30/manager/EventObserver',
    'dijit/form/Button',
], function (TemplatedMixin, WidgetsInTemplateMixin, declare, Dialog, template, EventObserver, domConstruct) {

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

        style: "width: 400px",

        constructor: function () {
            declare.safeMixin(this, arguments);
            this.isShowing = true;
        },

        startup: function () {
            this.inherited(arguments);

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
                    + buttonId + '" ';
                content += '\>' + this.buttons[i].description + '</button>';
            }

            return domConstruct.toDom(content);
        },

        /**
         *
         * @protected
         */
        _addListerners: function () {
            if (!this.buttons) {
                return;
            }
            var buttonId;
            for (var i = 0; i < this.buttons.length; i++) {
                buttonId = 'dialogButton_' + this.id + '_' + this.buttons[i].id;
                jQuery('#' + buttonId).on('click', this.buttons[i].callback.bind(this)); // ALERTA[Xavi] Al afegir el bind, la resta de dialegs pot haver deixat de funcionar (no importa perquè tots han de funcionar així ara)
                jQuery('#' + buttonId).on('click', function () {
                    this.remove(); // Al fer click en un boto sempre es tanca el dialeg
                }.bind(this));

            }
        },

        remove: function () {
            //console.log("CustomDialog#remove", this.id);
            this.isShowing = false;
            this.destroyRecursive();
        },

        show: function () {
            this.isShowing = true;
            this.inherited(arguments);
        },

        hide: function () {
            this.isShowing = false;
            this.inherited(arguments);
        }

    });
});
