define([
    "dojo/_base/declare",
    "ioc/gui/ButtonToListen",
    "dojo/text!./templates/Button.html",
    "ioc/wiki30/Request"
], function (declare, ButtonToListen, template, Request) {
    var ret = declare("ioc.gui.IocButton", [ButtonToListen, Request],

        /**
         * Declara un Botó capaç de gestionar la petició de tipus ajaxCommand
         *
         * Hereta de ButtonToListes i perr tant conté la seva funcionalitat. És 
         * a dir,  és un boto que al clicar-lo recorre tots els listeners 
         * associats i els processa si son objectes o els executa si son funcions, 
         * Adapta la mida al contenidor, etc.
         * 
         * @class IocButton
         * @extends ioc.gui.ButtonToListen
         * @extends Request
         */
        {
            /*templateString: template,*/
//            
//            constructor:function(){
//                //console.log("IocButton");
//            },
            
            /** @override */
            postListenOnClick: function(evt){
                this.sendRequest();
            }
        });
    return ret;
});