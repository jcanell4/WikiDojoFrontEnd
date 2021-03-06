define([
        'dojo/_base/declare',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dojo/text!./templates/IocFilteredList.html',
        'dojo/_base/array',
        'ioc/widgets/IocFilteredItem/IocFilteredItem',
        'dojo/text!./css/IocFilteredList.css',
        'dijit/form/Button',
        'ioc/wiki30/dispatcherSingleton',
        'ioc/widgets/SearchPane/SearchPane',
        // 'ioc/widgets/SearchUsersPane/SearchUsersPane',
        'dojo/dom-class',
        'dojo/string', // string.substitute
        'ioc/wiki30/Request',
    ],

    function (declare, _WidgetBase, _TemplatedMixin, template, arrayUtil, IocFilteredItem, css, Button, getDispatcher, SearchUsersPane, domClass, string, Request) {

        var cssStyle = document.createElement('style');
        cssStyle.innerHTML = css;
        document.head.appendChild(cssStyle);

        var dispatcher = getDispatcher();

        var isRelatedTargetAnItem = function (event) {

            var relatedTarget = event.relatedTarget || event.originalEvent.explicitOriginalTarget || event.originalTarget;
            var ret = relatedTarget && domClass.contains(relatedTarget, 'ioc-filtered-item');

            if (relatedTarget && !ret) {
                relatedTarget = relatedTarget.parentNode;
                ret = relatedTarget && domClass.contains(relatedTarget, 'ioc-filtered-item');
            }
            return ret;
        };


        return declare([_WidgetBase, _TemplatedMixin], {
            templateString: template,

            baseClass: 'ioc-filtered-list',

            // {string} clau del camp a utilizar com identificador
            fieldId: null,

            // {string} clau del camp a utilitzar com entrada per defecte
            defaultEntryField: null,

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

            // {object} referencia als controls jQuery
            controls: null,

            constructor: function (args) {

                this.selected = {}; // referenciats pel id per trobar-los més ràpidament
                this.candidate = null;

                if (!this.data) {
                    this.data = [];
                }

                this.itemListByFieldId = {};

                this.controls = {};
            },

            postCreate: function () {
                this.inherited(arguments);
                this._addListeners();
                this._fillValues();
                this._fill();
            },

            _fillValues: function() {

                // TODO: si this.values es un string son valors separats per comes, s'han de generar els items
                // per defecte com quan s'entren per teclat

                var value = null;

                if (this.valueFormat === 'json' && typeof this.value === 'string' && this.value.length>0) {
                    value = this.value = JSON.parse(this.value);
                } else if (typeof this.value === 'string') {
                    value = this._generateItemsFromString(this.value);
                }

                for (var item in value) {
                    this._itemSelected(value[item]);
                }

            },

            _generateItemsFromString: function(value) {
                if (value.length === 0) {
                    return {};
                }


                var objects = {};
                var values = value.split(',');

                for (var i=0; i<values.length; i++) {
                    var text = values[i];


                    var item = {};

                    if (this.fieldId) {
                        item[this.fieldId] = text;
                    }

                    if (this.defaultEntryField) {
                        item[this.defaultEntryField] = text;
                    }

                    objects[text] = item;
                }

                return objects;
            },

            _addInput: function() {
                var item;

                if (this.candidate) {
                    item = this.candidate;
                    this._itemSelected(item);
                } else {

                    //var value = this.controls.$input.val();

                    var values = this.controls.$input.val().split(',');

                    for (var i = 0; i < values.length; i++) {
                        var value = values[i].trim();

                        if (value === "") {
                            continue;
                        }

                        item = {};
                        item[this.fieldId] = value;
                        item[this.defaultEntryField] = item[this.fieldId];

                        this._itemSelected(item);
                    }

                }

                this.filter('');

            },

            _addListeners: function () {

                var $input = jQuery(this.entryText);
                this.controls.$input = $input;

                // var that = this;

                $input.on('change click input', function () {
                    this.filter($input.val());
                }.bind(this));

                $input.on('keydown', function (e) {


                    if (e.which == 13) { // Enter
                        this._addInput();
                        // var item;
                        // // cas 1: Hi ha almenys un element visible a la llista, es selecciona
                        // if (this.candidate) {
                        //     item = this.candidate;
                        // } else {
                        //
                        //     item = {};
                        //     item[this.fieldId] = $input.val();
                        //     item[this.defaultEntryField] = item[that.fieldId];
                        // }
                        //
                        // this.filter('');
                        // this._itemSelected(item);
                        e.preventDefault();
                        e.stopPropagation();

                    } else if (e.which === 27) {
                        this.filter(null);
                        e.preventDefault();
                        e.stopPropagation();
                    }

                }.bind(this));

                $input.on('blur', function (e) {
                    if (isRelatedTargetAnItem(e)) {
                        return;
                    } else {
                        this.filter(null);
                    }
                }.bind(this));

                $input.on('focus', function () {
                    this.filter($input.val());
                }.bind(this));

                this.selectedItemsNode.addEventListener('click', function () {
                    $input.focus();
                });

                var searchButton = new Button({
                    iconClass: 'ioc-filtered-list-icon search',
                    showLabel: false
                }).placeAt(this.buttonContainer);

                var $searchButton = jQuery(searchButton.domNode);

                $searchButton.on('click', function () {
                    this._addInput();



                    var searchUserWidget = new SearchUsersPane({
                        ns: this.ns,
                        urlBase: this.searchDataUrl,
                        buttonLabel: this.buttonLabel,

                        // Això ha d'arribar des del servidor, format {field:label, field:label}
                        fields: this.fields,

                        colFieldId: this.fieldId
                    });

                    var dialogParams = {
                        title: this.dialogTitle,
                        message: '',
                        sections: [
                            // Secció 1: widget de cerca que inclou la taula pel resultat.
                            // searchUserWidget.domNode
                            {widget: searchUserWidget}
                        ],
                        buttons: [
                            {
                                id: 'add-results',
                                description: this.dialogButtonLabel,
                                buttonType: 'default',
                                callback: function () {
                                    var items = searchUserWidget.getSelected();

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

            reset: function () {
                var $input = jQuery(this.entryText);
                $input.val('');

                var $field = jQuery(this.hiddenSelected);
                $field.val('');

                var $items = jQuery(this.selectedItemsNode).find('.selected');
                $items.remove();


                this.selected = {};
                this.candidate = null;
                this.lastQuery = null;


                this.filter(null);
            },


            process: function(response) {
                this.data = response;
                this._fill();
            },

            _fill: function () {

                if (typeof this.data === 'string' && this.data.length>0) {
                    var request = new Request({urlBase: this.data, dispatcher: dispatcher});
                    request.addProcessor("array", this);

                    var params = this.dataQuery || {};

                    params.id = this.ns;

                    request.sendRequest(params);



                    // request.sendRequest({
                    //     id: this.ns || '', // això es necessari per alguns commands, per exemple pel user_list
                    //     filter: this.filter || '',
                    // });

                    return;
                }

                var that = this;

                arrayUtil.forEach(this.data, function (item) {
                    // Create our widget and place it
                    var data = {};
                    data.fields = item;
                    data.fieldId = that.fieldId;
                    data.defaultEntryField = that.defaultEntryField;
                    data.container = that;
                    item.widget = new IocFilteredItem(data);
                    item.widget.placeAt(that.contentListNode);
                    item.widget.on('selected', that._itemSelected.bind(that));
                    that.itemListByFieldId[item[that.fieldId]] = item;

                    if (that.selected[item[that.fieldId]]) {
                        item.widget.hide();
                    }

                });
            },


            getItemHtmlTemplate: function () {
                var htmlTemplate;

                if (this.itemHtmlTemplate) {
                    htmlTemplate = this.itemHtmlTemplate;
                } else {
                    // Gerenerem un template automàtic a partir del fieldId i el defaultEntryField
                    htmlTemplate = '${' + this.defaultEntryField + '} &lt;${' + this.fieldId + '}&gt;';
                    this.itemHtmlTemplate = htmlTemplate;
                }

                return htmlTemplate + " <span data-close>x</span>";
            },

            _itemSelected: function (item) {

                if (this.selected[item[this.fieldId]]) {
                    console.log("Ja s'ha afegit anteriorment")
                    return;
                }

                // Ens assegurem que com a mínim aquests dos valors estan definits per evitar errors al template per defecte.
                if (!item[this.fieldId]) {
                    item[this.fieldId] = ''
                }

                if (!item[this.defaultEntryField]) {
                    item[this.defaultEntryField] = '';
                }

                var newItem = jQuery('<li class="selected"></li>');

                var itemHtml = string.substitute(this.getItemHtmlTemplate(), item);
                newItem.html(itemHtml);

                for (var fieldKey in this.fields) {
                    newItem.attr('data-' + fieldKey, item[fieldKey]);
                }


                newItem.insertBefore(this.entryListItem);

                var that = this;

                // Close button
                newItem.find('span[data-close]').on('click', function () {
                    that._itemUnselected(this);
                });

                if (item[this.fieldId]) {
                    this.selected[item[this.fieldId]] = item;

                    // ALERTA[Xavi] Els elements afegits a partir del dialeg no són a la llista

                    if (this.itemListByFieldId[item[this.fieldId]]) {
                        this.itemListByFieldId[item[this.fieldId]].widget.hide();
                    }

                } else {
                    // Aquest cas només pot ocorrer quan s'entra un valor que no es trobi a la llista
                    this.selected[item.name] = item;
                }

                this._updateHiddenSelectedField();

                var $input = jQuery(this.entryText);
                $input.val('');

                // ALERTA[Xavi] en el post create no el troba. Com no cal fer res fins que es selecciona alguna cosa ho afegim aquí
                if (!this.$form) {
                    this.$form = $input.closest('form');

                    this.$form.on('reset', function () {
                        this.reset();
                    }.bind(this));
                }

            },

            _itemUnselected: function (itemNode) {
                // console.log("IocFilteredList#_itemUnselected", itemNode);

                var $node = jQuery(itemNode.parentElement);

                // Ss'ha d'eliminar si està seleccionat la coincidencia de qualsevol camp.
                // Això es perque quan s'entra un valor que no sigui al llistat pot no tenir id, llavors s'ha de comprovar
                // el 'data-' + this.fieldId o el 'data-' + this.defaultEntryField

                var attrFieldId = 'data-' + this.fieldId,
                    attrDefaultEntryField = 'data-' + this.defaultEntryField;

                if (this.selected[$node.attr(attrFieldId)] || this.selected[$node.attr(attrDefaultEntryField)]) {
                    delete(this.selected[$node.attr(attrFieldId)]);
                    this.selectedCount--;
                    $node.remove();

                    this._updateHiddenSelectedField();

                } else {
                    // console.error("L'item no es troba a la llista de seleccionats:", $node, this.selected);
                }


                this.filter(this.lastQuery);

            },

            _updateHiddenSelectedField: function () {
                var value = this.valueFormat || '';

                switch (value.toLowerCase()) {

                    case 'json':
                        this._updateHiddenSelectedFieldJson();
                        break;

                    default:
                        this._updateHiddenSelectedFieldString();

                }

            },

            _updateHiddenSelectedFieldJson: function() {
                var $hiddenField = jQuery(this.hiddenSelected);

                var selectedItems = jQuery.extend(true, {}, this.selected);

                for (var key in selectedItems) {
                    delete(selectedItems[key].widget);
                }
                var selected = JSON.stringify(selectedItems);

                $hiddenField.val(selected);

                if (this.selected.length === 0) {
                    jQuery(this.entryText).prop('required', true);
                } else {
                    jQuery(this.entryText).prop('required', false);
                }

                this.set('value',selected);


            },

            _updateHiddenSelectedFieldString: function() {
                var $hiddenField = jQuery(this.hiddenSelected);

                var selectedIds = "",
                    first = true;

                for (var selected in this.selected) {
                    if (first) {
                        first = false;
                    } else {
                        selectedIds += ",";
                    }
                    selectedIds += selected;
                }

                $hiddenField.val(selectedIds);

                if (selectedIds.length === 0) {
                    jQuery(this.entryText).prop('required', true);
                } else {
                    jQuery(this.entryText).prop('required', false);
                }

                this.set('value', selectedIds);

            },

            /**
             * ALERTA[Xavi] Quan query es una cadena buida es mostren tots els resultats, però quan és null no es mostra cap resultat i s'amaga la llista
             *
             * @param query
             */
            filter: function (query) {
                // console.log("IocFilteredList#filter", query);

                if (this.candidate) {

                    jQuery(this.candidate.widget.domNode).removeClass('candidate');
                    this.candidate = null;
                }

                var isEmpty = true;

                if (query) {
                    query = query.toLowerCase();
                }

                this.lastQuery = query;


                for (var i = 0; i < this.data.length; i++) {

                    var item = this.data[i];

                    // console.log("Item:", item, this.fieldId, this.defaultEntryField);

                    var lowerFieldId = item[this.fieldId].toLowerCase(),
                        lowerDefaultEntryField = item[this.defaultEntryField].toLowerCase();


                    // Si es troba seleccioant no cal comprovar-lo, ja s'ha amagat abans.
                    if (this.selected[item[this.fieldId]]) {
                        // console.log("Ja es troba seleccionat", item.username);
                        continue;

                    } else if (query === null) {
                        item.widget.hide();

                    } else {
                        // Si la mida del query es 0 es mostren tots

                        if (query === undefined || query.length === 0 || lowerFieldId.indexOf(query) >= 0 || lowerDefaultEntryField.indexOf(query) >= 0) {
                            item.widget.show();

                            if (isEmpty) {
                                this.candidate = item;

                                jQuery(this.candidate.widget.domNode).addClass('candidate');
                                isEmpty = false;
                            }


                        } else {
                            item.widget.hide();
                        }
                    }
                }

                if (isEmpty) {
                    jQuery(this.contentListNode).css('display', 'none');
                } else {
                    jQuery(this.contentListNode).css('display', 'inherit');
                }


            }
        });
    });


