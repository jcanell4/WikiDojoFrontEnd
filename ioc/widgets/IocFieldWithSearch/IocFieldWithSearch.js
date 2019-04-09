define([
        'dojo/_base/declare',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dojo/text!./templates/IocFieldWithSearch.html',
        'dojo/_base/array',
        'dojo/text!./css/IocFieldWithSearch.css',
        'dijit/form/Button',
        'ioc/wiki30/dispatcherSingleton',
        'ioc/widgets/SearchPane/SearchPane',
        'dojo/dom-class',
        'dojo/string', // string.substitute
        'ioc/wiki30/Request',
    ],

    function (declare, _WidgetBase, _TemplatedMixin, template, arrayUtil, css, Button, getDispatcher, SearchPane,
              domClass, string, Request) {

        var cssStyle = document.createElement('style');
        cssStyle.innerHTML = css;
        document.head.appendChild(cssStyle);

        var dispatcher = getDispatcher();

        return declare([_WidgetBase, _TemplatedMixin], {
            templateString: template,

            baseClass: 'ioc-filtered-list',

            // {string} clau del camp a utilizar com identificador
            fieldId: null,


            // [Object] definició dels camps a mostrar a la taula de cerca
            fields: null,

            // [Object] Array amb la informació dels items a afegir en el desplegable per defecte
            data: null,

            // {string} etiqueta del botó del dialog per iniciar la cerca
            buttonLabel: null,

            // {string} nom que rep el camp ocult del formulari que conté els identificadors dels elements seleccionats
            // i que s'enviarà amb el formulari
            fieldName: null,

            // {string} url per realitzar la cerca desdel panell de cerca i que retornarà l'array d'elements trobats
            searchDataUrl: null,

            // {string} títol del diàleg de cerca
            dialogTitle: null,

            // {string} etiqueta del botó per tancar el diàleg de cerca i afegir els resultats seleccionats.
            dialogButtonLabel: null,

            // {string} template a utilitzar per cada item afegit
            itemTemplateHtml: null,

            // {string} format del valor que es desa, per defecte es string, accepta també el format 'json'
            valueFormat: null,

            fieldValue: null,

            constructor: function (args) {

                if (!this.data) {
                    this.data = [];
                }


            },

            postCreate: function () {
                this.inherited(arguments);
                this._addListeners();
                this._fillValues();
                this._fill();
            },

            _fillValues: function() {

                jQuery(this.fieldValue).val(this.value);

            },

            _addListeners: function () {

                var searchButton = new Button({
                    iconClass: 'ioc-filtered-list-icon search',
                    showLabel: false
                }).placeAt(this.buttonContainer);

                var $searchButton = jQuery(searchButton.domNode);

                $searchButton.on('click', function () {

                    var searchWidget = new SearchPane({
                        ns: this.ns,
                        urlBase: this.searchDataUrl,
                        buttonLabel: this.buttonLabel,

                        // Això ha d'arribar des del servidor, format {field:label, field:label}
                        fields: this.fields,
                        colFieldId: this.fieldId,
                        multiple: false
                    });

                    var dialogParams = {
                        title: this.dialogTitle,
                        message: '',
                        sections: [
                            // Secció 1: widget de cerca que inclou la taula pel resultat.
                            // searchUserWidget.domNode
                            {widget: searchWidget}
                        ],

                        buttons: [
                            {
                                id: 'add-results',
                                description: this.dialogButtonLabel,
                                buttonType: 'default',
                                callback: function () {
                                    var items = searchWidget.getSelected();

                                    // Només esperem 1 element, però com és el mateix els recorrem en lloc d'agafar el primer (és un objecte, no un array).
                                    for (var item in items) {
                                        this._itemSelected(items[item]);
                                    }

                                }.bind(this)
                            }
                        ]
                    };

                    var dialogManager = dispatcher.getDialogManager();
                    var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, 'search-users', dialogParams);

                    dialog.show();

                }.bind(this));

            },

            process: function(response) {
                this.data = response;
                this._fill();
            },

            _fill: function () {

                // Alerta[Xavi] Això fa falta per alguna raó? (era per omplir la llista inicial?)
                if (typeof this.data === 'string') {
                    var request = new Request({urlBase: this.data, dispatcher: dispatcher});
                    request.addProcessor("array", this);

                    var params = this.dataQuery || {};

                    params.id = this.ns;

                    request.sendRequest(params);


                    return;
                }


            },

            _itemSelected: function (item) {

                // TODO: Només cal posar el valor del item com a valor del camp
                this.value = item[this.fieldId];
                jQuery(this.fieldValue).val(this.value);

            },

        });
    });


