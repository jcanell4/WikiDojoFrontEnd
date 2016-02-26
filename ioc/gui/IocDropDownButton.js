define([
    "dojo/_base/declare",
    "dijit/form/DropDownButton",
    "dijit/_TemplatedMixin",
    "dijit/_Templated",
    "dojo/text!./templates/DropDownButton.html",
    "ioc/gui/ResizableComponent"
], function (declare, DropDownButton, _TemplatedMixin, _Templated, template, IocComponent) {

    var ret = declare("ioc.gui.IocDropDownButton", [DropDownButton, IocComponent, _Templated],

        /**
         * Afegeix un nou mètode al DropDownButton estàndar que redimensiona el botó
         * per igualar-lo a la mida del seu contenidor pare.
         *
         * @class IocDropDownButton
         * @extends DropDownButton
         * @extends _TemplatedMixin
         * @extends ResizableComponent
         */
        {
            templateString: template,
            
            constructor:function(){
                //console.log("IocDropDownButton");
            },

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
