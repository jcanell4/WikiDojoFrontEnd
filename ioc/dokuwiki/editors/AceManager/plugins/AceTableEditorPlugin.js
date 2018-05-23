define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    "dojox/grid/DataGrid",
    "dojox/grid/cells",
    "dojox/grid/cells/dijit",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "dijit/form/Button",
    "dojo/dom-construct",
    "dojo/_base/lang",
    'dojo/data/ItemFileWriteStore',
    'dijit/Dialog'
], function (declare, AbstractAcePlugin, DataGrid, cells, cellsDijit, Memory, ObjectStore, Button, domConstruct, lang, ItemFileWriteStore, Dialog) {

    return declare([AbstractAcePlugin], {

        init: function (args) {

            // ALERTA[Xavi] En aquest cas no cal afegir cap botó, però es podria afegir un botó per inserir un bloc, obrir un dialeg, etc.

            console.log("AceTableEditorPlugin#init", args);

            // var config = {
            //     type: 'format',
            //     title: args.title,
            //     icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            //     open: args.open,
            //     sample: args.sample,
            //     close: args.close
            // };
            //
            // this.addButton(config);

            this.previousMarker = null;
            this.editor.addReadonlyBlock('edittable', this.editTableCallback.bind(this));
            //this.editor.addReadonlyBlock('readonly');


            var config = {
                type: args.type,
                title: args.title,
                icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
                open: args.open,
                sample: args.sample,
                close: args.close
            };

            // this.addButton(config);

            this.addButton(config, this.process);

            this.enabled = true;
            this.editor.readOnlyBlocksManager.enabled = this.enabled; // TODO: Afegir una propietat independent per les taules?

        },

        process: function () {

            this.inherited(arguments);


            alert("TODO: mostrar el dialeg d'edició de taules");
            // this.enabled = !this.enabled;
            // this.editor.readOnlyBlocksManager.enabled = this.enabled; // TODO: Afegir una propietat independent per les taules?
        },


        _processFull: function () {
            var dispatcher = this.editor.dispatcher;

            var id = dispatcher.getGlobalState().getCurrentId(),
                editor = dispatcher.getContentCache(id).getMainContentTool().getEditor().editor.editor;
            // editor.toggleEditor();

            console.log("Editor?", editor);

            editor.session.insert(editor.getCursorPosition(), "\n<edittable></edittable>")
        },

        _processPartial: function () {
            var dispatcher = this.editor.dispatcher;

            var chunk = dispatcher.getGlobalState().getCurrentElementId(),
                id = dispatcher.getGlobalState().getCurrentId();
            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");
            var editor = dispatcher.getContentCache(id).getMainContentTool().getEditor(chunk).editor;

            // editor.toggleEditor();

            editor.getSession().insert(editor.getCursorPosition(), "\n<edittable></edittable>")

        },


        editTableCallback: function (range, blockContent) {
            console.log(range);
            this.editor.session.removeMarker(this.previousMarker);
            this.previousMarker = this.editor.session.addMarker(range, 'edittable-highlight');
            //editor.selection.setRange(range);

            blockContent = "<edittable>12345</edittable>";

            console.log("Click a secció table-editor, contingut:\n\n" + blockContent);


            // Eliminem el principi i el final
            var dokuwikiContent = blockContent.substring(11, blockContent.length - 12);
            console.log("dokuwikiContent", dokuwikiContent);

            // TODO: Parsejar el codi wiki per convertir-lo en dades

            this._showDialog(dokuwikiContent);

        },

        _showDialog: function (value) {
            // Alerta, el value ha de ser un objecte JSON amb els valors i la estructura de la taula


            var dialogManager = this.editor.dispatcher.getDialogManager();


            /*

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

            // $textarea.css('display', 'none');
            // $container.append($toolbar);
            // $container.append($textarea);

            */
            var saveCallback = function () {
                // var value =editor.getValue();
                //
                //
                // if (this.args.saveCallback) {
                //     this.args.saveCallback(value);
                //
                //
                // } else {
                //     // Aquest es el comportament per defecte, vàlid quan es treballa amb elements HTML
                //     this.$field.val(value);
                //     this.$field.trigger('input');
                // }
                //
                // this.setEditionState(false);
                // toolbarManager.delete(toolbarId);
                //
                // // this.$field.val(editor.getValue());
                // // this.setEditionState(false);
                // // toolbarManager.delete(toolbarId);
                // // this.$field.trigger('input');
                //
                // this.clearExternalContent(); // Esborrant
                //
                // dialog.onHide();
                // console.log("Desant al node el nou contingut", editor.getValue(), this.$field, this.$field.val());

                console.log("Dialeg desat");

                console.log("data?", store.data);
            }.bind(this);

            var cancelCallback = function () {
                // this.setEditionState(false);
                // toolbarManager.delete(toolbarId);
                //
                //
                // // això només es crida si es passa un cancelCallback com argument al constructor.
                // if (this.args.cancelCallback) {
                //     this.args.cancelCallback();
                // }
                //
                // this.clearExternalContent(); // Esborrant

                console.log("Dialeg cancel·lat");


                dialog.onHide();
            }.bind(this);


            var DIALOG_DEFAULT_HEIGHT = 800,
                DIALOG_DEFAULT_WIDTH = 800;


            // var width = 100 / tableData.columns.length;

            // var height = 36 + (rows * 24);

            var dialogParams = {
                title: "Edició de taula", //TODO[Xavi] Localitzar
                message: '',
                sections:[
                    // $container
                    // {widget: grid}

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


            var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, this.editor.ns, dialogParams);


            dialog.show();

            /*set up data store*/
            var data = {
                identifier: "id",
                items: []
            };
            var data_list = [
                { col1: "normal", col2: false, col3: 'But are not followed by two hexadecimal', col4: 29.91},
                { col1: "important", col2: false, col3: 'Because a % sign always indicates', col4: 9.33},
                { col1: "important", col2: false, col3: 'Signs can be selectively', col4: 19.34}
            ];
            var rows = 60;
            for(var i = 0, l = data_list.length; i < rows; i++){
                data.items.push(lang.mixin({ id: i+1 }, data_list[i%l]));
            }
            var store = new ItemFileWriteStore({data: data});

            /*set up layout*/
            var layout = [[
                {'name': 'Column 1', 'field': 'id', 'width': '100px'},
                {'name': 'Column 2', 'field': 'col2', 'width': '100px'},
                {'name': 'Column 3', 'field': 'col3', 'width': '200px'},
                {'name': 'Column 4', 'field': 'col4', 'width': '150px'}
            ]];

            /*create a new grid*/
            var grid = new DataGrid({
                id: 'grid',
                store: store,
                structure: layout,
                rowSelector: '20px',
                height: '500px'
            });

            domConstruct.place(grid.domNode,dialog.containerNode,'first');

            grid.startup();

            grid.resize();
            dialog.resize();
        }

    });

});