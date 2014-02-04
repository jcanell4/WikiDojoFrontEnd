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
        globalState: null
       ,unsavedChangesState: false
       ,contentCache:{}		//objecte {id_pestanya => metaInformacio[id => {id,title,content}]}
       ,processors:{}
       ,updateViewHandlers:null
       ,reloadStateHandlers:null
       ,sectokManager: null
       ,containerNodeId: null
       ,navegacioNodeId: null
       ,infoNodeId: null
       ,metaInfoNodeId: null
       ,toUpdateSectok: null
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
           this.toUpdateSectok = new Array();
           this.sectokManager = new SectokManager();
           this.globalState = GlobalState;
           this.updateViewHandlers = new Array();
           this.reloadStateHandlers = new Array();
           
       }
//       ,initGlobalState: function(){
//           if(typeof(Storage)!=="undefined"
//                    && sessionStorage.globalState){
//               this.globalState = JSON.parse(sessionStorage.globalState);
//           }else{
//               this.globalState = GlobalState;
//           }           
//       }
       ,addUpdateView: function(handler){
           this.updateViewHandlers.push(handler);
       }
       ,addReloadState: function(handler){
           this.reloadStateHandlers.push(handler);
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
       ,reloadFromState: function(stateToLoad){
               if(this.reloadStateHandlers){
                    array.forEach(this.reloadStateHandlers, function(handler){
                        handler.reload(stateToLoad);
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
//		,addWidgetChild: function(content, i) {						???
//			var nodeMetaInfo = registry.byId(this.metaInfoNodeId);	???
//			var cp = new ContentPane({								???
//						id: content.meta[i].id						???
//						,title: content.meta[i].title				???
//						,content: content.meta[i].content			???
//					});
//			nodeMetaInfo.addChild(cp);
//			if (content.defaultSelected === content.meta[i].id) 	???
//				nodeMetaInfo.selectChild(cp);						???
//			if (nodeMetaInfo.resize)
//				nodeMetaInfo.resize();
//		}
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
       ,getGlobalState: function(){
           return this.globalState;
       }
       ,getContentCache: function(id){
           return this.contentCache[id];
       }
       ,getCurrentPage: function(){
           return this.getGlobalState().pages[this.getGlobalState().currentTabId];
       }
       ,getUnsavedChangesState: function(){
           return this.unsavedChangesState;
       }
       ,setUnsavedChangesState: function(st){
           this.unsavedChangesState=st;          
       }
       ,loadDataFromGlobalState: function(){           
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
            this.updateFromState();            
            return 0;
        }
       ,_processResponse: function(response){
           if(this.processors[response.type]){
               this.processors[response.type].process(response.value, this);
           }else{
                this.processors["alert"].process("Missatge incomprensible", this); /*TO DO: internationalization*/
           }
           return 0;
        }
		,_processError: function(error, message){
            if (!error) error="";
            if (!message) message="";
            this.processors["error"].process(error + " " + message, this);
        }
    });
    return DispatcherClass;
});
