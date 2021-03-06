define([
    "dojo/dom-construct" //Cal importar el constructir del DOM
            , "ioc/gui/IocButton"
            , "dijit/Dialog"
            , "dijit/form/Button"
            , "dojo/domReady!"
], function(domConstruct, iocButton, Dialog, Button) {
    var res = function(params) {
        var maxWidth = 800;
        var maxHeight = 600;

        var imageDialog = new Dialog({
            title: params.imageTitle
            , onHide: function(e) { //Voliem detectar el event onClose i hem hagut de utilitzar onHide
                this.destroyRecursive();
            }
            , id: "imageDialog" + "_" + params.imageId
        });
        
        /*CAPTURAR EL offsetWidth del titol*/
        var titleId = imageDialog.get("id") + "_title";
//        console.log(titleId);
//        console.log(query("#"+titleId).offsetWidth);//undefined
//        console.log(dom.byId(titleId).innerHTML.offsetWidth);//undefined
//        console.log(dom.byId(titleId).offsetWidth);//0

        var dialogContainer = domConstruct.create("div", {
            id: "dialogContainer" + "_" + params.imageId
        });
        var contentContainer = domConstruct.create("div", {
            "class": "dijitDialogPaneContentArea"
            , "style": "maxWidth:" + maxWidth + "px; maxHeight:" + maxHeight + "px; overflow:auto;"
            , "innerHTML": params.content
        });
        var actionBar = domConstruct.create("div", {
            "class": "dijitDialogPaneActionBar"
        });
       
        /**/

        var mediaButton = new iocButton({
            "label": params.modifyImageLabel
            , "urlBase": "lib/exe/ioc_ajax.php?call=mediadetails"
            , "query": 'id='+params.fromId +'&image=' + params.imageId//+'&img='+params.imageId+'&do=media'                   
        });

        mediaButton.addClickListener(function() {
            imageDialog.destroyRecursive();
        });

        mediaButton.placeAt(actionBar);

        new Button({
            "label": params.closeDialogLabel
            , "onClick": function(e) {
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
