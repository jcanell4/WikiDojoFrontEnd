/* 
 * Funcions comunes als botons
 */
define([
    "dojo/_base/declare",
    "ioc/gui/ResizableComponent",
    "ioc/wiki30/Request"

], function (declare, Resizable, Request) {
    var ret = declare("ioc.gui.IocResizableComponent", [Resizable, Request],

        /**
         * Combina el comportament de redimensió + la capacitat de fer crides 
         * a comandes.
         *
         * @class IocResizableComponent
         * @extends ResizableComponent, Request
         * @author Rafael Claver <rclaver@xtec.cat>
         */
        {
            constructor:function(){
                console.log("IocResizableComponent");
            }
        });
    return ret;
});
