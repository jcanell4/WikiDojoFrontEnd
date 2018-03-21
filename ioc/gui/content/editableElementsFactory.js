define([
    'ioc/gui/content/EditableElements/TestFormElement',
    'ioc/gui/content/EditableElements/EditableTableElement'
], function (TestFormElement, EditableTableElement) {

    var editableElements = {},

        _createEditableElement = function (type, args) {
            return editableElements[type] ? new editableElements[type](args) : null;
        },

        _addEditableElement = function (type, editableElement) {
            editableElements[type] = editableElement;
        },

        _init = function () {

            _addEditableElement('test', TestFormElement);
            _addEditableElement('table', EditableTableElement);
        };

    _init();

    return {
        // Retornem només els mètodes exposats del closure
        createElement: _createEditableElement,
        addElement: _addEditableElement
    };
});

