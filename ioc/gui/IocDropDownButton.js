/* 
 * IocDropDownButton
 */
define([
    "dojo/_base/declare",
    "dijit/form/DropDownButton",
    "ioc/wiki30/Request",
    "dijit/_TemplatedMixin",
    "dojo/text!./templates/DropDownButton.html",
    "ioc/gui/IocResizableComponent"
], function (declare, DropDownButton, Request, _TemplatedMixin, template, IocComponent) {

    var ret = declare("ioc.gui.IocDropDownButton", [DropDownButton, Request, _TemplatedMixin, IocComponent],
        /**
         * Afegeix un nou mètode al DropDownButton estàndar que redimensiona el botó
         * per igualar-lo a la mida del seu contenidor pare.
         *
         * @class ioc.gui.IocDropDownButton
         * @extends dijit.form.DropDownButton
         * @extends dijit._TemplatedMixin
         * @extends ioc.gui.IocResizableComponent
         * @extends ioc.wiki30.Request
         * @extends ioc.gui.IocResizableComponent
         */
        {
            templateString: template,

            /** @override */
            startup: function () {
                this.inherited(arguments);
                this.nodeToResize = this._buttonNode;
                this.topNodeToResize = this._buttonTopNode;
                this.resize();
            }
        });
    return ret;
});
