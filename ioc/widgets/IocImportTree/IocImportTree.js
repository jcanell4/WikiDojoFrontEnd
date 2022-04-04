define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/IocImportTree.html',
    'dojo/text!./css/IocImportTree.css',
    'dijit/form/Button',
    'ioc/wiki30/dispatcherSingleton',
    'ioc/widgets/SearchTree/SearchTree',
    'ioc/wiki30/Request'
    ],
    function (declare, _WidgetBase, _TemplatedMixin, template, css, Button, getDispatcher, SearchTree, Request) {

        var cssStyle = document.createElement('style');
        cssStyle.innerHTML = css;
        document.head.appendChild(cssStyle);

        var dispatcher = getDispatcher();

        return declare([_WidgetBase, _TemplatedMixin], {
            templateString: template,
            baseClass: 'ioc-import-tree',
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
            entry: null,

            constructor: function (args) {
                this.selected = ""; // Element seleccionat de l'arbre
                this.entry = {};
            },

            postCreate: function () {
                this.inherited(arguments);
                this._addListeners();
                this._fillValues();
            },

            _fillValues: function() {
                this._itemSelected(this.value);
            },

            _addInput: function() {
                var value = this.entry.val();
                if (value !== "") {
                    this._itemSelected(value);
                }
            },

            _addListeners: function () {
                this.entry = jQuery(this.entryText);

                var searchButton = new Button({
                    iconClass: 'ioc-import-tree-icon search',
                    showLabel: false
                }).placeAt(this.buttonContainer);

                var $searchButton = jQuery(searchButton.domNode);

                $searchButton.on('click', function () {
                    this._addInput();

                    var searchTreeWidget = new SearchTree({
                        ns: this.ns,
                        projectType: this.projectType,
                        //Tree
                        treeDataSource: this.searchDataUrl,
                        onlyDirs: true,
                        hiddenProjects: false,
                        openOnClick: true
                    });

                    var dialogParams = {
                        title: this.dialogTitle,
                        width: 300,
                        message: this.dialogMessage,
                        sections: [
                            {widget: searchTreeWidget}
                        ],
                        buttons: [
                            {
                                id: 'add-results',
                                description: this.dialogButtonLabel,
                                buttonType: 'default',
                                callback: function() {
                                    var item = searchTreeWidget.getSelected();
                                    this._itemSelected(item);
                                }.bind(this)
                            },
                            {
                                id: 'cancel-results',
                                description: 'Cancel·la',
                                buttonType: 'default'
                            }
                        ]
                    };

                    var dialogManager = dispatcher.getDialogManager();
                    var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, 'show-tree', dialogParams);
                    dialog.show();

                }.bind(this));

            },

            _itemSelected: function(item) {
                if (item != "") {
                    jQuery(this.entryText).val(item);
                    this.selected = item;
                    this._updateHiddenSelectedField();
                }
            },

            _updateHiddenSelectedField: function() {
                var $hiddenField = jQuery(this.hiddenSelected);
                $hiddenField.val(this.selected);
                this.set('value', this.selected);
            }
            
        });

    });
