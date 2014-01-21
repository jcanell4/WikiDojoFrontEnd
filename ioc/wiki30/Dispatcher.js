define([
        "dojo/_base/declare" // declare
       ,"dijit/registry" //search widgets by id
       ,"dijit/layout/ContentPane"        //per a la funció newTab
       ,"dojo/dom"
       ,"dojo/query"
       ,"dojo/dom-style"
       ,"dijit/Dialog"
       ,"dojo/_base/lang"
       ,"dojo/_base/array"
       ,"ioc/wiki30/GlobalState"
       ,"ioc/wiki30/SectokManager"
       ,"dojo/_base/kernel"
       ,"ioc/wiki30/processor/AlertProcessor"
       ,"ioc/wiki30/processor/HtmlContentProcessor"
       ,"ioc/wiki30/processor/MetaInfoProcessor"
       ,"ioc/wiki30/processor/DataContentProcessor"
       ,"ioc/wiki30/processor/ErrorProcessor"
       ,"ioc/wiki30/processor/InfoStatusProcessor"
       ,"ioc/wiki30/processor/LoginProcessor"
       ,"ioc/wiki30/processor/SectokProcessor"
       ,"ioc/wiki30/processor/TitleProcessor"
       ,"ioc/wiki30/processor/RemoveAllContentTabProcessor"
       ,"ioc/wiki30/processor/RemoveContentTabProcessor"
       ,"ioc/wiki30/processor/CommandProcessor"
       ,"ioc/wiki30/UpdateViewHandler"       
], function(declare, registry, ContentPane, dom, query, domStyle, Dialog
		,lang, array, GlobalState, SectokManager, dojo, AlertProcessor
                ,HtmlContentProcessor, MetaInfoProcessor, DataContentProcessor
                ,ErrorProcessor, InfoStatusProcessor, LoginProcessor
                ,SectokProcessor, TitleProcessor, RemoveAllContentTabProcessor
                ,RemoveContentTabProcessor, CommandProcessor){
    var DispatcherClass = declare("ioc.wiki30.Dispatcher", [], {
        globalState: new GlobalState()
       ,contentCache:{}
       ,processors:{}
       ,updateViewHandlers:[]
       ,sectokManager: new SectokManager()
       ,containerNodeId: null
       ,navegacioNodeId: null
       ,infoNodeId: null
       ,metaInfoNodeId: null
       ,toUpdateSectok: new Array()
       ,diag: new Dialog({
                        title: "ERROR",
                        style: "width: 300px"
                    })
       ,constructor: function(/*Object*/ pAttributes){
           lang.mixin(this, pAttributes);
           this.processors["alert"]=new AlertProcessor();
           this.processors["html"]=new HtmlContentProcessor();
           this.processors["metainfo"]=new MetaInfoProcessor();
           this.processors["data"]=new DataContentProcessor();
           this.processors["error"]=new ErrorProcessor();
           this.processors["info"]=new InfoStatusProcessor();
           this.processors["login"]=new LoginProcessor();
           this.processors["sectok"]=new SectokProcessor();
           this.processors["title"]=new TitleProcessor();
           this.processors["removeall"]=new RemoveAllContentTabProcessor();
           this.processors["remove"]=new RemoveContentTabProcessor();
           this.processors["command"]=new CommandProcessor();
        }
       ,addUpdateView: function(handler){
           this.updateViewHandlers.push(handler);
       }
       ,startup: function(){
           /*TO DO. Set the globalState to different components*/
        }
       ,updateFromState: function(){
               if(this.updateViewHandlers){
                    array.forEach(this.updateViewHandlers, function(handler){
                        handler.update();
                    });
               }
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
       ,removeWidgetChild: function(parentId, childId) {
            var parent;
            var child;
            if(lang.isString(parentId)){
                parent = registry.byId(parentId);
            }else{
                parent = parentId;
            }
            if(lang.isString(childId)){
                child = registry.byId(childId);
            }else{
                child = childId;
            }
            if (child) {
                    parent.removeChild(child);
                    child.destroyRecursive(false);
            }
       }
       ,removeAllChildrenWidgets: function(pwidget) {
           var widget;
           if(lang.isString(pwidget)){
               widget = registry.byId(pwidget);
           }else{
               widget = pwidget;
           }
           if (widget.hasChildren()){
                    widget.destroyDescendants(false);
           }
       }
       ,changeWidgetProperty: function(id, propertyName, value){
           var widget=registry.byId(id);
           widget.set(propertyName, value);
       }       
//       ,processSectok: function(result){
//           this.putSectok(result);
//       }
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
            this.updateFromState();            
            return 0;
        }
       ,_processResponse: function(response){
           if(this.processors[response.type]){
               this.processors[response.type].process(response.value, this);
           }else{
//                if(response.type==="command"){
//                    this._processCommand(response.value);
//                }else if(response.type==="html"){
//                    this._processHtmlContent(response.value);
//                }else if(response.type==="data"){
//                    this._processDataContent(response.value);
//                }else if(response.type==="error"){
//                    this._processError(response.value);
//                }else if(response.type==="info"){
//                    this._processInfo(response.value);
//                }else if(response.type==="login"){
//                    this.processLogin(response.value);
//                }else if(response.type==="sectok"){
//                    this.processSectok(response.value);
//                }else if(response.type==="title"){
//                    this._processTitle(response.value);
//                }else if(response.type==="metainfo"){
//                    this._processMetaInfo(response.value);
//                }else{
                    this.processors["alert"].process("Missatge incomprensible", this); /*TO DO: internationalization*/
//                }
           }
           return 0;
        }        
//	   ,_processMetaInfo: function(content){
//			var widgetCentral = registry.byId(this.containerNodeId).selectedChildWidget;
//			var nodeMetaInfo = registry.byId(this.metaInfoNodeId);
//			var m;
//			this._processRemoveAllChildrenWidgets(nodeMetaInfo);
//			for (m in content.meta) {
//				if (widgetCentral && widgetCentral.id === content.docId) { //esta metainfo pertenece a la pestaña activa
//					var widgetMetaInfo = registry.byId(content.meta[m].id);
//					if (!widgetMetaInfo) {
//						/*Construeix un nou contenidor de meta-info*/
//						var cp = new ContentPane({
//										id: content.meta[m].id
//										,title: content.meta[m].title
//										,content: content.meta[m].content
//								});
//						nodeMetaInfo.addChild(cp);
//						if (content.defaultSelected === content.meta[m].id) 
//							nodeMetaInfo.selectChild(cp);
//						nodeMetaInfo.resize();
//					}else {
//						nodeMetaInfo.selectChild(widgetMetaInfo);
//						var node = dom.byId(content.meta[m].id);
//						node.innerHTML=content.meta[m].content;
//					}
//				}
//				else{
//					//dokuwikiContent.putMetaData(content);
//				}
//			}
//			return 0;
//		}
//       ,_processAlert: function(alert){
//            this.diag.set("title", "ALERTA");
//            this.diag.set("content", alert);
//            this.diag.show();
//        }
//       ,_processDataContent: function(content){
//			this.__newTab(content);
//			//dokuwikiContent.putMetaData(content);
//       }
//       ,_processHtmlContent: function(content){
//			this.__newTab(content);
//			//dokuwikiContent.putMetaData(content);
//        }        
//	   ,__newTab: function(content){
//			var tc = registry.byId(this.containerNodeId);
//			var widget = registry.byId(content.id);
//			/*Construeix una nova pestanya*/
//			if (!widget) {
//				var cp = new ContentPane({
//						id: content.id,
//						title: content.title,
//						content: content.content,
//						closable: true
//				});
//				tc.addChild(cp);
//				tc.selectChild(cp);
//			}else {
//				tc.selectChild(widget);
//				var node = dom.byId(content.id);
//				node.innerHTML=content.content;
//			}
//			return 0;
//		}
	,_processError: function(error, message){
            if (!error) error="";
            if (!message) message="";
            this.processors["error"].process(error + " " + message, this);
        }
//       ,_processInfo: function(info){
//           dom.byId(this.infoNodeId).innerHTML=info;
//       }
//       ,processLogin: function(result){
//                        if (result.loginRequest && !result.loginResult){
//                                this._processError("Usuari o contrasenya incorrectes");
//                        }else if (!result.loginRequest && !result.loginResult){
//                                dom.byId(this.infoNodeId).innerHTML="usuari desconnectat";
//                        }else {
//                                dom.byId(this.infoNodeId).innerHTML="usuari connectat";
//                        }
//       }
//       ,_processCommand: function(command){
//            /*TO DO*/
//            if(command.type==="change_dom_style"){
//                this._processChangeStyleCommand(command);
//            }else if(command.type==="change_widget_property"){
//                this._processChangeWidgetPropertyCommand(command);
//            }else if(command.type==="reaload_widget_content"){
//                                this._processRefresh(command);
//            }else if(command.type==="remove_widget_child"){
//                this._processRemoveWidgetChild(command);
//            }else if(command.type==="remove_all_widget_children"){
//                this._processRemoveAllChildrenWidgets(command);
//            }else if(command.type==="process_dom_from_function"){
//                this._processDomFromFuntcion(command);
//            }else if(command.type==="process_function"){
//                this._processFuntcion(command);
//            }else if(command.type==="jsinfo"){
//                this._processJsInfo(command);
//            }
//       }
//           ,_processRefresh: function(command){
//                        var tabId = registry.byId(command.id);
//                        if (tabId.refresh) {
//                                tabId.refresh();
//                        }else {
//                                this._processError("Aquest element: "+command.id+" no té mètode refresh.");
//                        }
//           }
//           ,_processRemoveWidgetChild: function(command) {
//                        var tc = registry.byId(this.containerNodeId);
//                        var widget = registry.byId(command.id);
//                        if (widget) {
//                                tc.removeChild(widget);
//                                widget.destroyRecursive(false);
//                        }
//                        return 0;
//           }
//           ,_processRemoveAllChildrenWidgets: function(command) {
//                        var node=registry.byId(command.id);
//                        if (node.hasChildren()){
//                                node.destroyDescendants(false);
//                        }
//           }
//       ,_processChangeWidgetPropertyCommand: function(command){
//           var widget=registry.byId(command.id);
//           widget.set(command.propertyName, command.propertyValue);
//       }
//       ,_processChangeStyleCommand: function(command){
//            domStyle.set(command.id, command.propertyName, command.propertyValue);
//       }
//       ,_processWidgetCommand: function(command){
//            var widget = registry.byId(command.componentId);
//            if(lang.isArray(command.toExecute)){
//                 array.forEach(command.toExecute, function(responseItem){
//                    widget.processCommand(responseItem); 
//                 });             
//            }else{
//                widget._processResponse(command.toExecute);
//            }
//        }
//       ,_processDomFromFuntcion: function(command){
//           if(command.amd){
//               require(new Array(command.processName), function(process){
//                   process(command.id, command.params);
//               });
//           }else{  
//               var cmd = command.processName;
//               cmd += "('"+command.id+"'";
//               if(command.params){
//                  for(var par in command.params){
//                        cmd +=", '"+par+"'";
//                  }
//               }
//               cmd +=")";
//               dojo.eval(cmd);
//           }
//       }
//       ,_processFuntcion: function(command){
//           if(command.amd){
//               require(new Array(command.processName), function(process){
//                   process(command.params);
//               });
//           }else{               
//               var i;
//               var cmd = command.processName;
//               cmd += "(";
//               if(command.params){
//                 for(i=0; i<command.params.length; i++){
//                     if(i>0){
//                         cmd +=", ";
//                     }
//                     cmd +="'"+command.params+"'";
//                 }
//               }
//               cmd +=")";
//               dojo.eval(cmd);
//           }
//       }
//       ,_processJsInfo: function(command){
//           lang.mixin(JSINFO, command.value);
//       }
//       ,_processTitle: function(title){
//           var nodeTitle = query("title")[0];
//           nodeTitle.innerHTML=title;
//       }
    });
    return DispatcherClass;
});
