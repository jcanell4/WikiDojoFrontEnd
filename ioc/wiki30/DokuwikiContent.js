define([
	"dojo/_base/declare"
], 
function(declare){
	var DokuwikiContent = declare("ioc.wiki30.DokuwikiContent", [],{
		id: null
		,title: null
//		,documentHTML: null
//		,documentWiki: null
		,metaData: null
	   
		,constructor: function(id, title) {
                     this.inherited(arguments);
			this.id = id;
			this.title = title;
                        this.metaData = new Array();
		}
		,getId: function(){
			return this.id;
		}
		,putMetaData: function(content) {
		   this.metaData[content.id] = content;
		}
		,getMetaData: function(id){
                    if(id){
			return this.metaData[id];
                    }else{
                        return this.metaData;
                    }
		}
		,removeAllMetaData: function(){
			this.metaData = new Array();
		}
		,setDocumentHTML: function(content){
		   this.documentHTML = content.content;
		}
		,setDocumentWiki: function(content){
		   this.documentWiki = content.content;
		}
    });
    
   return DokuwikiContent;
});
