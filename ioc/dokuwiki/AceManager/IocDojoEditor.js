define([
    'dojo/_base/declare',
    'dijit/Editor',
], function (declare, Editor) {
    return declare([Editor], {


        constructor: function () {
            this.changeDetectorEnabled = false;
        },

        startup: function () {
            this.inherited(arguments);
            this.watch('value', this._checkOriginalContent);
        },

        onDisplayChanged: function () {
            console.log("IocDojoEditor#onDisplayChanged");
            this.inherited(arguments);


            if (!this.changeDetectorEnabled) {
                this._enableChangeDetector();
            }

            // this.onChange(this.get('value'));

        },

        _enableChangeDetector: function () {

            var $editorContainer = jQuery("iframe#" + this.domNode.id + "_iframe").contents().find('#dijitEditorBody');
            var callback = function () {
                console.log("IocDojoEditor#onDisplayChanged->callback");
                this.onChange(this.get('value'));
            }.bind(this);

            if ($editorContainer.length > 0) {
                $editorContainer.on('input keyup', callback);
                this.changeDetectorEnabled = true;
            }
        },

        _checkOriginalContent: function (name, oldValue, newValue) {
            console.log("IocDojoEditor#_checkOriginalContent", newValue);
            if (!this.originalContent) {
                this.originalContent = newValue;
                console.log("Establert el contingut original:", newValue);
            }
        },

        resetOriginalContentState: function() {
            console.log("IocDojoEditor#resetOriginalContentState");
            this.originalContent = this.get('value');
        },

        isChanged: function() {
          return this.get('value') != this.originalContent;
        }

    })
});
