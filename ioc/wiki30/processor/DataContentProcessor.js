define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/ContentProcessor"
], function(declare, ContentProcessor){
    var ret = declare("ioc.wiki30.processor.DataContentProcessor", [ContentProcessor], {
        type: "data"
       ,process:function(value, dispatcher){ 
           this.inherited(arguments);
       }
       ,updateState: function(dispatcher, value){
           this.inherited(arguments);
           dispatcher.globalState.pages[value.id]["action"]="edit";
       }
    });
    return ret;
});

