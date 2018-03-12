define([
    'dojo/_base/declare',
    'ioc/gui/content/EditableElements/AbstractEditableElement',
    'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
], function (declare, AbstractEditableElement, AceFacade, toolbarManager) {

    var lastFocusedElement;

    return declare([AbstractEditableElement],
        {

            constructor: function(args) {

                this.init(args);


            },

            // show: function (shouldDisplay) {
            //     var visibility = '';
            //
            //
            //     if (this.$node.prop('readonly') || this.$node.prop('disabled')) {
            //         visibility = 'none';
            //     } else {
            //         visibility = shouldDisplay ? 'block' : 'none';
            //     }
            //
            //
            //     if (this.$icon) {
            //
            //         console.log("Visibility?", visibility);
            //         this.$icon.css('display', visibility);
            //     }
            //
            // },
            //
            // _createIcon: function () {
            //
            //     // Afegim un contenidor per l'icona i l'input
            //     this.$container = jQuery('<div>');
            //     this.$container.css('position', 'relative');
            //
            //     this.$node.before(this.$container);
            //     this.$container.append(this.$node);
            //
            //     this.$icon = jQuery('<img src="/iocjslib/ioc/gui/img/zoom.png" alt="" height="16" width="16">');
            //     this.$icon.css('position', 'absolute');
            //     this.$icon.css('top', '2px');
            //     this.$icon.css('left', '2px');
            //     this.$icon.css('display', 'none');
            //     this.$node.before(this.$icon);
            //
            //     this.$icon.on('mouseover', function () {
            //         this.hover = true;
            //     }.bind(this));
            //
            //     this.$icon.on('mouseout', function () {
            //         this.hover = false;
            //     }.bind(this));
            //
            //     this.$icon.on('click', this._zoom.bind(this));
            // },
            //
            // _zoom: function (event) {
            //     event.preventDefault();
            //     var fieldId = this.$node.attr('data-form-editor-button');
            //
            //
            //     var dialogManager = this.context.dispatcher.getDialogManager();
            //
            //     var args = {
            //         id: "auxWidget" + fieldId,
            //         title: this.context.title,
            //         dispatcher: this.context.dispatcher,
            //     };
            //
            //     var editorWidget = this.context.contentToolFactory.generate(this.context.contentToolFactory.generation.BASE, args);
            //     var toolbarId = 'DialogToolbar' + (Date.now() + Math.random()); // id única
            //
            //
            //     var $container = jQuery('<div>');
            //     var $toolbar = jQuery('<div id="toolbar_' + args.id + '"></div>');
            //     var $textarea = jQuery('<textarea id="textarea_' + args.id + '" style="width:100%;height:200px" name="wikitext"></textarea>');
            //
            //     $textarea.css('display', 'none');
            //     $container.append($toolbar);
            //     $container.append($textarea);
            //
            //
            //     var saveCallback = function () {
            //         this.$node.val(editor.getValue());
            //         toolbarManager.delete(toolbarId);
            //         this.$node.trigger('input');
            //         dialog.onHide();
            //
            //     }.bind(this);
            //
            //     var cancelCallback = function () {
            //         toolbarManager.delete(toolbarId);
            //         dialog.onHide();
            //     }.bind(this);
            //
            //
            //     var dialogParams = {
            //         title: "Editar camp: " + fieldId, //TODO[Xavi] Localitzar
            //         message: '',
            //         sections: [
            //             $container,
            //             {widget: editorWidget}
            //
            //
            //         ],
            //         buttons: [
            //             {
            //                 id: 'accept',
            //                 description: 'Desar', // TODO[Xavi] Localitzar
            //                 buttonType: 'default',
            //                 callback: saveCallback
            //             },
            //             {
            //                 id: 'cancel',
            //                 description: 'Cancel·lar', // TODO[Xavi] Localitzar
            //                 buttonType: 'default',
            //                 callback: cancelCallback
            //             }
            //         ]
            //     };
            //
            //     var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, this.context.ns, dialogParams);
            //
            //     dialog.show();
            //
            //     toolbarManager.createToolbar(toolbarId , 'simple');
            //
            //     var editor = new AceFacade({
            //         id: args.id,
            //         auxId: args.id,
            //         containerId: 'editor_widget_container_' + args.id, // editorWidget.id
            //         textareaId: 'textarea_' + args.id,
            //         theme: JSINFO.plugin_aceeditor.colortheme,
            //         wraplimit: JSINFO.plugin_aceeditor.wraplimit,
            //         dispatcher: this.context.dispatcher,
            //         content: this.$node.val(),
            //         originalContent: this.$node.val(),
            //         TOOLBAR_ID: toolbarId ,
            //         plugins: ['SaveDialogEditorButton', 'CancelDialogEditorButton'] // Plugins que ha de contenir la toolbar
            //     });
            //
            //
            //     editor.editor.on('CancelDialog', cancelCallback);
            //     editor.editor.on('SaveDialog', saveCallback);
            // },



            init: function (args) {
                this.context = args.context;
                this.$node = jQuery(args.node);
                this.args = args;




                this._replaceNodeContent(args);
                //
                //
                // this.$node.on('focus', function () {
                //     console.log("Focused!");
                //
                //     if (lastFocusedElement) {
                //         lastFocusedElement.show(false);
                //     }
                //
                //     lastFocusedElement = this;
                //
                //
                //     this.show(true);
                // }.bind(this));
                //
                // this.$node.on('blur', function () {
                //     if (!this.hover) {
                //         this.show(false);
                //     }
                //
                // }.bind(this));

            },

            _replaceNodeContent: function(args) {
                // TODO:
                // 1 - Crear un node que embolcalli els continguts per l'estat de vista i el d'edició
                    // Afegim un contenidor per l'icona i l'input
                    this.$container = jQuery('<div>');

                    this.$node.before(this.$container);
                    this.$container.append(this.$node);


                    // Alerta[Xavi] Aquesta es l'ancla on s'ha de ficar el widget que correspongui

                    this.$editableNode = jQuery('<div></div>');
                    this.$container.append(this.$editableNode);
                    //this.createWidget(args, this.$editableNode.get(0));
                    this.hide();


                // this.$icon = jQuery('<img src="/iocjslib/ioc/gui/img/zoom.png" alt="" height="16" width="16">');
                    // this.$icon.css('position', 'absolute');
                    // this.$icon.css('top', '2px');
                    // this.$icon.css('left', '2px');
                    // this.$icon.css('display', 'none');
                    // this.$node.before(this.$icon);
                    //
                    // this.$icon.on('mouseover', function () {
                    //     this.hover = true;
                    // }.bind(this));
                    //
                    // this.$icon.on('mouseout', function () {
                    //     this.hover = false;
                    // }.bind(this));


                
                // 2 - Afegir el contingut original en un node pel mode HTML.
                // 3 - Afegir el widget d'edició en un node pel mode Edició.
                // 4 - Afegir un listener pel dobleclick a l'edició que activi el mode d'edició.

                this.$node.on('click', this.show.bind(this));


            },

            hide: function() {

                console.log("TestFormElement#hide");
                this.setEditionState(false);
                this.$node.css('display', 'block');
                this.$editableNode.css('display', 'none');
            },

            show: function() {
                if (!this.widgetInitialized) {
                    this.createWidget()
                }

                console.log("TestFormElement#show");
                this.setEditionState(true);
                this.$node.css('display', 'none');
                this.$editableNode.css('display', 'block');
            },

            createWidget: function() {
                    // TODO:Xavi, exposar com id de l'element directament
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
                        plugins: ['SaveDialogEditorButton', 'CancelDialogEditorButton'] // Plugins que ha de contenir la toolbar
                    });


                    editor.editor.on('CancelDialog', cancelCallback);
                    editor.editor.on('SaveDialog', saveCallback);

                this.widgetInitialized = true;
            }


        });

});
