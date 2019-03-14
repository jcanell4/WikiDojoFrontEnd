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
    ],

    function (declare, _WidgetBase, _TemplatedMixin, template, arrayUtil, IocFilteredItem, css, Button, getDispatcher, SearchUsersPane, domClass, string) {

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
        }


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

            // {string} token de seguretat de la wiki
            token: null,

            // {string} url per realitzar la cerca desdel panell de cerca i que retornarà l'array d'elements trobats
            searchDataUrl: null,

            // {string} títol del diàleg de cerca
            dialogTitle: null,

            // {string} etiqueta del botó per tancar el diàleg de cerca i afegir els resultats seleccionats.
            dialogButtonLabel: null,

            // {string} template a utilitzar per cada item afegit
            itemTemplateHtml: null,

            constructor: function (args) {

                this.inherited(arguments);
                this.selected = {}; // referenciats pel id per trobar-los més ràpidament
                this.candidate = null;

                if (!this.data) {
                    this.data = [];
                }

            },

            postCreate: function () {
                this.inherited(arguments);
                this._addListeners();
                this._fill();
            },

            _addListeners: function () {
                var $input = jQuery(this.entryText);

                var that = this;

                $input.on('change click input', function () {
                    this.filter($input.val());
                }.bind(this));

                $input.on('keydown', function (e) {


                    if (e.which == 13) { // Enter
                        var item;
                        // cas 1: Hi ha almenys un element visible a la llista, es selecciona
                        if (this.candidate) {
                            item = this.candidate;
                        } else {

                            item = {};
                            for (var fieldKey in that.fields) {
                                if (fieldKey === that.defaultEntryField) {
                                    item[fieldKey] = $input.val();
                                } else {
                                    item[fieldKey] = '';
                                }
                            }

                        }

                        this.filter('');
                        this._itemSelected(item);
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


            _fill: function () {

                // console.log("IocFilteredList#fill", this.data);
                this.itemListByFieldId = {};

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

                });
            },


            getItemHtmlTemplate: function () {
                var htmlTemplate;

                if (this.itemHtmlTemplate) {
                    htmlTemplate = this.itemHtmlTemplate;
                } else {
                    // Gerenerem un template automàtic a partir del fieldId i el defaultEntryField
                    htmlTemplate = '${' + this.defaultEntryField + '} &lt;${' + this.fieldId + '}&gt;';
                }

                return htmlTemplate + " <span data-close>x</span>";
            },

            _itemSelected: function (item) {

                if (this.selected[item[this.fieldId]]) {
                    // console.log("Ja s'ha afegit anteriorment")
                    return;
                }

                // TODO[Xavi] decidir com definir el format, utilitzar algun tipus de template? utilitzar aquest format
                // com a default si no es passa cap template? (repasar el 'string' de Dojo per treballar amb els templates)


                // Ens assegurem que com a mínim aquests dos valors estan definits per evitar errors al template per defecte.

                console.log("item?", item);
                
                alert('stop');
                if (!item[this.fieldId]) {
                    item[this.fieldId] = ''
                }

                if (!item[this.defaultEntryField]) {
                    item[this.defaultEntryField] = '';
                }

                var newItem = jQuery('<li class="selected"></li>');

                var itemHtml = string.substitute(this.getItemHtmlTemplate(), item);
                newItem.html(itemHtml);

                // newItem.html(item.name + " &lt;" + item.username + "&gt;" + " <span data-close>x</span>");

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


                if (query !== null) {
                    query = query.toLowerCase();
                }

                this.lastQuery = query;


                for (var i = 0; i < this.data.length; i++) {

                    var item = this.data[i];


                    var lowerFieldId = item[this.fieldId].toLowerCase(),
                        loserDefaultEntryField = item[this.defaultEntryField].toLowerCase();


                    // Si es troba seleccioant no cal comprovar-lo, ja s'ha amagat abans.
                    if (this.selected[item[this.fieldId]]) {
                        // console.log("Ja es troba seleccionat", item.username);
                        continue;

                    } else if (query === null) {
                        item.widget.hide();

                    } else {
                        // Si la mida del query es 0 es mostren tots

                        if (query.length === 0 || lowerFieldId.indexOf(query) >= 0 || loserDefaultEntryField.indexOf(query) >= 0) {
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


