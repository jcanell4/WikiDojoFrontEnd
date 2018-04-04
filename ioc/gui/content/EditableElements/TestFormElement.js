define([
    'dojo/_base/declare',
    'ioc/gui/content/EditableElements/AbstractEditableElement',
    'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
], function (declare, AbstractEditableElement, AceFacade, toolbarManager) {

    return declare([AbstractEditableElement],
        {

            createWidget: function() {
                    // TODO[Xavi]: exposar com id de l'element directament
                    // TODO[Xavi]: generar un element ocult amb aquesta informació
                    this.args.id = ('' + Date.now() + Math.random()).replace('.', '-'); // id única

                    var args = this.args;
                    var editorWidget = this.context.contentToolFactory.generate(this.context.contentToolFactory.generation.BASE, args);
                    var toolbarId = 'FormToolbar_' + (args.id);


                    var $container = jQuery('<div id="container_' +args.id+'">');
                    // var $editor = jQuery('<div id="editor_' +args.id+'">');
                    var $toolbar = jQuery('<div id="toolbar_' + args.id + '"></div>');
                    var $textarea = jQuery('<textarea id="textarea_' + args.id + '" style="width:100%;height:200px" name="foobar"></textarea>');

                    console.log("Afegit textarea?", $textarea);

                    $textarea.css('display', 'none');
                    $container.append($toolbar);
                    $container.append($textarea);
                    // $container.append($editor);
                    $container.append(editorWidget);



                    this.$editableNode.append($container);

                console.log("Afegit textarea?", jQuery('#textarea_' + args.id ));

                    var saveCallback = function (e) {
                        this.$node.text(editor.getValue());
                        //toolbarManager.delete(toolbarId);
                        // TODO: Com indicar que s'ha produit canvis al formulari?
                        // this.$node.trigger('input');
                        // dialog.onHide();
                        console.log(e);
                         this.hide();
                    }.bind(this);

                    var cancelCallback = function (e) {
                        //toolbarManager.delete(toolbarId);
                         this.hide();
                         console.log(e);
                    }.bind(this);



                    toolbarManager.createToolbar(toolbarId , 'simple');

                    var editor = new AceFacade({
                        id: args.id,
                        auxId: args.id,
                        containerId: 'editor_' + editorWidget.id,
                        textareaId: 'textarea_' + args.id,
                        theme: JSINFO.plugin_aceeditor.colortheme,
                        wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                        dispatcher: this.context.dispatcher,
                        content: this.$node.text(),
                        originalContent: this.$node.text(),
                        TOOLBAR_ID: toolbarId,
                        ignorePatching: true,
                        plugins: ['SaveDialogEditorButton', 'CancelDialogEditorButton', 'TestReadonlyPlugin'] // Plugins que ha de contenir la toolbar
                    });


                    editor.editor.on('CancelDialog', cancelCallback);
                    editor.editor.on('SaveDialog', saveCallback);

                this.widgetInitialized = true;
            },

            update: function() {
                console.log("Update: no fem res, això és un elemnt de prova");
            }


        });

});
