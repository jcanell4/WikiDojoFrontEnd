define([], function(){
    var res = function(params){
        //ajax_quicksearch.init('qsearch__in','qsearch__out');
        ajax_quicksearch.init(params.inputId, params.outputId);
    };
    return res;
});