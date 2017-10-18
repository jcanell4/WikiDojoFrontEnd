define([
    'dojo/Stateful',
    'dojo/_base/declare'
], function (Stateful, declare) {

    return declare([Stateful], {

        resetOriginalContentState: function() {
            throw new Error('Method not implemented')
        },

        getOriginalValue: function() {
            throw new Error('Method not implemented')
        },

        /**
         * return {boolean}
         */
        isChanged: function() {
            throw new Error('Method not implemented')
        }
        

    });

});
