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

        constructor: function () {
            this.initFunctions = [];
            this.sections = [];
            this.nextDialogs = {};
            this.nextCallbacks = {};

            console.log(arguments);

            declare.safeMixin(this, arguments);

            this.style = "width: " + this.width + "px";

            this.eventManager = this.dispatcher.getEventManager();
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
            this._initTimer();
        },

        _initTimer: function () {
            if (!this.timeout) {
                return;
            }

            this.timeout=5000;

            console.log("timeout:", this.timeout);
            var timerId = setTimeout(function () {
                console.log("Expire");
                this.dispatchEvent(this.eventName.TIMEOUT, {id: this.id});
            }.bind(this), this.timeout); // El context del timer serà el propi dialog

            this.registerToEvent(this, this.eventName.DESTROY, function () {
                console.log("Clear");
                clearInterval(timerId);
            })
        },

        _initFunctions: function () {
            // llença tota la seqüencia de funcions d'inicialització afegides

            console.log(this.initFunctions);
            for (var i = 0; i < this.initFunctions.length; i++) {

                this.initFunctions[i].bind(this)(); // es passa el contexte del dialog a cada funció que es crida
            }

            // Afegim les suscripcions adicionals
            this.registerToEvent(this, this.eventName.TIMEOUT, this.remove.bind(this));
        },

        _initNextDialogs: function () {
            // llença tota la seqüencia de funcions d'inicialització afegides

            for (var event in this.nextDialogs) {
                this.registerToEvent(this, event, this.nextDialogs[event].show);
                this.destroy(); // Només pot haver un dialog actiu
            }
        },

        _initNextCallbacks: function () {
            console.log("CustomDialog#_initNextCallbacks", this.nextCallbacks);
            // llença tota la seqüencia de funcions d'inicialització afegides

            for (var event in this.nextCallbacks) {
                // Es tracta d'un array
                for (var i = 0; i < this.nextCallbacks[event].length; i++) {
                    this.registerToEvent(this, event, this.nextCallbacks[event][i].bind(this));
                }
            }
        },

        _addMessage: function () {
            this.contentNode.innerHTML = this.message;
        },

        _addSections: function () {
            for (var i = 0; i < this.sections.length; i++) {
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

        _getButtonId: function (id) {
            return 'dialogButton_' + this.id + '_' + id;
        },

        /**
         *
         * @protected
         */
        _addListerners: function () {
            var $button;

            if (!this.buttons) {
                return;
            }
            var buttonId;
            for (var i = 0; i < this.buttons.length; i++) {
                buttonId = this._getButtonId(this.buttons[i].id);
                $button = jQuery('#' + buttonId);

                $button.on('click', this.buttons[i].callback.bind(this));
                $button.on('click', function () {
                    this.remove(); // Al fer click en un boto sempre es tanca el dialeg
                }.bind(this));

            }
        },

        remove: function () {
            console.log("CustomDialog#remove", this.id);
            this.destroyRecursive();
            this.dispatchEvent(this.eventName.DESTROY, {id: this.id, refId: this.refId});
        },

        onHide: function () {
            this.inherited(arguments);
            this.dispatchEvent(this.eventName.CANCEL, {id: this.id, refId: this.refId});
            this.remove()
        },

        //
        //destroy: function () {
        //    this.remove();
        //    this.inherited(arguments);
        //
        //},

        setRefId: function (refId) {
            this.refId = refId;
        }
    });
});
