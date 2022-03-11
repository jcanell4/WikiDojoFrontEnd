define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/IocImportTree.html',
    'ioc/widgets/IocImportSelectedItem/IocImportSelectedItem',
    'dojo/text!./css/IocImportTree.css',
    'dijit/form/Button',
    'ioc/wiki30/dispatcherSingleton',
    'ioc/widgets/SearchTree/SearchTree',
    'ioc/wiki30/Request'
    ],
    function (declare, _WidgetBase, _TemplatedMixin, template, IocImportSelectedItem,
                css, Button, getDispatcher, SearchTree, Request) {

        var cssStyle = document.createElement('style');
        cssStyle.innerHTML = css;
        document.head.appendChild(cssStyle);

        var dispatcher = getDispatcher();

        return declare([_WidgetBase, _TemplatedMixin], {
            templateString: template,
            baseClass: 'ioc-import-tree',
            // {string} clau del camp a utilizar com identificador
            fieldId: null,
            // {string} etiqueta del botó del dialog per iniciar la cerca
            buttonLabel: null,
            // {string} nom que rep el camp ocult del formulari que conté l'identificador de l'element seleccionat
            // i que s'enviarà amb el formulari
            fieldName: null,
            // {string} url per realitzar la cerca desdel panell de cerca i que retornarà l'array d'elements trobats
            searchDataUrl: null,
            // {string} títol del diàleg de cerca
            dialogTitle: null,
            // {string} etiqueta del botó per tancar el diàleg de cerca i afegir els resultats seleccionats.
            dialogButtonLabel: null,
            // {object} referencia als controls jQuery
            controls: null,

            constructor: function (args) {
                this.selected = {}; // referenciats pel id per trobar-los més ràpidament
                this.itemListByFieldId = {};
                this.controls = {};
            },

            postCreate: function () {
                this.inherited(arguments);
                this._addListeners();
                this._fillValues();
            },

            _fillValues: function() {
                var value = null;
                if (typeof this.value === 'string') {
                    value = this._generateItemsFromString(this.value);
                }
                for (var item in value) {
                    this._itemSelected(value[item]);
                }
            },

            _addInput: function() {
                var value = this.controls.$input.val();
                if (value !== "") {
                    this._itemSelected(value);
                }
            },

            _addListeners: function () {
                var $input = jQuery(this.entryText);
                this.controls.$input = $input;

                var searchButton = new Button({
                    iconClass: 'ioc-import-tree-icon search',
                    showLabel: false
                }).placeAt(this.buttonContainer);

                var $searchButton = jQuery(searchButton.domNode);

                $searchButton.on('click', function () {
                    this._addInput();

                    var searchTreeWidget = new SearchTree({
                        ns: this.ns,
                        buttonLabel: this.buttonLabel,
                        projectType: this.projectType,
                        //Tree
                        treeDataSource: this.searchDataUrl,
                        onlyDirs: true,
                        hiddenProjects: false,
                        //respuesta al clic en un elemento del árbol
                        callback: function (valor) {
                            this._itemSelected(valor);
                        }.bind(this)
                    });

                    var dialogParams = {
                        title: this.dialogTitle,
                        message: '',
                        sections: [
                            // Secció 1: widget amb l'arbre de directoris.
                            {widget: searchTreeWidget}
                        ],
                        buttons: [
                            {
                                id: 'add-results',
                                description: this.dialogButtonLabel,
                                buttonType: 'default'
                            }
                        ]
                    };

                    var dialogManager = dispatcher.getDialogManager();
                    var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, 'show-tree', dialogParams);
                    dialog.show();

                }.bind(this));

            },

            _itemSelected: function (item) {
                jQuery(this.entryText).val(item);
                this.selected[this.fieldId] = item;
                this._updateHiddenSelectedField();
            },

            _updateHiddenSelectedField: function () {
                var $hiddenField = jQuery(this.hiddenSelected);
                var selectedIds = this.selected[this.fieldId];
                $hiddenField.val(selectedIds);
                this.set('value', selectedIds);
            },

            _generateItemsFromString: function(value) {
                var item = {};
                if (value.length !== 0) {
                    item[this.fieldId] = value;
                }
                return item;
            }

        });

    });
