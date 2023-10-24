define([
    'dojo/_base/declare',
    "dojo/store/Memory",
], function (declare, Memory) {

    return declare([Memory],
        {
            // Retorna una id lliure, començant a cercar a partir del nombre de files de la taula
            getUniqueId: function () {
                var candidate = this.data.length;

                while (candidate in this.index) {
                    candidate++
                }

                return candidate;
            },

            put: function (object, options) {

                if (options) {

                    var targetIndex = null;

                    if (options.before) {
                        targetIndex = options.before.id;
                    } else if (options.after) {
                        targetIndex = options.after.id + 1;
                    }


                    if (targetIndex !== null) {
                        var data = this.data;
                        var index = this.index;


                        if (object.id in index) {
                            console.warn("Ja existeix l'objecte amb id:", object.id, index, " és un update?")
                            //Remove the object from its current position
                            this.remove(object.id);
                        }


                        //carve out a spot for the new item
                        data.splice(targetIndex, 0, object);

                        // reindexing
                        this.setData(data);

                    }
                }

                this.inherited(arguments);


            }
        });

});
