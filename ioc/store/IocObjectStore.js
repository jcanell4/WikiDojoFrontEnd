define([
    'dojo/_base/declare',
    "dojo/data/ObjectStore",
    "dojo/_base/Deferred",
    "dojo/_base/connect"
], function (declare, ObjectStore, Deferred, connect) {

    return declare([ObjectStore],
        {
            // Coopiat de ObjectStore, només canvia que agafa kwArgs.options i ho passa com a optiosn al mètode .put del OjectStore
            save: function(kwArgs){

                var options = kwArgs && kwArgs.options ? kwArgs.options : {};


                // summary:
                //		Saves the dirty data using object store provider. See dojo/data/api/Write for API.
                // kwArgs:
                //		- kwArgs.global:
                //		  This will cause the save to commit the dirty data for all
                //		  ObjectStores as a single transaction.
                //
                //		- kwArgs.revertOnError:
                //		  This will cause the changes to be reverted if there is an
                //		  error on the save. By default a revert is executed unless
                //		  a value of false is provide for this parameter.
                //
                //		- kwArgs.onError:
                //		  Called when an error occurs in the commit
                //
                //		- kwArgs.onComplete:
                //		  Called when an the save/commit is completed

                kwArgs = kwArgs || {};
                var result, actions = [];
                var savingObjects = [];
                var self = this;
                var dirtyObjects = this._dirtyObjects;
                var left = dirtyObjects.length;// this is how many changes are remaining to be received from the server
                try{
                    connect.connect(kwArgs,"onError",function(){
                        if(kwArgs.revertOnError !== false){
                            var postCommitDirtyObjects = dirtyObjects;
                            dirtyObjects = savingObjects;
                            self.revert(); // revert if there was an error
                            self._dirtyObjects = postCommitDirtyObjects;
                        }
                        else{
                            self._dirtyObjects = dirtyObjects.concat(savingObjects);
                        }
                    });
                    if(this.objectStore.transaction){
                        var transaction = this.objectStore.transaction();
                    }

                    for(var i = 0; i < dirtyObjects.length; i++){
                        var dirty = dirtyObjects[i];
                        var object = dirty.object;
                        var old = dirty.old;
                        delete object.__isDirty;
                        if(object){
                            options.overwrite = true;

                            result = this.objectStore.put(object, options);
                            // result = this.objectStore.put(object, {overwrite: !!old});
                        }
                        else if(typeof old != "undefined"){
                            result = this.objectStore.remove(this.getIdentity(old));
                        }
                        savingObjects.push(dirty);
                        dirtyObjects.splice(i--,1);
                        Deferred.when(result, function(value){
                            if(!(--left)){
                                if(kwArgs.onComplete){
                                    kwArgs.onComplete.call(kwArgs.scope, actions);
                                }
                            }
                        },function(value){

                            // on an error we want to revert, first we want to separate any changes that were made since the commit
                            left = -1; // first make sure that success isn't called
                            kwArgs.onError.call(kwArgs.scope, value);
                        });

                    }
                    if(transaction){
                        transaction.commit();
                    }
                }catch(e){
                    console.error(e);
                    kwArgs.onError.call(kwArgs.scope, value);
                }
            },

        });

});
