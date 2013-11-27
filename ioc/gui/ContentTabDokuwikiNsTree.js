define([
	"dojo/_base/declare" // declare
        ,"dojo/query"
        ,"dojo/text!./templates/ContentTabDokuwikiNsTree.html"
        ,"ioc/wiki30/Request"
        ,"dijit/layout/ContentPane"
        ,'dijit/layout/_LayoutWidget'
        ,'dijit/_TemplatedMixin'
        ,"dojo/store/JsonRest"
        ,"dijit/Tree"
        ,"dojo/aspect"
        ,"dijit/tree/ObjectStoreModel"
	,"dojo/NodeList-dom" // NodeList.style
], function(declare, query, template, Request, ContentPane, _LayoutWidget,
                _TemplatedMixin, JsonRest, Tree, aspect, ObjectStoreModel){
    var ret = declare("ioc.gui.ContentTabDokuwikiNsTree", 
                              [ContentPane, _TemplatedMixin, _LayoutWidget, Request], {
	// summary:
        templateString: template
       ,treeDataSource: null
       /*,pageDataSource: null*/
       ,rootValue: "_"
       ,tree: null
//       ,widgetsInTemplate: true
       ,buildRendering: function(){
           this.inherited(arguments);
           var vid = this.id;
           var tds = this.treeDataSource;
           var root = this.rootValue;
           var nsTree = this;
           this.tree = new Tree({
                /*id: vid+"_nTree"
               ,*/model: new ObjectStoreModel({
                    store: new JsonRest({
                       target: tds                       
                       ,getChildren: function(object){
                            return this.get(object.id).then(
								function(fullObject){return fullObject.children;}
								,function(error){/*console.log(error);*/}
							);
                        }
                    })
                   ,getRoot: function(onItem){
                            this.store.get(root).then(onItem);
                    }
                   ,mayHaveChildren: function(object){
                            return object.type==="d";
                    }
                   ,getLabel: function(object){
                       return object.name;
                   }
                })
                ,persist: false
                ,openOnClick: true
                ,onClick: function(item){
                    if(!this.model.mayHaveChildren(item)){
                        nsTree.sendRequest("id="+item.id);
                    }
                }
           });
           var tree = this.tree;
//           this.tree.model.store.query(this.getSectok());
           aspect.after(this.tree, "_adjustWidths", function(){
//               tree._adjustWidths();
               var parentNode = tree.domNode.parentNode;
               var node = query(".dijitTreeRow", tree.domNode)[0];
               parentNode.style.width = ""+node.offsetWidth+"px";
           },true);
       }
	   
	   ,updateRendering: function(){
           this.inherited(arguments);
		   this.tree._adjustWidths();
	   }
	   
       ,startup: function(){
            this.inherited(arguments);
            this.tree.placeAt(this.id+"_tree");
            this.tree.startup();
       }
       ,setTreeDatasource: function(/*String*/ urlStr){
           this.treeDataSource=urlStr;
           this.updateSectok();
       }
       ,updateSectok: function(/*String*/ sectok){
           if(!sectok){
               sectok = this.getSectok();
           }
           this.tree.model.store.target=this.treeDataSource+sectok+"/";
       }
    });
    return ret;
});
