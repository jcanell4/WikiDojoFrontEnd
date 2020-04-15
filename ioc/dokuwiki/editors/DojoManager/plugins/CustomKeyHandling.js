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
            var handleEnterKey = lang.hitch(this, "handleEnterKey");

            // això no funciona amb el tabulador, el tabulador es gestiona en algún altre lloc fora de l'editor
            editor.addKeyHandler(13, 0, 0, handleEnterKey); // enter
            editor.addKeyHandler(13, 1, 0, handleEnterKey); // ctrl+enter


            // Gestió de la tecla d'esborrar
            editor.addKeyHandler(8, 0, 0, this.handleDeleteKey.bind(this)); // backspace

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

            console.log("Estat:", state);

            // Problema: quan es troba l'últim ol o ul es posa com a <div></p>, ho hem de gestionar
            // ALERTA! Només cal gestionar-lo quan el ol/ul es troba al principi i no hi ha cap més

            if ((state.indexOf('ol') === 0 || state.indexOf('ul') === 0) && state.substr(3).indexOf('ol') === -1 && state.substr(3).indexOf('ul') === -1) {

                //var ret = this.inherited(arguments);
                var $node = this.editor.getCurrentNode();

                if ($node.prop('tagName').toLowerCase() === 'span') {
                    $node = $node.parent();
                }

                // Alerta! usar regex perquè es'tan estripant els espais anteriors ' ' i '&nbsp'
                if (!this.isEmpty($node)) {
                    return this.inherited(arguments);
                }

                // Cerquem el node pare, no funciona el or al selector
                var $parent = $node.parent('ul');

                if ($parent.length === 0) {
                    $parent = $node.parent('ol');
                }

                $node.remove();
                $parent.after('<p></p>');

                var $nouNode = $parent.next();

                // Moure el cursor al nou node

                this.editor.setCursorToNodePosition($nouNode.get(0));


                return false;


            } else if (state.indexOf('pre') !== -1 || state.indexOf('editable-text') !== -1) {
                return true;

            } else if (state.indexOf('table') === -1 && !isIocInfo) {

                return this.inherited(arguments);


            } else if (isIocInfo) {
                return false;
            } else {
                return true;
            }

        },

        isEmpty: function ($node) {
            // Si es buit s'ha de fer la gestió normal: return this.inherited(arguments);
            var html = $node.html();

            html = html.replace('/&nbsp;/g').trim();


            // Es considera buit si:
            // és buit
            if (html.length === 0) {
                console.log("Length = 0");
                return true;
            }

            // el contingut del node és '<br>' amb qualsevol cuantitat d'espais al davant o &nbsp;
            if (html === '<br>' || html === '<br />') {
                console.log("Hi ha un BR");
                return true;
            }

            // el contingut es un <span>
            if (jQuery(html).prop('tagName').toLowerCase() === 'span') {
                console.log("Es un span");
                return true;
            }

            console.log(" No es buit:", html, jQuery(html));

            return false;
        },

        handleDeleteKey: function (e) {
            // console.log("detectat esborrar", e, editor.getCurrentNodeState());
            var selection = this.editor.getSelection();
            // ALERTA! només es compten com a nodes els blocks, no els inline
            console.log(selection);


            var $previousNode = this.editor.getPreviousNode();
            var $currentNode = this.editor.getCurrentNode();
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

            if (($previousNode.attr('data-delete-block') && selection.documentSelection.anchorOffset === 0) || $currentNode.attr('data-delete-block')
            /*|| ($previousNode.length === 0 && $currentNode.parent().hasClass('ioccontent'))*/) {
                // No es permet eliminar nodes amb camps
                e.preventDefault();
                e.stopPropagation();
                return false;
            }


            var wipe = false;


            for (var i = 0; i < selection.nodes.length; i++) {
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

                if (selection.nodes.length > 1 && !ALLOWED_DELETE.includes(node.tagName.toLowerCase())) {
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



        }
    });

    return CustomKeyHandling;
});