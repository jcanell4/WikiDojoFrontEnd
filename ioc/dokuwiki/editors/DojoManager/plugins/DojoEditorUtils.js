/**
 * Aquest mòdul exposa funcions per afegir accions comunes a diferentes elements.
 */

define([], function () {

    var insertHtmlInline = function (html, editor) {

        // Guardem el node abans d'afegir l'ancla
        var $currentNode = editor.getCurrentNode();
        var $node;

        var id = Math.random();
        editor.execCommand('inserthtml', '<b id="' + id + '">anchor</b>');
        var $anchor = jQuery(editor.getCurrentNode());
        $node = jQuery(html);
        $anchor.after($node);
        $anchor.remove();


        if ($currentNode.attr('id') === 'dijitEditorBody') {
            // orfe: a Chrome es pot donar quan s'inserta un link i s'ha perdut el focus del document

            var $paragraph = jQuery('<p>');
            $node.after($paragraph);
            $paragraph.append($node);

            if ($paragraph.prev().prop('tagName').toLowerCase() === 'p' && $paragraph.prev() && $paragraph.prev().html().length === 0) {
                $paragraph.prev().remove();
            }

        } else if ($currentNode.parent().attr('id') === 'dijitEditorBody' && $currentNode.prop('tagName').toLowerCase() === 'div' && $currentNode.get(0).attributes.length === 0) {

            var $paragraph = jQuery('<p>');
            $currentNode.after($paragraph);

            var children = $currentNode.contents();

            for (var i = 0; i < children.length; i++) {
                $paragraph.append(jQuery(children));
            }

            $currentNode.remove();
        }

        return $node;
    };


    return {

        insertHtmlInline: insertHtmlInline

    };
});