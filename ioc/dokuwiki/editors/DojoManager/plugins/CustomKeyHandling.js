define([
    "dojo/_base/declare",
    "dijit/_editor/plugins/EnterKeyHandling",
    "dojo/_base/lang",
], function (declare, EnterKeyHandling, lang) {

    var ALLOWED_DELETE = [
        "p", "h1", "h2", "h3", "h4", "h5", "li", "ol", "ul"
    ];

    var CustomKeyHandling = declare("dijit._editor.plugins.CustomKeyHandling", EnterKeyHandling, {

        setEditor: function (editor) {

            this.inherited(arguments);
            var h = lang.hitch(this, "handleEnterKey");

            // això no funciona amb el tabulador, el tabulador es gestiona en algún altre lloc fora de l'editor
            editor.addKeyHandler(13, 0, 0, h); // enter
            editor.addKeyHandler(13, 1, 0, h); // ctrl+enter



            editor.addKeyHandler(8, 0, 0, function(e) {

                // console.log("detectat esborrar", e, editor.getCurrentNodeState());
                var selection = editor.getSelection();
                // ALERTA! només es compten com a nodes els blocks, no els inline
                console.log(selection);



                var $previousNode = editor.getPreviousNode();
                var $currentNode = editor.getCurrentNode();
                // console.log($previousNode, $currentNode);


                // Codi per controlar la eliminació dels continguts de les caixes: ioccontent i data-dw-field

                if (($previousNode.attr('data-dw-field')
                    || ($previousNode.length === 0 && $currentNode.parent().hasClass('ioccontent')))
                    && selection.documentSelection.anchorOffset === 0) {
                    // No es permet eliminar nodes amb camps
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }

                // Codi per controlar la eliminació dels elements amb data-delete-block
                if (($previousNode.attr('data-delete-block') || $currentNode.attr('data-delete-block')
                    /*|| ($previousNode.length === 0 && $currentNode.parent().hasClass('ioccontent'))*/)
                    && selection.documentSelection.anchorOffset === 0) {
                    // No es permet eliminar nodes amb camps
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }


                var wipe = false;


                for (var i =0; i<selection.nodes.length; i++) {
                    var node = selection.nodes[i];
                    // console.log("tagname:", node.tagName);

                    // console.log("Comprovant si hi ha més d'un node", selection.nodes.length > 1 && jQuery(node).attr('data-dw-field'));
                   if (selection.nodes.length > 1 && jQuery(node).attr('data-dw-field')) {
                       alert("No es poden eliminar blocs, fes servir la icona d'eliminació corresponent");
                       e.preventDefault();
                       e.stopPropagation();
                       return false;
                   }

                    // if (jQuery(node).parent().hasClass('action')) {
                    //     // alert("No es poden eliminar blocs, fes servir la icona d'eliminació corresponent");
                    //     e.preventDefault();
                    //     e.stopPropagation();
                    //     return false;
                    // }

                    if (selection.nodes.length>1 && !ALLOWED_DELETE.includes(node.tagName.toLowerCase())) {
                        alert("No es poden eliminar blocs, fes servir la icona d'eliminació corresponent");
                        e.preventDefault();
                        e.stopPropagation();
                        return false;
                    }

                    if (node.tagName.toLowerCase() === 'ol' || node.tagName.toLowerCase() === 'ul') {
                        // Eliminem tots els nodes seleccionats
                        wipe = true;
                        break;
                    }
                }

                // if (wipe) {
                //     // ALERTA: això no es pot desfer.
                //     for (var i =0; i<selection.nodes.length; i++) {
                //         jQuery(selection.nodes[i]).remove();
                //     }
                //
                //     // TEST
                //     e.preventDefault();
                //     e.stopPropagation();
                // }

                // Continuem normalment
                return true;


            }); // backspace

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
            var state = this.editor.getCurrentNodeState();

            if (state.indexOf('pre') !== -1 || state.indexOf('editable-text') !== -1) {
                return true;

            } else if (state.indexOf('table') === -1 && !isIocInfo) {

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