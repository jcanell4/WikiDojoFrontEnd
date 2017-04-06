define([         
    "dojo/dom"
], function(dom){
    var _setValueFromFormId = function(formId, inputName, inputValue){
        console.log("processSetFormInputValue#_setValueFormFormId", formId, inputName, inputValue);
        var form = dom.byId(formId);

        // ALERTA[Xavi] En el cas de desar + cancel es possible que la resposta de cancel·lació arribi abans que la resposta de guardar
        if (form && form[inputName]) {
            form[inputName].value = inputValue;
        }


    };
    
    var res = function(param){

        console.log("processSetFromInputValue", param)
        if(param.inputs){
            for(var i in param.inputs){         
                _setValueFromFormId(param.formId, i,
                                    param.inputs[i]);
            }
        }else{
            _setValueFromFormId(param.formId, param.inputName, param.inputValue);
        }
    };
    return res;
});

