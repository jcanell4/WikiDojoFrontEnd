define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    'ioc/dokuwiki/editors/Components/FireEventComponent'
], function (declare, AbstractDojoPlugin, lang, _Plugin, FireEventComponent) {

    var FireEventButton = declare(AbstractDojoPlugin, {

        init: function(args) {
            this.inherited(arguments);

            this.fireEventComponent = new FireEventComponent(this.editor.dispatcher);

            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon, // TODO[Xavi] el prefix ha de canviar per correspondre amb una classe CSS que mostri la icona
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };

            this.events = args.event;

            console.log("args.icon:", args.icon);
            console.log("args", args);
            console.log("iconClass:", config.iconClass);


            this.addButton(config);
        },

        _processFull: function () {
            this.fireEventComponent.fireFull(this.events['full'])

            // var id = this._getDocumentId();
            //
            // this.fireEventComponent.fire(this.events['full'], {
            //     id: id
            // }, id)
        },

        _processPartial: function () {
            this.fireEventComponent.firePartial(this.events['partial']);

            // var id = this._getDocumentId();
            //
            // this.fireEventComponent.fire(this.events['partial'], {
            //     id: id,
            //     chunk: this._getChunkId()
            // }, id)
        }

    });


    // Register this plugin.
    _Plugin.registry["fire_event"] = function () {
        return new FireEventButton({command: "fire_event"});
    };

    return FireEventButton;
});