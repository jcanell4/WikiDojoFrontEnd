define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
    'ioc/gui/content/EditableElements/AbstractEditableElement',
    'ioc/dokuwiki/editors/AceManager/toolbarManager'
], function (declare, AceFacade, AbstractEditableElement, toolbarManager) {


    var lastFocusedElement;

    var DIALOG_DEFAULT_HEIGHT = 600;
    var DIALOG_DEFAULT_WIDTH = 800;


    return declare([AbstractEditableElement],
        {

            show: function (shouldDisplay) {
                var visibility = '';


                if (this.$field.prop('readonly') || this.$field.prop('disabled')) {
                    visibility = 'none';
                } else {
                    visibility = shouldDisplay ? 'block' : 'none';
                }


                if (this.$icon) {

                    this.$icon.css('display', visibility);
                }

            },

            _createIcon: function () {

                // Afegim un contenidor per l'icona i l'input
                this.$container = jQuery('<div>');
                this.$container.css('position', 'relative');

                this.$field.before(this.$container);
                this.$container.append(this.$field);

                this.$icon = jQuery('<img src="/iocjslib/ioc/gui/img/zoom.png" alt="" height="16" width="16">');
                this.$icon.css('position', 'absolute');
                this.$icon.css('top', '2px');
                this.$icon.css('right', '2px');

                //console.log("this.args??", this.args);

                if (!this.args.alwaysDisplayIcon) {
                    this.$icon.css('display', 'none');
                }


                this.$icon.css('z-index', '1000');
                this.$field.before(this.$icon);

                this.$icon.on('mouseover', function () {
                    this.hover = true;
                }.bind(this));

                this.$icon.on('mouseout', function () {
                    this.hover = false;
                }.bind(this));

                this.$icon.on('click', this._zoom.bind(this));

                // console.log("Afegida icona de zoom pel node:", this.$field);

            },

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

                    // this.$field.val(editor.getValue());
                    // this.setEditionState(false);
                    // toolbarManager.delete(toolbarId);
                    // this.$field.trigger('input');

                    this.clearExternalContent(); // Esborrant

                    dialog.onHide();
                    //console.log("Desant al node el nou contingut", editor.getValue(), this.$field, this.$field.val());

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
                        this.setExternalContent(e.newContent);
                    } else {
                        this.clearExternalContent();
                    }

                }.bind(this);

                var dialogParams = {
                    title: "Editar camp: " + fieldId, //TODO[Xavi] Localitzar
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

                //console.log("Quina informació tenim?", this);
                editor.setHeight(DIALOG_DEFAULT_HEIGHT - 137); //137 es la diferencia entre l'alçada de l'editor i el contenidor tenint en compte la toolbar i la barra inferior de botons

                editor.editor.on('CancelDialog', cancelCallback);
                editor.editor.on('SaveDialog', saveCallback);
                editor.on('change', changeCallback);

                this.context.setFireEventHandler('post_cancel_project', cancelCallback);
            },

            init: function (args) {
                this.context = args.context;
                this.$field = jQuery(args.node);
                this.args = args;


                this._createIcon();


                this.$field.on('focus', function () {
                    //console.log("Focused!");

                    if (lastFocusedElement) {
                        lastFocusedElement.show(false);
                    }

                    lastFocusedElement = this;


                    this.show(true);
                }.bind(this));

                this.$field.on('blur', function () {
                    if (!this.hover) {
                        this.show(false);
                    }

                }.bind(this));



            },

            setExternalContent: function (content) {
                //console.log("!!!!  set external content  !!!", content);

                this.context.setExternalContent(this.$field.attr('name'), content);
            },

            clearExternalContent: function() {
                //console.log("!!!!  clear external content  !!!");
                this.context.setExternalContent(this.$field.attr('name'));
            }

        });

});
