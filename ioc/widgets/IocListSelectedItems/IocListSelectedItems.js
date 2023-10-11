define([
        'dojo/_base/declare',
        'dijit/_WidgetBase',
        'dijit/_TemplatedMixin',
        'dojo/text!./templates/IocListSelectedItems.html',
        'dojo/text!./css/IocListSelectedItems.css',
        // 'dojo/_base/array',
        // 'ioc/widgets/IocFilteredItem/IocFilteredItem',
        // 'dijit/form/Button',
        // 'ioc/wiki30/dispatcherSingleton',
        // 'ioc/widgets/SearchPane/SearchPane',
        // 'ioc/widgets/SearchUsersPane/SearchUsersPane',
        // 'dojo/dom-class',
        'dojo/string', // string.substitute
    ],

    function (declare, _WidgetBase, _TemplatedMixin, template, css, string) {

        var cssStyle = document.createElement('style');
        cssStyle.innerHTML = css;
        document.head.appendChild(cssStyle);


        return declare([_WidgetBase, _TemplatedMixin], {
            templateString: template,
            //
            baseClass: 'ioc-filtered-list',

            // {string} clau del camp a utilizar com identificador
            fieldId: null,

            // {string} clau del camp a utilitzar com entrada per defecte
            defaultEntryField: null,

            // [Object] definició dels camps a mostrar a la taula de cerca
            fields: null,

            // {string} nom que rep el camp ocult del formulari que conté els identificadors dels elements seleccionats
            // i que s'enviarà amb el formulari
            fieldName: null,

            // {string} template a utilitzar per cada item afegit
            itemTemplateHtml: null,

            // {string} format del valor que es desa, per defecte es string, accepta també el format 'json'
            valueFormat: null,

            postCreate: function () {
                this.inherited(arguments);
                // this._addListeners();
                // this._fill();
                this._fillValues();

            },

            _fillValues: function() {

                jQuery(this.selectedItemsNode).html('');

                // TODO: si this.values es un string son valors separats per comes, s'han de generar els items
                // per defecte com quan s'entren per teclat

                if (this.valueFormat === 'json' && typeof this.value === 'string' && this.value.length > 0) {
                    this.value = JSON.parse(this.value);
                } else if (typeof this.value === 'string') {
                    this.value = this._generateItemsFromString(this.value);
                }

                if (!this.value || Object.keys(this.value).length === 0) {

                    // Això serveix per afegir un espai mínim quan la llista es buida
                    jQuery(this.selectedItemsNode).html('<li></li>');
                }

                for (var item in this.value) {
                    this._itemSelected(this.value[item]);
                }

            },

            _generateItemsFromString: function(value) {
                if (value.length === 0) {
                    return {};
                }


                var objects = {};
                var values = value.split(',');

                for (var i = 0; i < values.length; i++) {
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

            getItemHtmlTemplate: function () {
                var htmlTemplate;

                if (this.itemHtmlTemplate) {
                    htmlTemplate = this.itemHtmlTemplate;
                } else {
                    // Gerenerem un template automàtic a partir del fieldId i el defaultEntryField
                    htmlTemplate = '${' + this.defaultEntryField + '} &lt;${' + this.fieldId + '}&gt;';
                    this.itemHtmlTemplate = htmlTemplate;
                }

                return htmlTemplate;
            },

            _setValueAttr: function(value) {
                this.value = value;
                this._fillValues();
            },

            _itemSelected: function (item) {

                if (this.selected[item[this.fieldId]]) {
                    console.log("Ja s'ha afegit anteriorment");
                    return;
                }

                // Ens assegurem que com a mínim aquests dos valors estan definits per evitar errors al template per defecte.
                if (!item[this.fieldId]) {
                    item[this.fieldId] = '';
                }

                if (!item[this.defaultEntryField]) {
                    item[this.defaultEntryField] = '';
                }

                var newItem = jQuery('<li class="selected"></li>');


                var itemHtml = string.substitute(this.getItemHtmlTemplate(), item);
                newItem.html(itemHtml);

                jQuery(this.selectedItemsNode).append(newItem);

                // newItem.insertBefore(this.entryListItem);

            }

        });
    });


