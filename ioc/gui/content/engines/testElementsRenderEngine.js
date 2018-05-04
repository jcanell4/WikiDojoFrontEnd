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
        // console.log("Informació del content tool: ", context);

        // ALERTA[Xavi] si no arriba un objecte jquery suposem que es tracta d'objectes DOM o HTML i fem la conversió.
        if (!$content instanceof jQuery) {
            $content = jQuery($content);
        }

        // var $editorButtons = $content.find('[data-form-editor-button]');

        // ALERTA[Xavi] per fer aquesta proba s'agafan els nodes de classe 'h2'
        // var $nodes = $content.find('.h2');
        //
        //
        // // ALERTA: Determinem si es editable o no inicialment basant-nos en el tipus de content tool
        //
        // var formId = $content.find('form').attr('id');
        //
        //
        //
        // for (var i = 0; i < $nodes.length; i++) {
        //     var config;
        //
        //     var id = jQuery($nodes[i]).attr('id');
        //     if (element) {
        //         config = element.config;
        //     } else {
        //         config = {};
        //     }
        //
        //
        //     config.context = context;
        //     config.node = $nodes[i];
        //     config.name = id;
        //     config.formId = formId;
        //
        //     editableElementsFactory.createElement(type, config);
        //
        //
        //
        //     // editableElementsFactory.createElement('test', {
        //     //     context: context,
        //     //     node: $nodes[i],
        //     //     name: "nom-de-prova",
        //     //     formId: $content.find('form').attr('id')
        //     // });
        // }

        // ALERTA[Xavi] Test per les taules, afegim una taula al final del contingut

        // var tableHTML = "<table data-editable-element=\"table\">" +
        //     "<thead>" +
        //     "<tr>" +
        //     "<th readonly>Key</th>" +
        //     "<th>Value1</th>" +
        //     "<th>Value2</th>" +
        //     "</tr>" +
        //     "</thead>" +
        //     "<tbody>" +
        //     "<tr>" +
        //     "<th>Primera clau</th>" +
        //     "<td>AAA</td>" +
        //     "<td>42.3</td>" +
        //     "</tr>" +
        //     "<tr>" +
        //     "<th>Segona clau</th>" +
        //     "<td>BBB</td>" +
        //     "<td>19.8</td>" +
        //     "</tr>" +
        //     "<tr>" +
        //     "<th>Tercera clau</th>" +
        //     "<td>CCC</td>" +
        //     "<td>3.1416</td>" +
        //     "</tr>" +
        //     "<tr>" +
        //     "<th>Quarta clau</th>" +
        //     "<td>DDD</td>" +
        //     "<td>12126</td>" +
        //     "</tr>" +
        //     "<tr>" +
        //     "<th>Cinquena clau</th>" +
        //     "<td>EEE</td>" +
        //     "<td>9822</td>" +
        //     "</tr>" +
        //     "<tr>" +
        //     "<th>Sisena clau</th>" +
        //     "<td>FFF</td>" +
        //     "<td>82829.922</td>" +
        //     "</tr>" +
        //     "<tr>" +
        //     "<th>Setena clau</th>" +
        //     "<td>GGG</td>" +
        //     "<td>9823023</td>" +
        //     "</tr>" +
        //     "</tbody>" +
        //     "</table>";
        //
        // $content.append(tableHTML);


        // ALERTA[Xavi] indicant el tipus com a valor de la propietat es pot fer servir el mateix bucle per a totes
        var $nodes = $content.find('[data-editable-element]');
        var formId = $content.find('form').attr('id');

        // alert("Editable? " +editable);
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
