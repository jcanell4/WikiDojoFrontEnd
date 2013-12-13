define([
	"dojo/_base/declare"
], 
function(declare){
	var DokuwikiContent = declare("ioc.gui.DokuwikiContent", {
		id: null
		,title: null
		,documentHTML: null
		,documentWiki: null
		,metaData: new Array()
	   
		,constructor: function(id, title) {
			this.id = id;
			this.title = title;
		}
		,putMetaData: function(content) {
		   this.metaData[content.id] = content;
		}
		,setDocumentHTML: function(content){
		   this.documentHTML = content.content;
		}
		,removeAllMetaData: function(){
			this.metaData = new Array();
		}
    });
    
   return DokuwikiContent;
});
