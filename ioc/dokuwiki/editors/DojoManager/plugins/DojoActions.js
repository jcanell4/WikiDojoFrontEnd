define([
    "dojo/_base/declare",
    // 'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWikiBlock',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/_editor/range",
    'dojo/i18n!ioc/dokuwiki/editors/nls/commands',
], function (declare, DojoWikiBlock, lang, _Plugin, string, range, localization) {

    var getAndAddActionContainer = function ($node) {
            var $container = getBoxNode($node).find('.action');

            if ($container.length === 0) {

                $container = jQuery('<div class="no-render action" contenteditable="false"></div>');
                $node.append($container);
            }

            return $container;
        },

        getBoxNode = function ($node) {
            return $node.closest('[data-dw-box]');
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