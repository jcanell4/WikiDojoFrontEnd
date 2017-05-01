define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/IocFilteredItem.html',
    'dojo/on',
    'dojo/_base/lang',
    'dojo/text!./css/IocFilteredItem.css',
    "dojo/Evented",
], function (declare, _WidgetBase, _TemplatedMixin, template, on, lang, css, Evented) {

    var cssStyle = document.createElement('style');
    cssStyle.innerHTML= css;
    document.head.appendChild(cssStyle);

    return declare("ioc.widgets.IocFilteredItem", [_WidgetBase, _TemplatedMixin, Evented], {

        templateString: template,

        name: "Sense nom",
        username: "Sense username",

        baseClass: "ioc-filtered-item",


        postCreate: function(){
            var domNode = this.domNode;
            this.inherited(arguments);
            this.own(
//              on(domNode, 'click', lang.hitch(this, "_click"))
                on(domNode, 'click', this._click.bind(this))
            );
        },

        _click: function() {
            this.emit("selected", {name: this.name, username: this.username});
        },

        hide: function() {
            jQuery(this.domNode).css('display', 'none');
        },

        show: function() {
            jQuery(this.domNode).css('display', 'inherit');
        }

    });
});
