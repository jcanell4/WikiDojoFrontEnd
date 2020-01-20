define([
    "dojo/_base/declare",
    "dijit/_editor/plugins/EnterKeyHandling",
    "dojo/_base/lang",
], function (declare, EnterKeyHandling, lang) {

    var CustomKeyHandling = declare("dijit._editor.plugins.CustomKeyHandling", EnterKeyHandling, {

        setEditor: function (editor) {

            this.inherited(arguments);
            var h = lang.hitch(this, "handleTabKey");

            // això no funciona amb el tabulador, el tabulador es gestiona en algún altre lloc fora de l'editor
            editor.addKeyHandler(9, 0, 0, h); // tab
            editor.addKeyHandler(9, 1, 0, h); // ctrl+tab

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

        // onKeyPressed: function () {
        //     this.inherited(arguments);
        //     alert("test custom");
        //     return;
        // },

        handleTabKey: function (e) {
            if (this.editor.getCurrentNodeState().indexOf('table') !== -1) {
                alert("TODO! gestionar la navegació per la taula amb TAB")
            } else {
                console.log("Handled Tab");
                return true;
            }
        },

        handleEnterKey: function (e) {

            // console.log("handleEnterKey:", e, this.editor.getCurrentNodeState());


            // Si es troba dintre de una taula s'ha de procedir normalmente, no cal controlar que sigue un enter perquè això es fa al parent onKeyPressed

            if (this.editor.getCurrentNodeState().indexOf('table') === -1) {
                return this.inherited(arguments);
            } else {
                return true;
            }

        },
    });

    return CustomKeyHandling;
});