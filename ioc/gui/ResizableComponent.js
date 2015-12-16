/* 
 * Funcions comunes als botons
 */
define([
    "dojo/_base/declare",
    "dojo/dom-style"
], function (declare, style) {
    var ret = declare("ioc.gui.ResizableComponent", [],

        /**
         * Afegeix el mètode 'resize' que redimensiona l'objecte per igualar-lo a la mida del seu contenidor pare.
         * El mètode s'activa amb l'atribut autoSize.
         *
         * @class IocResizableComponent
         * @extends Request
         * @author Rafael Claver <rclaver@xtec.cat>
         */
        {
            /** @type {HTMLElement} */
            nodeToResize:    null,

            /** @type {HTMLElement} */
            topNodeToResize: null,

            /** @type {boolean} */
            visible: true,

            /** @type {boolean} */
            autoSize: false,

            /** @override */
            set: function (propName) {
                this.inherited(arguments);
                if (propName === "visible") {
                    this.__setVisible();
                }
            },

            /**
             * Mostra o amaga el widget.
             *
             * @private
             */
            __setVisible: function () {
                if (this._started) {
                    var node = this.nodeToResize;
                    if (this.visible) {
                        style.set(node, "display", "");
                        this.resize();
                    } else {
                        style.set(node, "display", "none");
                    }
                }
            },

            /**
             * Canvia la mida del botó segons l'estat de la propietat autoSize. Si aquesta es true es canvia la mida per
             * ajustarla a la mida del contenidor pare, i si es false es deixa com està.
             *
             * @override
             */
            resize: function () {
                if (this.autoSize) {
                    this.inherited(arguments);
                    var correccio_amplada = 15;
                    var node = this.nodeToResize;
                    var nodePare = this.topNodeToResize.parentNode;
                    var amplePare = nodePare.clientWidth - correccio_amplada;
                    style.set(node, "width", amplePare + "px");
                }
            }
        });
    return ret;
});
