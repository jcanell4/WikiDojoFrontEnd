define([
    'ioc/gui/content/EditableElements/EditableFormElement'
], function (EditableFormElement) {

    var editableElements = {},

        _createEditableElement = function (type, args) {
            return editableElements[type] ? new editableElements[type](args) : null;
        },

        _addEditableElement = function (type, editableElement) {
            editableElements[type] = editableElement;
        },

        _init = function () {

            _addEditableElement('editable-form-element', EditableFormElement);
        };

    _init();

    return {
        // Retornem només els mètodes exposats del closure
        createElement: _createEditableElement,
        addElement: _addEditableElement
    };
});

