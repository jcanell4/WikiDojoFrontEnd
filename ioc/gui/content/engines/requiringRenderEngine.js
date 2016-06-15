/**
 * @module DataEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define(function () {
    var _replace = function(text, replacements){
        if(!replacements){
            return text;
        }
        text.replace(/"({%[a-zA-X]*%})"/g, function(match, variable){
            return typeof replacements[variable] != 'undefined'
                ? replacements[variable]
                : match
            ;            
        });
        return text;
    }
    /**
     * Afegeix el id de la secció al formulari per enviarlo al servidor com a camp ocult.
     *
     * @param {string} data - codi html al que hem d'afegir un nou camp ocult per passar la id del document al formulari.
     * @returns {string} - document amb el camp section_id afegit
     */
    return function (data, contentTool) {
        console.log("RequiringRenderEngine", data);
        var $container, $form, $textarea, $toolBar;
        
        $container = jQuery('#container_' + contentTool.id);
        if($container.length==0){
            $container = jQuery('<div id="container_' + contentTool.id + '"></div>');
            $form = jQuery(data.htmlForm).find('form').clone();
            $textarea = $form.find('textarea');
            $container.append('<div id="toolbar_' + contentTool.id + '"></div>');
            $form.attr('id', 'form_' + contentTool.id);
            $textarea.attr('id', 'textarea_' + contentTool.id);
            $container.append($form);
        }else{
            $textarea = jQuery('#textarea_' + contentTool.id);
        }

        if(data.text){
//            $textarea.val(jQuery.trim(data.text));
            $textarea.val(data.text);
        }
        if(data.requiring){
            $container.find("#toolbar_" + contentTool.id).html("<div class='requiringMessage'>"
                +_replace(data.requiring.message, data.requiring.messageReplacements) 
                +"</div>");
        }
        // TODO afegir el afterContent
        return $container;
    }
});
