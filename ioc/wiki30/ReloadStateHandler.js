define([
	"dojo/_base/declare" // declare
], function(declare){
    var ret = declare("ioc.wiki30.ReloadStateHandler", [], {
        constructor: function(/*function*/ realodFunction){
            if(realodFunction){
                this.reload = realodFunction;
            }
        }
        ,reload: function(stateToReload){}
    });
    return ret;
});
