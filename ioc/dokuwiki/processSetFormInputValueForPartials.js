define([
    "dojo/dom"
], function (dom) {
    // TODO[Xavi] Eliminar la part comuna de processSetFormInputValue i deixar només el reset de date, així es pot cridar com a process de forma independent
    //var _setValueFromFormId = function (formId, inputName, inputValue) {
    //    var form = dom.byId(formId);
    //    form[inputName].value = inputValue;
    //};

    var _resetDateToAllForms = function (docId, date) {
        jQuery('input[name="date"]').each(function () {
            jQuery(this).val(date);
        })
    };

    var _updateEditingChunks = function (data, doc_id) {
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
                }

            });

        }

    };

    return function (param) {

        //if (param.inputs) {
        //    for (var i in param.inputs) {
        //        _setValueFromFormId(param.formId, i, param.inputs[i]);
        //    }
        //} else {
        //    _setValueFromFormId(param.formId, param.inputName, param.inputValue);
        //}

        _resetDateToAllForms(param.docId, param.date);


        _updateEditingChunks(param.structure, param.docId);


    };
});

