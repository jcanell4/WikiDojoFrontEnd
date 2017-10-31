define([
    'dojo/_base/declare',
    'dojo/Evented'
], function (declare, Evented) {


    return declare(Evented, {

        constructor: function(type) {
            
        },

        addButton: function() {
            throw new Error('Method not implemented');
        },

        getPluginConstructor: function() {

        }


    });

});