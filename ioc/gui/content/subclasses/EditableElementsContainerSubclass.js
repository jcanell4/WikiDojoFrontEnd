define([
    'dojo/_base/declare',
], function (declare) {
    /**
     * Aquesta classe no s'ha de instanciar directament, s'ha de fer a travÃ©s del contentToolFactory.
     * S'ha deixat com un fitxer independent per facilitar la seva edició
     * i no es garanteix que sigui accesible en el futur.
     *
     * @class EditableElementsContainerSubclass
     * @private
     * @see contentToolFactory.generate()
     */
    return declare([], {

        /**
         * El contingut original inicial s'ha de passar a través del constructor
         * dins dels arguments com a propietat originalContent.
         * @param args
         */
        constructor: function (args) {

            this.editableElements = [];
        },

        _registerEditableElement: function (element) {
            if (!element.updateField) {
                console.error("L'element no és updatable", element)
            } else {
                this.editableElements.push(element);
            }
        },

        _unregisterEditableElement: function (element) {
            this.editableElements = _.without(this.editableElements, element); // Alerta! biblioteca Underscore

        },

        _enableEditableElements: function () {
            for (var i = 0; i < this.editableElements.length; i++) {
                this.editableElements[i].show();
            }
        },

        _disableEditableElements: function () {
            for (var i = 0; i < this.editableElements.length; i++) {
                this.editableElements[i].hide();
            }
        },

        postRender: function () {
            this.inherited(arguments);
            if (this.editable) {
                this._enableEditableElements();
            }
        },

        _preSave: function(event) {
            this.inherited(arguments);

            this._saveEditableElements();
        },

        _saveEditableElements: function() {
            for (var i = 0; i<this.editableElements.length; i++) {
                this.editableElements[i].saveToField();
            }
        },

        postUpdateDocument: function(content) {
            this.inherited(arguments);

            for (var i = 0; i<this.editableElements.length; i++) {
                this.editableElements[i].restoreFromField();
            }

            console.log("EditableElementsContainerSubclass#updateDocument", this.editableElements, this.data);
        }

    });

});
