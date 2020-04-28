define([
    "dojo/_base/declare", // declare
    "dojox/editor/plugins/NormalizeIndentOutdent"

], function (declare, NormalizeIndentOutdent) {

    // ALERTA! Aquest plugin reemplaça el funcionament del NormalizeIndentOudent afegint la gestió correcta dels botons
    // pels navegadors Firefox y Chrome.
    //
    // En alguns casos es recrean els nodes perquè chrome afegeix els seus propis estils automàticament.


    var NormalizeIndentOutdent = dojo.declare("dojox.editor.plugins.NormalizeIndentOutdent", NormalizeIndentOutdent, {

        _isIndentableElement: function (tag) {
            // summary:
            //		Internal function to detect what element types
            //		are indent-controllable by us.
            // tag:
            //		The tag to check
            // tags:
            //		private
            switch (tag) {
                // case "p":
                // case "div":
                // case "h1":
                // case "h2":
                // case "h3":
                // case "center":
                // case "table":
                case "ul":
                case "ol":
                    return true;
                default:
                    return false;
            }
        },


        _outdentImpl: function () {

            // Prova de la resolució directa
            // this.editor.document.execCommand('outdent');
            // return;


            var $node = this.editor.getCurrentNode();
            var isLastNode = $node.next().length === 0;
            var $innerList = $node.find('ul,ol');
            var $pendingList;


            var isRoot = $node.parent().parent().attr('id') === "dijitEditorBody";

            var isParentRoot = $node.parent().attr('id') === "dijitEditorBody";

            if (isParentRoot) {
                alert("Alerta! el node actual no es el li si no el ul");
            }

            if ($node.attr('id') === "dijitEditorBody") {
                alert("Alerta! el node actual no es l'editor");
            }


            if (isRoot && $innerList.length > 0) {

                // ALERTA, aquí no tenim encara la posició final de la inserció, només fem el detach per reafegir-lo després

                $pendingList = jQuery($innerList.get(0));
                $pendingList.detach();


            }


            // ALERTA! Això fa el canvi original
            this.inherited(arguments);

            if (isRoot) {

                // Eliminem el node anterior

                $node.remove();

                // obtenim el nou node
                var $node = this.editor.getCurrentNode();
                // contemplem 2 casos
                // 		- el node es de text (FF)
                // 		- el node es un span


                if ($node.attr('id') === "dijitEditorBody") {
                    // console.log("El outdent node es el propi de l'editor, no fem res més");
                    return;
                }


                // var html = '<p>' + content + '<p>';
                // var html = '<p> ** ' + $node.html().trim() + ' ** <p>';
                var html = '<p>' + $node.html().trim() + '<p>';

                // Eliminem els salts de línia ja que pot ser que s'hagin afegit automàticament
                html.replace(/<br ?\/?>/g, '');


                var $currentNode;


                if (isLastNode) {
                    var $newNode = jQuery(html);

                    $node.after($newNode);

                    // this.editor.setCursorToNodePosition($node.prev());

                    $node.remove();


                    // var $currentNode = this.editor.getCurrentNode();
                    $currentNode = $newNode.next();

                } else {

                    console.log("Eliminant $node (html):", $node.html());

                    $node.remove();


                    this.editor.execCommand('inserthtml', html);

                    $currentNode = this.editor.getCurrentNode();
                }


                // var $prev = $currentNode.prev();


                // Reafegim la llista interna
                if ($innerList.length > 0) {

                    var listType = $pendingList.prop('tagName').toLowerCase();

                    // Cas 1, el node següent és un UL o un OL
                    if ($currentNode.next().prop("tagName").toLowerCase() === listType) {

                        $currentNode.next().prepend($innerList.children());

                        // alert("Reafegint Cas 1");

                    } else {
                        // El tipus no coincideix, s'afegeix com a llista indpeendent a continuació
                        $pendingList.insertAfter(jQuery($currentNode.get(0)));

                        // alert("Reafegint Cas 2");

                    }

                }


                // Això esperem que passi sempre
                if ($currentNode.html().length === 0 && $currentNode.prop('tagName').toLowerCase() !== 'body') {
                    // En alguns casos s'afegeix automàticament un node br
                    if ($currentNode.next().prop("tagName").toLowerCase() === 'br') {
                        $currentNode.next().remove();
                    }

                    var $next = $currentNode.next();

                    // En alguns casos queda un contenidor ul/ol orfa
                    if ((isLastNode)
                        && ($next.prop("tagName").toLowerCase() === 'ul' || $next.prop("tagName").toLowerCase() === 'ol')
                        && $next.children().length === 0) {
                        $next.remove();
                    }

                    $currentNode.remove();
                }


                // alert("Processat root outdent");

            }


        },

        // _indentImpl: function () {
        //     this.inherited(arguments)
        // },


    });


    // Register this plugin.
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        var name = o.args.name.toLowerCase();
        if (name === "normalizeindentoutdent") {
            o.plugin = new NormalizeIndentOutdent({
                indentBy: ("indentBy" in o.args) ?
                    (o.args.indentBy > 0 ? o.args.indentBy : 40) :
                    40,
                indentUnits: ("indentUnits" in o.args) ?
                    (o.args.indentUnits.toLowerCase() == "em" ? "em" : "px") :
                    "px"
            });
        }
    });

    return NormalizeIndentOutdent;

});
