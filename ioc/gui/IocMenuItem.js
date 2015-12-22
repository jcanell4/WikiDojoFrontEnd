define([
    "dojo/_base/declare", // declare
    "dijit/MenuItem",
    'dijit/_TemplatedMixin',
    "dojo/text!./templates/MenuItemDokuwiki.html",
    "ioc/gui/IocResizableComponent"

], function(declare, MenuItem, _TemplatedMixin, template, IocComponent) {
    return declare("ioc.gui.IocMenuItem", [MenuItem, _TemplatedMixin, IocComponent],
            {
                templateString: template,
                _onClick: function(evt) {
                    this.inherited(arguments);
                    this.sendRequest(this.getQuery());
                },
            });

});


