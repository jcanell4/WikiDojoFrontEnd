define([
    "dojo/_base/declare",
    "dijit/registry",
    "dojo/on",
    "dojo/dom",
    "dojo/dom-construct",
    "dojo/string",
    "dijit/Dialog",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "dijit/form/Form",
    "dijit/form/TextBox",
    "dijit/form/CheckBox",
    "dijit/form/Button",
    "ioc/gui/NsTreeContainer",
    "ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin",
    'ioc/dokuwiki/editors/Components/ShowIncludeSectionComponent'
], function (declare,registry,on,dom,domConstruct,string,Dialog,BorderContainer,ContentPane,
             Form,TextBox,CheckBox,Button,NsTreeContainer,AbstractAcePlugin, ShowIncludeSectionComponent) {


    var ret = declare([AbstractAcePlugin], {

        init: function (args) {
            this.template = args.template;
            this.title = args.title;

            var config = JSON.parse(JSON.stringify(args));
            if (args.icon.indexOf(".png") === -1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }
            this.addButton(config, this.process);
            this.enabled = true;
        },

        _showDialog: function () {
            new ShowIncludeSectionComponent().show(this.getEditor(), this.insert.bind(this));
        },

        _processFull: function () {
            this._showDialog();
        },

        insert: function (value) {
            var data = {id: value};
            var innerEditor = this.getInnerEditor();
            innerEditor.session.insert(innerEditor.cursor_position(), string.substitute(this.template, data));
        }

    });
    return ret;

});
