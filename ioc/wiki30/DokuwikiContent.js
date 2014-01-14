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
		,getId: function(){
			return this.id;
		}
		,putMetaData: function(content) {
		   this.metaData[content.id] = content;
		}
		,getMetaData: function(id){
			return this.metaData[id];
		}
		,removeAllMetaData: function(){
			this.metaData = new Array();
		}
		,setDocumentHTML: function(content){
		   this.documentHTML = content.content;
		}
    });
    
   return DokuwikiContent;
});
