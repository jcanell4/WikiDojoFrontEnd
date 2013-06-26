define([
	"dojo/_base/declare" // declare
       ,"ioc/dokuwiki/runRender"
       ,"ioc/dokuwiki/listHeadings"
       ,"ioc/dokuwiki/runQuiz"
       ,"dojo/dom"
       ,"dojo/query"
       ,"dijit/Dialog"
       ,"dojo/_base/lang"
       ,"dojo/_base/array"
], function(declare, runRender, listHeadings, runQuiz, dom, query, Dialog, 
                                                                 lang, array){
    var ret = declare("ioc.wiki30.Dispatcher", [], {
        containerNodeId: null
       ,infoNodeId:null
       ,diag: new Dialog({
                        title: "ERROR",
                        style: "width: 300px"
                    })
       ,constructor:function(/*Object*/ pAttributes){
           lang.mixin(this, pAttributes);
        }
       ,processResponse: function(response){
          var req = this;
          if(lang.isArray(response)){
             array.forEach(response, function(responseItem){
                req._processResponse(responseItem); 
             });             
          }else{
              req._processResponse(response);
          }
        }
       ,_processResponse: function(response){
            if(response.type==="data"){
                this._showContent(response.value);
            }else if(response.type==="title"){
                this._showTitle(response.value);
            }else if(response.type==="command"){
                this._processCommand(response.value);
            }else if(response.type==="error"){
                this._showError(response.value);
            }else{
                this._showAlert(/*TO DO: internationalization*/
                                        "Missatge incomprensible");
            }
        }        
       ,_showContent:function(content){
            dom.byId(this.containerNodeId).innerHTML=content;
            /*TO CHANGE*/
            listHeadings();
            runRender();   
            runQuiz();
        }        
       ,_showError: function(error){
            this.diag.set("ERROR", error);
            this.diag.show();
        }
       ,_showAlert: function(error){
            this.showError(error);
        }
       ,_showInfo: function(info){
           dom.byId(this.infoNodeId).innerHTML=info;
       }
       ,_showTitle: function(title){
           var nodeTitle = query("title")[0];
           nodeTitle.innerHTML=title;
       }
       ,_processCommand:function(){
            /*TO DO*/
        }
       ,processError: function(error){
           this._showError(error);
        }
    });
    return ret;
});
