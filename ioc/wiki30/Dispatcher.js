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
       ,"dojo/_base/kernel"
], function(declare, registry, ContentPane, runRender, listHeadings, runQuiz, dom, query
               ,domStyle, Dialog, lang, array, SectokManager, dojo){
    var DispatcherClass = declare("ioc.wiki30.Dispatcher", [], {
        globalState: null
       ,sectokManager: new SectokManager()
       ,containerNodeId: null
       ,infoNodeId: null
       ,toUpdateSectok: new Array()
       ,diag: new Dialog({
                        title: "ERROR",
                        style: "width: 300px"
                    })
       ,constructor: function(/*Object*/ pAttributes){
           lang.mixin(this, pAttributes);
        }
       ,startup: function(){
           /*TO DO. Set the globalState to different components*/
        }
       ,getSectok: function(strUrl){
           return (this.sectokManager.getSectok(strUrl));
       }
       ,putSectok: function(strUrl, sectok){
           if(!sectok){
               sectok=strUrl;
               strUrl=undefined;
           }
           this.sectokManager.putSectok(strUrl, sectok);
           array.forEach(this.toUpdateSectok, function(responseItem){
				responseItem.updateSectok();
           });             
           
       }
       ,processSectok: function(result){
           this.putSectok(result);
       }
       ,processError: function(error){
			this._processError(error.response.text);
        }
       ,processResponse: function(response){
			var req = this;
			if (lang.isArray(response)){
				array.forEach(response, function(responseItem){
					req._processResponse(responseItem); 
				});             
			}else{
				req._processResponse(response);
			}
			return 0;
        }
       ,_processResponse: function(response){
            if(response.type==="alert"){
                this._processAlert(response.value);
            }else if(response.type==="command"){
                this._processCommand(response.value);
            }else if(response.type==="data"){
                this._processContent(response.value);
            }else if(response.type==="error"){
                this._processError(response.value);
            }else if(response.type==="info"){
                this._processInfo(response.value);
            }else if(response.type==="login"){
                this.processLogin(response.value);
            }else if(response.type==="sectok"){
                this.processSectok(response.value);
            }else if(response.type==="title"){
                this._processTitle(response.value);
            }else{
                this._processAlert(/*TO DO: internationalization*/"Missatge incomprensible");
            }
			return 0;
        }        
       ,_processAlert: function(alert){
            this.diag.set("title", "ALERTA");
            this.diag.set("content", alert);
            this.diag.show();
        }
       ,_processContent: function(content){
			if (content.isTab!==undefined && content.isTab===false)	//logout
				dom.byId(this.containerNodeId).innerHTML=content.content;
			else {
				var cosa = dom.byId(this.containerNodeId);
				this.__newTab(content);
				listHeadings(content.id);
				runRender(content.id);   
				runQuiz();
			}
			return 0;
        }        
	   ,__newTab: function(content){
		   var tc = registry.byId(this.containerNodeId);
		   var node = registry.byId(content.id);
			/*Construeix una nova pestanya*/
			if (!node) {
				var cp = new ContentPane({
						id: content.id,
						title: content.title,
						content: content.content,
						closable: true
				});
				tc.addChild(cp);
				tc.selectChild(cp);
			}else {
				tc.selectChild(node);
			}
			return 0;
		}
	   ,_processError: function(error, message){
            if(!error) error="";
            if(!message) message="";
            this.diag.set("title", "ERROR");
            this.diag.set("content", error + " " + message);
            this.diag.show();
        }
       ,_processInfo: function(info){
           dom.byId(this.infoNodeId).innerHTML=info;
       }
       ,processLogin: function(result){
			if (result.loginRequest && !result.loginResult){
				this._processError("Usuari o contrasenya incorrectes");
			}else if (!result.loginRequest && !result.loginResult){
				dom.byId(this.infoNodeId).innerHTML="usuari desconnectat";
			}else {
				dom.byId(this.infoNodeId).innerHTML="usuari connectat";
			}
       }
       ,_processCommand: function(command){
            /*TO DO*/
            if(command.type==="change_dom_style"){
                this._processChangeStyleCommand(command);
            }else if(command.type==="change_widget_property"){
                this._processChangeWidgetPropertyCommand(command);
            }else if(command.type==="reaload_widget_content"){
				this._processRefresh(command);
            }else if(command.type==="remove_widget_child"){
                this._processRemoveWidgetChild(command);
            }else if(command.type==="remove_all_widget_children"){
                this._processRemoveAllChildrenWidgets(command);
            }else if(command.type==="process_dom_from_function"){
//                this._processDomFromFuntcion(command);
            }
       }
	   ,_processRefresh: function(command){
			var tabId = registry.byId(command.id);
			if (tabId.refresh) {
				tabId.refresh();
			}else {
				this._processError("Aquest element: "+command.id+" no té mètode refresh.");
			}
	   }
	   ,_processRemoveWidgetChild: function(command) {	//sólo necesario para destruir la pestaña logout
			var widget = registry.byId(command.id);		//ahora esa pestaña ya no existe
			if (widget) widget.destroy(false);
	   }
	   ,_processRemoveAllChildrenWidgets: function(command) {
			var node=registry.byId(command.id);
			if (node.hasChildren()){
				node.destroyDescendants(false);
			}
	   }
       ,_processChangeWidgetPropertyCommand: function(command){
           var widget=registry.byId(command.id);
           widget.set(command.propertyName, command.propertyValue);
       }
       ,_processChangeStyleCommand: function(command){
            domStyle.set(command.id, command.propertyName, command.propertyValue);
       }
       ,_processWidgetCommand: function(command){
            var widget = registry.byId(command.componentId);
            if(lang.isArray(command.toExecute)){
                 array.forEach(command.toExecute, function(responseItem){
                    widget.processCommand(responseItem); 
                 });             
            }else{
                widget._processResponse(command.toExecute);
            }
        }
       ,_processDomFromFuntcion: function(command){
           if(command.amd){
               require(command.processName, function(process){
                   process(command.id, command.params);
               });
           }else{               
               dojo.eval(command.processName+"('"+command.id+"', '"+command.params+"')");
           }
       }
       ,_processTitle: function(title){
           var nodeTitle = query("title")[0];
           nodeTitle.innerHTML=title;
       }
    });
    return DispatcherClass;
});
