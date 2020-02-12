/**
 * Aquest mòdul exposa funcions per afegir accions comunes a diferentes elements.
 */

define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/_editor/range",
    'dojo/i18n!ioc/dokuwiki/editors/nls/commands',
], function (declare, lang, _Plugin, string, range, localization) {


    var getAndAddActionContainer = function ($node) {
            var $container = getBoxNode($node).find('.action');

            if ($container.length === 0) {

                $container = jQuery('<div class="no-render action" contenteditable="false"></div>');
                $node.append($container);
            }

            return $container;
        },

        // Cerquem la caixa o l'últim node que no sigui l'arrel del document
        getBoxNode = function ($node) {

        console.log("Original $node:", $node)
            var $candidateNode = $node.closest('[data-dw-box]');

            if ($candidateNode.length === 0) {
                $candidateNode = $node;

                // afegim un comptador per si es detecta algún problema que no es penji el navegador
                var counter = 0;
                while ($candidateNode.parent().attr('id') !== 'dijitEditorBody' && counter <10) {
                    $candidateNode = $candidateNode.parent();
                    counter++;
                }

            }

            return $candidateNode;
        },

        addParagraphAction = function ($node, editor) {

            var $container = getAndAddActionContainer($node);

            var $aux = $container.find('.add-paragraph');

            if ($aux.length === 0) {
                $aux = jQuery('<span class="add-paragraph">' + localization["ioc-action-add-paragraph"] + '</span>');
                $container.append($aux);
            }

            $aux.off('click');
            $aux.on('click', function (e) {
                e.preventDefault();

                var $box = getBoxNode($node);

                $box.after(jQuery('<p></p>'));
                editor.forceChange();
            });
        },

        deleteAction = function ($node, editor) {

            var $container = getAndAddActionContainer($node);
            var $aux = $container.find('.delete');


            if ($aux.length === 0) {
                $aux = jQuery('<span class="delete">' + localization["delete"] + '</span>');
                $container.append($aux);
            }


            $aux.off('click');

            $aux.on('click', function (e) {
                e.preventDefault();
                getBoxNode($node).remove();
                editor.forceChange();
            });
        };


    return {
        addParagraphAction: addParagraphAction,

        deleteAction: deleteAction
    };
});