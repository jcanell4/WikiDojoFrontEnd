define([
	"dojo/_base/declare" // declare
], function(declare){
    var ret = declare("ioc.wiki30.UpdateViewHandler", [], {
        constructor: function(/*function*/ updateFunction){
            if(updateFunction){
                this.update = updateFunction;
            }
        }
        ,update: function(){}
    });
    return ret;
});
