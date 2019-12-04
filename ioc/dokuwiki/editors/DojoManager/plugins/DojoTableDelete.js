define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dijit/_editor/_Plugin",
    "dojox/editor/plugins/TablePlugins",
    "dojo/_base/lang",
], function (declare, AbstractDojoPlugin, _Plugin, TablePlugins, lang) {

    var TableCellMerge = declare([TablePlugins, AbstractDojoPlugin], {


        init: function (args) {
            this.inherited(arguments);

            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon,
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };

            this.addButton(config);


            this.button.set('disabled', true);

            this.editor.on('changeCursor', this.updateCursorState.bind(this));

        },


        updateCursorState: function (e) {

            if (e.state.indexOf('table') > -1) {
                this.button.set('disabled', false);
            } else {
                this.button.set('disabled', true);
            }
        },


        process: function () {
            var o = this.getTableInfo();

            console.log("taula:", jQuery(o.tbl));
            console.log("box?:", jQuery(o.tbl).parent());

            // jQuery(o.tbl).remove();
            jQuery(o.tbl).parent().remove();
            this.editor.forceChange();
        }


    });


    // Register this plugin.
    _Plugin.registry["table_delete"] = function () {
        return new TableCellMerge({command: "table_delete"});
    };


    return TableCellMerge;
});