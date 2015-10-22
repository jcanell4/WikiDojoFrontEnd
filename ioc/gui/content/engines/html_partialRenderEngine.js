/**
 * @module htmlEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define(function () {

    /**
     * Afegeix el id de la secció al formulari per enviarlo al servidor com a camp ocult.
     *
     * @param {string} data - codi html al que hem d'afegir un nou camp ocult per passar la id del document al formulari.
     * @returns {string} - document amb el camp section_id afegit
     */

    return function (data) {
        var $container, $viewContainer, $editContainer, $header, $content, $form, $doc, text, aux_id;
        //console.log("Render partial:", data);
        //data = JSON.parse(JSON.stringify(data));

        console.log("Structure: ", data);
        // Recorrem totes les seccions, tenim el id de cadascuna
        // Cerquem el id del header i agafem aquest i els 2 next siblings per ficar-los dins d'un div
        // El div contindra dos divs, un de vista i un d'edició

        $doc = jQuery('<div>' + data.html + '</div>');

        for (var i = 0; i < data.chunks.length; i++) {
            aux_id = data.id+"_"+data.chunks[i].header_id;
            $container = jQuery('<div id="container_' + aux_id + '"></div>');

            $header = $doc.find('#' + data.chunks[i]['header_id']);


            $content = $header.next();
            $form = $content.next();
            //
            //console.log("header:", $header);
            //console.log("content:", $content);
            //console.log("form:", $form);

            $header.before($container);


            $viewContainer = jQuery('<div id="view_' + aux_id + '"></div>');


            $viewContainer.append($header);
            $viewContainer.append($content);
            $viewContainer.append($form);

            $editContainer = jQuery('<div id="edit_' + aux_id + '"></div>');
            // Aquí s'afegirà el espai pels editors i la barra de eines

            text = data.text.substring(data.chunks[i].start-2, data.chunks[i].end-2);

            //console.log("Texto entre inici:",data.chunks[i].start-2, " i final: ",  data.chunks[i].end-2);

            $editContainer.append('<div id="toolbar_'+aux_id+'"></div>');
            $editContainer.append('<textarea id="textarea_'+aux_id+'" style="width:100%;height:200px">' + text + '</textarea>');



            $container.append($viewContainer);
            $container.append($editContainer);

            //console.log("afegit", chunk_id);

            if (data.id+"_"+data.selected === aux_id) {
                $editContainer.css('display', '');
                $viewContainer.css('display', 'none');
            } else {
                $editContainer.css('display', 'none');
                $viewContainer.css('display', '');
            }

        }


        //var $doc, $forms;
        //
        //$doc = jQuery(data.html);
        //
        //$doc.find('form');
        //$forms = $doc.find('form');
        //
        //
        //$forms.each(function () {
        //    jQuery(this).remove();
        //
        //});

        return $doc;
    }
});