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
    "dojo/i18n!ioc/dokuwiki/editors/DojoManager/nls/commands",



], function (declare, i18n, lang, has, focus, _Plugin, Button, string, DialogBuilder, template, templateReply) {

    var strings = i18n.getLocalization("ioc.dokuwiki.editors.DojoManager", "commands");


    var CommentsDialog = declare("ioc.dokuwiki.editors.DojoManager.plugins.commentsdialog", _Plugin, {
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
        iconClassPrefix: 'dijitIocIcon',

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
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "Comments",
                tabIndex: "-1",
                onClick: lang.hitch(this, "_addNote")
                // onClick: lang.hitch(this, "_showCommentDialog")
            });

            this.firstRun = true;

        },

        _showCommentDialog: function () {
            console.log("S'ha fet click al botó del plugin");


            //
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
            //
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
            var $replyNode = $node.find('textarea.reply');
            var $buttons = $node.find('button[data-action]');
            var $removeButtons = $node.find('[data-button="remove"]');
            var $editButtons = $node.find('[data-button="edit"]');
            // var $saveButons = $node.find('button[data-action-reply="save"]');
            // var $cancelButtons = $node.find('button[data-action-reply="cancel"]');

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

            // $replyNode.on('focus', function() {
            //
            // });
            //
            // $replyNode.on('blur', function() {
            //
            // });


            // Això només ha de ser disponible en els comentaris propis de l'usuari

            $removeButtons.each(function () {
                var $button = jQuery(this);
                var $commentNode = $button.closest('.ioc-comment-reply');
                var $toolbar = $button.closest('.ioc-comment-toolbar');

                var user = $commentNode.attr('data-user');
                if (user == context.editor.dispatcher.getGlobalState().userId) {
                    $button.on('click', context.addRemoveCommentHandler($commentNode).bind(context));
                    $toolbar.css('display', 'inherit');
                } else {

                    $toolbar.css('display', 'none');
                }
            });

            $editButtons.each(function () {
                var $button = jQuery(this);
                var $commentNode = $button.closest('.ioc-comment-reply');

                var user = $commentNode.attr('data-user');

                if (user == context.editor.dispatcher.getGlobalState().userId) {
                    $button.on('click', context.addEditCommentHandler($commentNode).bind(context));
                }
                // ALERTA[Xavi] No cal amargar-la perquè ja es fa al botó anterior.
            });


            var $commentBody = $node.find('.ioc-comment-body');



            $commentBody.on('click', function (e) {
                $node.find('textarea.reply').focus();

                e.preventDefault();
            });


        },

        parse: function() {

            var $nodes = jQuery(this.editor.iframe).contents().find('.ioc-comment-block');
            var context = this;

            $nodes.each(function() {
                $nodes.find('.viewComment').css('display', 'inherit');
                $nodes.find('.editComment').css('display', 'none');
                context._addHandlers(jQuery(this), context);
            });

            // if (this.firstRun) {
            //     this.firstRun  =false;
            // }

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


            // Comprovem si es pot insertar en aquest punt
            iframe= document.getElementById('my');



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
            var $textarea = $node.find('textarea.reply');
            var reply = $textarea.val();
            var $replyList = $node.find('.ioc-reply-list');

            if (reply.length == 0) {
                return;
            }

            reply = reply.replace(/(?:\r\n|\r|\n)/g, '<br />')

            var args = {
                reply: reply,
                signature: SIG
                // TODO[Xavi] Afegir els noms dels botons esborrar i editar localitzats
            };

            var $replyCode = jQuery(string.substitute(this.replyTemplate, args));


            var user = this.editor.dispatcher.getGlobalState().userId;
            $replyCode.attr('data-user', user);
            $replyList.append($replyCode);
            $textarea.val('');
            $textarea.focus();


            var $removeButton = $replyCode.find('[data-button="remove"]');
            $removeButton.on('click', this.addRemoveCommentHandler($replyCode));

            var $editButton = $replyCode.find('[data-button="edit"]');

            $editButton.on('click', this.addEditCommentHandler($replyCode));

            //TODO[Xavi] Al parse afegir la comprovació d'usuari per mostrar o no els botons (i afegir o no els listeners).


            this.editor.endEditing();
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

        },





        addEditCommentHandler: function($commentNode) {
            var context = this;
            var $editNode = $commentNode.find('.editComment');
            var $viewNode = $commentNode.find('.viewComment');
            var $textarea = $commentNode.find('textarea');
            var $content = $commentNode.find('.replyContent');
            var $signature = $commentNode.find('.ioc-signature');


            var $saveButton = $commentNode.find('button[data-action-reply="save"]');
            var $cancelButton = $commentNode.find('button[data-action-reply="cancel"]');


            $textarea.on('keypress keydown keyup', function (e) {
                $textarea.focus();

                if (e.keyCode == 13 || e.charCode == 13) {
                    e.stopPropagation();
                }

            });

            $textarea.on('focus', function() {
                context.editor.beginEditing();
            });

            $textarea.on('blur', function() {
                context.editor.endEditing();
            });


            $textarea.on('click', function(e) {
                // context.editor.beginEditing();
                // context.$forcedTextArea = $textarea;
                // context.$forcedTextArea.focus();
                e.stopPropagation();
                // context.editor.endEditing();
            });

            $saveButton.on('click', function() {

                context.editor.beginEditing();
                $editNode.css('display', 'none');
                $viewNode.css('display', 'inherit');




                $content.html($textarea.val().replace(new RegExp('\n', 'g'), '<br>'));

                $commentNode.find('.ioc-comment-main textarea.reply').focus();

                $signature.html('<span>(editat)</span>' + SIG); // TODO[Xavi] Localitzar el "editat"


                context.editor.endEditing();

            });

            $cancelButton.on('click', function() {

                $editNode.css('display', 'none');
                $viewNode.css('display', 'inherit');

                $commentNode.find('.ioc-comment-main textarea.reply').focus();
                // context.editor.endEditing();
                // alert("TODO: Cancel·lar els canvis");


                //
                context.editor.endEditing();
            });



            // Amaga el text
            // Mostra un textarea amb 2 botons.
            // Establir el valor del text area com el contingut del node
            // Mostrar els botons desar i cancel·lar
            //  - Desar: amaga el textarea i els botons i estableix el valor del textarea com a text, mostra el text.
            //  - Cancel·lar: amaga el textarea i mostra el text.


            return  function() {
                context.editor.beginEditing();

                $editNode.css('display', 'inherit');
                $viewNode.css('display', 'none');
                // context.$forcedTextArea = $textarea;

                // TODO[Xavi] Convertir els <BR> en salts de línia

                $textarea.val($content.html().replace(new RegExp('<br>', 'g'), '\n'));


                $textarea.focus();

                // $commentNode.remove();
                // context.editor.beginEditing();
            };
        },



        addRemoveCommentHandler: function ($commentNode) {
            var context = this;

            return  function() {
                context.editor.beginEditing();
                $commentNode.remove();
                context.endEditing();
            };
        }
    });


    // Register this plugin.
    _Plugin.registry["commentsdialog"] = function () {
        return new CommentsDialog({command: "commentsdialog"});
    };


    return CommentsDialog;
});