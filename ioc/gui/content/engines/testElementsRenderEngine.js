/**
 * @module TestRenderEngine
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([
    // 'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
    'ioc/gui/content/editableElementsFactory'
], function (editableElementsFactory) {


    // Afegim als camps amb l'atribut data-form-editor-button una icona per ampliar l'editor.

    var searchElement = function (id, data) {

        // console.log("Cercant:", id, data);
        var element;

        if (Array.isArray(data)) {
            for (var i = 0; i < data.length; i++) {
                element = searchElement(id, data[i]);
                if (element.id === id) {
                    break;
                }
            }
        } else if (data.elements) {
            element = searchElement(id, data.elements);
        } else {
            element = data;
        }
        return element;

    };


    return function (data, context, $content) {

        // ALERTA[Xavi] si no arriba un objecte jquery suposem que es tracta d'objectes DOM o HTML i fem la conversió.
        if (!$content instanceof jQuery) {
            $content = jQuery($content);
        }


        // ALERTA[Xavi] indicant el tipus com a valor de la propietat es pot fer servir el mateix bucle per a totes
        var $nodes = $content.find('[data-editable-element]');
        var formId = $content.find('form').attr('id');

        for (var i = 0; i < $nodes.length; i++) {

            var id = jQuery($nodes[i]).attr('id');
            var element = searchElement(id, data);


            var type = jQuery($nodes[i]).attr('data-editable-element');

            var config;
            if (element) {
                config = element.config;
                config.data = element;
            } else {
                config = {};
            }


            config.context = context;
            config.node = $nodes[i];
            config.name = id;
            config.formId = formId;

            editableElementsFactory.createElement(type, config);


        }


        return $content;
    }


});
