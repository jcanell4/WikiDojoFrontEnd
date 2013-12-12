define([
	"dojo/_base/declare"
	,"ioc/wiki30/Request"
	,"dijit/layout/ContentPane"
	,'dijit/layout/_LayoutWidget'
	,'dijit/_TemplatedMixin'
	,"dojo/NodeList-dom" //NodeList.style
], 
function(declare, Request, ContentPane, _LayoutWidget, _TemplatedMixin){
	var DokuwikiContent = declare("ioc.gui.DokuwikiContent", 
                              [ContentPane, _TemplatedMixin, _LayoutWidget, Request], {
       document: null
       ,metaData: null
	   
       ,startup: function(){
            this.inherited(arguments);
       }
    });
    
   return DokuwikiContent;
});
