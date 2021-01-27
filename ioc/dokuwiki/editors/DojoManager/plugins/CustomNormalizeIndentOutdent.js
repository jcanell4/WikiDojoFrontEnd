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

        // Aquesta implementació reemplaça completament la implementació del navegador per Outdent
        _outdentImpl: function () {

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

                // ALERTA, aquí no tenim encara la posició final de la inserció, només fem el detach per reafegir-la després

                $pendingList = jQuery($innerList.get(0));
                $pendingList.detach();

            }


            if (isRoot) {

                // ALERTA! la implementació de chrome es podria desactivar, la implementació general funciona correctament
                // però he detectat algún cas en que s'afegeix un paràgraf buit en afegir un nou element a una llista
                // després de dividir-la.

                if (navigator.userAgent.indexOf("Chrome") > -1) {

                    this.inherited(arguments);
                    this._outdentImplChrome($node, isLastNode, $pendingList)

                } else {

                    // Important! No cridar al inherited

                    this._outdentImplGeneral($node, isLastNode, $pendingList)
                }

            } else {

                // ALERTA! Això fa el canvi original
                this.inherited(arguments);

            }


        },

        // Aquesta implementació depén de que s'hagi cridat abans al _outdentImpl i s'hagi executat el Outdent del navegador.
        _outdentImplChrome: function ($originalNode, isLastNode, $pendingList) {

            // Eliminem el node anterior
            $originalNode.remove();

            // obtenim el nou node
            var $node = this.editor.getCurrentNode();

            if ($node.attr('id') === "dijitEditorBody") {
                // console.log("El outdent node es el propi de l'editor, no fem res més");
                return;
            }

            var html = '<p>' + $node.html().trim() + '<p>';

            // Eliminem els salts de línia ja que pot ser que s'hagin afegit automàticament
            html.replace(/<br ?\/?>/g, '');

            var $currentNode;


            if (isLastNode) {
                var $newNode = jQuery(html);

                $node.after($newNode);
                $node.remove();
                $currentNode = $newNode.next();

            } else {

                $node.remove();
                this.editor.execCommand('inserthtml', html);
                $currentNode = this.editor.getCurrentNode();
            }


            // Reafegim la llista interna
            if ($pendingList.length > 0) {

                var listType = $pendingList.prop('tagName').toLowerCase();

                // Cas 1, el node següent és un UL o un OL
                if ($currentNode.next().prop("tagName").toLowerCase() === listType) {

                    $currentNode.next().prepend($pendingList.children());

                } else {
                    // El tipus no coincideix, s'afegeix com a llista indpeendent a continuació
                    $pendingList.insertAfter(jQuery($currentNode.get(0)));
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


        },

        _outdentImplGeneral: function ($originalNode, isLastNode, $pendingList) {


            var listType = $originalNode.parent().prop('tagName').toLowerCase();

            // Separem els elements de llista a continuació, aniran en una nova llista del mateix tipus
            var $child = $originalNode.next();
            var $splittedList = jQuery('<' + listType + '>');

            while ($child.length > 0) {
                var $nextChild = $child.next();
                $splittedList.append($child);
                $child = $nextChild;
            }

            var $newNode = jQuery('<p>');
            $newNode.html($originalNode.html());
            $originalNode.replaceWith($newNode);
            $newNode.parent().after($newNode);

            if ($splittedList.children().length > 0) {
                $newNode.after($splittedList);
            }

            // Si la llista conté una llista interna movem els elements o creem una nova llista si es de diferent tipus
            var pendingListType = $pendingList.prop('tagName').toLowerCase();

            var nextTagName = $newNode.next() ? $newNode.next().prop('tagName').toLowerCase() : '';

            if ($newNode.next().length === 0 || pendingListType != listType || (nextTagName !== 'ol' && nextTagName !== 'ul')) {
                $newNode.after($pendingList)
            } else {
                $newNode.next().prepend($pendingList.children());
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
