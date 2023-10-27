define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dojo/text!./templates/SearchTree.html',
    'dojo/text!./css/SearchTree.css',
    'ioc/gui/NsTreeContainer',
    'ioc/wiki30/Request'
], function (declare, _WidgetBase, template, css, NsTreeContainer, Request) {

    var cssStyle = document.createElement('style');
    cssStyle.innerHTML = css;
    document.head.appendChild(cssStyle);

    return declare("ioc.widgets.SearchTree", [_WidgetBase, Request, NsTreeContainer], {

        templateString: template,
        baseClass: "search-tree",
        selected: "",

        postCreate: function() {
            this.inherited(arguments);
            var that = this;

            this.tree.onClick = function(item) {
                if (that.projectType.includes(item.projectType)) {
                    that.setSelected(item.id);
                }else {
                    alert("El tipus de projecte " + item.projectType + " no està permés.");
                }
            };

            this.addProcessor("array", this);
        },

        setSelected: function(value) {
            this.selected = value;
        },

        getSelected: function() {
            return this.selected;
        }

    });

});
