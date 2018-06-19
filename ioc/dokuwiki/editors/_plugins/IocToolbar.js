define([
    "dojo/_base/declare",
    "dijit/Toolbar",
    // "dijit/form/Button",
    // "dojo/_base/array",
    // "dojo/domReady!"
], function(declare, Toolbar/*, Button, array*/){


    return declare([Toolbar], {

        constructor: function() {
            //console.log("Creada toolbar");
        }
    });

    // var t  = new IocToolbar();



    // Test: afegim la toolbar directament a la pàgina

    // var $container = jQuery('#bodyContent');
    // $container.append(jQuery('<span id="toolbarXXX"></span>'));
    //
    //
    //
    // var toolbar = new IocToolbar({}, "toolbarXXX");
    //
    // array.forEach(["Cut", "Copy", "Paste"], function(label){
    //     console.log("inici");
    //     var button = new Button({
    //         // note: should always specify a label, for accessibility reasons.
    //         // Just set showLabel=false if you don't want it to be displayed normally
    //         label: label,
    //         showLabel: false,
    //         iconClass: "dijitEditorIcon dijitEditorIcon"+label
    //     });
    //
    //     button.startup();
    //
    //     console.log("Afegit el botó", button);
    //
    //     toolbar.addChild(button);
    //
    //     console.log("Afegit a la barra");
    // });
    // toolbar.startup();

    // return IocToolbar;
});