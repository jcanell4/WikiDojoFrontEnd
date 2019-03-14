define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/IocFilteredItem.html',
    'dojo/on',
    'dojo/_base/lang',
    'dojo/text!./css/IocFilteredItem.css',
    'dojo/Evented',
    'dojo/string', // string.substitute
], function (declare, _WidgetBase, _TemplatedMixin, template, on, lang, css, Evented, string) {

    var cssStyle = document.createElement('style');
    cssStyle.innerHTML= css;
    document.head.appendChild(cssStyle);

    return declare("ioc.widgets.IocFilteredItem", [_WidgetBase, _TemplatedMixin, Evented], {

        templateString: template,

        baseClass: "ioc-filtered-item",

        // calu del camp a utilizar com a entrada de teclat
        defaultEntryField: null,

        // clau del camp a utilizar com a identifiacodr
        fieldId: null,

        // objecte amb la informació del item
        fields: null,


        constructor: function(args) {
            // els args han de contenir:
            //  data: objecte amb la informació del item
            //  fieldId: camp que es farà servir como identificador
            //  defaultEntryField: camp qeu es farà servir com a text entrat

            if (!args.fields) {
                this.fields = {};
            }

        },

        postCreate: function(){
            var fclick = lang.hitch(this, "_click");
            var domNode = this.domNode;
            var $itemNode  = jQuery(this.itemNode);
            this.inherited(arguments);



            for (var fieldKey in this.fields) {
                var newItem = jQuery('<div>');
                var html = this.fields[fieldKey];

                if (fieldKey === this.defaultEntryField) {
                    html = '<b>' + html + '</b>';
                } else if (fieldKey === this.fieldId) {
                    html = '<i>' + html + '</i>';
                }

                newItem.html(html);
                $itemNode.append(newItem);
            }



            this.own(
              on(domNode, 'click', fclick)
            );
        },

        _click: function() {
            this.emit("selected", this.fields);
        },

        hide: function() {
            jQuery(this.domNode).css('display', 'none');
        },

        show: function() {
            jQuery(this.domNode).css('display', 'inherit');
        }

    });
});
