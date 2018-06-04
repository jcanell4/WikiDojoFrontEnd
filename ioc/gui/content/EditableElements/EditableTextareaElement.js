define([
    'dojo/_base/declare',
    'ioc/gui/content/EditableElements/AbstractEditableElement',
    'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
    'ioc/gui/content/EditableElements/ZoomableFormElement'
], function (declare, AbstractEditableElement, AceFacade, toolbarManager, ZoomableFormElement) {

    return declare([AbstractEditableElement],
        {

            createWidget: function () {
                // TODO[Xavi]: exposar com id de l'element directament
                // TODO[Xavi]: generar un element ocult amb aquesta informació
                this.args.id = ('' + Date.now() + Math.random()).replace('.', '-'); // id única

                var args = this.args;
                var editorWidget = this.context.contentToolFactory.generate(this.context.contentToolFactory.generation.BASE, args);
                var toolbarId = 'FormToolbar_' + (args.id);

                var $container = jQuery('<div id="container_' + args.id + '">');
                // this.$node.before($container);





                var $toolbar = jQuery('<div id="toolbar_' + args.id + '"></div>');
                //var $textarea = jQuery('<textarea id="textarea_' + args.id + '" style="width:100%;height:200px"></textarea>');
                // this.$textarea = this.$node;


                // ALERTA[Xavi] Es crea un nou node arrel on s'afegeix el node de lectura
                // var $root = jQuery('<div></div>');
                // this.$node.before($root);
                // this.$node = $root; // ALERTA! falta afegir el on dbl click! mirar si es poden moure els triggers
                //
                // $root.append(this.$viewer);


                this.$textarea.css('height', '200px');

                this.$textarea.attr('id', 'textarea_' + args.id);


                this.$node.text(this.$textarea.val());

                // this.$textarea.css('display', 'none'); // No cal, ho fa automàticament l'ACE


                $container.append($toolbar);
                $container.append(this.$textarea);
                $container.append(editorWidget);

                this.$editableNode.append($container);

                // var saveCallback = function (e) {
                //     this.originalContent = editor.getValue();
                //
                //
                //
                //     this.$node.text(this.originalContent);
                //     this.hide();
                //     // console.log(e);
                //     // this.$container.hide();
                //
                // }.bind(this);
                //
                // var cancelCallback = function (e) {
                //     //toolbarManager.delete(toolbarId);
                //
                //     this.$textarea.val(this.originalContent);
                //     editor.setValue(this.originalContent);
                //
                //     this.hide();
                //
                // }.bind(this);

                toolbarManager.createToolbar(toolbarId, 'simple');


                this.originalContent = this.args.data.value;

                var editor = new AceFacade({
                    id: args.id,
                    auxId: args.id,
                    containerId: 'editor_' + editorWidget.id,
                    textareaId: 'textarea_' + args.id,
                    theme: JSINFO.plugin_aceeditor.colortheme,
                    wraplimit: JSINFO.plugin_aceeditor.wraplimit, // TODO: determinar el lmit correcte
                    wrapMode: true,
                    dispatcher: this.context.dispatcher,
                    content: this.$textarea.val(),
                    originalContent: this.originalContent,
                    TOOLBAR_ID: toolbarId,
                    ignorePatching: true,
                    plugins: [],
                    // plugins: ['SaveDialogEditorButton', 'CancelDialogEditorButton', 'TestReadonlyPlugin'] // Plugins que ha de contenir la toolbar
                });

                this.editor = editor;

                var context = this;

                this.editor.on('change', function(e) {
                    context.originalContent = e.newContent;
                });

                // this.editor.editor.on('CancelDialog', cancelCallback);
                // this.editor.editor.on('SaveDialog', saveCallback);

                this.widgetInitialized = true;

                var saveCallback = function(value) {
                    context.editor.setValue(value);
                };

                new ZoomableFormElement({
                    context: this.context,
                    node: this.$textarea.get(0),
                    alwaysDisplayIcon: true,
                    saveCallback: saveCallback
                });
            },

            _replaceNodeContent: function (args) {
                this.$container = jQuery('<div>');


                // Afegim un nou node que servirà d'arrel
                var $newViewNode = jQuery('<div>');
                $newViewNode.addClass('view-textarea');
                this.$node.before($newViewNode);

                // Assignem el textarea
                this.$textarea = this.$node;

                // Reemplacem el valor del $node pel del nou node (l'anterior corresponia al $textarea, i no es correcte en aquest cas)
                this.$node = $newViewNode;


                this.$node.before(this.$container);
                this.$container.append(this.$node);
                // Alerta[Xavi] Aquesta es l'ancla on s'ha de ficar el widget que correspongui

                this.$editableNode = jQuery('<div></div>');
                this.$container.append(this.$editableNode);


                this.hide();

                this.$node.on('dblclick', this.show.bind(this));

                if (args.editable) {
                    jQuery(args.context.domNode).on('postrender',this.show.bind(this));
                }

            },



            updateField: function () {
                // No fem res, la sincronització es automàtica

            },

            saveToField: function () {
                // No fem res, la sincronització es automàtica
            },

            show: function() {
                if (this.editor) {
                    this.editor.enable();
                }
                // TODO: S'ha de fer click a l'editor per que s'actualitzi el contingut!

                this.inherited(arguments);
            },

            hide: function() {
                if (this.editor) {
                    this.editor.disable();
                }

                this.inherited(arguments);
            }

        });

});