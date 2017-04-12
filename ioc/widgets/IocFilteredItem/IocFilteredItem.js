define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/IocFilteredItem.html',
    'dojo/dom-style',
    'dojo/mouse',
    'dojo/on',
    'dojo/_base/lang',
    'dojo/text!./css/IocFilteredItem.css',
    "dojo/Evented",
], function (declare, _WidgetBase, _TemplatedMixin, template, domStyle, mouse, on, lang, css, Evented) {

    var cssStyle = document.createElement('style');
    cssStyle.innerHTML= css;
    document.head.appendChild(cssStyle);

    return declare("ioc.widgets.IocFilteredItem", [_WidgetBase, _TemplatedMixin, Evented], {

        templateString: template,

        name: "Sense nom",
        userId: "Sense userId",

        baseClass: "ioc-filtered-item",


        postCreate: function(){
            var domNode = this.domNode;
            this.inherited(arguments);

            this.own(
                on(domNode, 'click', lang.hitch(this, "_click"))
            );
        },

        _click: function() {
            console.log("Click!", this);
            this.emit("selected", {name: this.name, userId: this.userId});
        },

        hide: function() {
            jQuery(this.domNode).css('display', 'none');
        },

        show: function() {
            jQuery(this.domNode).css('display', 'inherit');
        }

    });
});
