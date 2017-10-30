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
        var $container, $viewContainer, $editContainer, $header, $content, $form, $doc, $textArea, text, aux_id, i;

        // console.log("html_partialRenderEngine: ", data);

        $doc = jQuery('<div>' + data.html + '</div><div class="end-of-document></div>"');

        try {


            var editing_chunks = [];

        for (i = 0; i < data.chunks.length; i++) {
            if (data.chunks[i].text) {
                editing_chunks.push(data.chunks[i].header_id);
            }
        }

        for (i = 0; i < data.chunks.length; i++) {
            aux_id = data.id + "_" + data.chunks[i].header_id;
            $container = jQuery('<div id="container_' + aux_id + '" data-editor-container=""></div>');
            $container.addClass('new-section');

            $header = $doc.find('#' + data.chunks[i].header_id);

            if (i + 1 < data.chunks.length) {
                $content = $header.nextUntil("#" + data.chunks[i + 1].header_id);

            } else {
                $content = $header.nextUntil(".end-of-document");
            }

            $header.before($container);
            $header.attr('id', 'header_' + data.chunks[i].header_id);

            $viewContainer = jQuery('<div id="view_' + aux_id + '"></div>');

            $viewContainer.append($header);
            $viewContainer.append($content);
            //$viewContainer.append($form);$viewContainer.append($form);

            $editContainer = jQuery('<div id="edit_' + aux_id + '"></div>');


            if (data.chunks[i].text) {
                $editContainer.css('display', '');
                $viewContainer.css('display', 'none');
            } else {
                $editContainer.css('display', 'none');
                $viewContainer.css('display', '');
                text = '';
            }

            $editContainer.append('<div id="toolbar_' + aux_id + '"></div>');

            $form = jQuery('<form id="form_' + aux_id + '" data-form="' + data.ns + '" method="post" accept-charset="urf-8" action="" class="form_save"></form>'); // TODO[Xavi] L'action no cal perqué s'afegirà al AJAX?
            $editContainer.append($form);

            // method="post"
            // accept-charset="utf-8"
            $textArea = jQuery('<textarea id="textarea_' + aux_id + '" style="width:100%;height:200px" name="wikitext" ' +
                'data-header-id="'+ data.chunks[i].header_id + '" data-doc-id="'+data.id+'"></textarea>');
            $form.append($textArea);

            $form.append('<input name="do" value="save_partial" type="hidden">'); // TODO[Xavi] aquí es on s'ha d'establir el command pel desar parcial <-- crec que no cal per a res
            $form.append('<input name="rev" value="' + (data.rev || '') + '" type="hidden">');
            $form.append('<input name="date" value="' + data.date + '" type="hidden">');
            $form.append('<input name="summary" value="[' + data.chunks[i].title + ']" type="hidden">');
            $form.append('<input name="target" value="section" type="hidden">');
            $form.append('<input name="range" value="' + data.chunks[i].start + '-' + data.chunks[i].end + '" type="hidden">');
            $form.append('<input name="id" value="' + data.ns + '" type="hidden">');
            $form.append('<input name="section_id" value="' + data.chunks[i].header_id + '" type="hidden">');
            $form.append('<input name="editing_chunks" value="' + editing_chunks + '" type="hidden">');

            if (data.chunks[i].text) {
                //console.log("afegint text");
                $textArea.val(data.chunks[i].text.editing);
                $form.append('<input name="changecheck" value="' + data.chunks[i].text.changecheck + '" type="hidden">');

                var $pre = jQuery('<input name="prefix" value="" type="hidden">');
                var $suf = jQuery('<input name="suffix" value="" type="hidden">');
                $form.append($pre);
                $form.append($suf);
                $pre.val(data.chunks[i].text.pre);
                $suf.val(data.chunks[i].text.suf || '');
            }

            $container.append($viewContainer);
            $container.append($editContainer);

            // ALERTA[Xavi] Embolcallat per ser referenciat correctament pel TOC

            var $outerContainer = jQuery('<div id="' + data.chunks[i].header_id + '"></div>');
            $container.before($outerContainer);

        }


        var $forms = $doc.find('form');

        $forms.each(function () {
            var $form = jQuery(this).parent(),
                id,
                $candidateHeaders = jQuery($form.closest('div')).prevAll(':header');

            for (var i = 0; i < $candidateHeaders.length; i++) {
                if ($candidateHeaders[i].className.indexOf("sectionedit") > -1) {
                    id = $candidateHeaders[i].id;
                    break;
                }
            }

            var $divInsideForm = $form.find('div.no');
            $divInsideForm.append('<input type="hidden" value="' + id + '" name="section_id"/>');
            $divInsideForm.append('<input name="editing_chunks" value="' + editing_chunks + '" type="hidden">');
        });

        } catch (e){
            var message = "S'ha produït un error. S'ha desactivat la edició parcial";  //TODO[JOSEP]: Cal passar els missatge a ll JSINFO per internacionalitzar
            alert(message);
            console.error(message);
            $doc = jQuery('<div>' + data.html + '</div><div class="end-of-document></div>"');
        }

        return $doc;
    }
});