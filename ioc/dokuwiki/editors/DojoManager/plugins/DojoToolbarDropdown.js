define([
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    "dojo",
    "dijit",
    "dojox",
    "dijit/_editor/_Plugin",
    "dojo/_base/lang",
    "dijit/layout/ContentPane",
    "dijit/_Widget",
    "dijit/_TemplatedMixin",
    "dijit/form/DropDownButton",
    "dojo/_base/declare",
    "dojo/dom-construct",
    "dojo/_base/connect",
    "dojo/i18n",
    "dojox/html/format",
    "dojo/i18n!dojox/editor/plugins/nls/Smiley"
], function (AbstractParseableDojoPlugin, dojo, dijit, dojox, _Plugin, lang, ContentPane, _Widget, _TemplatedMixin, DropDownButton, declare, domConstruct) {


    var Smiley = declare([AbstractParseableDojoPlugin], {


        init: function (args) {
            this.inherited(arguments);

            console.log("DojoToolbarDropdown#init", args);
            // this.inherited(arguments);
            //
            // this.editor.customUndo = true;
            //
            var config = {
                title: args.title,
                // ownerDocument: this.editor.ownerDocument,
                // dir: this.editor.dir,
                // lang: this.editor.lang,
                // showLabel: true,
                // iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon,
                // tabIndex: "-1",
                // onClick: lang.hitch(this, "process"),
                toolbarContainerId: args.toolbarContainerId

            };
            //
            this.addButton(config);

            // this._initButton();
        },

        // process: function () {
        //     // this.button.closeDropDown();
        //     this.button.openDropDown();
        //     this.editor.focus();
        // },


        addButton: function (config) {
            console.log("DojoToolbarDropdown#addButton", config);

            this.dropDown = new ContentPane({className:'floating-toolbar'});
            this.dropDown.startup();

            this.toolbarContainerId = config.toolbarContainerId;

                // jQuery('#test-toolbar').append($toolbarContainer);
                // console.log("Existe el #test-toolbar?", jQuery('#test-toolbar'));


            this.button = new DropDownButton({
                label: config.title,
                showLabel: true,
                // iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + config.icon,
                tabIndex: "-1",
                dropDown: this.dropDown,
            });
        },

        parse: function() {
            var $toolbarContainer = jQuery('#' + this.toolbarContainerId).detach();
            domConstruct.place($toolbarContainer.get(0),this.button.dropDown.domNode);
        },

        updateState: function () {
            // summary:
            //		Over-ride for button state control for disabled to work.
            this.button.set("disabled", this.get("disabled"));
        },


    });

    // Register this plugin.
    dojo.subscribe(dijit._scopeName + ".Editor.getPlugin", null, function (o) {
        if (o.plugin) {
            return;
        }
        if (o.args.name === "smiley") {
            o.plugin = new Smiley();
        }
    });


    return Smiley;

});
