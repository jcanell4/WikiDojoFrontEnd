define([
    'dojo/_base/declare',
    'ioc/gui/content/EditableElements/AbstractEditableElement',
    "ioc/store/IocDataGrid",
    // "dojox/grid/DataGrid",
    "dojox/grid/cells",
    "dojox/grid/cells/dijit",
    "ioc/store/IocMemory",
    "ioc/store/IocObjectStore",
    // "dojo/store/Memory",
    // "dojo/data/ObjectStore",
    "dijit/form/Button",
    "dojox/grid/_Events",
    // "dijit/form/Textarea"
    // "dijit/form/NumberTextBox",
    "dijit/form/NumberSpinner", // això fa el mateix que el NumberTextBox però afegint les fletxes
    "ioc/gui/content/EditableElements/ZoomableCell"

], function (declare, AbstractEditableElement, DataGrid, cells, cellsDijit, Memory, ObjectStore, Button, GridEvents, NumberTextBox, ZoomableCell) {

    var ADD_ROW = "add_row",
        ADD_DEFAULT_ROW = "add_default_row",
        ADD_DEFAULT_ROW_BEFORE = "add_default_row_before",
        ADD_DEFAULT_ROW_AFTER = "add_default_row_after",
        ADD_MULTIPLE_DEFAULT_ROWS = "add_multiple_default_rows",
        SET_MULTIPLE_DEFAULT_ROWS = "set_multiple_default_rows",
        REMOVE_ROWS = "remove_rows";

    var DATA_STORE_PATTERN = 'yyyy/MM/dd';
    var DATA_DISPLAY_PATTERN = 'dd/MM/yyyy';

    var defaultActions = {
        ADD_DEFAULT_ROW: "Afegir fila",
        REMOVE_ROWS: "Eliminar fila"
    };


    // TODO: si augmenta el nombre de funcions s'ha d'extreure a un mòdul
    var wiocclFunctions = {

        copy: function (defaultValue, previousField) {
            var ret;
            
            if (!previousField) {
                console.warn("No s'ha trobat el valor previ del camp");
                return defaultValue;
            }
            
            return previousField;
        },
        inc: function (defaultValue, previousField) {
            var ret;
            
            if (!previousField) {
                console.warn("No s'ha trobat el valor previ del camp");
                return defaultValue;
            }

            if(typeof previousField == "string"){
                var numberRegex = /(\d)+/gi;
                var matches = previousField.match(numberRegex);
                if (matches != null) {
                    ret = Number(matches[0]) + 1;
                } else {
                    ret = defaultValue;
                }
            }else if(typeof previousField == "number"){
                ret = previousField + 1;
            }else{
                ret = defaultValue;
            }
            
            return ret;
        },

        today: function () {
            return dojo.date.locale.format(new Date(), {
                selector: 'date',
                datePattern: DATA_STORE_PATTERN
            });
        }

    };

    return declare([AbstractEditableElement],
        {
            defaultRow: null,

            init: function (args) {
                // console.log("EditableTableElement#init", args);
                this.inherited(arguments);
                this.fieldToCol = {};
                this.colToField = {};
                this.colToName = {};

                // this.defaultDisplay = 'table';

                this.initializeCallbacks()

            },

            initializeCallbacks: function () {
                this.actionCallbacks = {};

                this.actionCallbacks[ADD_ROW] = this._addRowCallback.bind(this);
                this.actionCallbacks[ADD_DEFAULT_ROW] = this._addDefaultRowCallback.bind(this);
                this.actionCallbacks[ADD_DEFAULT_ROW_AFTER] = this._addDefaultRowAfterCallback.bind(this);
                this.actionCallbacks[ADD_DEFAULT_ROW_BEFORE] = this._addDefaultRowBeforeCallback.bind(this);
                this.actionCallbacks[ADD_MULTIPLE_DEFAULT_ROWS] = this._addMultipleDefaultRowsCallback.bind(this);
                this.actionCallbacks[SET_MULTIPLE_DEFAULT_ROWS] = this._setMultipleDefaultRowsCallback.bind(this);
                this.actionCallbacks[REMOVE_ROWS] = this._removeRowCallback.bind(this);
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

                var args = this.args;

                var $container = jQuery('<div id="grid_container"></div>');

                if (this.args.data.props) {
                    var props = this.args.data.props;
                    for (var prop in props) {
                        switch (prop) {
                            case "accesskey":
                            case "contenteditable":
                            case "dir":
                            case "draggable":
                            case "dropzone":
                            case "hidden":
                            case "id":
                            case "lang":
                            case "spellcheck":
                            case "style":
                            case "tabindex":
                            case "title":
                            case "translate":
                                $container.attr(prop, props[prop]);
                                break;
                            default :
                        }
                    }
                }

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
                this.$container.parent().css('display', 'block'); // S'ha de fer visible abans de crear el grid o l'alçada es 0.


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

                //console.log("gridLayout final:", gridLayout);

                this.setupCells(gridLayout[0]);

                this.objectStore = new Memory({data: tableData.rows});

                this.dataStore = new ObjectStore({objectStore: this.objectStore});
                this.backupData = jQuery.extend(true, {}, tableData.rows);


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
                    // height: "500px",
                    height: height + 'px', // la alçada de cada fila

                });


                // Alerta[Xavi]: el DataGrid te un bug i no permet fer scroll a l'última fila. La solució ha estat
                // afegir 25 punts a l'scroll, això actualment no afecta a la aplicació perquè no es contempla
                // la opció de fer scroll a una fila en concret.
                // Com que la gestió de l'scroll es realitza mitjançant la classe _Scroller.js desde la super classe
                // _Grid.js he sobreescrit la funció concreta aquí:

                grid.scroller.scroll = function (inTop) {
                    this.grid.scrollTop = inTop + 25;
                    if (this.colCount) {
                        this.startPacify();
                        this.findPage(inTop);
                        var h = this.height;
                        var b = this.getScrollBottom(inTop);
                        for (var p = this.page, y = this.pageTop; (p < this.pageCount) && ((b < 0) || (y < b)); p++) {
                            y += this.needPage(p, y);
                        }
                        this.firstVisibleRow = this.getFirstVisibleRow(this.page, this.pageTop, inTop);
                        this.lastVisibleRow = this.getLastVisibleRow(p - 1, y, b);
                        // indicates some page size has been updated
                        if (h != this.height) {
                            this.repositionPages(p - 1);
                        }
                        this.endPacify();
                    }
                };

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
                };


                // grid.focus.focusGrid = function() {console.log("focusGrid")}; // aquesta es crida quan es fa doble click
                grid.focus.focusGridView = function () {
                }; // Aquesta funció l'unic que fa es disparar l'esdeveniment 'focus' i es el que provoca el desplaçament de les cel·les


                // grid.views.getFirstScrollingView = function() {
                //     console.log("getFirstScrollingView");
                //     return null;
                // };


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

                grid.on("ApplyCellEdit", function (e) {
                    this.updateField();
                }.bind(this));


                var actions = this.args.actions ? this.args.actions : defaultActions;
                this.initializeButtons(actions, $toolbar[0]);

                this.updateField();
                this.widgetInitialized = true;
            },

            initializeButtons: function (actions, toolbarNode) {

                for (var action in actions) {
                    this.initializeButton(actions[action], toolbarNode, this.actionCallbacks[action]);
                }

            },

            initializeButton: function (label, toolbarNode, callback) {
                var button = new Button({
                    label: label,
                    onClick: callback
                });
                button.placeAt(toolbarNode);
                button.startup();
            },


            parseRow: function (row) {
                var newRow = {};

                var lastRow;

                if (this.dataStore.objectStore.data.length > 0) {
                    lastRow = this.dataStore.objectStore.data[this.dataStore.objectStore.data.length - 1];
                }

                var fieldRegex = /{#(.*?)#}/g;

                for (var name in row) {
                    newRow[name] = row[name] + "";

                    var tokens = newRow[name].match(fieldRegex);

                    if (tokens === null) {
                        continue;
                    } else if (tokens.length > 1) {
                        console.warn("Alerta, només es processarà un token:", tokens[0]);
                    }

                    // Extraïem la funció
                    var functionRegex = /{#_(.*?)\((.*?)\)_#}/g;
                    var functionTokens = functionRegex.exec(tokens[0]);

                    // El primer token és el nom de la funció
                    var func = functionTokens[1].toLowerCase();

                    // El segón token conté els paràmetres
                    var params = functionTokens[2];

                    var value;


                    switch (func) {
                        case 'copy':
                        case 'inc':

                            // Si hi ha una fila anterior cerquem el valor anterior
                            if (lastRow) {
                                value = wiocclFunctions[func](params[0], lastRow[this.fieldToCol[name]]);
                            } else {
                                // El paràmetre és el valor per defecte per la primera fila
                                value = params[0];
                            }

                            break;

                        default:
                            if (wiocclFunctions[func]) {
                                value = wiocclFunctions[func](params);
                            } else {
                                console.error("Function: unknown", params);
                            }
                    }

                    newRow[name] = newRow[name].replace(fieldRegex, value);

                }

                return newRow;
            },


            /**
             *
             * @param <Object>|Array<Object>|null keyPairs si no hi ha cap valor es faran servir els valors per defecte.
             * Si hi ha valors es faran servir aquests valors per les claus indicades y el default per a la resta.
             *
             * @param <Object> options objecte amb les opcions {before: {id: number} | after: {id: number}} on number és
             * l'index de la fila.
             *
             * @private
             */
            addRow: function (keyPairs, options) {

                this.grid.addingRow = true;

                this.dataStore.save(); // Desem els canvis actuals al grid (cel·les editades)

                var data = {
                    id: this.objectStore.getUniqueId(),
                };

                // console.log("Valor de la taula", this.args.data.value);

                var parsedRow = this.parseRow(this.defaultRow);

                for (var name in parsedRow) {
                    var field = this.args.fields[name];

                    if (keyPairs && keyPairs[name]) {
                        data[this.fieldToCol[name]] = keyPairs[name];

                    } else if (field.type && field.type === "date" && !parsedRow[name]) {
                        data[this.fieldToCol[name]] = dojo.date.locale.format(new Date(), {
                            selector: 'date',
                            datePattern: DATA_STORE_PATTERN
                        });

                        // dojo.date.locale.format(new Date(), {selector:'date', datePattern:DATA_DISPLAY_PATTERN})
                    } else {
                        data[this.fieldToCol[name]] = parsedRow[name];
                    }
                }

                // Afegim la fila als valors originals
                var originalValue;
                if (typeof  this.args.data.value == "string") {
                    if (0 == this.args.data.value.length) {
                        originalValue = [];
                    } else {
                        originalValue = JSON.parse(this.args.data.value);
                    }
                } else {
                    originalValue = this.args.data.value;
                }
                originalValue.push(parsedRow);
                this.args.data.value = originalValue;

                this.dataStore.newItem(data);

                if (options) {
                    this.dataStore.save({options: options});
                } else {
                    this.dataStore.save();
                }

                this.grid._refresh();

                this.updateField();

                if (!options || (!options.after && !options.before)) {
                    this.grid.scrollToRow(this.grid.rowCount);
                }

                this.grid.addingRow = false;
            },

            addRowAfter: function (data) {
                this.addRow(data, {
                    after: {
                        id: this.grid.selection.selectedIndex
                    }
                });
            },

            addRowBefore: function (data) {
                this.addRow(data, {
                    before: {
                        id: this.grid.selection.selectedIndex
                    }
                });
            },

            _addRowCallback: function () {

                var value;
                var data = {};

                for (var key in this.inputOnNewRowFields) {

                    do {
                        value = prompt("Introdueix el valor pel camp " + key + ":");
                        if (value.length === 0) {
                            alert("El valor no pot ser buit");
                        }
                    } while (value.length === 0);

                    data[key] = value;
                }

                this.addRow(data);
            },

            _addDefaultRowCallback: function () {
                this.addRow();
            },

            _addDefaultRowAfterCallback: function () {
                this.addRowAfter();
            },

            _addDefaultRowBeforeCallback: function () {
                this.addRowBefore();
            },

            _setMultipleDefaultRowsCallback: function () {

                var quantity;
                var ok = true;
                do {
                    quantity = Number(prompt("Introdueix el nombre de files a afegir:"));
                    if (isNaN(quantity) || quantity < 1) {
                        alert("El nombre de files ha de ser un nombre igual o superior a 1.");
                    }
                } while (isNaN(quantity) || quantity < 1);

                ok = this.objectStore.data.length < quantity;
                if (ok) {
                    this.setRows(quantity);
                } else if (this.objectStore.data.length > quantity) {
                    alert("Aquesta acció només permet incrementar el nombre de files. Per reduir-les, selecciona les que desitgis eliminar i prem el botó corresponent.");
                } else {
                    alert("Has indicat el nombre de files que ja hi ha. No es realitzarà cap canvi.");
                }
            },

            _addMultipleDefaultRowsCallback: function () {

                var quantity;

                do {
                    quantity = Number(prompt("Introdueix el nombre de files a afegir:"));
                    if (isNaN(quantity) || quantity < 1) {
                        alert("El nombre de files ha de ser un nombre igual o superior a 1.");
                    }
                } while (isNaN(quantity) || quantity < 1);

                this.addRows(quantity);

            },

            setRows: function (quantity) {
                if (this.objectStore.data.length < quantity) {
                    for (var i = this.objectStore.data.length; i < quantity; i++) {
                        this.addRow();
                    }
                } else if (this.objectStore.data.length > quantity) {
                    alert("Aquesta acció només permet incrementar el nombre de files. No pas reduir-lo.")
                }
            },
            addRows: function (quantity) {

                for (var i = 0; i < quantity; i++) {
                    this.addRow();
                }

            },

            _removeRowCallback: function () {

                var selected = this.grid.selection.getSelected();
                if (selected.length === 0) {
                    return;
                }

                var suffix = selected.length > 1 ? "es" : "a";
                var confirmation = confirm("Segur que vols eliminar les fil" + suffix + " seleccionad"
                    + suffix + "? (" + selected.length + " fil" + suffix + ")");

                if (!confirmation) {
                    return;
                }

                this.removeRows(selected);

            },

            removeRows: function (indexes) {
                indexes.sort(function (a, b) {
                    return b - a;
                });


                var originalValues = this.args.data.value;

                for (var i = 0; i < indexes.length; i++) {
                    this.dataStore.deleteItem(indexes[i]);

                    // Eliminem segons el seu index de major a menor
                    originalValues.splice(indexes[i], 1);

                }
                this.args.data.value = originalValues;

                this.dataStore.save();

                this.updateField();
            },

            // Copia els paràmetres de configuració a la cel·la
            setupCells: function (layout) {

                this.inputOnNewRowFields = {};

                if (!this.args.fields) {
                    return;
                }

                for (var i in layout.cells) {
                    var cell = layout.cells[i];

                    if (this.args.fields && this.args.fields[cell.name]) {

                        var field = this.args.fields[cell.name];

                        // Els cellType estan definits com propietats a dojox/grid/cells/_Base.js

                        switch (field['type']) {
                            case 'date':


                                cell.type = dojox.grid.cells.DateTextBox;
                                cell.getValue = function () {
                                    // Override the default getValue function for dojox.grid.cells.DateTextBox
                                    return dojo.date.locale.format(this.widget.get('value'), {
                                        selector: 'date',
                                        datePattern: DATA_STORE_PATTERN
                                    });
                                };
                                cell.formatter = function (datum) {

                                    // Format the value in store, so as to be displayed.
                                    var d = !datum ? (new Date()) : dojo.date.locale.parse(datum, {
                                        selector: 'date',
                                        datePattern: DATA_STORE_PATTERN
                                    });
                                    return dojo.date.locale.format(d, {
                                        selector: 'date',
                                        datePattern: DATA_DISPLAY_PATTERN
                                    });
                                };
                                break;
                            case 'number':
                                cell.type = cells._Widget;
                                cell.widgetClass = NumberTextBox;
                                break;
                            case 'select':
                                cell.type = dojox.grid.cells.Select;
                                cell.options = field['options'] || ['Error. No options added to default view'];
                                break;

                            case 'textarea':
                                cell.type = cells._Widget;
                                cell.widgetClass = ZoomableCell;
                                break;

                            case 'boolean':
                            case 'bool':
                                cell.type = dojox.grid.cells.Bool;
                                break;

                            default:
                                cell.type = cells._Widget;
                        }

                        if (field["input_on_new_row"] === true) {
                            this.inputOnNewRowFields[cell.name] = this.args.fields[cell.name];
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
                // Això pot passar si no s'ha carregat encara el mode d'edició
                if (!this.dataStore) {
                    return;
                }

                this.backupData = jQuery.extend(true, {}, this.dataStore.objectStore.data);

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
                        editable: jQuery($columns[i]).attr('readonly') === undefined
                    };

                    data.columns.push(fieldData);

                    var field = jQuery($columns[i]).attr('data-field');


                    this.fieldToCol[field] = fieldData.field;
                    this.colToField[fieldData.field] = field;


                    // this.fieldToCol[fieldData.name] = fieldData.field;
                    //this.colToField[fieldData.field] = fieldData.name;


                    this.colToName[fieldData.field] = jQuery($columns[i]).attr('data-field-name') || fieldData.name;
                }

                // ALERTA! ens hem d'asegurar que al abstractFormRenderEngine s'afegeixen files buides si és necessari.

                var numColumns = $columns.length;

                // Extraiem les dades de la resta de files
                for (i = 1; i < $rows.length; i++) {
                    $columns = jQuery($rows[i]).children();
                    var row = {id: i - 1};

                    for (var j = 0; j < numColumns; j++) {

                        // Cerquem la columna corresponent al camp
                        var field = jQuery($columns[j]).attr('data-field');
                        var colKey = this.fieldToCol[field];

                        // var colKey = 'col' + j;
                        var key = this.colToField[colKey];


                        row[colKey] = this.normalizeValueForKey(key, jQuery($columns[j]).attr("data-originalvalue")) || '';

                    }

                    data.rows.push(row);
                }


                return data;
            },

            normalizeValueForKey: function (key, value) {
                var normalizedValue;
                var type = this.args.fields[key] ? this.args.fields[key].type : '';

                switch (type) {
                    case 'bool':
                    case 'boolean':
                        normalizedValue = value === true || value === "true";
                        break;

                    default:
                        normalizedValue = value;

                }

                return normalizedValue;
            },


            jsonToHTML: function (data) {
                var $table = this.$node.find('tbody');
                $table.html("");

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

                if (this.$container.attr("data-display-node")) {
                    this.$container.parent().slideToggle();
                }
            },

            hide: function () {
                this.inherited(arguments);

                this.saveToField();

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
                        var key = this.colToField[this.columns[j].field];
                        newItem[key] = updatedData[i][this.columns[j].field];
                    }

                    data.push(newItem);
                    this.addHiddenFieldValues(newItem, i);
                }


                data = this.normalizeData(data);

                this.$field.val(JSON.stringify(data));

                if (this.context.forceCheckChanges) {
                    this.context.forceCheckChanges();
                }
            },

            normalizeData: function (data) {

                // Recorrem totes les files
                for (var i = 0; i < data.length; i++) {


                    for (var key in data[i]) {
                        var type = this.args.fields[key] ? this.args.fields[key].type : '';

                        switch (type) {
                            case 'bool':
                            case 'boolean':
                                data[i][key] = data[i][key] === true || data[i][key] === "true";
                                break;

                            default:
                            // No fer cap canvi

                        }

                    }

                }


                return data;
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

                    if (!this.isCellInLayout(generatedCells[i], configCells) && this.isFieldDisplayed(generatedCells[i].field)) {
                        cells.push(generatedCells[i]);
                    }
                }

                for (var i = 0; i < configCells.length; i++) {


                    configCells[i].field = this.fieldToCol[configCells[i].field];

                    if (configCells[i].field !== undefined) {
                        cells.push(configCells[i]);
                    }


                }

                cells.sort(function (a, b) {
                    return (Number(a.field.replace('col', '')) - Number(b.field.replace('col', '')));
                });


                return cells;
            },

            isFieldDisplayed: function (field) {
                if (!this.args.display_fields) {
                    return true;
                } else {
                    return this.args.display_fields.indexOf(field) > -1;
                }
            },

            addHiddenFieldValues: function (row, rowNumber) {

                // var originalValues = JSON.parse(this.args.data.value);
                var originalValues = this.args.data.value;

                for (var field in originalValues[rowNumber]) {
                    if (!this.isFieldDisplayed(field)) {
                        row[field] = originalValues[rowNumber][field];
                    }
                }
            },

            isCellInLayout: function (cell, layout) {

                for (var i = 0; i < layout.length; i++) {
                    if (layout[i].field === this.colToField[cell.field]) {
                        // if (layout[i].field === cell.field) {
                        return true;
                    }
                }
                return false;
            },

            //NO SE USA
            //Convierte una fecha a formato "dd-mm-yyyy"
            convertToDateDMY: function (data) {
                function pad(s) {
                    return (s.length < 2 || s.toString().length < 2) ? '0' + s : s;
                }

                var displayPattern = 'dd-MM-yyyy';
                var d;
                if (data === "") {
                    d = new Date();
                    return dojo.date.locale.format(d, {selector: 'date', datePattern: displayPattern});
                } else if (isNaN(data.substring(0, 4))) {
                    sdata = data.split(/\/|-/);
                    return [pad(sdata[0]), pad(sdata[1]), sdata[2]].join('-');
                } else {
                    d = new Date(data);
                    return [pad(d.getDate()), pad(d.getMonth() + 1), d.getFullYear()].join('-');
                }
            },

            //NO SE USA
            //Convierte una fecha a formato "yyyy-mm-dd"
            convertToISODate: function (data) {
                function pad(s) {
                    return (s.length < 2 || s.toString().length < 2) ? '0' + s : s;
                }

                var pattern = 'yyyy-MM-dd';
                var d;
                if (data === "") {
                    d = new Date();
                    return dojo.date.locale.format(d, {selector: 'date', datePattern: pattern});
                } else if (isNaN(data.substring(0, 4))) {
                    sdata = data.split(/\/|-/);
                    return [sdata[2], pad(sdata[1]), pad(sdata[0])].join('-');
                } else {
                    d = new Date(data);
                    return [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-');
                }
            }

        });

});
