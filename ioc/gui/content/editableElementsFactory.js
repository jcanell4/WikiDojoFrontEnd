define([
    'ioc/gui/content/EditableElements/EditableTableElement',
    'ioc/gui/content/EditableElements/EditableTextareaElement',
    'ioc/gui/content/EditableElements/EditableWidgetElement',
], function (/*TestFormElement, */EditableTableElement, EditableTextareaElement, EditableWidgetElement) {

    var editableElements = {},

        _createEditableElement = function (type, args) {
            return editableElements[type] ? new editableElements[type](args) : null;
        },

        _addEditableElement = function (type, editableElement) {
            editableElements[type] = editableElement;
        },

        _init = function () {
            _addEditableElement('table', EditableTableElement);
            _addEditableElement('textarea', EditableTextareaElement);
            _addEditableElement('widget', EditableWidgetElement);
        };

    _init();

    return {
        // Retornem només els mètodes exposats del closure
        createElement: _createEditableElement,
        addElement: _addEditableElement
    };
});

