define([
     "dojo/dom-construct" //Cal importar el constructir del DOM
    ,"ioc/gui/IocButton"
    , "dijit/Dialog"
    , "dijit/form/Button"
//], function(iocButton, Dialog, Button) { //Cal importar el constructir del DOM
], function(domConstruct, iocButton, Dialog, Button) { 
//    var res = function(content, imageTitle, imageName) { //NOmés es passa un paràmetre! un objecte que conté les dades en el seu atribut
    var res = function(params) { 
        var content = params.content, imageTitle= params.imageTitle, imageName=params.imageName; //adaptació al teu sistema
        var imageDialog = new Dialog({
             title: imageTitle
            //,content: content, //Modifiquem el content per afegir-hi la barra de control 
            ,id: "imageDialog" + "_" + imageName
            //,style: "width: 500px"
        });

//        var actionBar = dojo.create("div", {   //No facis servir variables globals com dijit o dojo. Importa la funcionalitat equivalent!
        var dialogContainer = domConstruct.create("div", {
           id:"dialogContainer" + "_" + imageName
        });
        var contentContainer = domConstruct.create("div", {
           class:"dijitDialogPaneContentArea"            
        }).innerHTML=content;
        var actionBar = domConstruct.create("div", {
            "class": "dijitDialogPaneActionBar"
        });

        new iocButton({
            "label": "TODO"
        }).placeAt(actionBar);
        
        new Button({
            "label": "Cancel",
            "onClick": function(evt) {
                //dijit.byId("imageDialog").destroyRecursive(); //1) La variable imageDialog encara existeix! Per què no fer-la servir?  2) No facis servir variables globals com dijit o dojo. Importa la funcionalitat equivalent!
                imageDialog.destroyRecursive();
            }
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
