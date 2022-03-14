define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
    'ioc/gui/content/EditableElements/ZoomableCellElement',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
    'ioc/gui/content/EditableElements/TreeDialog',


], function (declare, AceFacade, ZoomableCellElement, toolbarManager, Dialog/*, contentToolFactory*//**/) {


    var lastFocusedElement;

    var DIALOG_DEFAULT_HEIGHT = 600;
    var DIALOG_DEFAULT_WIDTH = 800;

    var REFRESH_TIMEOUT = 300;

    return declare([ZoomableCellElement],
        {

            // TEST: herència, sense cap canvi, ha de funcionar normalment.
            _zoom: function (event) {
                event.preventDefault();
                this.setEditionState(true);
                var fieldId = this.$field.attr('data-form-editor-button') || Date.now();


                // TODO: Afegir el treeDialog al dialogManager
                //var dialogManager = this.context.dispatcher.getDialogManager();

                // var args = {
                //     id: "auxWidget" + fieldId,
                //     title: this.context.title,
                //     dispatcher: this.context.dispatcher,
                // };
                //
                // var editorWidget = this.context.contentToolFactory.generate(this.context.contentToolFactory.generation.BASE, args);
                // var toolbarId = 'DialogToolbar' + (Date.now() + Math.random()); // id única
                //
                //
                // var $container = jQuery('<div>');
                // var $toolbar = jQuery('<div id="toolbar_' + args.id + '"></div>');
                // var $textarea = jQuery('<textarea id="textarea_' + args.id + '" style="width:100%;height:200px" name="wikitext"></textarea>');
                //
                // $textarea.css('display', 'none');
                // $container.append($toolbar);
                // $container.append($textarea);


                let saveCallback = function () {
                    var value = editor.getValue();


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

                let cancelCallback = function () {
                    this.setEditionState(false);
                    toolbarManager.delete(toolbarId);


                    // això només es crida si es passa un cancelCallback com argument al constructor.
                    if (this.args.cancelCallback) {
                        this.args.cancelCallback();
                    }

                    this.clearExternalContent(); // Esborrant

                    dialog.onHide();
                }.bind(this);
                //
                // var changeCallback = function(e) {
                //
                //     if (editor.isChanged()) {
                //         // console.log("changeCallback:", e);
                //         this.setExternalContent(e.newContent);
                //     } else {
                //         this.clearExternalContent();
                //     }
                //
                // }.bind(this);
                //
                // // TODO: Revisar com afegir un widget
                // $container.append("<h1>TODO!</h1>");
                //
                // var dialogParams = {
                //     title: "Editar cel·la", //TODO[Xavi] Localitzar
                //     message: '',
                //     single: true,
                //     sections: [
                //         $container,
                //         {widget: editorWidget}
                //     ],
                //     buttons: [
                //         {
                //             id: 'accept',
                //             description: 'Desar', // TODO[Xavi] Localitzar
                //             buttonType: 'default',
                //             callback: saveCallback
                //         },
                //         {
                //             id: 'cancel',
                //             description: 'Cancel·lar', // TODO[Xavi] Localitzar
                //             buttonType: 'default',
                //             callback: cancelCallback
                //         }
                //     ],
                //     height: DIALOG_DEFAULT_HEIGHT,
                //     width: DIALOG_DEFAULT_WIDTH
                // };
                //
                // var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, this.context.ns, dialogParams);
                //
                // dialog.show();
                // dialog.resize();
                //
                // toolbarManager.createToolbar(toolbarId , 'simple');

                // var editor = new AceFacade({
                //     id: args.id,
                //     auxId: args.id,
                //     containerId: 'editor_widget_container_' + args.id, // editorWidget.id
                //     textareaId: 'textarea_' + args.id,
                //     theme: JSINFO.plugin_aceeditor.colortheme,
                //     wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                //     wrapMode: true,
                //     dispatcher: this.context.dispatcher,
                //     content: this.$field.val(),
                //     originalContent: this.$field.val(),
                //     TOOLBAR_ID: toolbarId ,
                //     plugins: ['SaveDialogEditorButton', 'CancelDialogEditorButton'] // Plugins que ha de contenir la toolbar
                // });
                //
                // editor.setHeight(DIALOG_DEFAULT_HEIGHT - 137); //137 es la diferencia entre l'alçada de l'editor i el contenidor tenint en compte la toolbar i la barra inferior de botons
                //
                // editor.editor.on('CancelDialog', cancelCallback);
                // editor.editor.on('SaveDialog', saveCallback);
                // editor.on('change', changeCallback);

                let value;
                try {
                    value = JSON.parse(this.$field.val());
                    // console.log("Value parsejat amb èxit:", value);
                } catch {
                    value = {"error":"no s'ha pogut fer el parse"};
                }


                let wiocclDialog = new Dialog({
                    title: 'Edició arbre',
                    // fields: context.editor.extra.wioccl_structure.fields,
                    style: 'height:100%; width:100%; top:0; left:0; position:absolute; max-width: 80%; max-height: 80%;',
                    onHide: function (e) { // Es dispara quan es tanca el diàleg
                        // clearTimeout(refreshTimerId);
                        this.destroyRecursive();
                    },
                    // id: 'wioccl-dialog' + counter,
                    id: "auxWidget" + fieldId,
                    firstResize: true,
                    dispatcher: this.dispatcher, // Carregat al init de la superclasse
                    args: {
                        id: "auxWidget" + fieldId,
                        value: JSON.stringify(value)
                    },
                    //wioccl: structure.getNodeById(wiocclNode.id),
                    data: value,
                    // structure: structure,
                    // tree: tree,
                    // refId: refId,
                    saveCallback: saveCallback,
                    cancelCallback: cancelCallback,
                    // updateCallback: _update,
                    // enabledDelete: true,

                    // ALERTA[Xavi], aquesta propietat no és utilitzada pel dialeg, la injectem per poder-la utilitzar
                    // al saveCallback
                    // originalStructure: context.structure,
                    // $document: jQuery(context.editor.iframe).contents(),
                    // pluginEditor: context.editor,
                    // readonly: readonly
                });

                // TODO: això al wioccl refresca l'editor principal per evitar que es tanqui el document
                // determinar com refrescar el projecte de la mateixa manera
                // let refreshTimerId = setInterval(function() {
                //         context.editor.refresh();
                //     },
                //     REFRESH_TIMEOUT
                // );

                // context.wiocclDialog = wiocclDialog;

                wiocclDialog.startup();
                wiocclDialog.show();
                // wiocclDialog._updateFields(tree[0]);
                // wiocclDialog._updateDetail(tree[0]);


                this.originalContent = this.$field.val();

                //this.context.setFireEventHandler('post_cancel_project', cancelCallback);


            },

        });

});
