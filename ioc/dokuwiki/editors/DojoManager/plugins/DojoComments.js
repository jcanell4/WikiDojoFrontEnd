define([
    "dojo/_base/declare", // declare
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    // "dojo/i18n", // i18n.getLocalization
    "dojo/_base/lang", // lang.hitch
    "dojo/sniff", // has("chrome") has("opera")
    "dijit/focus", // focus.focus()
    "dijit/_editor/_Plugin",
    "dijit/form/Button",
    "dojo/string", // string.substitute
    'ioc/gui/DialogBuilder',
    "dojo/text!./templates/CommentFragment.html",
    "dojo/text!./templates/CommentFragmentReply.html",

], function (declare, AbstractParseableDojoPlugin,
             /*i18n,*/ lang, has, focus, _Plugin, Button, string, DialogBuilder, template, templateReply) {

    // var strings = i18n.getLocalization("ioc.dokuwiki.editors.DojoManager", "commands");

    var CommentsDialog = declare("ioc.dokuwiki.editors.DojoManager.plugins.commentsdialog", [AbstractParseableDojoPlugin], {

        htmlTemplate: template,
        replyTemplate: templateReply,

        init : function () {
            this.inherited(arguments);

            this.editor.customUndo = true;

            var args = {
                label: this.strings["commentplugin"],
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + "Comments",
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };


            // this.firstRun = true;

            this.addButton(args);

        },

        _addHandlers: function ($node/*, context*/) {
            // console.log("Adding handlers", $node, context);
            var $replyNode = $node.find('textarea.reply');
            var $buttons = $node.find('button[data-action]');
            var $removeButtons = $node.find('[data-button="remove"]');
            var $editButtons = $node.find('[data-button="edit"]');
            var context = this;

            $buttons.on('click', function (e) {
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
                context._addHandlers(jQuery(this)/*, context*/);
            });

        },

        process: function () {
            this.editor.beginEditing();
            var reference = this._getSelectionText();

            var time = Date.now();

            var ref = this._referenceFromDate(time);

            if (!reference) {
                reference = "*"
            }

            reference += " ("+ref+")";

            var args = {
                id: "ioc-comment-" + Date.now(),
                reference: reference,
                ref: ref,
                resolveBtnTitle: this.strings['resolveBtnTitle'],
                resolveBtn : this.strings['resolveBtn'],
                textareaPlaceholder : this.strings['textareaPlaceholder'],
                replyBtnTitle : this.strings['replyBtnTitle'],
                replyBtn : this.strings['replyBtn']
                // signature: SIG, // ALERTA[Xavi] aquesta és una variable global definida per DokuWiki
            };


            // Comprovem si es pot insertar en aquest punt
            // iframe= document.getElementById('my');

            var htmlCode = string.substitute(this.htmlTemplate, args);
            this.editor.execCommand('inserthtml', htmlCode); //ALERTA[Xavi] S'afegeix la referència per evitar esborrar el text ressaltat

            var $node = jQuery(this.editor.iframe).contents().find('#' + args.id);
            $node.find('textarea').focus();

            this._addHandlers($node/*, this*/);

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
                context.editor.endEditing();
            });


            return  function() {
                context.editor.beginEditing();

                $editNode.css('display', 'inherit');
                $viewNode.css('display', 'none');

                $textarea.val($content.html().replace(new RegExp('<br>', 'g'), '\n'));
                $textarea.focus();
            };
        },

        addRemoveCommentHandler: function ($commentNode) {
            var context = this;

            return  function() {
                context.editor.beginEditing();
                $commentNode.remove();
                context.editor.endEditing();
            };
        }
    });

    // Register this plugin.
    _Plugin.registry["commentsdialog"] = function () {
        return new CommentsDialog({command: "commentsdialog"});
    };


    return CommentsDialog;
});