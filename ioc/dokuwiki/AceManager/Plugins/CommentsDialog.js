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

    // @override
        _initButton: function () {
            var editor = this.editor;
            editor.customUndo = true;

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

            // ALERTA[Xavi] En aquest punt ja tenim el text disponible?
            // this._parse(this.editor.get('value'));


        },

        _showCommentDialog: function () {

            this._addNote();


            // var refId = "comments";
            //
            // var dialogParams = {
            //     dispatcher: this.editor.dispatcher,
            //     id: "commentsDialog",
            //     // ns: params.ns,
            //     title: strings['addcommenttitle'],
            //     // message: strings['addcommentmessage'],
            //     closable: true
            // };
            // var builder = new DialogBuilder(dialogParams),
            //     dialogManager = this.editor.dispatcher.getDialogManager(),
            //     dlg;
            //
            // dlg = dialogManager.getDialog(refId, builder.getId());
            //
            //
            // if (!dlg) {
            //     var button = {
            //         id: refId + '_ok',
            //         buttonType: 'default',
            //         description: strings['addcommentbutton'],
            //         callback: this._addNote.bind(this),
            //     };
            //
            //     console.log("** Afegir aqui la crida al textarea del builder");
            //     // alert("Afegir textareas al builder, lligats al component");
            //     // builder.addTextArea() // ALERTA: Comprovar els contextes d'execució del callback
            //
            //     builder.addButton(button.buttonType, button);
            //
            //
            //     builder.addForm({
            //         fields: [
            //             {
            //                 type: 'textarea',
            //                 name: 'comment',
            //                 properties: ['required']
            //             }
            //         ]
            //     });

            //     dlg = builder.build();
            //     dialogManager.addDialog(refId, dlg);
            // }
            //
            // dlg.show();

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
            var $removeButtons = $node.find('[data-button="remove"]');

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

        _addNote: function () {

            // ALERTA[Xavi] Generem el id basat en el temps perquè només necessitem que sigui únic

            this.editor.beginEditing();
            var reference = this._getSelectionText();

            var time = Date.now();

            var ref = this._referenceFromDate(time);

            if (!reference) {
                reference = "*"
            }


            reference += " ("+ref+")";

            args = {
                id: "ioc-comment-" + Date.now(),
                reference: reference,
                ref: ref,
                resolveBtnTitle: strings['resolveBtnTitle'],
                resolveBtn : strings['resolveBtn'],
                textareaPlaceholder : strings['textareaPlaceholder'],
                replyBtnTitle : strings['replyBtnTitle'],
                replyBtn : strings['replyBtn']
                // signature: SIG, // ALERTA[Xavi] aquesta és una variable global definida per DokuWiki

            };

            var htmlCode = string.substitute(this.htmlTemplate, args);
            this.editor.execCommand('inserthtml', htmlCode); //ALERTA[Xavi] S'afegeix la referència per evitar esborrar el text ressaltat

            var $node = jQuery(this.editor.iframe).contents().find('#' + args.id);
            $node.find('textarea').focus();



            this._addHandlers($node, this);

            this.editor.endEditing();

        },

        // ALERTA[Xavi] es genera la referència a partir de la data, simplificant el nombre: limitant a 1 per segon, comptant a partir del 1 de gener del 2017
        _referenceFromDate: function(time) {
            time = time - 1483228800000; // 2017-1-1

            return Math.floor(time / 1000);
        },


        // ALERTA[Xavi] S'ha de fer a través de la propietat window de l'editor perqué aquest es troba en un iframe
        _getSelectionText: function () {
            var text = this.editor.window.getSelection().toString();
            return text;
        },

        reply: function ($node) {

            this.editor.beginEditing();
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


            var user = this._getSignatureUser(SIG);
            $replyCode.attr('data-user', user);

            $replyList.append($replyCode);
            $textarea.val('');
            $textarea.focus();

            this.editor.endEditing();
        },


        // ALERTA[Xav] No es correspon amb el user del global state, només amb el de la signatura
        _getSignatureUser: function(signature) {
            // console.log(("Sig?", SIG));
            var match = /\[\[(.*)\]\]/gi.exec(signature);
            // console.log("Match:", match);
            return match[1];
        },

        resolve: function ($node) {

            this.editor.beginEditing();
            var $reference = $node.find('.ioc-comment-reference');

            var ref = $reference.attr('data-reference');

            if ($reference.html() != '* (' + ref + ')') {
                var text = $reference.html().replace('(' + ref + ')', '');

                jQuery(document.createTextNode(text)).insertBefore($node);
            }

            $node.remove();
            this.editor.endEditing();

        }
    });


    // Register this plugin.
    _Plugin.registry["commentsdialog"] = function () {
        return new CommentsDialog({command: "commentsdialog"});
    };


    return CommentsDialog;
});