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
    "dojox/grid/enhanced/plugins/Selector",
    "ioc/dokuwiki/editors/AceManager/plugins/IocCellMerge"
], function (declare, AbstractAcePlugin, DataGrid, cells, cellsDijit, Memory, ObjectStore, Button, domConstruct, lang, ItemFileWriteStore, Dialog, array, EnhancedGrid, Selector, CellMerge) {

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


                // Aquestes son les dades necessaries per recrear la taula
                console.log("Layout:", layout);



                store.fetch({
                        query: {}, onComplete: function (items) {
                        console.log("Dades:", items);
                        }
                    }
                );

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


            var $mergeCells = jQuery('<button>Test Merge Cells</button>');
            $toolbar.append($mergeCells);


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

                var items = grid.selection.getSelected('col', false);

                console.log("items seleccionats:", items);

                var removeCols = [];
                for (var col in selection['cols']) {
                    removeCols.push(selection['cols'][col].col);


                    grid.layout.setColumnVisibility(/* int */ selection['cols'][col].col, /* bool */ false)

                }

                console.log("TODO: Afegir l'index a la llista d'elements 'elimintats'");

                alert("TODO: Afegir l'element amagat com a columna amagada");

                //
                // var newLayout = [];
                // for (var i = 0; i < layout[0].length; i++) {
                //
                //     if (removeCols.indexOf(i) === -1) {
                //         newLayout.push(layout[0][i]);
                //     }
                // }
                //
                //
                // layout = [newLayout];
                //
                // grid.setStructure(layout);
                //
                //
                console.log("Eliminades les columnes", removeCols);




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

                grid.selection.clear();

            });


            $mergeCells.on('click', function (e) {

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
                console.log("Cel·les seleccionades:", selection['cells']);
                console.log("Layout", layout);


                // La fusió de cel·les consisteix en:
                // - modificar la cel·la corresponent a la cantonada superior esquerra afegint rowspan i colspan corresponent a la extensió
                // - eliminar totes les altres cel·les seleccionades.


                // var items = grid.getSelected('cell', true);
                // console.log("Merge Cells (funciona el getSelected??)", items);


                // Per fer un unmerge s'ha de fer sobre el handle, o amb getMergedCells es poden desfer tots els merges

                // var row = 2; // tercera fila
                // var startCol = 1; // segona columna
                //     var endCol = 2; // tercera columna
                // var contentCol = startCol; // Contingut de la primera cel·la fusionada
                //


                var first = true;
                var startCol, endCol, contentCol, currentCol, currentRow;

                var rows = [];

                for (var i = 0; i < selection['cells'].length; i++) {
                    currentCol = selection['cells'][i].col;
                    currentRow = selection['cells'][i].row;


                    if (rows.indexOf(currentRow) === -1) {
                        rows.push(currentRow);
                    }

                    if (first) {
                        startCol = currentCol;
                        endCol = currentCol;

                        first = false;
                    } else {
                        if (currentCol < startCol) {
                            startCol = currentCol;
                        } else if (currentCol > endCol) {
                            endCol = currentCol;
                        }
                    }
                }

                contentCol = startCol;


                console.log(rows, startCol, endCol, contentCol);


                for (var i = 0; i < rows.length; i++) {

                    console.log("Fent merge de la línia", rows[i]);
                    var handleMeger1 = grid.mergeCells(rows[i], startCol, endCol, contentCol); // Alerta, s'ha de desar aquest handler per poder defer-ho
                }


                // // if (items.length) {
                //     /* Iterate through the list of selected items.
                //     The current item is available in the variable
                //     'selectedItem' within the following function: */
                //     array.forEach(items, function (selectedItem) {
                //         if (selectedItem !== null) {
                //             /* Iterate through the list of attributes of each item.
                //             The current attribute is available in the variable
                //             'attribute' within the following function: */
                //
                //             store.deleteItem(selectedItem);
                //
                //
                //         }
                //     });
                // }


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
                {'name': 'Column 1', 'field': 'id', 'width': '100px', editable: true},
                {'name': 'Column 2', 'field': 'col2', 'width': '100px', editable: true},
                {'name': 'Column 3', 'field': 'col3', 'width': '200px', editable: true},
                {'name': 'Column 4', 'field': 'col4', 'width': '150px', editable: true}
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
                    return false;
                },
                plugins: {
                    selector: {
                        'cell': 'multi', // Alerta la selecció múltiple amb ctrl no funciona a firefox
                        'col': 'multi',
                        'row': 'multi'
                    },
                    cellMerge: true // Pel plugin, no permet fer merge de files
                },
                selectionMode: 'multiple'
            });


            domConstruct.place(grid.domNode, dialog.containerNode);

            grid.startup();


            grid.resize();
            dialog.resize();


            var selection = {};


            // Test selections
            var func = function (type, startPoint, endPoint, selected) {

                selection = {
                    cells: selected["cell"],
                    cols: selected["col"],
                    rows: selected["row"]
                };

                $removeCol.prop('disabled', selection.cols.length === 0);
                $removeRow.prop('disabled', selection.rows.length === 0);
                $mergeCells.prop('disabled', selection.cells.length <= 1);


                console.log(selection);
            };

            var handle1 = dojo.connect(grid, "onEndDeselect", func);
            var handle2 = dojo.connect(grid, "onEndSelect", func);


            // ALERTA[Xavi] Arreglos d'estil forçats a la taula, no es poden arreglar mitjançant CSS
            jQuery('[dojoattachpoint="viewsHeaderNode"]').css('height', '24px');

        }

    });

});