define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/declare',
    'dijit/Dialog',
    'dojo/text!./templates/CustomDialog.html',
    'dojo/dom-construct',
    'ioc/wiki30/manager/EventObserver',
    'dijit/form/Button',
], function (TemplatedMixin, WidgetsInTemplateMixin, declare, Dialog, template, domConstruct, EventObserver) {

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
    return declare("ioc.gui.CustomDialog", [Dialog, TemplatedMixin, WidgetsInTemplateMixin, EventObserver], {

        templateString: template,

        style: "width: 400px",

        constructor: function () {
            this.initFunctions = [];
            this.sections = [];
            this.nextDialogs = {};
            this.nextCallbacks = {};

            declare.safeMixin(this, arguments);

            this.eventManager = this.dispatcher.getEventManager();


            this.isShowing = true; // TODO[Xavi] això no ha de ser necessari
        },

        startup: function () {
            this.inherited(arguments);


            this._addMessage();
            this._addSections();
            this._addButtons();
            this._addListerners();
            this._initNextDialogs();
            this._initNextCallbacks();
            this._initFunctions();
        },

        _initFunctions:function() {
            // llença tota la seqüencia de funcions d'inicialització afegides

            for (var i=0; i<this.initFunctions.length; i++) {
                this.initFunctions[i]().bind(this); // es passa el contexte del dialog a cada funció que es crida
            }
        },

        _initNextDialogs:function() {
            // llença tota la seqüencia de funcions d'inicialització afegides

            for (var event in this.nextDialogs) {
                this.registerToEvent(this, event, this.nextDialogs[event].show);
                this.destroy(); // Només pot haver un dialog actiu
            }
        },

        _initNextCallbacks:function() {
            // llença tota la seqüencia de funcions d'inicialització afegides

            for (var event in this.nextCallbacks) {
                // Es tracta d'un array
                for (var i=0; i<this.nextCallbacks[event].length; i++) {
                    this.registerToEvent(this, event, this.nextCallbacks[event][i].bind(this));
                }
            }
        },

        _addMessage: function() {
            this.contentNode.innerHTML = this.message;
        },

        _addSections: function() {
            console.log("Sections:", this.sections);

            for (var i=0; i<this.sections.length; i++) {
                console.log('Afegint node:', this.sections[i]);
                this.sectionsNode.appendChild(this.sections[i]);
                jQuery(this.sectionsNode.lastChild).animate({scrollTop: (0)}); // En cas de que es mostri una barra de desplaçament sempre es mostrarà el principi de la secció
            }


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
                buttonId = this._getButtonId(this.buttons[i].id);
                content += '<button data-dojo-type="dijit/form/Button" type="button" id="'
                    + buttonId + '" ';
                content += '\>' + this.buttons[i].description + '</button>';
            }

            return domConstruct.toDom(content);
        },

        _getButtonId: function (id){
            return 'dialogButton_' + this.id + '_' + id;
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
                buttonId = this._getButtonId(this.buttons[i].id);
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
