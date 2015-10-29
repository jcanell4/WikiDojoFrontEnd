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
        console.log("*** RENDER DE DATA PARCIAL ***");
        var $container, $viewContainer, $editContainer, $header, $content, $form, $doc, $textArea, text, aux_id, i;
        //console.log("Render partial:", data);
        //data = JSON.parse(JSON.stringify(data));

        console.log("Structure: ", data);
        // Recorrem totes les seccions, tenim el id de cadascuna
        // Cerquem el id del header i agafem aquest i els 2 next siblings per ficar-los dins d'un div
        // El div contindra dos divs, un de vista i un d'edició

        $doc = jQuery('<div>' + data.html + '</div>');

        var editing_chunks = [];

        for (i = 0; i < data.chunks.length; i++) {
            //TODO: només afegim els chunks amb text, ho deixem així per provar
            if (data.chunks[i].text) {
                editing_chunks.push(data.chunks[i].header_id);
            }
            //editing_chunks.push(data.chunks[i].header_id);
        }



        for (i = 0; i < data.chunks.length; i++) {
            aux_id = data.id + "_" + data.chunks[i].header_id;
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


            if (data.chunks[i].text) {
                //text = data.chunks[i].text.editing; // TODO afegir al formulari el text.pre i text.suf
                console.log("Activant editor per: ", aux_id);
                $editContainer.css('display', '');
                $viewContainer.css('display', 'none');
            } else {
                $editContainer.css('display', 'none');
                $viewContainer.css('display', '');
                text = '';
            }


            //console.log("Texto entre inici:",data.chunks[i].start-2, " i final: ",  data.chunks[i].end-2);

            $editContainer.append('<div id="toolbar_' + aux_id + '"></div>');

            $form = jQuery('<form id="form_'+aux_id+'" data-form="'+ data.ns+'" method="post" accept-charset="urf-8" action="" class="form_save"></form>'); // TODO[Xavi] L'action no cal perqué s'afegirà al AJAX?
            $editContainer.append($form);

            // method="post"
            // accept-charset="utf-8"
            $textArea = jQuery('<textarea id="textarea_' + aux_id + '" style="width:100%;height:200px" name="wikitext"></textarea>');
            $form.append($textArea);

            //$form.append('<input name="do" value="save_partial" type="hidden">'); // TODO[Xavi] aquí es on s'ha d'establir el command pel desar parcial
            $form.append('<input name="do" value="save_partial" type="hidden">'); // TODO[Xavi] aquí es on s'ha d'establir el command pel desar parcial
            $form.append('<input name="rev" value="' + data.rev + '" type="hidden">');
            $form.append('<input name="date" value="' + data.date + '" type="hidden">');
            $form.append('<input name="summary" value="[' + data.chunks[i].title + ']" type="hidden">');
            $form.append('<input name="target" value="section" type="hidden">');
            $form.append('<input name="range" value="' + data.chunks[i].start + '-' + data.chunks[i].end + '" type="hidden">');
            $form.append('<input name="id" value="' + data.ns + '" type="hidden">'); // TODO[Xavi] comprovar si es el id o el ns el que cal passar
            $form.append('<input name="section_id" value="' + data.chunks[i].header_id + '" type="hidden">');
            $form.append('<input name="editing_chunks" value="' + editing_chunks + '" type="hidden">');

            if (data.chunks[i].text) {
                console.log("afegint text");
                $textArea.val(data.chunks[i].text.editing);
                $form.append('<input name="changecheck" value="' + data.chunks[i].text.changecheck + '" type="hidden">');

                var $pre = jQuery('<input name="prefix" value="" type="hidden">');
                var $suf = jQuery('<input name="suffix" value="" type="hidden">');
                $form.append($pre);
                $form.append($suf);
                $pre.val(data.chunks[i].text.pre);
                $suf.val(data.chunks[i].text.suf);
            }


            $form.append('<div><input value="Tornar" type="submit" data-call-type="cancel_partial"/><input value="Desar" type="submit" data-call-type="save_partial"/></div>');

            $container.append($viewContainer);
            $container.append($editContainer);

            //console.log("afegit", chunk_id);


        }


        // TODO[Xavi] Duplicat al htmlRenderEngine. Aquest es pels botons del ajax command edit_partial, cal un diferent pels form save_partial

        var $forms = $doc.find('form');

        $forms.each(function () {
            var $form = jQuery(this).parent(),
                id = jQuery(this).parent().prev().prev().attr('id');
            $form.find('div.no').append('<input type="hidden" value="' + id + '" name="section_id"></input>');
        });

        return $doc;
    }
});