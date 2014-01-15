define([
	"dojo/_base/declare" // declare
], function(declare, lang){
    var ret = declare("ioc.wiki30.GlobalState", [], {
        pages: {}
       ,mode: "show"
       ,login: false
       ,info:""
    });
    return ret;
});
