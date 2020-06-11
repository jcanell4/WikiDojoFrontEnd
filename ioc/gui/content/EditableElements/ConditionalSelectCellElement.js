define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
    'ioc/gui/content/EditableElements/ZoomableFormElement',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',

    // 'ioc/wiki30/dispatcherSingleton',

], function (declare, AceFacade, ZoomableFormElement, toolbarManager/*, contentToolFactory*//*, getDispatcher*/) {


    var lastFocusedElement;

    var DIALOG_DEFAULT_HEIGHT = 600;
    var DIALOG_DEFAULT_WIDTH = 800;


    return declare([ZoomableFormElement],
        {

            _zoom: function (event) {
                event.preventDefault();
                this.setEditionState(true);
                var fieldId = this.$field.attr('data-form-editor-button') || Date.now();




                var dialogManager = this.context.dispatcher.getDialogManager();

                var args = {
                    id: "auxWidget" + fieldId,
                    title: this.context.title,
                    dispatcher: this.context.dispatcher,
                };

                var editorWidget = this.context.contentToolFactory.generate(this.context.contentToolFactory.generation.BASE, args);
                var toolbarId = 'DialogToolbar' + (Date.now() + Math.random()); // id única


                var $container = jQuery('<div>');
                var $toolbar = jQuery('<div id="toolbar_' + args.id + '"></div>');
                var $textarea = jQuery('<textarea id="textarea_' + args.id + '" style="width:100%;height:200px" name="wikitext"></textarea>');

                $textarea.css('display', 'none');
                $container.append($toolbar);
                $container.append($textarea);


                var saveCallback = function () {
                    var value =editor.getValue();


                    if (this.args.saveCallback) {
                        this.args.saveCallback(value);

                    } else {
                        // Aquest es el comportament per defecte, vàlid quan es treballa amb elements HTML
                        this.$field.val(value);
                        this.$field.trigger('input');
                    }

                    this.setEditionState(false);
                    toolbarManager.delete(toolbarId);

                    //this.clearExternalContent(); // Esborrant

                    dialog.onHide();
                    // console.log("Desant al node el nou contingut", editor.getValue(), this.$field, this.$field.val());

                }.bind(this);

                var cancelCallback = function () {
                    this.setEditionState(false);
                    toolbarManager.delete(toolbarId);


                    // això només es crida si es passa un cancelCallback com argument al constructor.
                    if (this.args.cancelCallback) {
                        this.args.cancelCallback();
                    }

                    this.clearExternalContent(); // Esborrant

                    dialog.onHide();
                }.bind(this);

                var changeCallback = function(e) {

                    if (editor.isChanged()) {
                        // console.log("changeCallback:", e);
                        this.setExternalContent(e.newContent);
                    } else {
                        this.clearExternalContent();
                    }

                }.bind(this);

                var dialogParams = {
                    title: "Editar cel·la", //TODO[Xavi] Localitzar
                    message: '',
                    single: true,
                    sections: [
                        $container,
                        {widget: editorWidget}
                    ],
                    buttons: [
                        {
                            id: 'accept',
                            description: 'Desar', // TODO[Xavi] Localitzar
                            buttonType: 'default',
                            callback: saveCallback
                        },
                        {
                            id: 'cancel',
                            description: 'Cancel·lar', // TODO[Xavi] Localitzar
                            buttonType: 'default',
                            callback: cancelCallback
                        }
                    ],
                    height: DIALOG_DEFAULT_HEIGHT,
                    width: DIALOG_DEFAULT_WIDTH
                };

                var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, this.context.ns, dialogParams);

                dialog.show();
                dialog.resize();

                toolbarManager.createToolbar(toolbarId , 'simple');

                var editor = new AceFacade({
                    id: args.id,
                    auxId: args.id,
                    containerId: 'editor_widget_container_' + args.id, // editorWidget.id
                    textareaId: 'textarea_' + args.id,
                    theme: JSINFO.plugin_aceeditor.colortheme,
                    wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                    wrapMode: true,
                    dispatcher: this.context.dispatcher,
                    content: this.$field.val(),
                    originalContent: this.$field.val(),
                    TOOLBAR_ID: toolbarId ,
                    plugins: ['SaveDialogEditorButton', 'CancelDialogEditorButton'] // Plugins que ha de contenir la toolbar
                });

                editor.setHeight(DIALOG_DEFAULT_HEIGHT - 137); //137 es la diferencia entre l'alçada de l'editor i el contenidor tenint en compte la toolbar i la barra inferior de botons

                editor.editor.on('CancelDialog', cancelCallback);
                editor.editor.on('SaveDialog', saveCallback);
                editor.on('change', changeCallback);

                this.originalContent = this.$field.val();

                //this.context.setFireEventHandler('post_cancel_project', cancelCallback);


            },

            init: function (args) {


                // Això hauria de ser un contenttool, però no es aplicable en el cas de les cel·les perquè les crea el DataGrid
                var context = {
                    title: "Edició de cel·la", // TODO: Localitzar
                    ns: "zoomable-cell-element", // No el fem servir
                    //setFireEventHandler: function() {/* no fem res*/}
                };


                this.context = context;

                // ALERTA[Xavi] Important, el require es syncron, fins que no s'executa no continua la execució!
                require(["ioc/wiki30/dispatcherSingleton", "ioc/gui/content/contentToolFactory"], function(getDispatcher, contentToolFactory) {
                    context.dispatcher = getDispatcher();
                    context.contentToolFactory = contentToolFactory;
                });


                this.$field = jQuery(args.node);
                this.args = args;


                this._createIcon();


                this.$field.on('focus', function () {

                    this.$field.parent().css('position', 'relative');
                    this.$field.before(this.$icon);

                    if (lastFocusedElement) {
                        lastFocusedElement.show(false);
                    }

                    lastFocusedElement = this;


                    this.show(true);
                }.bind(this));



            },

            setExternalContent: function (content) {
                this.$field.val(content);
            },

            clearExternalContent: function() {
                this.$field.val(this.originalContent);
            }

        });

});
