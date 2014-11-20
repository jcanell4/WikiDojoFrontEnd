define([
    "ioc/gui/IocButton"
            , "dijit/Dialog"
            , "dijit/form/Button"
], function(iocButton, Dialog, Button) {

    var res = function(content, imageTitle, imageName) {
        var imageDialog = new Dialog({
            title: imageTitle,
            content: content,
            id: "imageDialog"
        });

        var actionBar = dojo.create("div", {
            "class": "dijitDialogPaneActionBar"
        }, imageDialog.containerNode);

        new iocButton({
            "label": "TODO"
        }).placeAt(actionBar);
        
        new Button({
            "label": "Cancel",
            "onClick": function(evt) {
                dijit.byId("imageDialog").destroyRecursive();
            }
        }).placeAt(actionBar);
    };
    return res;
});
