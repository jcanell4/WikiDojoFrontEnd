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
    "dojox/grid/enhanced/plugins/Selector", // Encara que no s'utitlitzi directament ho utilitza el EnghancedGrid i s'ha de carregar
], function (declare, AbstractAcePlugin, DataGrid, cells, cellsDijit, Memory, ObjectStore, Button, domConstruct, lang, ItemFileWriteStore, Dialog, array, EnhancedGrid, Selector) {

    // TODO[Xavi] Afegir com a paràmetre al constructor o als arguments d'inicialització
    var MAX_EXTRA_COLUMNS = 50,
        DEFAULT_ROWS= 2,
        DEFAULT_COLS = 2;



    return declare([AbstractAcePlugin], {

        init: function (args) {

            this.previousMarker = null;
            this.editor.addReadonlyBlock('edittable', this.editTableCallback.bind(this));

            //console.log("AceTableEditorPlugin->args", args);

            var config = {
                type: args.type,
                title: args.title,
                icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            };

            // this.addButton(config);

            this.addButton(config, this.process);

            this.enabled = true;
            this.editor.readOnlyBlocksManager.enabled = this.enabled; // TODO: Afegir una propietat independent per les taules?

        },


        _buildDefaultTable: function() {
            var cols = Number(prompt("Introdueix el nombre de columnes (mínim 1):", DEFAULT_COLS));
            var rows = Number(prompt("Introdueix el nombre de columnes (mínim 1):", DEFAULT_ROWS));
            var value = "^ "; // generar el valor demanant el nombre de columnes i a partir d'aquest generar el codi wiki més simple possible


            if (isNaN(cols) || cols<1) {
                cols = 1;
            }

            if (isNaN(rows) || rows<1) {
                rows = 1;
            }

            for (var i=0; i<cols; i++) {
                value +="Columna " + (i+1) + " ^";
            }




            for (var i=0; i<rows; i++) {
                value +="\n|";
                for (var j=0; j<cols; j++) {
                    if (j===0) {
                        value += " fila " + (i+1);
                    }
                    value += " |";
                }

            }
            value += "\n";

            return value;
        },

        _processFull: function () {
            var dispatcher = this.editor.dispatcher;

            var id = dispatcher.getGlobalState().getCurrentId(),
                editor = dispatcher.getContentCache(id).getMainContentTool().getEditor().editor;
            // editor.toggleEditor();


            // editor.session.insert(editor.getCursorPosition(), "\n<edittable></edittable>")


            //console.log(editor);

            var pos = {row: editor.getCurrentRow(), col: 0};
            var range = {start :  pos, end: pos};
            var value = this._buildDefaultTable();

            this._showDialog(value, range);

        },

        _processPartial: function () {
            var dispatcher = this.editor.dispatcher;

            var chunk = dispatcher.getGlobalState().getCurrentElementId(),
                id = dispatcher.getGlobalState().getCurrentId();
            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");
            var editor = dispatcher.getContentCache(id).getMainContentTool().getEditor(chunk);

            var pos = {row: editor.getCurrentRow(), col: 0};
            var range = {start :  pos, end: pos};
            var value = this._buildDefaultTable();

            this._showDialog(value, range);

        },


        editTableCallback: function (range, blockContent) {
            // console.log(range);
            this.editor.getSession().removeMarker(this.previousMarker);
            this.previousMarker = this.editor.getSession().addMarker(range, 'edittable-highlight');

            // Eliminem el principi i el final
            var dokuwikiContent = blockContent.substring(11, blockContent.length - 12);

            this._showDialog(dokuwikiContent, range);

        },

        _showDialog: function (value, range) {
            // Alerta, el value ha de ser un objecte JSON amb els valors i la estructura de la taula


            var dialogManager = this.editor.dispatcher.getDialogManager();
            var context = this;


            var saveCallback = function () {

                store.fetch({
                        query: {}, onComplete: function (items) {
                            var dokuwikiTable = context.parseData(items, layout, removedColumns);
                            dokuwikiTable.unshift('<edittable>');
                            dokuwikiTable.push('</edittable>');
                            context.editor.replace_lines(range.start.row, range.end.row, dokuwikiTable);
                        }
                    }
                );

            }.bind(this);

            var cancelCallback = function () {

                dialog.onHide();
            }.bind(this);


            var DIALOG_DEFAULT_HEIGHT = 800,
                DIALOG_DEFAULT_WIDTH = 800;


            var $container = jQuery('<div>');

            var $toolbar = jQuery('<div>');
            $container.append($toolbar);


            var $addCol = jQuery('<button>Afegir columna</button>');
            $toolbar.append($addCol);

            var $addRow = jQuery('<button>Afegir fila</button>');
            $toolbar.append($addRow);


            var $removeCol = jQuery('<button>Eliminar columna</button>');
            $toolbar.append($removeCol);

            var $removeRow = jQuery('<button>Eliminar fila</button>');
            $toolbar.append($removeRow);


            var $mergeCells = jQuery('<button>Fusionar cel·les</button>');
            $toolbar.append($mergeCells);


            this.numberOfColumns = 0;

            $addCol.on('click', function (e) {

                if (context.numberOfColumns === context.maxColumns) {
                    return;
                }

                grid.layout.setColumnVisibility(context.numberOfColumns, /* bool */ true);

                context.numberOfColumns++;

                grid.selection.clear();
            });


            var removedColumns = [];

            $removeCol.on('click', function (e) {

                var items = grid.selection.getSelected('col', false);

                for (var col in selection['cols']) {
                    removedColumns.push((selection['cols'][col].col+1));
                    grid.layout.setColumnVisibility(/* int */ selection['cols'][col].col, /* bool */ false)
                }

                grid.selection.clear();
            });


            $addRow.on('click', function (e) {

                // ALERTA![xavi] El id ha de ser únic, fem servir un comptador extern que l'augmenti independentment de
                // la mida actual de la taula ja que en esborrar-se elements els ids es duplicarian
                var data = {
                    id: ++contentData.length
                    // col0: key
                };

                var first = true;
                for (var i = 0; i < this.numberOfColumns; i++) {
                    if (first && removedColumns.indexOf(i) ===-1) {
                        first = false;
                        data['col' + (i + 1)] = 'nova fila';
                    } else {
                        data['col' + (i + 1)] = '';
                    }


                }

                store.newItem(data);


            });

            $removeRow.on('click', function (e) {

                var items = grid.selection.getSelected('row', false);


                if (items.length) {
                    array.forEach(items, function (selectedItem) {
                        if (selectedItem !== null) {
                            store.deleteItem(selectedItem);
                        }
                    });
                }

                grid.selection.clear();

            });


            $mergeCells.on('click', function (e) {


                var confirmed = confirm("La fusió de cel·les no es pot desfer, vols continuar?");

                if (!confirmed) {
                    return;
                }

                var first = true;
                var startCol, endCol, startRow, endRow, currentCol, currentRow;

                var rows = [];

                // la posició inicial i final de la selecció
                for (var i = 0; i < selection['cells'].length; i++) {
                    currentCol = selection['cells'][i].col;
                    currentRow = selection['cells'][i].row;


                    if (rows.indexOf(currentRow) === -1) {
                        rows.push(currentRow);
                    }

                    if (first) {
                        startCol = currentCol;
                        startRow = currentRow;
                        endCol = currentCol;
                        endRow = currentRow;

                        first = false;

                    } else {
                        if (currentCol < startCol) {
                            startCol = currentCol;
                        } else if (currentCol > endCol) {
                            endCol = currentCol;
                        }

                        if (currentRow < startRow) {
                            startRow = currentRow;
                        } else if (currentRow > endRow) {
                            endRow = currentRow;
                        }
                    }
                }


                // Hem de treballar amb el llistat complet de files per que no hi ha correspondencia directa entre cel·les i files/columnes de dades al store
                store.fetch({
                        query: {}, onComplete: function (items) {


                            //console.log("items:", items);

                            var first = true;
                            for (var i = startRow; i <= endRow; i++) {

                                if (items[i].merge && typeof items[i].merge[0] === "string") {
                                    items[i].merge = JSON.parse(items[i].merge[0]);
                                }

                                for (var j = startCol; j <= endCol; j++) {
                                    if (first) { // El primer element es el que conté el contingut del merge, esborrem qualsevol informació de merge anterior
                                        delete(items[i].merge);
                                        first = false;
                                        continue;
                                    }

                                    if (!items[i].merge) {
                                        items[i].merge = {
                                            h: [],
                                            v: []
                                        }
                                    }

                                    if (i === startRow) { // Merge horitzonal
                                        items[i].merge.h.push(j);
                                        items[i]['col' + (j + 1)] = ["<<<"];

                                    } else { // Merge vertical
                                        items[i].merge.v.push(j);
                                        items[i]['col' + (j + 1)] = ["^^^"];
                                    }

                                }

                            }


                            grid.setQuery({'id': '*'}); // Reresca el grid amb les dades actualitzades
                        }
                    }
                );


            });

            var dialogParams = {
                title: "Edició de taula", //TODO[Xavi] Localitzar
                message: '',
                sections: [
                    $container
                    // {widget: grid}

                ],
                single: true,
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

            var store = new ItemFileWriteStore({data: contentData.data});

            var layout = contentData.layout;

            // TODO: Aquí es crean les columnes buides per poder afegir noves columnes.
            for (var i = this.numberOfColumns + 1; i < this.maxColumns; i++) {
                layout.push({
                    'name': 'Columna ' + i,
                    'field': 'col' + i,
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
                },
                selectionMode: 'multiple'
            });


            domConstruct.place(grid.domNode, dialog.containerNode);


            grid.startup();

            // Amagem les columnes buides
            for (var i = this.numberOfColumns; i < this.maxColumns - 1; i++) {
                grid.layout.setColumnVisibility(/* int */ i, /* bool */ false);
            }


            grid.resize();
            dialog.resize();


            var selection = {};


            // Test selections
            var selectionCallback = function (type, startPoint, endPoint, selected) {

                selection = {
                    cells: selected["cell"],
                    cols: selected["col"],
                    rows: selected["row"]
                };

                $removeCol.prop('disabled', selection.cols.length === 0);
                $removeRow.prop('disabled', selection.rows.length === 0);
                $mergeCells.prop('disabled', selection.cells.length <= 1);

            };

            dojo.connect(grid, "onEndDeselect", selectionCallback);
            dojo.connect(grid, "onEndSelect", selectionCallback);


            // ALERTA[Xavi] Arreglos d'estil forçats a la taula, no es poden arreglar mitjançant CSS
            jQuery('[dojoattachpoint="viewsHeaderNode"]').css('height', '24px');

        },

        parseData: function (items, layout, removedColumns) {

            // console.log(items, layout, removedColumns);

            var lines = [];

            var header = "";
            var first = true;

            // Construim la capçalera //
            for (var i = 0; i < this.numberOfColumns; i++) {
                if (removedColumns.indexOf(i) !== -1) {
                    continue; // Columna eliminada
                }

                if (first) {
                    first = false;
                } else {
                    header += " ";
                }

                header += "^ " + layout[i].name;


            }

            header += " ^";

            lines.push(header);
            for (var i = 0; i < items.length; i++) {
                var line = "";

                var ignoreFirstSpace = true;
                var addSpaceOnFinishLine;


                if (items[i].merge && typeof items[i].merge[0] === 'string') {
                    items[i].merge = JSON.parse(items[i].merge[0]);
                }


                for (var j = 1; j <= this.numberOfColumns; j++) {
                    if (removedColumns.indexOf(j) !== -1) {
                        continue; // Columna eliminada
                    }

                    addSpaceOnFinishLine = true;

                    if (ignoreFirstSpace) {
                        ignoreFirstSpace = false;
                    } else {
                        line += " ";
                    }


                    if (items[i].merge && items[i].merge.h.indexOf(j - 1) !== -1) {
                        addSpaceOnFinishLine = false;
                        ignoreFirstSpace = true;
                        line += "|";
                        continue;
                    } else if (items[i].merge && items[i].merge.v.indexOf(j - 1) !== -1) {
                        //merged = true;
                        line += "| :::";
                        continue;
                    }


                    var cellContent = items[i]['col' + j];
                    line += "| " + cellContent;

                }

                if (addSpaceOnFinishLine) {
                    line += " |";
                } else {
                    line += "|";
                }

                lines.push(line);
            }


            return lines;
        },


        parseContentData: function (content) {

            var lines = content.split("\n");
            var parsedData = this.parseContentLines(lines);

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


            var cols = 0;

            for (var i = 0; i < tokens.length; i++) {
                var value = tokens[i].trim();


                if (tokens[i].length === 0) {
                    if (i === 0 || i === tokens.length - 1) { // El principi i el final sempre son buits
                        continue;

                    } else {
                        // Es tracta d'un merge horitzontal
                        if (!row.merge) {
                            row.merge = {
                                h: [],
                                v: []
                            }
                        }

                        row.merge.h.push(cols);
                        value = '<<<';
                    }
                }

                if (value === ':::') {
                    value = '^^^';

                    if (!row.merge) {
                        row.merge = {
                            h: [],
                            v: []
                        }
                    }

                    row.merge.v.push(cols);
                }

                row['col' + (cols + 1)] = value;

                cols++;
            }


            // Afegim els camps buits a l'store
            for (var i = tokens.length; i < this.maxColumns; i++) {
                row['col' + (cols + 1)] = '';
            }

            // Quan es crea el datagrid cap element pot ser un array, ho passem com a json i fem el canvi quan sigui necessari
            if (row.merge) {
                row.merge = JSON.stringify(row.merge);
            }

            return row;
        },


        parseHeader: function (line) {
            var tokens = line.split('^');
            var layout = [];


            var cols = 0;


            var formatterCallback = function(value, rowIndex, cell) {
                // TODO[Xavi] en lloc de comprovar el contingut es podria cercar l'element a l'store i comprovar si es merge o no i substituir el contingut.

                if (!value || value === "undefined") {
                    value = '';
                }


                if (value === '^^^' || value === '<<<' || value === '&lt;&lt;&lt;') {
                    value = '<i>' + value + '</i>';
                }

                return value;
            };

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
                    'editable': true,
                    'formatter': formatterCallback
                });
                cols++;
            }

            // S'inicialitza aquí perquè abans no sabem la mida real del layout
            this.numberOfColumns = layout.length;
            this.maxColumns = layout.length + MAX_EXTRA_COLUMNS;


            return layout;
        },


    });

});