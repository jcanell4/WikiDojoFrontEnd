define([
    'dojo/_base/declare',
    'dijit/_editor/plugins/LinkDialog',
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    'dojo/_base/lang',
    'dijit/_editor/_Plugin',
    'dojo/string',
    "dojo/on",
    "dojo/sniff", // has("ie")
    "dojo/query", // query
    // "dojo/string", // string.substitute
    "dijit/_Widget",
    // "dijit/_editor/_Plugin",
    "dijit/form/DropDownButton",
    "dijit/_editor/range",
    "dojo/keys", // keys.ENTER
], function (declare, LinkDialog, AbstractDojoPlugin, lang, _Plugin, string, on, has, query,
             _Widget, DropDownButton, rangeapi, keys) {

    var DojoLinkDialog = declare([AbstractDojoPlugin, LinkDialog], {

        init: function(args) {
            // alert("stop");
            console.log("DojoLinkDialog#init");

            this.inherited(arguments);

            // this.htmlTemplate = "${urlInput} ${textInput} ${targetSelect}";
            // TODO[Xavi] Com fer la substitució dels atributs a l'args open??
            // this.htmlTemplate = args.open + "${textInput}" + args.close;
            this.htmlTemplate = "<a href=\"${urlInput}\" target=\"${targetSelect}\">${textInput}" + args.close;

            this.content = args.sample;

            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon,
                tabIndex: "-1",
                // onClick: lang.hitch(this, "process")
                // onClick: lang.hitch(this, "_loadDropDown")
            };

            this.addButton(config);

        },

        addButton: function(config) {
            this.button = new DropDownButton(config);
            this._initButton();
            this.button.loadDropDown = lang.hitch(this, "_loadDropDown");
        },

        _initButton: function(){
            // alert("init!");


            // Setup to lazy create TooltipDialog first time the button is clicked
            // this.button.loadDropDown = lang.hitch(this, "_loadDropDown");

            this._connectTagEvents();
        },

        _loadDropDown: function(callback){

                // Called the first time the button is pressed.  Initialize TooltipDialog.
                require([
                    "dojo/i18n", // i18n.getLocalization
                    "dijit/TooltipDialog",
                    "dijit/registry", // registry.byId, registry.getUniqueId
                    "dijit/form/Button", // used by template
                    "dijit/form/Select", // used by template
                    "dijit/form/ValidationTextBox", // used by template
                    "dojo/i18n!dijit/nls/common",
                    "dojo/i18n!dijit/_editor/nls/LinkDialog"
                ], lang.hitch(this, function(i18n, TooltipDialog, registry){
                    var _this = this;
                    this.tag = this.command == 'insertImage' ? 'img' : 'a';
                    var messages = lang.delegate(i18n.getLocalization("dijit", "common", this.lang),
                        i18n.getLocalization("dijit._editor", "LinkDialog", this.lang));
                    var dropDown = (this.dropDown = this.button.dropDown = new TooltipDialog({
                        title: this.button.label,
                        ownerDocument: this.editor.ownerDocument,
                        dir: this.editor.dir,
                        execute: lang.hitch(this, "setValue"),
                        onOpen: function(){
                            _this._onOpenDialog();
                            TooltipDialog.prototype.onOpen.apply(this, arguments);
                        },
                        onCancel: function(){
                            setTimeout(lang.hitch(_this, "_onCloseDialog"), 0);
                        }
                    }));
                    messages.urlRegExp = this.urlRegExp;
                    messages.id = registry.getUniqueId(this.editor.id);
                    this._uniqueId = messages.id;
                    this._setContent(dropDown.title +
                        "<div style='border-bottom: 1px black solid;padding-bottom:2pt;margin-bottom:4pt'></div>" +
                        string.substitute(this.linkDialogTemplate, messages));
                    dropDown.startup();
                    this._urlInput = registry.byId(this._uniqueId + "_urlInput");
                    this._textInput = registry.byId(this._uniqueId + "_textInput");
                    this._setButton = registry.byId(this._uniqueId + "_setButton");
                    this.own(registry.byId(this._uniqueId + "_cancelButton").on("click", lang.hitch(this.dropDown, "onCancel")));
                    if(this._urlInput){
                        this.own(this._urlInput.on("change", lang.hitch(this, "_checkAndFixInput")));
                    }
                    if(this._textInput){
                        this.own(this._textInput.on("change", lang.hitch(this, "_checkAndFixInput")));
                    }

                    // Build up the dual check for http/https/file:, and mailto formats.
                    this._urlRegExp = new RegExp("^" + this.urlRegExp + "$", "i");
                    this._emailRegExp = new RegExp("^" + this.emailRegExp + "$", "i");
                    this._urlInput.isValid = lang.hitch(this, function(){
                        // Function over-ride of isValid to test if the input matches a url or a mailto style link.
                        var value = this._urlInput.get("value");
                        return this._urlRegExp.test(value) || this._emailRegExp.test(value);
                    });

                    // Listen for enter and execute if valid.
                    this.own(on(dropDown.domNode, "keydown", lang.hitch(this, lang.hitch(this, function(e){
                        if(e && e.keyCode == keys.ENTER && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey){
                            if(!this._setButton.get("disabled")){
                                dropDown.onExecute();
                                dropDown.execute(dropDown.get('value'));
                            }
                        }
                    }))));

                    callback();
                }));


            // var args = {content: this._getSelectionText() || this.content}
            // this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));
        },


    });


    // Register this plugin.
    _Plugin.registry["insert_external_link"] = function () {
        return new DojoLinkDialog({command: "insert_external_link"});
    };

    return DojoLinkDialog;
});