define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/IocImportSelectedItem.html',
    'dojo/text!./css/IocImportSelectedItem.css'
    ],
    function (declare, _WidgetBase, _TemplatedMixin, template, css) {

        var cssStyle = document.createElement('style');
        cssStyle.innerHTML = css;
        document.head.appendChild(cssStyle);

        return declare([_WidgetBase, _TemplatedMixin], {
            templateString: template,
            baseClass: 'ioc-selected-item',

            postCreate: function () {
                this.inherited(arguments);
                this._fillValues();
            },

            _setValueAttr: function(value) {
                this.value = value;
                this._fillValues();
            },

            _fillValues: function() {
                jQuery(this.selectedItemsNode).html('');
                this._itemSelected(this.value);
            },

            _itemSelected: function (item) {
                var newItem = jQuery('<span></span>');
                newItem.html(item);
                jQuery(this.selectedItemsNode).append(newItem);
            }

        });

    });
