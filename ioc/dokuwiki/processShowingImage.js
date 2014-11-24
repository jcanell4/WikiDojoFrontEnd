define([
     "dojo/dom-construct" //Cal importar el constructir del DOM
    ,"ioc/gui/IocButton"
    , "dijit/Dialog"
    , "dijit/form/Button"
    , "dojo/on"
    , "dojo/_base/event"
], function(domConstruct, iocButton, Dialog, Button, on, event) { 
    var res = function(params) { 
        var imageDialog = new Dialog({
             title: params.imageTitle
             ,onClose: function(e){event.stop(e);fOnClose();} //NO FUNCIONA, e.preventDefault() tampoc em funciona
            ,id: "imageDialog" + "_" + params.imageId
            //,style: "width: 500px"
        });

//        var actionBar = dojo.create("div", {   //No facis servir variables globals com dijit o dojo. Importa la funcionalitat equivalent!
        var dialogContainer = domConstruct.create("div", {
           id:"dialogContainer" + "_" + params.imageId
        });
        var contentContainer = domConstruct.create("div", {
           class:"dijitDialogPaneContentArea"            
        }).innerHTML=params.content;
        var actionBar = domConstruct.create("div", {
            "class": "dijitDialogPaneActionBar"
        });
        
        var fOnClose = function(){
            console.log("DESTROY");
            //imageDialog.destroyRecursive();
        };
        
        on(imageDialog, "close", function(e){fOnClose();});
        
        new iocButton({
            "label": params.modifyImageLabel
            ,"onClick": function(e){
                //TODO call ajaxcommand?
                fOnClose();
            }
        }).placeAt(actionBar);
        
        new Button({
            "label": params.closeDialogLabel
            ,"onClick": function(e){fOnClose();}
        }).placeAt(actionBar);
        
        
        //col·locar en el lloc adequat
        domConstruct.place(contentContainer, dialogContainer, "last");
        domConstruct.place(actionBar, dialogContainer, "last");
        
        //assignar i mostrar
        imageDialog.set("content", dialogContainer);
        imageDialog.show();
    };
    return res;
});
