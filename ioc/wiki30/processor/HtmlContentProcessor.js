define([
	"dojo/_base/declare" // declare
       ,"ioc/wiki30/processor/ContentProcessor"
], function(declare, ContentProcessor){
    var ret = declare("ioc.wiki30.processor.HtmlContentProcessor", [ContentProcessor], {
        type: "html"
       ,process:function(value, dispatcher){ 
           this.inherited(arguments);
       }
       ,updateState: function(dispatcher, value){
           this.inherited(arguments);
           dispatcher.globalState.pages[value.id]["action"]="view";
       }
    });
    return ret;
});

