/* 
 * Extensió de ContentPane que afegeix l'esdeveniment OnResize 
 */
define([
    "dojo/_base/declare",
    "dijit/layout/ContentPane",
    "ioc/wiki30/dispatcherSingleton"
], function (declare, ContentPane, getDispatcher) {
    var ret = declare("ioc.gui.ContentPaneOnResize", [ContentPane],
        /**
         * @class ContentPaneOnResize
         * @extends ContentPane
         * @author Rafael Claver <rclaver@xtec.cat>
         */
        {
            constructor:function(){
                if(!this.dispatcher){
                    this.dispatcher = getDispatcher();
                }
            },
            
            /** @override */
            resize: function(size){
                this.inherited(arguments);
                this.onResize({"size":size});
            },
            
            onResize: function(data) {}
        });
        
    return ret;
});
