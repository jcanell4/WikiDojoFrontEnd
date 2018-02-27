define([
    'ioc/gui/content/EditableElements/TestEditableElement'
], function (testEditableElement) {

    var editableElements = {},

        _createEditableElement = function (type, args) {
            return editableElements[type] ? new editableElements[type](args) : null;
        },

        /**
         * Afegeix el motor de render amb el tipus especificat.
         *
         * @param {string} type - Nom del tipus de motor de render
         * @param {function} renderEngine - Funció que actuará com a motor de render
         * @private
         */
        _addEditableElement = function (type, editableElement) {
            editableElements[type] = editableElement;
        },

        _init = function () {

            _addEditableElement('zoomable-text-field', testEditableElement);
        };

    _init();

    return {
        // Retornem només els mètodes exposats del closure
        createElement: _createEditableElement,
        addElement: _addEditableElement
    };
});

