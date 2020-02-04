define([
    "dojo/_base/declare",
    "dijit/_editor/_Plugin",
], function (declare, _Plugin) {

    var CustomAutoAddEndParafraph = declare( _Plugin, {

        setEditor: function (editor) {

            this.inherited(arguments);

            this.editor.on('changeCursor', this.updateCursorState.bind(this));

        },

        updateCursorState: function(e) {

            console.log("ContentDomPostFilters?", this.contentDomPostFilters)

            // Buit perque no cal aquesta classe, la he deixat per reaprofitar la estructura


        }
    });

    _Plugin.registry["customAutoAddEndParagraph"] = function(){
        return new CustomAutoAddEndParafraph({command: "customAutoAddEndParagraph"});
    };


    return CustomAutoAddEndParafraph;
});