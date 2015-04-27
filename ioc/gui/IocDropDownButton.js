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
         * @class IocDropDownButton
         * @extends DropDownButton
         * @extends _TemplatedMixin
         * @extends IocResizableComponent
         * @extends Request
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
