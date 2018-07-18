define([
    'dojo/_base/declare',
    'ioc/gui/content/EditableElements/AbstractEditableElement',
    "dojox/grid/DataGrid",
    "dojox/grid/cells",
    "dojox/grid/cells/dijit",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "dijit/form/Button",
    "dojox/grid/_Events",
    // "dijit/form/Textarea"
    "ioc/gui/content/EditableElements/ZoomableCell"

], function (declare, AbstractEditableElement, DataGrid, cells, cellsDijit, Memory, ObjectStore, Button, GridEvents, ZoomableCell) {

    return declare([AbstractEditableElement],
        {
            defaultRow: null,

            init: function (args) {
                // console.log("EditableTableElement#init", args);
                this.inherited(arguments);
                this.fieldToCol = {};
                // this.defaultDisplay = 'table';


            },

            _replaceNodeContent: function (args) {

                if (args.defaultRow) {
                    this.defaultRow = args.defaultRow;
                } else {
                    this.defaultRow = {};
                }

                this.inherited(arguments);
            },

            // ALERTA! De moment només canvia aquest, la resta es igual, es pot moure cap amun en la jerarquia.
            createWidget: function () {

                var tableData = this.htmlToJson(this.$node);
                this.columns = tableData.columns;
                this.args.id = ('' + Date.now() + Math.random()).replace('.', '-'); // id única

                console.log("Format de les columnes:", tableData.columns);
                console.log("Contingut de this.args?", this.args);

                var args = this.args;

                var $container = jQuery('<div id="grid_container"></div>');


                // Movem l'estil de la taula al contenidor;
                this.$container.parent().addClass('element-container');
                this.$container.parent().addClass(this.$node[0].className);
                this.$node.removeClass(this.$node[0].className);

                this.$field = jQuery('<input type="hidden" name="' + args.name + '" id="' + args.name + '"/>');

                if (args.formId) {
                    this.$field.attr('form', args.formId);
                }

                $container.append(this.$field);

                this.$editableNode.css('display', 'block'); // S'ha de fer visible abans de crear el grid o l'alçada es 0.


                var $toolbar = jQuery('<div></div>');
                $container.append($toolbar);

                this.$editableNode.append($container);

                var width = 100 / tableData.columns.length;

                var gridLayout = [{
                    defaultCell: {
                        width: width + "%",
                        editable: true,
                        // cellType: dojox.grid.cells.Select,
                        // options: ['aaa', 'bbb', 'ccc'],
                        // type: cells._Widget,
                        //widgetClass: dijitTextarea,
                        styles: 'text-align: left;'
                    },
                    cells: tableData.columns
                }];


                if (this.args.layout) {
                    gridLayout = this.mergeLayout(gridLayout, this.args.layout);
                    this.columns = gridLayout[0].cells;
                }


                console.log("gridLayout final:", gridLayout);

                this.setupCells(gridLayout[0]);

                var objectStore = new Memory({data: tableData.rows});
                this.dataStore = new ObjectStore({objectStore: objectStore});
                this.backupData = jQuery.extend(true, {}, tableData.rows);


                //var height = Math.max(500, (tableData.rows.length * 30));

                var rows = tableData.rows.length;

                if (this.args.data.rows) {
                    // rows = Math.max(this.args.data.rows, rows);
                    rows = this.args.data.rows;

                }

                var height = 36 + (rows * 24);

                var grid = new DataGrid({
                    store: this.dataStore,
                    structure: gridLayout,
                    escapeHTMLInData: false,
                    //height: "500px"
                    height: height + 'px', // la alçada de cada fila


                });

                // Sobreescrita de _EditManager.js
                grid.edit.apply = function () {

                    if (jQuery(document.activeElement).hasClass('ace_text-input')) {
                        // console.log("És un dialeg, no fem res");
                        return;
                    }

                    // summary:
                    //		Apply a grid edit
                    if (this.isEditing() && this._isValidInput()) {
                        this.grid.beginUpdate();
                        this.editorApply();
                        this.applyRowEdit();
                        this.info = {};
                        this.grid.endUpdate();
                        this.grid.focus.focusGrid();
                        this._doCatchBoomerang();
                    }
                }


                // grid.onApplyCellEdit = function(inValue,inRowIndex,inFieldIndex) {
                //     this.inherited(arguments);
                //     console.log("Canvis aplicats a la cel·la");
                // };

                this.grid = grid;

                // grid.onApplyCellEdit = function(inValue, inRowIndex, inFieldIndex) {
                //     console.log("Canvis detectats: ", inValue, inRowIndex, inFieldIndex);
                // };


                grid.placeAt($container[0]);
                grid.startup();

                // AFEGIR Buttons
                var context = this;


                grid.on("ApplyCellEdit", function (e) {
                    console.log("Canvis detectats: ", e);
                    context.updateField();
                });

                var addKeyButton = new Button({
                    label: "Afegir clau",

                    onClick: function () {

                        var key = prompt("Introdueix la clau:");

                        if (!key || key.length === 0) {
                            return;
                        }

                        var data = {
                            id: objectStore.data.length,
                            col0: key
                        };


                        for (var name in context.defaultRow) {
                            if (name === 'key') {
                                continue;
                            }
                            data[context.fieldToCol[name]] = context.defaultRow[name];

                        }
                        context.dataStore.newItem(data);

                        //console.log("Afegides noves dades", context.dataStore);

                        // ALERTA[Xavi] Un cop es desa ja no es pot fer revert, hem d'implementar el nostre propi revert
                        context.dataStore.save();
                        context.updateField();
                    }
                });
                addKeyButton.placeAt($toolbar[0]);
                addKeyButton.startup();


                var removeKeyButton = new Button({
                    label: "Eliminar clau",

                    onClick: function () {

                        var selected = context.grid.selection.getSelected();


                        var confirmation = confirm("Segur que vols eliminar les files seleccionades? (" + selected.length + ")");

                        if (!confirmation) {
                            return;
                        }

                        for (var i = 0; i < selected.length; i++) {
                            context.dataStore.deleteItem(selected[i]);
                        }

                        context.dataStore.save();
                        context.updateField();


                    }
                });
                removeKeyButton.placeAt($toolbar[0]);
                removeKeyButton.startup();


                this.updateField();
                this.widgetInitialized = true;
            },

            // Copia els paràmetres de configuració a la cel·la
            setupCells: function (layout) {

                if (!this.args.fields) {
                    return;
                }

                for (var i in layout.cells) {
                    var cell = layout.cells[i];

                    if (this.args.fields && this.args.fields[cell.name]) {

                        var field = this.args.fields[cell.name];

                        // Els cellType estan definits com propietats a dojox/grid/cells/_Base.js

                        switch (field['type']) {
                            case 'select':
                                cell.type = dojox.grid.cells.Select;
                                cell.options = field['options'] || ['Error. No options added to default view'];
                                break;

                            case 'textarea':
                                cell.type = cells._Widget;
                                cell.widgetClass = ZoomableCell;
                                break;

                            case 'bool':
                                cell.type = dojox.grid.cells.Bool;
                                break;

                            default:
                                cell.type = cells._Widget;
                        }

                    }
                }
            },


            revert: function () {
                // console.log("Revert!");
                var data = jQuery.extend(true, {}, this.backupData);
                // var objectStore = new Memory({data: data});
                // this.dataStore = new ObjectStore({objectStore: objectStore});
                var store = this.dataStore;

                store.fetch({
                    query: {id: "*"}, onComplete: function (results) {
                        results.forEach(function (i) {
                            store.deleteItem(i);

                        })

                    }
                });

                for (var i in data) {
                    this.dataStore.newItem(data[i]);
                }

                this.dataStore.save();
                this.grid.update();

            },
            saveToField: function () {
                this.backupData = jQuery.extend(true, {}, this.dataStore.objectStore.data);

                // console.log(this.backupData);
                // console.log("Save!");

                this.jsonToHTML(this.backupData);
                this.updateField();

                this.dataStore.save();

            },

            htmlToJson: function ($table) {

                var data = {
                    columns: [],
                    rows: []
                };


                var $rows = $table.find('tr');
                var $columns = jQuery($rows[0]).children();

                // La primera columna són les capçáleres
                for (var i = 0; i < $columns.length; i++) {

                    var fieldData = {
                        name: jQuery($columns[i]).text(),
                        field: 'col' + i,
                        editable: jQuery($columns[i]).attr('readonly') === undefined,
                        //formatter:,
                        //constraint:,

                    };

                    data.columns.push(fieldData);

                    this.fieldToCol[fieldData.name] = fieldData.field;
                }

                // Extraiem les dades de la resta de files
                for (i = 1; i < $rows.length; i++) {
                    $columns = jQuery($rows[i]).children();
                    var row = {id: i - 1};

                    for (var j = 0; j < $columns.length; j++) {
                        row['col' + j] = jQuery($columns[j]).text();
                    }
                    data.rows.push(row);
                }

                return data;
            },


            jsonToHTML: function (data) {
                var $table = this.$node.find('tbody');
                $table.html("");

                // console.log(data);


                var cols = this.columns.length;

                for (var i in data) {

                    var $row = jQuery("<tr>");

                    for (var j = 0; j < cols; j++) {
                        var $col;
                        if (!this.columns[j].editable) {
                            $col = jQuery('<th>');
                        } else {
                            $col = jQuery('<td>');
                        }
                        $col.text(data[i]["col" + j]);

                        $row.append($col);
                    }

                    $table.append($row);
                }
            },

            show: function () {
                this.inherited(arguments);

                this.grid.update();
                this.$icon.css('display', 'none');

            },

            hide: function () {
                this.inherited(arguments);

                if (this.$icon) {
                    this.$icon.css('display', 'block');
                }


            },


            updateField: function () {
                var data = [];

                var updatedData = this.dataStore.objectStore.data;

                for (var i = 0; i < updatedData.length; i++) {
                    var newItem = {};

                    for (var j = 0; j < this.columns.length; j++) {
                        // console.log(this.columns[j],updatedData[i]);
                        newItem[this.columns[j].name] = updatedData[i][this.columns[j].field];
                    }

                    data.push(newItem);
                }

                this.$field.val(JSON.stringify(data));

                if (this.context.forceCheckChanges) {
                    this.context.forceCheckChanges();
                }
                //console.log("Rebuilt item:", data);

            },

            restoreFromField: function () {
                console.log("Contingut del field: ", this.$field.val());
                alert("TODO: implementar");
            },

            mergeLayout: function (generatedLayout, configLayout) {
                if (!configLayout || !Array.isArray(configLayout)) {
                    console.warn("DefaultView invalid layout config:", configLayout);
                    return generatedLayout;
                }

                var mergedLayout = [];

                for (var i = 0; i < configLayout.length; i++) {
                    if (generatedLayout.length < i) {
                        mergedLayout.push(configLayout[i]);
                        continue;
                    }

                    var layout = {};

                    if (configLayout[i].defaultCell) {
                        layout.defaultCell = configLayout[i].defaultCell;
                    }

                    layout.cells = this.mergeCells(generatedLayout[i].cells, configLayout[i].cells);


                    mergedLayout.push(layout);


                }



                return mergedLayout;

            },

            mergeCells: function (generatedCells, configCells) {

                if (!generatedCells && configCells) {
                    return configCells;
                } else if (!generatedCells && !configCells) {
                    return [];
                }


                var cells = [];

                // Eliminamos de generatedCells las que se encuentren con el mismo name en configCells

                for (var i = 0; i < generatedCells.length; i++) {

                    if (!this.isCellInLayout(generatedCells[i], configCells)) {
                        cells.push(generatedCells[i]);
                    }

                }

                for (var i = 0; i < configCells.length; i++) {
                    configCells[i].field =  this.fieldToCol[configCells[i].name];

                    cells.push(configCells[i]);
                }

                cells.sort(function(a, b) {
                    return (Number(a.field.replace('col','')) - Number(b.field.replace('col','')));
                });

                return cells;
            },

            isCellInLayout(cell, layout) {
                for (var i = 0; i < layout.length; i++) {
                    if (layout[i].name === cell.name) {
                        return true;
                    }
                }

                return false;
            }



        });


});
