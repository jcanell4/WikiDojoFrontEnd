define([
	"dojo/_base/declare" // declare
       ,"dijit/registry" //search widgets by id
	   ,"dijit/layout/ContentPane"	//per a la funció newTab
       ,"ioc/dokuwiki/runRender"
       ,"ioc/dokuwiki/listHeadings"
       ,"ioc/dokuwiki/runQuiz"
       ,"dojo/dom"
       ,"dojo/query"
       ,"dojo/dom-style"
       ,"dijit/Dialog"
       ,"dojo/_base/lang"
       ,"dojo/_base/array"
       ,"ioc/wiki30/SectokManager"
], function(declare, registry, ContentPane, runRender, listHeadings, runQuiz, dom, query
                             ,domStyle, Dialog, lang, array, SectokManager){
    var DispatcherClass = declare("ioc.wiki30.Dispatcher", [], {
        globalState:null
       ,sectokManager:new SectokManager()
       ,containerNodeId: null
       ,infoNodeId:null
       ,toUpdateSectok:new Array()
       ,diag: new Dialog({
                        title: "ERROR",
                        style: "width: 300px"
                    })
       ,constructor:function(/*Object*/ pAttributes){
           lang.mixin(this, pAttributes);
        }
       ,startup: function(){
           /*TO DO. Set the globalState to different components*/
        }
       ,getSectok:function(strUrl){
           return (this.sectokManager.getSectok(strUrl));
       }
       ,putSectok:function(strUrl, sectok){
           if(!sectok){
               sectok=strUrl;
               strUrl=undefined;
           }
           this.sectokManager.putSectok(strUrl, sectok);
           array.forEach(this.toUpdateSectok, function(responseItem){
                    responseItem.updateSectok();
           });             
           
       }
       ,processLogin: function(result){
           if(!result){
            this.diag.set("ALERTA", "Usuari o contrasenya incorrecta");
            this.diag.show();               
           }
       }
       ,processSectok: function(result){
           this.putSectok(result);
       }

       ,processError: function(error){
           this._processError(error.response.text);
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
                this._processContent(response.value);
            }else if(response.type==="title"){
                this._processTitle(response.value);
            }else if(response.type==="command"){
                this._processCommand(response.value);
            }else if(response.type==="error"){
                this._processError(response.value);
            }else if(response.type==="info"){
                this._processInfo(response.value);
            }else if(response.type==="sectok"){
                this.processSectok(response.value);
            }else if(response.type==="login"){
                this.processLogin(response.value);
            }else if(response.type==="alert"){
                this._processAlert(response.value);
            }else{
                this._processAlert(/*TO DO: internationalization*/
                                 "Missatge incomprensible");
            }
        }        
       ,_processContent:function(content){
            //dom.byId(this.containerNodeId).innerHTML=content;
            this.newTab(content);
            listHeadings();
            runRender();   
            runQuiz();
        }        
		,newTab: function(content){
			/*Construeix una nova pestanya*/
			if (!registry.byId(content.id)) {
				var tc = registry.byId(this.containerNodeId);
				var cp = new ContentPane({
						id: content.id,
						title: content.title,
						content: content.content,
						closable: true
				});
				tc.addChild(cp);
				tc.selectChild(cp);
			}
		}
	   ,_processError: function(error, message){
            if(!error) error="";
            if(!message) message="";
            this.diag.set("title", "ERROR");
            this.diag.set("content", error + " " + message);
            this.diag.show();
        }
       ,_processAlert: function(alert){
            this.diag.set("title", "ALERTA");
            this.diag.set("content", alert);
            this.diag.show();
        }
       ,_processInfo: function(info){
           dom.byId(this.infoNodeId).innerHTML=info;
       }
       ,_processTitle: function(title){
           var nodeTitle = query("title")[0];
           nodeTitle.innerHTML=title;
       }
       ,_processCommand:function(command){
            /*TO DO*/
            if(command.type=="change_dom_style"){
                this._processChangeStyleCommand(command);
            }else if(command.type=="change_widget_property"){
                this._processChangeWidgetPropertyCommand(command);
            }
       }
       ,_processChangeWidgetPropertyCommand:function(command){
           var widget=registry.byId(command.id);
           widget.set(command.propertyName, command.propertyValue);
       }
       ,_processChangeStyleCommand:function(command){
            domStyle.set(command.id, command.propertyName, command.propertyValue);
       }
       ,_processWidgetCommand:function(command){
            var widget = registry.byId(command.componentId);
            if(lang.isArray(command.toExecute)){
                 array.forEach(command.toExecute, function(responseItem){
                    widget.processCommand(responseItem); 
                 });             
            }else{
                widget._processResponse(command.toExecute);
            }
        }
    });
    return DispatcherClass;
});
