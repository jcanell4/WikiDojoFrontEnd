define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/text!./templates/SearchTree.html',
    'dojo/text!./css/SearchTree.css',
    'ioc/gui/NsTreeContainer',
    'ioc/wiki30/Request',
    'ioc/wiki30/processor/AbstractResponseProcessor'
], function (declare,_WidgetBase,_TemplatedMixin,template,css,NsTreeContainer,Request,AbstractResponseProcessor) {

    var cssStyle = document.createElement('style');
    cssStyle.innerHTML = css;
    document.head.appendChild(cssStyle);

    return declare("ioc.widgets.SearchTree", [_WidgetBase, _TemplatedMixin, Request, NsTreeContainer, AbstractResponseProcessor], {

        templateString: template,
        baseClass: "search-tree-pane",

        postCreate: function () {
            this.inherited(arguments);
            var that = this;

            this.tree.onClick = function(item) {
                if (item.type==="d" || that.projectType.includes(item.projectType)) {
                    that.callback(item.id);
                }else {
                    alert("El tipus de projecte " + item.projectType + " no està permés.");
                }
            };

            this.addProcessor("array", this);
        }

    });

});
