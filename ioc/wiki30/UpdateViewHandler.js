define([
	"dojo/_base/declare" // declare
], function(declare, lang){
    var ret = declare("ioc.wiki30.UpdateViewHandler", [], {
        _dispatcher: null
        ,constructor: function(/*Dispatcher*/ dispatcher, /*function*/ updateFunction){
            this._dispatcher = dispatcher;
            if(updateFunction){
                this.update = updateFunction;
            }
        }
        ,getDispatcher: function(){
            return this._dispatcher;
        }
        ,update: function(){}
    });
    return ret;
});
