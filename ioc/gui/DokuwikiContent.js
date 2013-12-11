define([
	"dojo/_base/declare" // declare
        ,"dojo/query"
//        ,"dojo/text!./templates/ContentTabDokuwikiNsTree.html"
        ,"ioc/wiki30/Request"
        ,"dijit/layout/ContentPane"
        ,'dijit/layout/_LayoutWidget'
        ,'dijit/_TemplatedMixin'
        ,"dojo/store/JsonRest"
        ,"dijit/Tree"
        ,"dojo/aspect"
        ,"dijit/tree/ObjectStoreModel"
		,"dojo/NodeList-dom" // NodeList.style
], function(declare, query, /*template,*/ Request, ContentPane, _LayoutWidget,
                _TemplatedMixin, JsonRest, Tree, aspect, ObjectStoreModel){
    var ret = declare("ioc.gui.DokuwikiContent", 
                              [ContentPane, _TemplatedMixin, _LayoutWidget, Request], {
       document: null
       ,metaData: null
       ,buildRendering: function(){
           this.inherited(arguments);
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
	   
	   ,refresh: function(){
			// Destruct the references to any selected nodes so that 
			// the refreshed tree will not attempt to unselect destructed nodes
			// when a new selection is made.
			// These references are contained in Tree.selectedItem,
			// Tree.selectedItems, Tree.selectedNode, and Tree.selectedNodes.
			this.tree.dndController.selectNone();

//			this.tree.model.store.clearOnClose = true; //no és necessari
//			this.tree.model.store.close(); produeix error

			// Completely delete every node from the dijit.Tree     
			this.tree._itemNodesMap = {};
			this.tree.rootNode.state = "UNCHECKED";
//			this.tree.model.root.children = null; produeix error

			// Destroy the widget
			this.tree.rootNode.destroyRecursive();

			// Recreate the model, (with the model again)registry.byId
//			this.tree.model.constructor(dijit.byId(this.tree.id).model);
			//this.tree.model.constructor(registry.byId(this.tree.id).model);
			this.tree.model.constructor(this.tree.model);

			// Rebuild the tree
			this.tree.postMixInProperties();
			this.tree._load();
		}
    });
    return ret;
});
