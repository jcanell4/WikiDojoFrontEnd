define([
    'dojo/_base/declare',
    "dojo/store/Memory",
], function (declare, Memory) {

    return declare([Memory],
        {
            // TODO: override els métodes per permetre inserir abans i després
            put: function (object, options) {
                console.log(object, options);


                if (options) {
                    console.log("Rebudes options", options);

                    // Per tree example online:
                    //             To support DnD, the store must support put(child, {parent: parent}).
                    //     Since memory store doesn't, we hack it.
                    //     Since our store is relational, that just amounts to setting child.parent
                    //     to the parent's id.
                    if  (options.parent){
                        object.parent = options.parent.id;

                        //Another hack to cause items moved into a new parent to show up as the
                        //last child of the parent
                        if  (!options.before) {
                            this.remove(object.id);
                        }
                    }

                    // What the examples don't tell you is that to support betweenThreshold on the tree
                    // (and support setting the order of nodes), we also need to deal with the "before"
                    // attribute (passed in by model's newItem and pasteItem implementations). So, hacking that
                    // in as well.

                    var targetIndex = null;

                    if  (options.before) {
                        targetIndex = options.before.id;
                    } else if (options.after) {
                        targetIndex = options.after.id + 1;
                    }



                    if  (targetIndex !== null) {
                        var data = this.data;
                        var index = this.index,
                            idProperty = this.idProperty;

                        var  id = object[idProperty] = (options && "id"   in  options) ? options.id : idProperty in  object ? object[idProperty] : Math.random();

                        if (id in  index){

                            //Remove the object from its current position
                            this.remove(id);
                        }
                        //Insert/add it in right position
                        index = this.index; //there's a re-index after the remove operation

                        if (targetIndex in index){
                            //carve out a spot for the new item

                            // if (targetIndex === 0) {
                            //     data.unshift(object);
                            // } else {
                                data.splice(index[targetIndex], 0, object);
                            // }



                            // reindexing
                            for (var i=0; i<data.length;i++) {
                                data[i].id = i;
                            }

                            this.setData(data);
                        }
                    }
                }

                this.inherited(arguments);

            }
        });

});
