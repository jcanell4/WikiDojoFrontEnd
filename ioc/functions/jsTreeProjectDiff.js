define([
    "dojo/aspect",
    "dojo/json",
    "dojo/query",
    "dojo/store/Memory",
    "dojo/store/Observable",
    "dijit/Tree",
    "dijit/tree/ObjectStoreModel",
    "dijit/tree/dndSource",
    "dojo/domReady!"
], function (aspect, json, query, Memory, Observable, Tree, ObjectStoreModel, dndSource) {
    
    var getDiffPart = function(form, rev_id){

        var treeStore = new Memory({
            data: json.parse(form),
            getChildren: function(object){
                return this.query({parent: object.id});
            }
        });

        // To support dynamic data changes, including DnD, the store must support put(child, {parent: parent}).
        // But dojo/store/Memory doesn't, so we have to implement it.
        // Since our store is relational, that just amounts to setting child.parent to the parent's id.
        aspect.around(treeStore, "put", function(originalPut){
            return function(obj, options){
                if (options && options.parent){
                    obj.parent = options.parent.id;
                }
                return originalPut.call(treeStore, obj, options);
            };
        });

        // give store Observable interface so Tree can track updates
        treeStore = new Observable(treeStore);

        // create model to interface Tree to store
        var model = new ObjectStoreModel({
            store: treeStore,
            // query to get root node
            query: {id: "root"}
        });

        var tree = new Tree({
            model: model,
            dndController: dndSource,
            persist: false
        }, rev_id); // make sure you have a target HTML element with this id
        tree.startup();
        
    };
    
    var getDiff = function(formL, formR){
        getDiffPart(formL, "treeRevision1");
        getDiffPart(formR, "treeRevision2");
    };
    
    return {
        getDiff: getDiff
    };
    
});