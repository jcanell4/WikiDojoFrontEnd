define([
    // 'ioc/gui/content/EditableElements/TestFormElement',
    'ioc/gui/content/EditableElements/EditableTableElement',
    'ioc/gui/content/EditableElements/EditableTextareaElement'
], function (/*TestFormElement, */EditableTableElement, EditableTextareaElement) {

    var editableElements = {},

        _createEditableElement = function (type, args) {
            return editableElements[type] ? new editableElements[type](args) : null;
        },

        _addEditableElement = function (type, editableElement) {
            editableElements[type] = editableElement;
        },

        _init = function () {

            // _addEditableElement('test', TestFormElement);
            _addEditableElement('table', EditableTableElement);
            _addEditableElement('textarea', EditableTextareaElement);
        };

    _init();

    return {
        // Retornem només els mètodes exposats del closure
        createElement: _createEditableElement,
        addElement: _addEditableElement
    };
});

