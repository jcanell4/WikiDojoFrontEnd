define([
    "dojo/_base/declare", // declare
    "dijit/form/TextBox",
    "dijit/MenuItem",
    "dijit/form/Button",
    "ioc/wiki30/Request",
    'dijit/_TemplatedMixin',
    "dojo/text!./templates/MenuItemDokuwiki.html",
    "dijit/registry",
    "dojo/dom-form",
    "dojo/dom-style",
    "dojo/NodeList-dom", // NodeList.style
    "ioc/gui/IocResizableComponent",
    "dojo/_base/lang"

], function(declare, TextBox, MenuItem, Button, Request, _TemplatedMixin, template, registry, domForm, style, IocComponent, dojoBase) {
    return declare("ioc.gui.IocMenuItem",
            [MenuItem, Request, _TemplatedMixin, IocComponent],
            {
                templateString: template,
                query: "",
                _onClick: function(evt) {
                    this.inherited(arguments);
                    this.sendRequest(this.getQuery());
                },
                //això és temporal per tal de que funcioni
                //però s'ha de treure perquè Request ja la tindrà
                getQuery: function() {
                    return this.query;
                }

            });

});


