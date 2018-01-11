define([
    'dojo/Evented',
    'dojo/_base/declare'
], function (Evented, declare) {
    return declare([Evented], {

        /**
         * return {string}
         */
        getValue: function() {
            throw new Error('Method not implemented');
        },

        /**
         *
         * @param {string} value
         */
        setValue: function(value) {
            throw new Error('Method not implemented');
        },

        /**
         * Estableix el contingut actual com a contingut original
         */
        resetOriginalContentState:function() {
            throw new Error('Method not implemented');
        },

        /**
         * return {boolean}
         */
        isChanged: function () {
            throw new Error('Method not implemented');
        },

        lockEditor: function() {
            throw new Error('Method not implemented');
        },

        unlockEditor: function() {
            throw new Error('Method not implemented');
        },

        hideToolbar: function() {
            throw new Error('Method not implemented');
        },

        showToolbar: function() {
            throw new Error('Method not implemented');
        },

        destroy: function() {
            throw new Error('Method not implemented');
        },

        getOriginalValue: function() {
            throw new Error('Method not implemented');
        },

        /**
         * Restabelix el valor original
         */
        resetValue:function() {
            throw new Error('Method not implemented');
        },

        /**
         * return {boolean}
         */
        getReadOnly: function() {
            throw new Error('Method not implemented');
        },

        /**
         *
         * @param {number} height
         */
        setHeight: function(height) {
            throw new Error('Method not implemented');
        },

        fillEditorContainer: function() {
            throw new Error('Method not implemented');
        },

        select: function() {
            throw new Error('Method not implemented');
        },

        getContentFormat: function () {
            return this.editor.getContentFormat();
        }
    });

});
