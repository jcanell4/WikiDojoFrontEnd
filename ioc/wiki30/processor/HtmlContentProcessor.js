define([
	"dojo/_base/declare"
    ,"dijit/registry"    //search widgets by id       
    ,"ioc/wiki30/processor/ContentProcessor"
], function(declare, registry, ContentProcessor){
    var ret = declare("ioc.wiki30.processor.HtmlContentProcessor", [ContentProcessor], {
        type: "html"
       ,process:function(value, dispatcher){ 
           this.inherited(arguments);
           
           /* Provisional */
//           var node = registry.byId(value.id);
//           var childNodeH1 = node.domNode.children[0]; //domNode de H1
//           var childNodeDIV1 = node.domNode.children[1]; //domNode de DIV1
//           var childNodeDIV2 = node.domNode.children[2]; //domNode de DIV2
////           dispatcher.getGlobalState().__ImprimirObjeto(node.domNode.children, "node.domNode.children");
////           dispatcher.getGlobalState().__ImprimirObjeto(childNodeDIV2, "node.domNode.children[2]");
//           dispatcher.getGlobalState().getIdSectionNode(childNodeDIV1);
           /* Provisional */
       }
       ,updateState: function(dispatcher, value){
           this.inherited(arguments);
           dispatcher.getGlobalState().pages[value.id]["action"]="view";
       }
    });
    return ret;
});

