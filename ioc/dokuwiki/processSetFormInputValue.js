define([         
    "dojo/dom"
], function(dom){
    var _setValueFromFormId = function(formId, inputName, inputValue){
        var form = dom.byId(formId);
        form[inputName].value = inputValue;
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

