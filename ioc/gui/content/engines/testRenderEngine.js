/**
 * @module TestRenderEngine
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define(['ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade'], function (AceFacade) {

    return function (data, context, $content) {
        //console.log($content);

        // ALERTA[Xavi] si no arriba un objecte jquery suposem que es tracta d'objectes DOM o HTML i fem la conversió.
        if (!$content instanceof jQuery) {
            $content = jQuery($content);
        }

        var $editorButtons = $content.find('[data-form-editor-button]');


        $editorButtons.on('click', function (e) {
            e.preventDefault();
            var $button = jQuery(this);
            var fieldId = $button.attr('data-form-editor-button');
            var $field = jQuery('#' + fieldId);
            var dialogManager = context.dispatcher.getDialogManager();


            var args = {
                id: "auxWidget" + fieldId,
                title: content.title,
                dispatcher: this.dispatcher
            };

            var editorWidget = context.contentToolFactory.generate(context.contentToolFactory.generation.BASE, args);

            var $container = jQuery('<div>');
            var $toolbar = jQuery('<div id="toolbar_' + args.id + '"></div>');
            var $textarea = jQuery('<textarea id="textarea_' + args.id + '" style="width:100%;height:200px" name="wikitext"></textarea>');

            $textarea.css('display', 'none');
            $container.append($toolbar);
            $container.append($textarea);


            var dialogParams = {
                title: "Editar camp: " + fieldId, //TODO[Xavi] Localitzar
                message: '',
                sections: [
                    // Secció 1: widget de cerca que inclou la taula pel resultat.
                    // searchUserWidget.domNode
                    $container,
                    {widget: editorWidget}


                ],
                buttons: [
                    {
                        id: 'accept',
                        description: 'Desar', // TODO[Xavi] Localitzar
                        buttonType: 'default',
                        callback: function () {
                            console.log("TODO: Desar els canvis al camp: ", $field);
                            //$field.val("TODO: Contingut de l'editor");
                            $field.val(editor.getValue());
                            // var items = searchUserWidget.getSelected();
                            // for (var item in items) {
                            //     this._itemSelected(items[item]);
                            // }

                        }.bind(this)
                    },
                    {
                        id: 'cancel',
                        description: 'Cancel·lar', // TODO[Xavi] Localitzar
                        buttonType: 'default',
                        callback: function () {
                            // No cal fer res, el comportament per defecte de tots els botons es tancar-lo


                        }.bind(this)
                    }
                ]
            };

            var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, context.ns, dialogParams);

            dialog.show();

            var editor = new AceFacade({
                id: args.id,
                auxId: args.id,
                // xmltags: JSINFO.plugin_aceeditor.xmltags,
                containerId: 'editor_widget_container_' + args.id, // editorWidget.id
                textareaId: 'textarea_' + args.id,
                theme: JSINFO.plugin_aceeditor.colortheme,
                // readOnly: $textarea.attr('readonly'),// TODO[Xavi] cercar altre manera més adient <-- només canvia això respecte al BasicEditorSubclass#createAceEditor
                wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                // wrapMode: $textarea.attr('wrap') !== 'off',
                // mdpage: JSINFO.plugin_aceeditor.mdpage,
                dispatcher: context.dispatcher,
                content: $field.val(),
                originalContent: $field.val(),
            });

        });

        return $content;
    }
});
