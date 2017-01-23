define([
    'dojo/_base/declare',
    'dijit/Editor',
], function (declare, Editor) {
    return declare([Editor], {


        constructor: function () {
            this.changeDetectorEnabled = false;
        },

        startup: function () {
            console.log("*** Editor#startup: START");
            console.log("*** Editor#startup: START");
            console.log("*** Editor#startup: START");
            this.inherited(arguments);
            console.log("*** Editor#startup: END");
            console.log("*** Editor#startup: END");
            console.log("*** Editor#startup: END");
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
            var callback = function() {
                console.log("IocDojoEditor#onDisplayChanged->callback");
                this.onChange(this.get('value'));
            }.bind(this);

            if ($editorContainer.length > 0) {
                $editorContainer.on('input keyup', callback);
                this.changeDetectorEnabled = true;
            }

        },

    })
});
