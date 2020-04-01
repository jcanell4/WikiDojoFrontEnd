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

            var $candidateNode = $node.closest('[data-dw-box]');

            if ($candidateNode.length === 0) {
                $candidateNode = $node;

                // afegim un comptador per si es detecta algún problema que no es penji el navegador
                var counter = 0;
                while ($candidateNode.parent().attr('id') !== 'dijitEditorBody' && counter < 10) {
                    $candidateNode = $candidateNode.parent();
                    counter++;
                }

            }

            return $candidateNode;
        },

        // @param isElement es opcional
        addHighlighter = function($node, isElement) {
            var $box;

            if (isElement) {
                $box = $node.parent('.action').parent();


            } else {
                $box = getBoxNode($node);
            }

            $node.on('mouseover', function() {
                $box.addClass('box-highlight');
            });

            $node.on('mouseout', function() {
                $box.removeClass('box-highlight');
            });
        };

        addParagraphAfterAction = function ($node, editor) {

            var $container = getAndAddActionContainer($node);

            var $aux = $container.find('.add-paragraph-after');

            if ($aux.length === 0) {
                // $aux = jQuery('<span class="add-paragraph">' + localization["ioc-action-add-paragraph"] + '</span>');
                $aux = jQuery('<span class="iocAddParagraphIcon actionIcon add-paragraph-after" title="'+localization["ioc-action-add-paragraph"]+'"></span>');
                $container.append($aux);
            }

            $aux.off('click');
            $aux.on('click', function (e) {
                e.preventDefault();

                var $box = getBoxNode($node);

                $box.after(jQuery('<p></p>'));
                editor.forceChange();

            });

            addHighlighter($aux);


        },

        addParagraphBeforeAction = function ($node, editor) {

            var $container = getAndAddActionContainer($node);

            var $aux = $container.find('.add-paragraph-before');

            if ($aux.length === 0) {
                // $aux = jQuery('<span class="add-paragraph">' + localization["ioc-action-add-paragraph"] + '</span>');
                $aux = jQuery('<span class="iocAddParagraphBeforeIcon actionIcon add-paragraph-before" title="'+localization["ioc-action-add-paragraph-before"]+'"></span>');
                $container.append($aux);
            }

            $aux.off('click');
            $aux.on('click', function (e) {
                e.preventDefault();

                var $box = getBoxNode($node);

                $box.before(jQuery('<p></p>'));
                editor.forceChange();

            });

            addHighlighter($aux);
        },

        deleteAction = function ($node, editor, elementType) {

            var $container = getAndAddActionContainer($node);
            var $aux = $container.find('.delete');



            if ($aux.length === 0) {
                //$aux = jQuery('<span class="delete">' + localization["delete"] + '</span>');
                $aux = jQuery('<span class="iocDeleteIcon actionIcon" title="'+localization["delete"]+'"></span>');
                $container.append($aux);
            }


            $aux.off('click');

            $aux.on('click', function (e) {
                e.preventDefault();

                // console.log(jQuery(getBoxNode($node)));

                if (!confirm(localization["confirm-delete"] + " (" + elementType + ")?")) {
                    return;
                }

                switch (elementType) {

                    case 'element':
                        if ($node.next().is('br')) {
                            $node.next().remove();
                        }
                        $node.remove();

                        break;

                    default:
                        getBoxNode($node).remove();
                }

                editor.forceChange();

            });

            addHighlighter($aux, elementType === 'element');

        };


    return {

        addParagraphAfterAction: addParagraphAfterAction,

        addParagraphBeforeAction: addParagraphBeforeAction,

        deleteAction: deleteAction,

        getActionContainer: getAndAddActionContainer

    };
});