define([
    'dojo/_base/declare',
    'ioc/gui/content/plugins/AbstractContentToolPlugin',
    'ioc/dokuwiki/editors/Components/AjaxComponent',
    'ioc/wiki30/manager/StorageManager',
    "dojo/string", // string.substitute
], function (declare, AbstractContentToolPlugin, AjaxComponent, storageManager, string) {

    return declare([AbstractContentToolPlugin],

        {

            init: function (contentTool) {

                this.inherited(arguments);

                // TODO: Extreure això a una clase i generalitzar-la, el templat es copiat de plugins/templates/CommentFragmentReply.html

                var htmlTemplate = '<div class="ioc-comment-reply" data-ioc-reply>'
                    +'<div class="viewComment">'
                    +'<span class="ioc-comment-toolbar">'
                    +'<span class="ioc-comment-toolbar-button" title="" data-button="edit">Editar</span>'
                    +'|'
                    +'<span class="ioc-comment-toolbar-button" title="" data-button="remove">Esborrar</span>'
                    +'</span>'
                    +'<span class="replyContent">${reply}</span>'
                    +'<span class="ioc-signature">${signature}</span>'
                    +'</div>'
                    +'<div class="editComment">'
                    +'<textarea rows="2"></textarea>'
                    +'<button data-action-reply="save">${btnSave}</button>'
                    +'<button data-action-reply="cancel">${btnCancel}</button>'
                    +'</div>'
                    +'</div>';


                var ajax = new AjaxComponent(); //ajax.send(urlBase, dataToSend, type)

                // TODO: Obtenir la urlbase del servidor, d'on/com?
                var urlBase =  '/dokuwiki_30/lib/exe/ioc_ajax.php?call=comment';


                var context = this.contentTool;

                // alert("Afegint extra listeners");
                var $comments = jQuery(context.domNode).find('[data-ioc-comment]');

                // Alerta! de vegades el userid no es troba definit (en recarregar per exemple) (veure el relogin al post-init.js)
                var currentUser = context.dispatcher.getGlobalState().userId;

                // Si no s'ha trobat comprovem el login info del storage
                if (!currentUser) {
                    var loginInfo = storageManager.findObject('login');
                    if (loginInfo.login) {
                        currentUser = loginInfo.userId;
                    }
                }



                $comments.each(function () {
                    // console.log("Processant comentari");
                    var $comment = jQuery(this);

                    // Botons del comentari:
                    //      - Resol
                    //      - Respon
                    var $resolveButton = $comment.find('button[data-action="resolve"]');
                    var $replyButton = $comment.find('button[data-action="reply"]');
                    var $replyTextarea = $comment.find('textarea.reply');


                    $resolveButton.on('click', function () {

                        var $reference = $comment.find('.ioc-comment-reference');
                        var refId = $reference.attr('data-reference');

                        var text = $reference.html().replace(' (' + refId + ')', '');
                        var $text = jQuery('<div>' + text + '</div>');

                        $comment.after($text);
                        $comment.remove();

                        var dataToSend = {
                            ns :context.ns,
                            commentId: $comment.find('[data-reference]').attr('data-reference'),
                            action: 'resolve'
                        };

                        // TODO: fer alguna cosa amb la resposta, es pot lligar amb .then perque retorna una promesa
                        ajax.send(urlBase, dataToSend, 'POST');
                    });

                    var addListenersToReply = function($reply) {
                        // TODO: Afegir els listeners pels botons
                        var $editButton = $reply.find('[data-button="edit"]');
                        var $deleteButton = $reply.find('[data-button="remove"]');

                        $editButton.on('click', function() {

                            var oldContent = $reply.find('.replyContent').text();

                            // Temporal: fem servir un prompt
                            var newContent = prompt("Edita el comentari:", oldContent);

                            if (newContent !== oldContent) {
                                $reply.find('.replyContent').html(newContent)

                                var dataToSend = {
                                    ns :context.ns,
                                    commentId: $comment.find('[data-reference]').attr('data-reference'),
                                    oldContent: oldContent,
                                    newContent: newContent,
                                    action: 'edit',
                                    signature: SIG
                                };

                                // TODO: fer alguna cosa amb la resposta, es pot lligar amb .then perque retorna una promesa
                                ajax.send(urlBase, dataToSend, 'POST');
                            }

                            // TODO: millora de presentació: mostrar el div.editComment i lligar el contingut del textarea i els dos botons per actualitzar el comentari i enviar la petició via AJAX amb la actualització.

                        });

                        $deleteButton.on('click', function() {
                            $reply.remove();
                            // TODO: Enviar petició per esborrar el comentari

                            var oldContent = $reply.find('.replyContent').text();

                            var dataToSend = {
                                ns :context.ns,
                                commentId: $comment.find('[data-reference]').attr('data-reference'),
                                oldContent: oldContent,
                                action: 'delete'
                            };

                            // TODO: fer alguna cosa amb la resposta, es pot lligar amb .then perque retorna una promesa
                            ajax.send(urlBase, dataToSend, 'POST');
                        });
                    };

                    $replyButton.on('click', function () {
                        // ALERTA: això requereix importar el template dels comments, ho deixem de banda fins que ho extraiem a un a altre classe


                        var data = {};
                        data.reply = $replyTextarea.val();
                        data.signature = SIG;
                        data.btnSave = 'desar';
                        data.btnCancel = 'cancel·lar';

                        $replyTextarea.val('');


                        var $newReply= jQuery(string.substitute(htmlTemplate, data));

                        $comment.find('.ioc-reply-list').append($newReply);

                        addListenersToReply($newReply);

                        // TODO: Afegir els listeners als botons (com que fem servir el prompt per editar per ara no cal)


                        var dataToSend = {
                            ns :context.ns,
                            commentId: $comment.find('[data-reference]').attr('data-reference'),
                            newContent: data.reply,
                            action: 'add',
                            signature: SIG
                        };

                        // TODO: fer alguna cosa amb la resposta, es pot lligar amb .then perque retorna una promesa
                        ajax.send(urlBase, dataToSend, 'POST');
                    });



                    var $replies = $comment.find('[data-ioc-reply]');

                    // Blocs de comentaris, per cada comentari:
                    // si el autor es el propi usuari:
                    //  - editar: mostra un textarea per editar el comentari
                    //  - esborrar

                    $replies.each(function () {
                        var $reply = jQuery(this);
                        // console.log("Processant reply");
                        var signature = jQuery(this).find('span.ioc-signature').text();
                        var match = signature.match(/\[\[(.*?)@/i);

                        if (match.length > 0) {
                            var author = match[1];
                        } else {
                            var author = '';
                            console.warn("Error, user signature not found");
                        }

                        if (author === currentUser) {
                            addListenersToReply($reply);

                        } else {
                            $reply.find('.ioc-comment-toolbar').css('display', 'none');

                        }

                    })


                });

            },


        });
});
