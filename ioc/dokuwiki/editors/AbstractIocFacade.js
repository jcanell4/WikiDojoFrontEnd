define([
    'dojo/Evented',
    'dojo/_base/declare',
    'dojo/dom-geometry',
], function (Evented, declare, geometry) {
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

        _getImportantMessageHeight:function(containerNode) {
            var $messageNode = jQuery(containerNode).find('.importantMessage');

            var messageHeight = 0;

            if ($messageNode.length > 0) {
                messageHeight = geometry.getContentBox($messageNode.get(0)).h;
            }

            return messageHeight
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
