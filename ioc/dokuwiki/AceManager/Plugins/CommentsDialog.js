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
    "dojo/text!./templates/CommentFragmentReply.html",
    "dojo/i18n!ioc/dokuwiki/AceManager/nls/commands",

], function (declare, i18n, lang, has, focus, _Plugin, Button, string, DialogBuilder, template, templateReply) {

    var strings = i18n.getLocalization("ioc.dokuwiki.acemanager", "commands");


    // Aquí es guarda una referència a tots els comentaris creats
    var comments = [];


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
        replyTemplate: templateReply,

        needsParse: true,

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

            // ALERTA[Xavi] En aquest punt ja tenim el text disponible?
            // this._parse(this.editor.get('value'));


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

        _addHandlers: function ($node, context) {
            var $replyNode = $node.find('textarea');
            var $buttons = $node.find('button');

            $buttons.on('click', function (e) {
                // alert("Click a un botó");

                var $button = jQuery(this);
                var func = $button.attr('data-action');
                context[func].bind(context);
                context[func]($node);
                e.preventDefault();

            });

            $replyNode.on('keypress keydown keyup', function (e) {
                $replyNode.focus();

                if (e.keyCode == 13 || e.charCode == 13) {
                    e.stopPropagation();
                }

            });


            var $commentBody = $node.find('.ioc-comment-body');

            $commentBody.on('click', function (e) {
                $replyNode.focus();
                e.preventDefault();
            });
        },

        parse: function() {

            var $nodes = jQuery(this.editor.iframe).contents().find('.ioc-comment-block');
            var context = this;

            $nodes.each(function() {
                context._addHandlers(jQuery(this), context);
            });

        },

        _addNote: function (content) {

            console.log("Retornat: ", content);

            // ALERTA[Xavi] Generem el id basat en el temps perquè només necessitem que sigui únic

            var reference = this._getSelectionText();

            if (!reference) {
                reference = "*"
            }

            args = {
                id: "ioc-comment-" + Date.now(),
                reference: reference,
                content: content.comment || this.content,
                signature: SIG, // ALERTA[Xavi] aquesta és una variable global definida per DokuWiki

            };

            var htmlCode = string.substitute(this.htmlTemplate, args);
            this.editor.execCommand('inserthtml', htmlCode); //ALERTA[Xavi] S'afegeix la referència per evitar esborrar el text ressaltat


            // TODO:
            // Afegir quadre de text per respondre (que afegirà la firma automàticament). Mateix format que el template però sense el * ja que aquest ha d'estar lligat al comentari anterior


            var $node = jQuery(this.editor.iframe).contents().find('#' + args.id);

            this._addHandlers($node, this);

            // var $replyNode = $node.find('textarea');
            //
            // var $buttons = $node.find('button');
            //
            // var that = this;
            //
            // $buttons.on('click', function (e) {
            //     // alert("Click a un botó");
            //
            //     var $button = jQuery(this);
            //     var func = $button.attr('data-action');
            //     that[func].bind(that);
            //     that[func]($node);
            //     e.preventDefault();
            //
            // });
            //
            // $replyNode.on('keypress keydown keyup', function (e) {
            //     $replyNode.focus();
            //
            //     if (e.keyCode == 13 || e.charCode == 13) {
            //         e.stopPropagation();
            //     }
            //
            // });
            //
            //
            // var $commentBody = $node.find('.ioc-comment-body');
            //
            // $commentBody.on('click', function (e) {
            //     $replyNode.focus();
            //     e.preventDefault();
            // });

        },


        // ALERTA[Xavi] S'ha de fer a través de la propietat window de l'editor perqué aquest es troba en un iframe
        _getSelectionText: function () {
            var text = this.editor.window.getSelection().toString();
            return text;
        },

        reply: function ($node) {

            var $textarea = $node.find('textarea');
            var reply = $textarea.val();
            var $replyList = $node.find('.ioc-reply-list');

            if (reply.length == 0) {
                return;
            }

            reply = reply.replace(/(?:\r\n|\r|\n)/g, '<br />')

            var args = {
                reply: reply,
                signature: SIG
            };

            var $replyCode = jQuery(string.substitute(this.replyTemplate, args));

            // console.log("replycode:", $replyCode);
            // console.log("ReplyList:", $replyList);

            $replyList.append($replyCode);
            $textarea.val('');
            $textarea.focus();
        },

        resolve: function ($node) {


            var $reference = $node.find('.ioc-comment-reference');

            if ($reference.html() != '*') {
                jQuery(document.createTextNode($reference.html())).insertBefore($node);
            }

            $node.remove();
        }
    });


    // Register this plugin.
    _Plugin.registry["commentsdialog"] = function () {
        return new CommentsDialog({command: "commentsdialog"});
    };


    return CommentsDialog;
});