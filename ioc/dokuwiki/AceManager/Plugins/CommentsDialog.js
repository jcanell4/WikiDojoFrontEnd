define([
    "dojo/_base/declare", // declare
    "dojo/i18n", // i18n.getLocalization
    "dojo/_base/lang", // lang.hitch
    "dojo/sniff", // has("chrome") has("opera")
    "dijit/focus", // focus.focus()
    "dijit/_editor/_Plugin",
    "dijit/form/Button",
    "dojo/string", // string.substitute
    'ioc/gui/DialogBuilder',
    "dojo/text!./templates/CommentFragment.html",
    "dojo/i18n!ioc/dokuwiki/AceManager/nls/commands",

], function (declare, i18n, lang, has, focus, _Plugin, Button, string, DialogBuilder, template) {

    var strings = i18n.getLocalization("ioc.dokuwiki.acemanager", "commands");

    var CommentsDialog = declare("ioc.dokuwiki.acemanager.plugins.commentsdialog", _Plugin, {
        // summary:
        //		This plugin provides Print capability to the editor.  When
        //		clicked, the document in the editor frame will be printed.

        // htmlTemplate: [protected] String
        //		String used for templating the HTML to insert at the desired point.
        // htmlTemplate: '<span class="ioc-comment">*</span>' +
        //     '<note class="ioc-comment">' +
        //     '<div class="triangle-outer"> </div>' +
        //     '<div class="triangle-inner"> </div>' +
        //     '${content}</br>' +
        //     '<span class="ioc-signature">${signature}</span>' +
        //     '</note>',

        htmlTemplate: template,

        content: "comentari de prova",


        _initButton: function () {
            // summary:
            //		Over-ride for creation of the Print button.
            var editor = this.editor;
            this.button = new Button({
                label: strings["commentplugin"],
                ownerDocument: editor.ownerDocument,
                dir: editor.dir,
                lang: editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "Print", // TODO[Xavi] el prefix ha de canviar per correspondre amb una classe CSS que mostri la icona
                tabIndex: "-1",
                // onClick: lang.hitch(this, "_addNote")
                onClick: lang.hitch(this, "_showCommentDialog")
            });

            console.log("** Inicialitzat NotesPlugin");
        },

        _showCommentDialog: function () {
            var refId = "comments";

            var dialogParams = {
                dispatcher: this.editor.dispatcher,
                id: "commentsDialog",
                // ns: params.ns,
                title: strings['addcommenttitle'],
                // message: strings['addcommentmessage'],
                closable: true
            };
            var builder = new DialogBuilder(dialogParams),
                dialogManager = this.editor.dispatcher.getDialogManager(),
                dlg;

            dlg = dialogManager.getDialog(refId, builder.getId());

            if (!dlg) {
                var button = {
                    id: refId + '_ok',
                    buttonType: 'default',
                    description: strings['addcommentbutton'],
                    callback: this._addNote.bind(this),
                };

                console.log("** Afegir aqui la crida al textarea del builder");
                // alert("Afegir textareas al builder, lligats al component");
                // builder.addTextArea() // ALERTA: Comprovar els contextes d'execució del callback

                builder.addButton(button.buttonType, button);


                builder.addForm({
                    fields: [
                        {
                            type: 'textarea',
                            name: 'comment',
                            properties: ['required']
                        }
            ]
                });

                    //     'type' => 'textarea',
                    // 'name' => 'message',
                    // 'value' => '',
                    // 'label' => WikiIocLangManager::getLang('notification_form_message'), // Optional
                    // 'properties' => ['required'] // Optional


                dlg = builder.build();
                dialogManager.addDialog(refId, dlg);
            }

            dlg.show();

        },

        setEditor: function (/*dijit/Editor*/ editor) {
            // summary:
            //		Tell the plugin which Editor it is associated with.
            // editor: Object
            //		The editor object to attach the print capability to.
            this.editor = editor;
            this._initButton();
        },

        // updateState: function(){
        //     // summary:
        //     //		Over-ride for button state control for disabled to work.
        //     var disabled = this.get("disabled");
        //     if(!this.editor.iframe.contentWindow["print"]){
        //         disabled = true;
        //     }
        //     this.button.set("disabled", disabled);
        // },

        _addNote: function (content) {

            console.log ("Retornat: ",  content);

            args = {
                content: content.comment ||this._getSelectionText() || this.content,
                signature: SIG // ALERTA[Xavi] aquesta és una variable global definida per DokuWiki

            };
            this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));

        },

        // ALERTA[Xavi] S'ha de fer a través de la propietat window de l'editor perqué aquest es troba en un iframe
        _getSelectionText: function () {
            var text = this.editor.window.getSelection().toString();
            console.log("Text:", text);
            return text;
        }


    });


    // Register this plugin.
    _Plugin.registry["commentsdialog"] = function () {
        return new CommentsDialog({command: "commentsdialog"});
    };

    console.log("Plugins:", _Plugin.registry);

    return CommentsDialog;
});