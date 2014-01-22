define([
	"dojo/_base/declare" // declare
       ,"dijit/registry" //search widgets by id
       ,"dojo/dom"
       ,"dijit/layout/ContentPane"            
       ,"ioc/wiki30/processor/AbstractResponseProcessor"
       ,"ioc/wiki30/DokuwikiContent"
], function(declare, registry, dom, ContentPane, AbstractResponseProcessor){
    var ret = declare("ioc.wiki30.processor.MetaInfoProcessor", [AbstractResponseProcessor], {
        type: "meta"
       ,process:function(value, dispatcher){ 
           this._processMetaInfo(value, dispatcher);
           this._processContentCache(dispatcher, value);
       }
       ,_processMetaInfo: function(content, dispatcher){
            var widgetCentral = registry.byId(dispatcher.containerNodeId).selectedChildWidget;
            var nodeMetaInfo = registry.byId(dispatcher.metaInfoNodeId);
            var m;
            dispatcher.removeAllChildrenWidgets(nodeMetaInfo);
            for (m in content.meta) {
                if (widgetCentral && widgetCentral.id === content.docId) { //esta metainfo pertenece a la pestaña activa
                    var widgetMetaInfo = registry.byId(content.meta[m].id);
                    if (!widgetMetaInfo) {
                        /*Construeix un nou contenidor de meta-info*/
                        var cp = new ContentPane({
                                        id: content.meta[m].id
                                        ,title: content.meta[m].title
                                        ,content: content.meta[m].content
                        });
                        nodeMetaInfo.addChild(cp);
                        if (content.defaultSelected === content.meta[m].id) 
                                nodeMetaInfo.selectChild(cp);
                        nodeMetaInfo.resize();
                    }else {
                        nodeMetaInfo.selectChild(widgetMetaInfo);
                        var node = dom.byId(content.meta[m].id);
                        node.innerHTML=content.meta[m].content;
                    }
                }
            }
            return 0;
    }
    ,_processContentCache: function(dispatcher, value){
           if(dispatcher.contentCache[value.docId]){
              var meta = value.meta;
              for (var i=0; i< meta.length; i++){
                dispatcher.contentCache[value.docId].putMetaData(meta[i]);
              }
           }           
    }

  });
  return ret;
});

