define([
    "dojo/dom"
], function (dom) {
    // TODO[Xavi] Eliminar la part comuna de processSetFormInputValue i deixar només el reset de date, així es pot cridar com a process de forma independent
    //var _setValueFromFormId = function (formId, inputName, inputValue) {
    //    var form = dom.byId(formId);
    //    form[inputName].value = inputValue;
    //};


    // TODO[Xavi] S'estan modificant tots els formularis! de totes les pestanyes?

    var _updateEditingChunks = function (data, doc_id, date) {
        var i, $range, $inputs, aux_id;

        for (i = 0; i < data.chunks.length; i++) {
            aux_id = doc_id + "_" + data.chunks[i].header_id;

            $range = jQuery('#form_' + aux_id + ' :input[name="range"]');
            $range.val(data.chunks[i].start + "-" + data.chunks[i].end);

            if (!data.chunks[i].text) {
                continue;
            }

            $inputs = jQuery('#form_' + aux_id + ' :input');


            $inputs.each(function () {
                var name = jQuery(this).attr('name');

                switch (name) {
                    case 'suffix':
                        jQuery(this).val(data.chunks[i].text.suf);
                        break;

                    case 'prefix':
                        jQuery(this).val(data.chunks[i].text.pre);
                        break;

                    case 'date':
                        jQuery(this).val(date);
                }

            });

        }

    };

    return function (param) {
        _updateEditingChunks(param.structure, param.docId, param.date);


    };
});

