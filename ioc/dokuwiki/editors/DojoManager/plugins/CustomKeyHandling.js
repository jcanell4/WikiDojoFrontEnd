define([
    "dojo/_base/declare",
    "dijit/_editor/plugins/EnterKeyHandling",
    "dojo/_base/lang",
], function (declare, EnterKeyHandling, lang) {

    var CustomKeyHandling = declare("dijit._editor.plugins.CustomKeyHandling", EnterKeyHandling, {

        setEditor: function (editor) {

            this.inherited(arguments);
            var h = lang.hitch(this, "handleEnterKey");

            // això no funciona amb el tabulador, el tabulador es gestiona en algún altre lloc fora de l'editor
            editor.addKeyHandler(13, 0, 0, h); // tab
            editor.addKeyHandler(13, 1, 0, h); // ctrl+tab

            // editor.addKeyHandler(9, 0, 0, h); // tab
            // editor.addKeyHandler(9, 1, 0, h); // ctrl+tab


            // aquestes si que funcionen (son exemples)
            // editor.addKeyHandler(86, 0, 0, h); // v
            // editor.addKeyHandler(38, 0, 0, h); // Up
            // editor.addKeyHandler(40, 0, 0, h); // Down
            // editor.addKeyHandler(37, 0, 0, h); // Left
            // editor.addKeyHandler(39, 0, 0, h); // Right

            // Aquesta implementació funciona per les tecles però no pel tab
            // this.editor.on('KeyPressed', function(e) {
            //     console.log(e, this.editor.getCurrentNodeState());
            //     alert("dojo keypressed");
            // }.bind(this));


        },

        handleEnterKey: function (e) {

            // console.log("handleEnterKey:", e, this.editor.getCurrentNodeState());


            // Si es troba dintre de una taula s'ha de procedir normalmente, no cal controlar que sigue un enter perquè això es fa al parent onKeyPressed

            var isIocInfo = this.editor.getCurrentNodeState().indexOf('iocinfo') > -1;

            if (this.editor.getCurrentNodeState().indexOf('table') === -1 && !isIocInfo ) {
                return this.inherited(arguments);

            } else if (isIocInfo) {
                return false;
            } else {
                return true;
            }

        },
    });

    return CustomKeyHandling;
});