define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
], function (declare, AceFacade) {


    // TODO[Xavi]: Afegir classe abstracta de la que hereti

    return declare(null,
        {
            editionState : false,

            constructor: function (args) {
                var context = args.context;

                // TODO: Afegir una icona dins del node i sigui aquesta a la que es fa click
                var that = this;

                jQuery(args.node).on('click', function (e) {
                    e.preventDefault();
                    that.setEditionState(true);
                    var $button = jQuery(this);
                    var fieldId = $button.attr('data-form-editor-button');
                    var $field = jQuery('#' + fieldId);
                    var dialogManager = context.dispatcher.getDialogManager();


                    var args = {
                        id: "auxWidget" + fieldId,
                        title: context.title,
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
                                    $field.val(editor.getValue());
                                    that.setEditionState(false);
                                }.bind(this)
                            },
                            {
                                id: 'cancel',
                                description: 'Cancel·lar', // TODO[Xavi] Localitzar
                                buttonType: 'default',
                                callback: function () {
                                    // No cal fer res, el comportament per defecte de tots els botons es tancar-lo
                                    that.setEditionState(false);

                                }.bind(this)
                            }
                        ]
                    };

                    var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, context.ns, dialogParams);

                    dialog.show();

                    var editor = new AceFacade({
                        id: args.id,
                        auxId: args.id,
                        containerId: 'editor_widget_container_' + args.id, // editorWidget.id
                        textareaId: 'textarea_' + args.id,
                        theme: JSINFO.plugin_aceeditor.colortheme,
                        wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                        dispatcher: context.dispatcher,
                        content: $field.val(),
                        originalContent: $field.val()
                    });

                });

            },

            getHtmlRender: function() {
                // No es necessari
            },

            setEditionState: function (state) { // Alerta[Xavi] es un booleà o un enum?
                this.editionState = state;
            }
        });

});
