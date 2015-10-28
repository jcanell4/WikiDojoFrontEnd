define([
    "dojo/dom",
    "ioc/wiki30/dispatcherSingleton",
], function (dom, dispatcher) {
    // TODO[Xavi] Eliminar la part comuna de processSetFormInputValue i deixar només el reset de date, així es pot cridar com a process de forma independent
    var _setValueFromFormId = function (formId, inputName, inputValue) {
        var form = dom.byId(formId);
        form[inputName].value = inputValue;
    };

    var _resetDateToAllForms = function (docId, date) {
        jQuery('input[name="date"]').each(function () {
            //console.log("this", this);
            //console.log("Canviant la data de ", jQuery(this).val(), " a ", date);
            jQuery(this).val(date);
            //console.log("Canviada? ", jQuery(this).val());

        })
    };

    var _updateEditingChunks = function (data, doc_id) {
        var contentTool = dispatcher.getContentCache(doc_id).getMainContentTool(), //TODO[xavi] Comprovar si els namespace son amb _ o :
            structure = contentTool.content;


        // TODO[Xavi]: Repassar, no cal fer rest amb el text ja que aquest només s'ha de actualitzar quan arriba una nova edició parcial o una cancel·lació (abans de fer un nou Render, es podria posar com a preRender?)


        //console.log(contentTool);
        //console.log(structure);
        //alert("structura ok?");


        console.log("Nombre de chunks: ", data.chunks.length, data.chunks);
        for (var i = 0; i < data.chunks.length; i++) {
            var aux_id = doc_id + "_" +data.chunks[i].header_id;

            var $range = jQuery('#form_' + aux_id + ' :input[name="range"]');

            $range.val(data.chunks[i].start + "-" + data.chunks[i].end);


            if (!data.chunks[i].text && structure) {
                console.log ("No hi ha chunk de text per ", data.chunks[i].header_id);
                continue;
            }

            // Actualitcem la estructura amb el contingut actual del text area

            console.log("Selector textarea: ", '#textarea_' + aux_id);
            var $textArea = jQuery('#textarea_' +aux_id);

            console.log("Modificant el chunk, nou valor:", $textArea.val());
            structure.chunks[i].text.editing = $textArea.val();

            var $inputs = jQuery('#form_' + aux_id+ ' :input');
            //values = {};

            // not sure if you wanted this, but I thought I'd add it.
            // get an associative array of just the values.
            //var values = {};
            $inputs.each(function () {
                var name = jQuery(this).attr('name');
                switch (name) {
                    case 'suffix':
                        jQuery(this).val(data.chunks[i].text.suf);
                        break;

                    case 'prefix':
                        jQuery(this).val(data.chunks[i].text.pre);
                        break;
                }

                //values[this.name] = $(this).val();
            });
            //


            // Actualitzem el range de tots

            // Si hi ha text
            // Actualitzem el pre
            // Actualitzem el suf


        }

        //contentTool.setData(structure);
        console.log("structura al contenttool:", contentTool.content);

    };

    return function (param) {
        console.log(param);
        if (param.inputs) {
            for (var i in param.inputs) {
                _setValueFromFormId(param.formId, i, param.inputs[i]);
            }
        } else {
            _setValueFromFormId(param.formId, param.inputName, param.inputValue);
        }

        _resetDateToAllForms(param.docId, param.date);



        _updateEditingChunks(param.structure, param.docId);


    };
});

