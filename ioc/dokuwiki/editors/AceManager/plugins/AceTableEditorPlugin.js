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
    'dijit/Dialog',
    'dojo/_base/array',
    "dojox/grid/EnhancedGrid",
    "dojox/grid/enhanced/plugins/Selector"
], function (declare, AbstractAcePlugin, DataGrid, cells, cellsDijit, Memory, ObjectStore, Button, domConstruct, lang, ItemFileWriteStore, Dialog, array, EnhancedGrid, Selector) {

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


            var $container = jQuery('<div>');

            var $toolbar = jQuery('<div>');
            $container.append($toolbar);


            var $addCol = jQuery('<button>Test Add Column</button>');
            $toolbar.append($addCol);

            var $addRow = jQuery('<button>Test Add Row</button>');
            $toolbar.append($addRow);


            var $removeCol = jQuery('<button>Test Remove Column</button>');
            $toolbar.append($removeCol);

            var $removeRow = jQuery('<button>Test Remove Row</button>');
            $toolbar.append($removeRow);


            $addCol.on('click', function (e) {
                // Test: substituim el layout per un amb una columna extra


                //
                //
                // var layout = [[
                //     {'name': 'Column 1', 'field': 'id', 'width': '100px'},
                //     {'name': 'Column 2', 'field': 'col2', 'width': '100px'},
                //     {'name': 'Column 3', 'field': 'col3', 'width': '200px'},
                //     {'name': 'Column 4', 'field': 'col4', 'width': '150px'},
                //     {'name': 'Column 5', 'field': 'col5', 'width': '50px'}
                // ]];

                var counter = layout[0].length + 1;


                var header = prompt("Introdueix el nom de la columna");

                layout[0].push({'name': header, 'field': 'col' + counter, 'width': '50px'});


                grid.setStructure(layout);
                console.log("Afegint columna");
            });


            $removeCol.on('click', function (e) {
                // Test: substituim el layout per un amb una columna extra



                //
                //
                // var layout = [[
                //     {'name': 'Column 1', 'field': 'id', 'width': '100px'},
                //     {'name': 'Column 2', 'field': 'col2', 'width': '100px'},
                //     {'name': 'Column 3', 'field': 'col3', 'width': '200px'},
                //     {'name': 'Column 4', 'field': 'col4', 'width': '150px'},
                //     {'name': 'Column 5', 'field': 'col5', 'width': '50px'}
                // ]];

                var counter = layout[0].length + 1;


                var items = grid.selection.getSelected('col', false);

                console.log("items seleccionats:", items);

                var selectedCol = grid.focus.cell.field;

                var newLayout = [];
                for (var i = 0; i < layout[0].length; i++) {
                    if (layout[0][i].field !== selectedCol) {
                        newLayout.push(layout[0][i]);
                    }
                }


                layout = [newLayout];

                grid.setStructure(layout);
                console.log("Eliminada columna");
            });

            var itemsCount = 0;

            $addRow.on('click', function (e) {

                // ALERTA![xavi] El id ha de ser únic, fem servir un comptador extern que l'augmenti independentment de
                // la mida actual de la taula ja que en esborrar-se elements els ids es duplicarian
                var data = {
                    id: ++itemsCount,
                    // col0: key
                };

                store.newItem(data);

                console.log("Added Row");
            });

            $removeRow.on('click', function (e) {

                // var row = grid.selection.getSelected()[0];
                // console.log("Fila seleccionada?", row);
                //
                //
                // var id = row.id[0];
                //
                // store.fetch({
                //         query: {id: id}, onComplete: function (items) {
                //             store.deleteItem(items[0]);
                //         }
                //     }
                // );


                // var items = grid.selection.getSelected();
                var items = grid.selection.getSelected('row', false);

                console.log("Remove Row", items);

                if (items.length) {
                    /* Iterate through the list of selected items.
                    The current item is available in the variable
                    'selectedItem' within the following function: */
                    array.forEach(items, function (selectedItem) {
                        if (selectedItem !== null) {
                            /* Iterate through the list of attributes of each item.
                            The current attribute is available in the variable
                            'attribute' within the following function: */

                            store.deleteItem(selectedItem);


                        }
                    });
                }


            });


            var dialogParams = {
                title: "Edició de taula", //TODO[Xavi] Localitzar
                message: '',
                sections: [
                    $container
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
                {col1: "normal", col2: false, col3: 'But are not followed by two hexadecimal', col4: 29.91},
                {col1: "important", col2: false, col3: 'Because a % sign always indicates', col4: 9.33},
                {col1: "important", col2: false, col3: 'Signs can be selectively', col4: 19.34}
            ];
            var rows = 10;
            for (var i = 0, l = data_list.length; i < rows; i++) {
                ++itemsCount;
                data.items.push(lang.mixin({id: i + 1}, data_list[i % l]));
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
            // var grid = new DataGrid({
            //     id: 'grid',
            //     store: store,
            //     structure: layout,
            //     rowSelector: '20px',
            //     height: '500px',
            //     selectionMode: 'multiple'
            // });

            var grid = new EnhancedGrid({
                id: 'grid',
                store: store,
                structure: layout,
                rowSelector: '20px',
                height: '500px',
                canSort: function () {
                    return true;
                },
                plugins: {
                    selector: {
                        'cell': 'multi', // Alerta la selecció múltiple amb ctrl no funciona a firefox
                        'col': 'multi',
                        'row': 'multi'
                    }
                },
                // selectionMode: 'multiple'
            });


            domConstruct.place(grid.domNode, dialog.containerNode);

            grid.startup();

            grid.setupSelectorConfig(

            );



            grid.resize();
            dialog.resize();
        }

    });

});