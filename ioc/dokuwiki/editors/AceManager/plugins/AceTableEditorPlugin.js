define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    // "dojox/grid/DataGrid",
    "dojox/grid/cells",
    "dojox/grid/cells/dijit",
    "dijit/form/Button",
    "dojo/dom-construct",
    "dojo/_base/lang",
    'dojo/data/ItemFileWriteStore',
    'dijit/Dialog',
    'dojo/_base/array',
    "dojox/grid/EnhancedGrid",
    "dojox/grid/enhanced/plugins/Selector", // Encara que no s'utitlitzi directament ho utilitza el EnhancedGrid i s'ha de carregar
    "dijit/registry",
    // "dijit/form/Textarea"

    // "ioc/gui/content/EditableElements/ZoomableCell",

    "dojo/_base/sniff"
], function (declare, AbstractAcePlugin, /*DataGrid, */cells, cellsDijit, Button, domConstruct, lang, ItemFileWriteStore, Dialog, array, EnhancedGrid, Selector, registry/*, Textarea*/, has) {

    // TODO[Xavi] Afegir com a paràmetre al constructor o als arguments d'inicialització
    var MAX_EXTRA_COLUMNS = 50,
        DEFAULT_ROWS = 2,
        DEFAULT_COLS = 2,

        // Correspondencia amb els valors posibles al PluginFactory pel tableType
        NORMAL = "normal",
        MULTILINE = "multiline",
        ACCOUNTING = "accounting";


    var ZoomableCell;

    // ALERTA[Xavi] Si s'afegeix al declare no funciona, ni idea de perquè
    require(["ioc/gui/content/EditableElements/ZoomableCell"], function(InZoomableCell) {
        ZoomableCell = InZoomableCell;
    });

    return declare([AbstractAcePlugin], {

        init: function (args) {

            this.previousMarker = null;

            // ALERTA[Xavi] El callback només cal disparar-lo pel tipus original, s'utilizan diferents plugins només per crear els botons
            this.triggerState = 'edittable';

            this.editor.addReadonlyBlock(this.triggerState, this.editTableCallback.bind(this), true);


            // this.editor.addReadonlyBlock('edittable', this.editTableCallback.bind(this));

            //console.log("AceTableEditorPlugin->args", args);

            var config = args;
            if (args.icon.indexOf(".png") === -1) {
                config.icon = "/iocjslib/ioc/gui/img/" + args.icon + ".png";
            }

            this.tableType = args.tableType;



            // var config = {
            //     type: args.type,
            //     title: args.title,
            //     icon: '/iocjslib/ioc/gui/img/' + args.icon + '.png',
            //     category: args.category
            // };

            // this.addButton(config);

            this.addButton(config, this.process);

            this.enabled = true;
            this.editor.readOnlyBlocksManager.enabled = this.enabled; // TODO: Afegir una propietat independent per les taules?

        },


        _buildDefaultTable: function () {
            var cols = Number(prompt("Introdueix el nombre de columnes (mínim 1):", DEFAULT_COLS));
            var rows = Number(prompt("Introdueix el nombre de files (mínim 1):", DEFAULT_ROWS));
            var value = "^ "; // generar el valor demanant el nombre de columnes i a partir d'aquest generar el codi wiki més simple possible


            if (isNaN(cols) || cols < 1) {
                cols = 1;
            }

            if (isNaN(rows) || rows < 1) {
                rows = 1;
            }

            for (var i = 0; i < cols; i++) {
                value += "Columna " + (i + 1) + " ^";
            }


            for (var i = 0; i < rows; i++) {
                value += "\n|";
                for (var j = 0; j < cols; j++) {
                    if (j === 0) {
                        value += " fila " + (i + 1);
                    }
                    value += " |";
                }

            }
            value += "\n";

            return value;
        },

        _processFull: function () {
            var pos = {row: this.editor.getCurrentRow(), col: 0};
            var range = {start: pos, end: pos};
            var value = this._buildDefaultTable();

            this._showDialog(value, range);

        },

        _processPartial: function () {
            var dispatcher = this.editor.dispatcher;

            var chunk = dispatcher.getGlobalState().getCurrentElementId(),
                id = dispatcher.getGlobalState().getCurrentId();

            // console.log("chunk:", chunk);
            // console.log("id:", id);

            chunk = chunk.replace(id + "_", "");
            chunk = chunk.replace("container_", "");
            var editor = dispatcher.getContentCache(id).getMainContentTool().getEditor(chunk);

            var pos = {row: editor.getCurrentRow(), col: 0};
            var range = {start: pos, end: pos};
            var value = this._buildDefaultTable();

            this._showDialog(value, range);

        },

        changeEditorCallback: function(e) {

            var cursor = this.editor.editor.getCursorPosition();

            if (cursor.row>=this.lastRange.start.row && cursor.row<=this.lastRange.end.row) {
                return;
            }
            this.editor.remove_marker(this.marker);
            clearTimeout(this.timerId);
        },


        editTableCallback: function (range, blockContent) {

            this.editor.getSession().removeMarker(this.previousMarker);

            // this.previousMarker = this.editor.getSession().addMarker(range, 'edittable-highlight');

            this.lastRange = range;


            this.editor.remove_marker(this.marker);

            var context = this;

            clearTimeout(this.timerId);

            if (!this.initializedChangeDetection) {
                this.editor.on('changeCursor', this.changeEditorCallback.bind(this));
                this.initializedChangeDetection = true;
            }


            this.marker = this.editor.add_marker(
                {
                    start_row: range.start.row,

                    start_column: range.start.column,

                    end_row: range.start.row,

                    end_column: range.start.column + 1,

                    klass: 'preview',

                    on_render: function (spec) {
                        var attributes, style, vertical_pos, icon_id;

                        icon_id = Date.now();

                        // vertical_pos = spec.top > spec.screen_height - spec.bottom ? "bottom: "
                        //     + (spec.container_height - spec.top) + "px;" : "top: " + spec.bottom + "px;";
                        style = "right: 25px; top: " + spec.top + "px;";
                        attributes = "class=\"zoom\" style=\"" + style + "\"";
                        attributes += 'data-zoom-icon-id="' + icon_id + '"';


                        context.timerId = setInterval(function() {

                            var $node = jQuery('[data-zoom-icon-id="'+ icon_id+'"]');

                            if ($node.length>0) {

                                var $parent =$node.parent();
                                $parent.css('z-index', 9999);
                                $parent.css('pointer-events', 'auto');

                                clearTimeout(context.timerId);

                                $node.on('click', function (e) {
                                    e.preventDefault();
                                    e.stopPropagation();


                                    // Eliminem el principi i el final
                                    var dokuwikiContent = blockContent.substring(11, blockContent.length - 12);

                                    context._showDialog(dokuwikiContent, range);


                                });

                            }
                        },0.1);


                        return '<div ' + attributes + '><img src="/iocjslib/ioc/gui/img/zoom.png"/></div>';
                    }
                });





        },

        _showDialog: function (value, range) {
            // Alerta, el value ha de ser un objecte JSON amb els valors i la estructura de la taula

            var dialogManager = this.editor.dispatcher.getDialogManager();
            var context = this;

            var saveCallback = function () {

                store.fetch({
                        query: {}, onComplete: function (items) {
                            var dokuwikiTable = context.parseData(items, layout, removedColumns);

                            dokuwikiTable.unshift('<' + context.triggerState + '>');
                            dokuwikiTable.push('</' + context.triggerState + '>');
                            context.editor.replace_lines(range.start.row, range.end.row, dokuwikiTable);

                            context.editor.emit('update', {editor: context.editor.editor});

                        }
                    }
                );

            }.bind(this);

            var cancelCallback = function () {

                dialog.onHide();

            }.bind(this);


            var DIALOG_DEFAULT_HEIGHT = 'auto',
                DIALOG_DEFAULT_WIDTH = 'auto';


            var $container = jQuery('<div>');

            var $toolbar = jQuery('<div>');
            $container.append($toolbar);



            var $fieldsList = jQuery('<ul class="table-editor">');
            $toolbar.append($fieldsList);


            var $idLabel = jQuery('<li><label>ID:</label></li>');
            this.$id= jQuery('<input type="text" />');
            $idLabel.append(this.$id);
            $fieldsList.append($idLabel);

            var $titleLabel = jQuery('<li><label>Títol:</label></li>');
            this.$title = jQuery('<input type="text" />');
            $titleLabel.append(this.$title);
            $fieldsList.append($titleLabel);

            var $footerLabel = jQuery('<li><label>Peu:</label></li>');
            this.$footer = jQuery('<input type="text" />');
            $footerLabel.append(this.$footer);
            $fieldsList.append($footerLabel);


            var $widthsLabel = jQuery('<li><label title="(separades per comes)">Amplades:</label></li>');
            this.$widths = jQuery('<input type="text" />');
            $widthsLabel.append(this.$widths);
            $fieldsList.append($widthsLabel);

            var $typesLabel = jQuery('<li><label title="(separades per comes)">Tipus:</label></li>');
            this.$types = jQuery('<input type="text" />');
            $typesLabel.append(this.$types);
            $fieldsList.append($typesLabel);

            this.numberOfColumns = 0;




            var $buttonsBar = jQuery('<div class="table-editor">');
            $toolbar.append($buttonsBar);

            var $addCol = jQuery('<button><span class="dijit dijitReset dijitInline dijitButton">Afegir columna</span></button>');
            $buttonsBar.append($addCol);

            var $addRow = jQuery('<button><span class="dijit dijitReset dijitInline dijitButton">Afegir fila</span></button>');
            $buttonsBar.append($addRow);


            var $removeCol = jQuery('<button><span class="dijit dijitReset dijitInline dijitButton">Eliminar columna</span></button>');
            $buttonsBar.append($removeCol);

            var $removeRow = jQuery('<button><span class="dijit dijitReset dijitInline dijitButton">Eliminar fila</span></button>');
            $buttonsBar.append($removeRow);


            var $mergeCells = jQuery('<button><span class="dijit dijitReset dijitInline dijitButton">Fusionar cel·les</span></button>');
            $buttonsBar.append($mergeCells);



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
                    removedColumns.push((selection['cols'][col].col + 1));
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
                for (var i = 0; i < context.numberOfColumns; i++) {
                    if (first && removedColumns.indexOf(i) === -1) {
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
                var cell = {
                    name: 'Columna ' + i,
                    field: 'col' + i,
                    editable: true
                };


                if (this.tableType === MULTILINE) {
                    cell.type = cells._Widget;
                    cell.widgetClass = ZoomableCell;
                }


                layout.push(cell);
            }

            var formatterCallback = function (value, rowIndex, cell) {
                // TODO[Xavi] en lloc de comprovar el contingut es podria cercar l'element a l'store i comprovar si es merge o no i substituir el contingut.

                if (!value || value === "undefined") {
                    value = '';
                }


                if (value === '^^^' || value === '<<<' || value === '&lt;&lt;&lt;') {
                    value = '<i>' + value + '</i>';
                    // cell.editable = false;
                }

                return value;
            };

            var defaultCell = {
                width: '100px',
                editable: true,
                formatter: formatterCallback
                // cellType: dojox.grid.cells.Select,
                // options: ['aaa', 'bbb', 'ccc'],
                // type:dojox.grid.cells._Widget,
                // widgetClass: dijitTextarea,
            };

            if (this.tableType === MULTILINE) {
                defaultCell.type = cells._Widget;
                defaultCell.widgetClass = ZoomableCell;
            }



            var oldGrid = registry.byId('grid');

            if (oldGrid) {
                // console.log("Destruit el grid anterior");
                oldGrid.destroyRecursive();
            }

            var grid = new EnhancedGrid({
                id: 'grid',
                store: store,
                structure: [{
                    defaultCell: defaultCell,
                    cells: layout
                }],
                rowSelector: '20px',
                autoHeight: 'true',
                autoWidth: 'true',
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

            // ALERTA[Xavi] Sobreescrita de _EditManager.js y duplicada del EditableTalbeElements. Això es imprescindible perque funcioni el dialeg!
            grid.edit.apply= function(){

                if (jQuery(document.activeElement).hasClass('ace_text-input')) {
                    // console.log("És un dialeg, no fem res");
                    return;
                }

                // summary:
                //		Apply a grid edit
                if(this.isEditing() && this._isValidInput()){
                    this.grid.beginUpdate();
                    this.editorApply();
                    this.applyRowEdit();
                    this.info = {};
                    this.grid.endUpdate();
                    this.grid.focus.focusGrid();
                    this._doCatchBoomerang();
                }
            };

            grid.onHeaderCellDblClick = function (e){
                var nouHeader = prompt("Introdueix el nom de la capçalera:", e.cell.name); // TODO: Localitzar
                if (nouHeader === null) {
                    return;
                }
                layout[e.cellIndex].name = nouHeader;
                jQuery(e.cellNode).html(nouHeader);
            };


            // ALERTA[Xavi]No sembla posible cridar al parent d'aquesta funció ni guardan't
            // la original ni cridant al inherited. Així que he copiat el codi original (de dojox/grid/_Events.js)
            grid.onCellDblClick = function(e) {
                var value = jQuery(e.cellNode).html();

                if (value === '<i>^^^</i>' || value === '<i>&lt;&lt;&lt;</i>') {
                    return;
                } else {
                }

                // summary:
                //		Event fired when a cell is double-clicked.
                // e: Event
                //		Decorated event object contains reference to grid, cell, and rowIndex
                var event;
                if(this._click.length > 1 && has('ie')){
                    event = this._click[1];
                }else if(this._click.length > 1 && this._click[0].rowIndex != this._click[1].rowIndex){
                    event = this._click[0];
                }else{
                    event = e;
                }
                this.focus.setFocusCell(event.cell, event.rowIndex);
                this.edit.setEditCell(event.cell, event.rowIndex);
                this.onRowDblClick(e);

            };

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


            // Establim els valors inicials de les opcions
            // this.$tableType.val(this.parsedData.meta.table_type);
            this.$id.val(this.parsedData.meta.id);
            this.$title.val(this.parsedData.meta.title);
            this.$footer.val(this.parsedData.meta.footer);
            this.$types.val(this.parsedData.meta.types);
            this.$widths.val(this.parsedData.meta.widths)


        },

        /**
         * Métode que converteix la informació del grid en línies de codi wiki
         *
         * @param items
         * @param layout
         * @param removedColumns
         * @returns {Array}
         */
        parseData: function (items, layout, removedColumns) {

            // console.log(items, layout, removedColumns);


            var lines = [];

            // Construim la caixa
            lines.push("::" + (this.tableType === 'accounting' ? 'accounting' : 'table') + ":" + this.$id.val());


            if (this.$title.val().length > 0) {
                lines.push("  :title:" + this.$title.val());
            }

            if (this.$footer.val().length > 0) {
                lines.push("  :footer:" + this.$footer.val());
            }

            if (this.$widths.val().length > 0) {
                lines.push("  :widths:" + this.$widths.val());
            }

            if (this.$types.val().length > 0) {
                lines.push("  :type:" + this.$types.val());
            }

            // if (this.tableType === MULTILINE) {
            //     lines.push("  :type:" + this.$tableType.val());
            // }


            var header = "";
            var first = true;

            // Construim la capçalera //

            for(var i=0; i<this.numberOfColumns; i++) {

                if (removedColumns.indexOf(i+1) !== -1) {
                    continue; // Columna eliminada
                }

                if (first) {
                    first = false;
                    if (this.tableType === MULTILINE) {
                        header += "[";
                    }
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


                    var cellContent = items[i]['col' + j]? items[i]['col' + j][0] : '';

                    if (typeof cellContent === 'string') {
                        cellContent = cellContent.split(new RegExp('\\n', 'g')).join('\\\\ ');
                    }


                    line += "| " + cellContent;

                }

                if (addSpaceOnFinishLine) {
                    line += " |";
                } else {
                    line += "|";
                }

                lines.push(line);
            }


            if (this.tableType === MULTILINE) {
                lines[lines.length - 1] += "]";
            }


            // Tanquem la caixa
            lines.push(":::");

            return lines;
        },


        parseContentData: function (content) {

            var lines = content.split("\n");
            this.parsedData = this.parseContentLines(lines);

            return {
                data: {
                    identifier: "id",
                    items: this.parsedData.rows
                },
                layout: this.parsedData.columns,
                length: this.parsedData.rows.length
            };
        },

        parseContentLines: function (lines) {


            var parsedLines = {
                columns: [],
                rows: [],
                meta: {
                    id:"",
                    title: "",
                    footer: "",
                    types: "",
                    widths: "",
                    table_type: NORMAL
                }
            };

            var rowsCounter = 0;
            var columns = 0;

            if (!this.tableType) {
                this.tableType = NORMAL;
            }


            for (var i = 0; i < lines.length; i++) {

                // Determinem si es una taula multilínia
                if (lines[i].startsWith('[')) {
                    this.tableType = MULTILINE;
                    lines[i] = lines[i].substr(1);
                }


                // Descartem el caràcter de tancament, no es necessari
                if (lines[i].endsWith(']')) {
                    lines[i] = lines[i].slice(0, -1);
                }

                if (lines[i].startsWith(':::')) {
                    // Es tanca la taula
                    continue;
                } else if (lines[i].startsWith('::table:')) {
                    parsedLines.meta.id= lines[i].replace('::table:', '').trim();
                } else if (lines[i].startsWith('  :title:')) {
                    parsedLines.meta.title = lines[i].replace('  :title:', '').trim();
                } else if (lines[i].startsWith('  :footer:')) {
                    parsedLines.meta.footer = lines[i].replace('  :footer:', '').trim();
                } else if (lines[i].startsWith('  :widths:')) {
                    parsedLines.meta.widths = lines[i].replace('  :widths:', '').trim();
                } else if (lines[i].startsWith('  :type:')) {
                    parsedLines.meta.types = lines[i].replace('  :type:', '').trim();
                } else if (lines[i].startsWith('::accounting:')) {
                    this.tableType = ACCOUNTING;
                // } else if (lines[i].startsWith('::table:')) {
                //     parsedLines.meta.table_type = NORMAL;

                } else if (lines[i].startsWith('^')) {

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
                } else {
                    console.warn("Línia no processada:", lines[i]);
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
                value = value.split('\\\\ ').join("\n");


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


            // ALERTA! Si es fa servir això es descarta el tipus de cel·la personalitzat


            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].length === 0) {
                    if (i === 0 || i === tokens.length - 1) { // El principi i el final sempre son buits
                        continue;
                    }
                }

                var cell = {
                    name: tokens[i].trim(),
                    field: 'col' + (cols + 1),
                    // 'width': '100px',
                    // 'editable': true,
                    // 'formatter': formatterCallback,

                };


                if (this.tableType === MULTILINE) {
                    cell.type = cells._Widget;
                    cell.widgetClass = ZoomableCell;
                }


                layout.push(cell);
                cols++;
            }

            // S'inicialitza aquí perquè abans no sabem la mida real del layout
            this.numberOfColumns = layout.length;
            this.maxColumns = layout.length + MAX_EXTRA_COLUMNS;


            return layout;
        },


    });

});