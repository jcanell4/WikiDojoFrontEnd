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

    // TODO[Xavi] Afegir com a paràmetre al constructor o als arguments d'inicialització
    var MAX_EXTRA_COLUMNS = 100;


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
                editor = dispatcher.getContentCache(id).getMainContentTool().getEditor().editor;
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
            var editor = dispatcher.getContentCache(id).getMainContentTool().getEditor(chunk);

            // editor.toggleEditor();

            editor.getSession().insert(editor.getCursorPosition(), "\n<edittable></edittable>")

        },


        editTableCallback: function (range, blockContent) {
            console.log(range);
            this.editor.getSession().removeMarker(this.previousMarker);
            this.previousMarker = this.editor.getSession().addMarker(range, 'edittable-highlight');
            //editor.selection.setRange(range);

            // blockContent = "<edittable>12345</edittable>";

            // console.error("Click a secció table-editor, contingut:\n\n" + blockContent);


            // Eliminem el principi i el final
            var dokuwikiContent = blockContent.substring(11, blockContent.length - 12);
            console.log("dokuwikiContent:", dokuwikiContent);

            // TODO: Parsejar el codi wiki per convertir-lo en dades

            this._showDialog(dokuwikiContent, range);

        },

        _showDialog: function (value, range) {
            // Alerta, el value ha de ser un objecte JSON amb els valors i la estructura de la taula


            var dialogManager = this.editor.dispatcher.getDialogManager();
            var context = this;


            var saveCallback = function () {

                store.fetch({
                        query: {}, onComplete: function (items) {
                            console.log("Dades:", items);
                            console.log("Layout:", layout);
                            console.log("Columnes eliminades", removedColumns);
                            console.log("Merged cells", mergeHandlers);


                            var row = context.editor.getCurrentRow();

                            var dokuwikiTable = context.parseData(items, layout, removedColumns, mergeHandlers);

                            dokuwikiTable.unshift('<edittable>');
                            dokuwikiTable.push('</edittable>');

                            context.editor.replace_lines(range.start.row, range.end.row, dokuwikiTable);

                        }
                    }
                );

            }.bind(this);

            var cancelCallback = function () {


                console.log("Dialeg cancel·lat");


                dialog.onHide();
            }.bind(this);


            var DIALOG_DEFAULT_HEIGHT = 800,
                DIALOG_DEFAULT_WIDTH = 800;



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


            this.numberOfColumns = 0;

            $addCol.on('click', function (e) {

                if (context.numberOfColumns === maxColumns) {
                    return;
                }

                context.numberOfColumns++;

                grid.layout.setColumnVisibility(context.numberOfColumns, /* bool */ true);

                console.log("Afegint columna");
                grid.selection.clear();
            });


            var removedColumns = [];

            $removeCol.on('click', function (e) {

                var items = grid.selection.getSelected('col', false);

                console.log("items seleccionats:", items);

                for (var col in selection['cols']) {
                    removedColumns.push(selection['cols'][col].col);
                    grid.layout.setColumnVisibility(/* int */ selection['cols'][col].col, /* bool */ false)
                }


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
                console.log("Eliminades les columnes");


                grid.selection.clear();
            });

            var itemsCount = 0;

            $addRow.on('click', function (e) {

                // ALERTA![xavi] El id ha de ser únic, fem servir un comptador extern que l'augmenti independentment de
                // la mida actual de la taula ja que en esborrar-se elements els ids es duplicarian
                var data = {
                    id: ++contentData.length
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

            var mergeHandlers = [];

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
                    mergeHandlers.push(grid.mergeCells(rows[i], startCol, endCol, contentCol)); // Alerta, s'ha de desar aquest handler per poder defer-ho
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

            var contentData = this.parseContentData(value);


            /*set up data store*/


            var store = new ItemFileWriteStore({data: contentData.data});


            /*set up layout*/

            // TODO: Aquí s'ha d'afegir el layout generat a partir del codi wiki, això es només de proves

            var layout = contentData.layout;

            // var layout = [[
            //     {'name': 'Columna 1', 'field': 'col1', 'width': '100px', editable: true},
            //     {'name': 'Columna 2', 'field': 'col2', 'width': '100px', editable: true},
            //     {'name': 'Columna 3', 'field': 'col3', 'width': '200px', editable: true},
            //     {'name': 'Columna 4', 'field': 'col4', 'width': '150px', editable: true}
            // ]];


            this.numberOfColumns = layout.length;
            var maxColumns = layout.length + MAX_EXTRA_COLUMNS;


            // TODO: Aquí es crean les columnes buides per poder afegir noves columnes.
            for (var i = this.numberOfColumns; i < maxColumns; i++) {
                layout.push({
                    'name': 'Columna ' + (i + 1),
                    'field': 'col' + (i + 1),
                    'width': '100px',
                    editable: true
                });
            }

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


            // Amagem les columnes buides
            for (var i = this.numberOfColumns; i < maxColumns; i++) {
                grid.layout.setColumnVisibility(/* int */ i, /* bool */ false);
            }

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

        },

        parseData: function (items, layout, removedColumns, mergeHandlers) {

            console.log(items, layout, removedColumns, mergeHandlers);

            var lines = [];

            var header = ""
            var first = true;

            // Construim la capçalera //
            for (var i=0; i<this.numberOfColumns; i++) {
                if (removedColumns.indexOf(i)!==-1) {
                    continue; // Columna eliminada
                }

                if (first) {
                    first = false;
                } else {
                    header +=" ";
                }

                header+="^ "+ layout[i].name;



            }

            header +=" ^";

            lines.push(header);
            for(var i=0; i<items.length; i++) {
                var line = "";

                var first = true;

                for (var j=0; j<this.numberOfColumns;j++) {
                    if (removedColumns.indexOf(j)!==-1) {
                        continue; // Columna eliminada
                    }

                    if (first) {
                        first = false;
                    } else {
                        line+=" ";
                    }

                    console.log("Contingut de la columna?", items[i]['col'+(j+1)]);
                    var cellContent = items[i]['col'+(j+1)];
                    if (cellContent === 'undefined' || cellContent === undefined || cellContent === null) {
                        cellContent = '';
                    }

                    line+="| "+ cellContent;

                }
                line +=" |";
                lines.push(line);
            }



            return lines;








            /*return [
                "^ Heading 1 ^ Heading 2 ^ Heading 3 ^",
                "| Row 1 Col 1 | Row 1 Col 2 | Row 1 Col 3 |",
                "| Row 2 Col 1 | some colspan (note the double pipe) ||",
                "| Row 3 Col 1 | Row 3 Col 2 | Row 3 Col 3 |"
            ];*/
        },


        parseContentData: function (content) {
            console.log("**** CONTENT:", content)

            var lines = content.split("\n");

            console.log("Lines:", lines);

            var parsedData = this.parseContentLines(lines);


            console.log("Contingut parsejat", parsedData);


            return {
                data: {
                    identifier: "id",
                    items: parsedData.rows
                },
                layout: parsedData.columns,
                length: parsedData.rows.length
            };
        },

        parseContentLines: function (lines) {


            var parsedLines = {
                columns: [],
                rows: []
            };

            var rowsCounter = 0;
            var columns = 0;

            for (var i = 0; i < lines.length; i++) {

                if (lines[i].startsWith('^')) {

                    // ALERTA, no s'admet que hi hagi més d'una fila de capçaleres

                    if (parsedLines.columns.length > 0) {
                        console.error("Error, no s'accepta més d'una fila de capçaleras, s'ignora la fila:", lines[i]);


                    } else if (lines[i].startsWith('^')) {
                        parsedLines.columns = this.parseHeader(lines[i]);
                        if (parsedLines.columns.length > columns) {
                            columns = parsedLines.columns.length;
                        }
                    }
                } else if (lines[i].startsWith('|')) {
                    var row = this.parseLine(lines[i], rowsCounter++);
                    parsedLines.rows.push(row);
                    if (row.length - 1 > columns) {
                        columns = row.length - 1;
                    }
                }
            }

            return parsedLines;

        },

        parseLine: function (line, id) {
            var tokens = line.split('|');
            var row = {
                id: id
            };

            // TODO[Xavi]: en cas de detectar-se més d'un | consecutio s'ha d'aplicar un merge d'aquestes cel·les, es pot passar com informació extra a del row ja que només es mostraran a la taula les columnes amb el format "colx"
            console.log("Tokens:", tokens);


            var mergeOpen = false;

            var cols = 0;

            // ALERTA[Xavi] el codi del merge fa que peti la taula, pendent de comprovar si pasa el mateix am qualsevol propietat extra del storage (a banda del id)
            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].length === 0) {
                    if (i === 0 || i === tokens.length - 1) { // El principi i el final sempre son buits
                        continue;

                        // } else {
                        //     // Es tracta d'un merge. Una mateixa fila pot tenir múltiples merge
                        //     if (mergeOpen) { // Tanquem el merge
                        //
                        //         if (!row.merge) {
                        //             row.merge = [];
                        //         }
                        //
                        //         row.merge.push({start: mergeOpen, close: cols});
                        //         mergeOpen = false;
                        //
                        //     } else {
                        //         // Obrim el merge
                        //         mergeOpen = cols;
                        //     }
                        //
                    }
                }

                console.log("Contingut del token?", tokens[i]);
                row['col' + (cols + 1)] = tokens[i].trim();
                cols++;
            }

            // if (mergeOpen && !row.merge) {
            //     row.merge = [];
            //     row.merge.push({start: mergeOpen, close: cols});
            // }

            console.log("row:", row);

            return row;
        },


        parseHeader: function (line) {
            var tokens = line.split('^');
            var layout = [];

            // TODO[Xavi]: en cas de detectar-se més d'un | consecutio s'ha d'aplicar un merge d'aquestes cel·les, es pot passar com informació extra a del row ja que només es mostraran a la taula les columnes amb el format "colx"
            console.log("Tokens header:", tokens);


            var cols = 0;

            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].length === 0) {
                    if (i === 0 || i === tokens.length - 1) { // El principi i el final sempre son buits
                        continue;
                    }
                }

                layout.push({
                    'name': tokens[i].trim(),
                    'field': 'col' + (cols + 1),
                    'width': '100px',
                    'editable': true
                });
                cols++;
            }
            console.log("columns:", layout);

            return layout;
        }
    });

});