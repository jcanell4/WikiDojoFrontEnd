/**
 * @module TestRenderEngine
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([
    // 'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
    'ioc/gui/content/editableElementsFactory'
], function (editableElementsFactory) {


    // Afegim als camps amb l'atribut data-form-editor-button una icona per ampliar l'editor.


    return function (data, context, $content) {
        //console.log($content);

        // ALERTA[Xavi] si no arriba un objecte jquery suposem que es tracta d'objectes DOM o HTML i fem la conversió.
        if (!$content instanceof jQuery) {
            $content = jQuery($content);
        }

        // var $editorButtons = $content.find('[data-form-editor-button]');

        // ALERTA[Xavi] per fer aquesta proba s'agafan els nodes de classe 'h2'
        var $nodes = $content.find('.h2');


        for (var i = 0; i < $nodes.length; i++) {
            editableElementsFactory.createElement('test', {
                context: context,
                node: $nodes[i]
            });
        }

        return $content;
    }
});
