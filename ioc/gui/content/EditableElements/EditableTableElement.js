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
    "dijit/form/NumberTextBox",
    "dijit/form/NumberSpinner", // això fa el mateix que el NumberTextBox però afegint les fletxes
    "ioc/gui/content/EditableElements/ZoomableCell",
    "ioc/gui/content/EditableElements/ConditionalSelectCell",
    "dijit/Dialog",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/importTableDialog.html",
    // "dojo/i18n!./nls/TableDialog",
    "dojo/on",
    "ioc/gui/content/EditableElements/TreeCell",
    // Carregats pel template
    "dijit/form/TextBox",
    "dijit/form/Textarea",
    "dijit/Fieldset"

], function (declare, AbstractEditableElement, DataGrid, cells, cellsDijit, Memory, 
                    ObjectStore, Button, GridEvents, NumberTextBox, NumberSpinner, 
                    ZoomableCell, ConditionalSelectCell, Dialog, _TemplatedMixin, 
                    _WidgetsInTemplateMixin, insertTableTemplate, /* tableDialogStrings,*/ on,
             TreeCell
) {

    var ADD_IMPORT = "add_import",
        ADD_ROW = "add_row",
        ADD_DEFAULT_ROW = "add_default_row",
        ADD_DEFAULT_ROW_BEFORE = "add_default_row_before",
        ADD_DEFAULT_ROW_AFTER = "add_default_row_after",
        ADD_MULTIPLE_DEFAULT_ROWS = "add_multiple_default_rows",
        SET_MULTIPLE_DEFAULT_ROWS = "set_multiple_default_rows",
        REMOVE_ROWS = "remove_rows",
        CREATE_TABLE_FROM_URL = "create_table_from_url";

    var DATA_STORE_PATTERN = 'yyyy/MM/dd';
    var DATA_DISPLAY_PATTERN = 'dd/MM/yyyy';

    var defaultActions = {
        "add_default_row": "Afegir fila",
        "remove_rows": "Eliminar fila"
    };

    var nullActions = {};


    function clickElem(elem) {
        // Thx user1601638 on Stack Overflow (6/6/2018 - https://stackoverflow.com/questions/13405129/javascript-create-and-save-file )
        var eventMouse = document.createEvent("MouseEvents");
        eventMouse.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
        elem.dispatchEvent(eventMouse);
    }

    function openFile(func) {
        readFile = function (e) {
            var file = e.target.files[0];
            if (!file) {
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                var contents = e.target.result;
                fileInput.func(contents);
                document.body.removeChild(fileInput);
            };
            reader.readAsText(file);
        };
        var fileInput = document.createElement("input");
        fileInput.type = 'file';
        fileInput.style.display = 'none';
        fileInput.onchange = readFile;
        fileInput.func = func;
        document.body.appendChild(fileInput);
        clickElem(fileInput);
    }


    // TODO: si augmenta el nombre de funcions s'ha d'extreure a un mòdul
    var wiocclFunctions = {

        iffieldisequal: function (params/*field, value, valueIfTrue, valueIfFalse*/) {
            var field = params[0], value = params[1], valueIfTrue = params[2], valueIfFalse = params[3];
            var ret;
            var $input = jQuery("#" + field);
            if ($input.val() == value) {
                ret = valueIfTrue;
            } else {
                ret = valueIfFalse;
            }
            return ret;
        },
        copy: function (params /*defaultValue*/, previousField) {
            var ret;
            let defaultValue = params[0];
            if (!previousField) {
                console.warn("No s'ha trobat el valor previ del camp");
                return defaultValue;
            }

            return previousField;
        },
        inc: function (params /*defaultValue, [String regex, int groupToIncrement, Array groupsToCopy]*/, previousField) {
            var ret;
            let defaultValue = params[0];

            if (!previousField) {
                console.warn("No s'ha trobat el valor previ del camp");
                return defaultValue;
            }

            if (typeof previousField === "string") {
                if(params.length===1){
                    var numberRegex = /(\d)+/gi;
                    var matches = previousField.match(numberRegex);
                    if (matches != null) {
                        if(params.length==1){
                            ret = Number(matches[matches.length-1]) + 1;
                        }else{
                            ret = Number(matches[matches.length-1]) + 1;
                        }
                    } else {
                        ret = defaultValue;
                    }
                }else{
                    var numberRegex = new RegExp(params[1], "gi");                    
                    var matches = numberRegex.exec(previousField);
                    if (matches != null) {
                        ret = "";
                        if(params.length===4){
                            for(var i=0; i<params[3]; i++){
                                ret += matches[params[3][i]];
                            }
                        }
                        ret += Number(matches[params[2]]) + 1;
                    } else {
                        ret = defaultValue;
                    }
                }
            } else if (typeof previousField === "number") {
                ret = previousField + 1;
            } else {
                ret = defaultValue;
            }

            return ret;
        },

        seq: function(data, value) {
            // Obtener el valor de la siguiente secuencia para la tabla
            // (el campo que obtiene la secuencia debe ser la primera columna)
            var max = false;
            for (var i = 0; i < data.length; i++) {
                max = parseInt(data[i]['col0']);
                if (value < max) {
                    value = max;
                }
            }
            return (max===false) ? value : ++value;
        },

        today: function () {
            return dojo.date.locale.format(new Date(), {
                selector: 'date',
                datePattern: DATA_STORE_PATTERN
            });
        }

    };

    var ImportTableDialog = declare("dojox.editor.plugins.EditableTableImportDialog", [Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //		Dialog box with options for table creation

        baseClass: "EditorTableDialog",

        templateString: insertTableTemplate,

        tableId: 'Identificador',

        inputType: '',
        inputFooter: '',
        inputTableId: '',
        boxType: '',

        // TODO: pasar a un fitxer nls
        csvImportLegend: "Importació via CSV",
        regexImportLegend: "Importació via RegEx",
        importTableTitle: "Importar dades",
        buttonCancel: "Cancel·lar",
        buttonImport: "Afegir",
        buttonReplace: "Reemplaçar",
        buttonLoad: "Carregar fitxer",
        rowSeparatorLabel: "Separador files",
        colSeparatorLabel: "Separador columnes",
        regexRowSeparatorLabel: "Separador files",
        regexColSeparatorLabel: "Separador columnes",
        dataToImport: "Dades a importar",

        // postMixInProperties: function () {
        //     dojo.mixin(this, tableDialogStrings);
        //     this.inherited(arguments);
        // },
        validated: false,

        postCreate: function () {

            this.validated = false;

            dojo.addClass(this.domNode, this.baseClass); //FIXME - why isn't Dialog accepting the baseClass?
            this.inherited(arguments);

            var context = this;

            this.csvColSeparator.set('value', this.data.csvColSeparator);
            this.csvRowSeparator.set('value', this.data.csvRowSeparator);
            this.regexColSeparator.set('value', this.data.regexColSeparator);
            this.regexRowSeparator.set('value', this.data.regexRowSeparator);


            if (context.regexRowSeparator.get('value').length === 0 && context.regexColSeparator.get('value').length === 0) {
                context.csvColSeparator.set('disabled', false);
                context.csvRowSeparator.set('disabled', false);
                context.useRegex = false;
            } else {
                context.csvColSeparator.set('disabled', true);
                context.csvRowSeparator.set('disabled', true);
                context.useRegex = true;
            }

            //per canvis al camp regexColSeparator del template (interfie d'usuari)
            on(this.regexColSeparator, "input,change", function (evt) {

                if (context.regexRowSeparator.get('value').length === 0 && context.regexColSeparator.get('value').length === 0) {
                    context.csvColSeparator.set('disabled', false);
                    context.csvRowSeparator.set('disabled', false);
                    context.useRegex = false;
                } else {
                    context.csvColSeparator.set('disabled', true);
                    context.csvRowSeparator.set('disabled', true);
                    context.useRegex = true;
                }

            });

            //per canvis al camp regexRowSeparator del template (interfie d'usuari) 
            on(this.regexRowSeparator, "input,change", function (evt) {
                if (context.regexRowSeparator.get('value').length === 0 && context.regexColSeparator.get('value').length === 0) {
                    context.csvColSeparator.set('disabled', false);
                    context.csvRowSeparator.set('disabled', false);
                    context.useRegex = false;
                } else {
                    context.csvColSeparator.set('disabled', true);
                    context.csvRowSeparator.set('disabled', true);
                    context.useRegex = true;
                }

            });
        },

        onInsert: function () {

            var rows = this.selectRow.get("value") || 1,
                cols = this.selectCol.get("value") || 1,
                _id = "tbl_" + (new Date().getTime()),


                // El template conté la informació a mostrar pel dialog, aquesta es la que s'insereix al document

                pre = '<div data-dw-box="' + this.boxType.get("value") + '" id="box_' + _id + '" class="ioctable'
                    + ' ' + this.inputType.get("value")
                    + ' ioc' + this.boxType.get("value")
                    + '" data-dw-type="' + this.inputType.get("value") + "\">\n",
                info = '<div class="iocinfo"><a id="' + this.inputTableId.get("value") + '" data-dw-link="table"><b contenteditable="false" data-dw-field="id">ID:</b> ' + this.inputTableId.get("value") + '<br></a>'
                    + '<b contenteditable="false" data-dw-field="title">Títol:</b> ' + this.inputTitle.get("value") + '<br>'
                    + '<b contenteditable="false" data-dw-field="footer">Peu:</b> ' + this.inputFooter.get("value") + '<br>'
                    + '</div>',


                t = pre + info + '<table id="' + _id + '" width="100%">\n';

            // post = '</div>';


            for (var r = 0; r < rows; r++) {
                t += '\t<tr>\n';
                for (var c = 0; c < cols; c++) {
                    t += '\t\t<td width="' + (Math.floor(100 / cols)) + '%">&nbsp;</td>\n';
                }
                t += '\t</tr>\n';
            }

            t += '</table></div>';

            var cl = dojo.connect(this, "onHide", function () {
                dojo.disconnect(cl);
                var self = this;
                setTimeout(function () {
                    self.destroyRecursive();
                }, 10);
            });
            this.hide();

            //console.log(t);
            this.onBuildTable({htmlText: t, id: _id});

            var $node = jQuery(this.plugin.editor.iframe).contents().find('#box_' + _id);

            var $prev = $node.prev();
            var $next = $node.next();

            if ($prev.length === 0 || !$prev.is('p')) {
                // Afegim un salt de línia com a separador
                $node.before(jQuery('<p>&nbsp;</p>'));
            }

            if ($next.length === 0 || !$next.is('p')) {
                // Afegim un salt de línia com a separador
                $node.after(jQuery('<p>&nbsp;</p>'));
            }

            console.log(this);
            console.log(this.plugin);

            addActions($node, this.editor);

        },

        onCancel: function () {
            // summary:
            //		Function to clean up memory so that the dialog is destroyed
            //		when closed.
            var c = dojo.connect(this, "onHide", function () {
                dojo.disconnect(c);
                var self = this;
                setTimeout(function () {
                    self.destroyRecursive();
                }, 10);
            });
        },

        onBuildTable: function (tableText) {
            //stub
            // console.log("tableText:", tableText);

        },

        onReplace: function () {
            this.table.clear();
            this.onImport();
        },

        onImport: function () {
            // Dividim el contingut en files
            var content = this.inputDataToImport.get('value').split('\\n').join('\n');

            // TODO: Si regexSeparator.length > 0 s'ha de fer servir la expressió regular en lloc del import simple


            var extractedData;

            this.validated = true;

            if (this.useRegex) {
                extractedData = this._extractRegex(content);
            } else {
                extractedData = this._extractSimple(content);
            }

            if (this.validated) {
                for (var i = 0; i < extractedData.length; i++) {
                    this.table.addRow(extractedData[i]);
                    this.destroyRecursive();
                }
            } else {
                alert("Error de validació: no es pot construir una taula a partir d'aquestes dades");
            }


        },

        _extractSimple: function (content) {
            // Si el separador es buit es fa servir el salt de línia
            var rowSeparator = this.csvRowSeparator.get('value') ? this.csvRowSeparator.get('value') : "\n";
            var colSeparator = this.csvColSeparator.get('value');

            // Convertiem en expressió regular el separador, en cas contrari no funciona el salt de línia
            rowSeparator = new RegExp(rowSeparator, 'gms');

            var rows = content.split(rowSeparator);

            var extractedData = [];

            for (var i = 0; i < rows.length; i++) {

                if (rows[i].length === 0) {
                    continue;
                }

                var cols = rows[i].split(colSeparator);

                extractedData.push(this._makeObjectData(cols));

            }

            return extractedData;
        },

        _makeObjectData: function (cols) {
            var data = {};

            if (cols.length !== Object.keys(this.table.args.fields).length) {
                this.validated = false;
                console.error("Import error: col number (" + cols.length + ") is different from field number (" + Object.keys(this.table.args.fields).length + ")");
                return data;
            }

            var j = 0;

            for (var key in this.table.args.fields) {

                console.log("Field data:", key, this.table.args.fields[key]);

                if (j === cols.length) {
                    console.error("Import error: missing value for field [" + key + "]. Aborting.");
                    this.validated = false;
                    break;
                }

                var value = cols[j]===undefined?"":cols[j].trim();

                switch (this.table.args.fields[key].type) {

                    case "number":

                        if (isNaN(value)) {
                            console.error("Import error: " + value + " is not a number");
                            this.validated = false;
                            return {};
                        }

                        value = Number(value);

                        break;

                    case "select":

                        if (this.table.args.fields[key].options.indexOf(value) === -1) {
                            console.error("Import error: " + value + " is not a valid option:", this.table.args.fields[key].options);
                            this.validated = false;
                            return {};
                        }

                        break;

                    case "boolean":
                    case "bool":

                        if (value === "true" || value === "vertader" || value === "cert" || value === "t" || value === "v" || value === "c" || value === "1") {
                            value = true;
                        } else if (value === "false" || value === "f" || value === "0" || value.trim()==="") {
                            value = false;
                        } else {
                            console.error("Import error: " + value + " is not boolean option:", this.table.args.fields[key].options);
                            this.validated = false;
                            return {};
                        }

                        break;

                    case "date":
                        // TODO[Xavi] considerar si això és necessari, les datas probablement no s'importen perque canvien cada semestre
                        console.warn("Alert: currently dates are not validated");
                        break;

                    case "textarea":
                        value = value.split("\\\\ ").join("\n");
                        break;

                    case "tree":
                        console.log("Trobat tree:", this.table.args.fields[key]);

                    case "string": // intentional fall-through

                    default:
                    // si es tipus string sempre es correcte
                }

                data[key] = value;
                j++;
            }

            return data;
        },

        _extractRegex: function (content) {
            var extractedData = [];

            // Si el separador es buit es fa servir el salt de línia
            var rowSeparator = this.regexRowSeparator.get('value') ? this.regexRowSeparator.get('value') : "\n";
            var colSeparator = this.regexColSeparator.get('value');

            // Convertiem en expressió regular el separador, en cas contrari no funciona el salt de línia
            rowSeparator = new RegExp(rowSeparator, 'gms');

            var rows = content.split(rowSeparator);

            for (var i = 0; i < rows.length; i++) {
                //var regex = new RegExp(colSeparator, 'gm');
                var regex = new RegExp(colSeparator, 's');

                if (rows[i].length === 0) {
                    continue;
                }

                var matches = regex.exec(rows[i]);

                var cols = [];

                if (matches === null) {
                    console.error("Import error: can't extract row from string. Aborting.", rows[i]);
                    this.validated = false;
                    return [];
                }

                for (var j = 1; j < matches.length; j++) {
                    if(matches[j]==undefined){
                        matches[j]="";
                    }
                    cols.push(matches[j]);
                }

                extractedData.push(this._makeObjectData(cols));

            }

            return extractedData;
        },

        // És crida desde el template
        onLoadFile: function () {
            var context = this;

            openFile(function (contents) {

                context.inputDataToImport.set('value', contents);

            });
        }

    });


    return declare([AbstractEditableElement],
        {
            defaultRow: null,

            actionData: {},

            init: function (args) {
                this.dataSource = args.context;

                this.inherited(arguments);
                this.fieldToCol = {};
                this.colToField = {};
                this.colToName = {};
                this.actionData = {};

                this.initializeCallbacks();

            },

            initializeCallbacks: function () {
                this.actionCallbacks = {};

                this.actionCallbacks[ADD_ROW] = this._addRowCallback.bind(this);
                this.actionCallbacks[ADD_IMPORT] = this._addImportCallback.bind(this);
                this.actionCallbacks[ADD_DEFAULT_ROW] = this._addDefaultRowCallback.bind(this);
                this.actionCallbacks[ADD_DEFAULT_ROW_AFTER] = this._addDefaultRowAfterCallback.bind(this);
                this.actionCallbacks[ADD_DEFAULT_ROW_BEFORE] = this._addDefaultRowBeforeCallback.bind(this);
                this.actionCallbacks[ADD_MULTIPLE_DEFAULT_ROWS] = this._addMultipleDefaultRowsCallback.bind(this);
                this.actionCallbacks[SET_MULTIPLE_DEFAULT_ROWS] = this._setMultipleDefaultRowsCallback.bind(this);
                this.actionCallbacks[REMOVE_ROWS] = this._removeRowCallback.bind(this);
                this.actionCallbacks[CREATE_TABLE_FROM_URL] = this._createTableFromUrlCallback.bind(this);
            },

            _showDialog: function () {

                var w = new ImportTableDialog({
                    plugin: this,
                    editor: this.editor,
                    boxType: this.boxType,
                    table: this,
                    data: this.actionData[ADD_IMPORT]
                });
                w.show();
            },

            _replaceNodeContent: function (args) {

                if (args.defaultRow) {
                    this.defaultRow = args.defaultRow;
                } else if (String(args.defaultRow) === args.defaultRow+"")  {
                    this.defaultRow = args.defaultRow;
                } else {
                    this.defaultRow = {};
                }
                this.inherited(arguments);

            },

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
                    sourceId: args.data.id,
                    // @override
                    // fem que cap columna es pugui ordenar
                    canSort: function(col) {
                        return false;
                    }
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

                    // Això permet mantener la cel·la en edició quan s'obre un dialeg
                    if (grid.ignoreApply || jQuery(document.activeElement).hasClass('ace_text-input')) {
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
                
                var defAc = this.args.data.config.array_rows? nullActions: defaultActions;
                var actions = this.args.actions ? this.args.actions : defAc;

                this.initializeButtons(actions, $toolbar[0]);

                this.updateField();
                this.widgetInitialized = true;

                this.grid.edit.setDataSource(args.context);
                this.grid.edit.setParentElement(this);

            },

            initializeButtons: function (actions, toolbarNode) {

                for (var action in actions) {

                    if (typeof actions[action] === "string") {
                        this.initializeButtonSimple(actions[action], toolbarNode, this.actionCallbacks[action]);
                    } else {
                        this.initializeButtonComplex(action, actions[action], toolbarNode, this.actionCallbacks[action]);
                    }

                }

            },

            initializeButtonSimple: function (label, toolbarNode, callback) {
                var button = new Button({
                    label: label,
                    onClick: callback
                });
                button.placeAt(toolbarNode);
                button.startup();
            },

            initializeButtonComplex: function (actionId, action, toolbarNode, callback) {

                this.initializeButtonSimple(action.button_label, toolbarNode, callback);

                this.actionData[actionId] = action.data;

            },
            
            _parseValue: function (value, lastRow){
                // Extraïem la funció
                var functionRegex = /{#_(.*?)\((.*?)\)_#}/g;
                var functionTokens = functionRegex.exec(value);

                // El primer token és el nom de la funció
                var func = functionTokens[1].toLowerCase();

                // El segón token conté els paràmetres
                var params = JSON.parse("[" + functionTokens[2] + "]");

                var parsedValue;

                switch (func) {
                    case 'copy':
                    case 'inc':
                        // Si hi ha una fila anterior cerquem el valor anterior
                        if (lastRow) {
                            parsedValue = wiocclFunctions[func](params, lastRow);
                        } else {
                            // El paràmetre és el valor per defecte per la primera fila
                            parsedValue = params[0];
                        }
                        break;

                    case 'seq':
                        // Obtener el valor de la siguiente secuencia para la tabla
                        // (el campo que obtiene la secuencia debe ser la primera columna)
                        var param = (params[0]) ? params[0] : 0; //valor inicial
                        parsedValue = wiocclFunctions[func](this.dataStore.objectStore.data, param);
                        break;

                    default:
                        if (wiocclFunctions[func]) {
                            parsedValue = wiocclFunctions[func](params);
                        } else {
                            console.error("Function: unknown", params);
                        }
                }

               return parsedValue;
            },
            
            parseSingleRow: function (row){
                var newRow = row + "";

                var lastRow;

                if (this.dataStore.objectStore.data.length > 0) {
                    lastRow = this.dataStore.objectStore.data[this.dataStore.objectStore.data.length - 1];
                }

                var fieldRegex = /{#(.*?)#}/g;
                var tokens = newRow.match(fieldRegex);
                
                if (tokens !== null) {                
                    for (var iToken = 0; iToken < tokens.length; iToken++) {
                        var value = this._parseValue(tokens[iToken], lastRow);
                        newRow = newRow.replace(tokens[iToken], value);
                    }
                }
                return newRow;
            },

            parseRow: function (row) {
                // console.log(row);
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
                    } 

                    for (var iToken = 0; iToken < tokens.length; iToken++) {
                        var lr = lastRow?lastRow[this.fieldToCol[name]]:null;
                        var value = this._parseValue(tokens[iToken], lr);
                        newRow[name] = newRow[name].replace(tokens[iToken], value);
                    }

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
            _addObjectRow: function (keyPairs, options) {
                
                var data = {
                    id: this.objectStore.getUniqueId()
                };

                // console.log("Valor de la taula", this.args.data.value);

                var parsedRow = this.parseRow(this.defaultRow);

                for (var name in parsedRow) {
                    var row;
                    var field = this.args.fields ? this.args.fields[name] : {};

                    if (keyPairs && keyPairs[name]) {
                        row = data[this.fieldToCol[name]] = keyPairs[name];

                    } else if (field.type && field.type === "date" && !parsedRow[name]) {
                        row = data[this.fieldToCol[name]] = dojo.date.locale.format(new Date(), {
                            selector: 'date',
                            datePattern: DATA_STORE_PATTERN
                        });

                        // dojo.date.locale.format(new Date(), {selector:'date', datePattern:DATA_DISPLAY_PATTERN})
                    } else {
                        row = data[this.fieldToCol[name]] = parsedRow[name];
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
                //originalValue.push(row); //WARNING: esto no tiene sentido!!! row no es una fila, solo es un string = el valor del último campo procesado
                if (!originalValue) {
                    originalValue = [];
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
            
            _addSingleRow: function (value, options) {
                var parsedRow;
                var data = {
                    id: this.objectStore.getUniqueId()
                };

                if (value){
                    parsedRow = value;
                }else{
                    parsedRow = this.parseSingleRow(this.defaultRow);
                }
                
                if (this.args.data.config.typeDef && this.args.data.config.typeDef === "date" && !parsedRow) {
                    parsedRow = dojo.date.locale.format(new Date(), {
                        selector: 'date',
                        datePattern: DATA_STORE_PATTERN
                    });
                }
                
                data["col0"] = parsedRow;

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
            
            _addArrayRow: function (array, options) {
                var data = {
                    id: this.objectStore.getUniqueId()
                };

                var parsedRow = this.parseRow(this.defaultRow);
                var row = new Array(parsedRow.lenght);
                
                for (var i = 0; i < parsedRow.length; i++) {
                    var item;

                    if (array && i<array.length) {
                        row[i] = data[this.fieldToCol["col"+i]] = array[i];
                    } else if (this.args.data.config.typeDef && this.args.data.config.typeDef === "date" && !parsedRow[i]) {
                        row[i] = data[this.fieldToCol["col"+i]] = dojo.date.locale.format(new Date(), {
                            selector: 'date',
                            datePattern: DATA_STORE_PATTERN
                        });

                        // dojo.date.locale.format(new Date(), {selector:'date', datePattern:DATA_DISPLAY_PATTERN})
                    } else {
                        row[i] = data[this.fieldToCol["col"+i]] = parsedRow[i];
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
                originalValue.push(row);
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
            
            addRow: function (keyPairs, options) {

                this.grid.addingRow = true;

                this.dataStore.save(); // Desem els canvis actuals al grid (cel·les editades)

                if(this.args.data.type==="array" || this.args.data.type==="editableArray"){
                    this._addSingleRow(keyPairs, options);
                }else if(this.args.data.type==="table" || this.args.data.type==="editableTable"){
                    this._addArrayRow(keyPairs, options);
                }else{
                    this._addObjectRow(keyPairs, options);
                }

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
                        
            _createTableFromUrlCallback: function(){
                var self = this;
                var confirmation = confirm("Aquesta opció eliminarà totes les files de la taula i la crearà de nou amb les dades per defecte.\n\
Segur que voleu crear de nou la taula?");

                if (!confirmation) {
                    return;
                }
                
                var processor = {
                    process:function(response){
                        self.clear();
                        for(var item of response){
                           self.addRow(item);
                        }
                    }
                };                
                require(["ioc/wiki30/Request"], function(Request) {
                    var url = self.actionData[CREATE_TABLE_FROM_URL].url;
                    var formValues = self.context.getCurrentContent();
                    var request = new Request({urlBase: url});
                    request.addProcessor("array", processor);
                    request.dataToSend = {
                        id:self.context.ns,
                        parameters: JSON.stringify(formValues)
                    };
                    request.sendRequest();
                });
                return;
            },

            _addImportCallback: function () {

                this._showDialog();

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
                    alert("Aquesta acció només permet incrementar el nombre de files. No pas reduir-lo.");
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
                indexes.sort(function (a, b) { // això no se si cal
                    return b.id - a.id;
                });

                var originalValues;

                if (typeof this.args.data.value === "string") {
                    originalValues = JSON.parse(this.args.data.value);
                } else {
                    originalValues = this.args.data.value;
                }

                for (var i = 0; i < indexes.length; i++) {
                    originalValues.splice(indexes[i].id, 1);
                    console.log("Eliminant item:", indexes[i]);
                    this.dataStore.deleteItem(indexes[i]);
                }

                this.args.data.value = originalValues;

                this.dataStore.save();

                this.updateField();
            },

            clear: function () {

                var originalValues;

                if (typeof this.args.data.value === "string") {
                    originalValues = JSON.parse(this.args.data.value);
                } else {
                    originalValues = this.args.data.value;
                }


                for (var i = 0; i < this.dataStore.objectStore.data.length; i++) {
                    var item = this.dataStore.objectStore.data[i];
                    originalValues.splice(item.id, 1);
                    this.dataStore.deleteItem(item);
                    // console.log("eliminant id", item);
                }

                this.args.data.value = originalValues;

                this.dataStore.save();

                this.updateField();

            },
            
            _configCell: function(type, layout, i, options){
                var constraints;
                var cell = layout.cells[i];
                
                // Els cellType estan definits com propietats a dojox/grid/cells/_Base.js
                switch (type) {
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
                            if (datum) datum = datum.replace(/-/g, "/");
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

                    case 'decimal':
                        cell.type = cells._Widget;
                        cell.widgetClass = NumberTextBox;
                        cell.formatter = function (value, row, attr) {
                            if (attr.constraints === undefined || attr.constraints === null) 
                                constraints = {places: 2};
                            else
                                constraints = JSON.parse(attr.constraints);
    //                                    console.log ("decimal.formatter", value, dojo.number.format(value, constraints));
                            return dojo.number.format(value, constraints);
                        };
                        break;

                    case 'number':
                        cell.type = cells._Widget;
                        cell.widgetClass = NumberSpinner;
                        break;

                    case 'select':
                        cell.type = dojox.grid.cells.Select;
                        cell.options = options || ['Error. No options added to default view'];
                        break;

                    case 'textarea':
                        cell.type = cells._Widget;
                        cell.widgetClass = ZoomableCell;
                        cell.getValue = function () {
                            // Override the default getValue function for dojox.grid.cells.DateTextBox
                            var ret = this.widget.get("value");
                            return  ret.split("<br>").join("\n");
                        };
                        cell.formatter = function (datum) {
                            // Format the value in store, so as to be displayed.
                            var ret = !datum ? "" : datum.split("\n").join("<br>");
                            return ret;
                        };
                        break;                                

                    case 'conditionalselect':
                        cell.type = cells._Widget;
                        cell.widgetClass = ConditionalSelectCell;
                        break;

                    case 'boolean':
                    case 'bool':
                        cell.type = dojox.grid.cells.Bool;
                        break;

                    case 'tree':
                        cell.type = cells._Widget;
                        cell.widgetClass = TreeCell;
                        break;

                    default:
                        cell.type = cells._Widget;
                }
                
            },

            // Copia els paràmetres de configuració a la cel·la
            setupCells: function (layout) {
                if(this.args.data.type==="array" || this.args.data.type==="editableArray"){
                    this._setupCellsFomArray(layout);
                }else if(this.args.data.type==="table" || this.args.data.type==="editableTable"){
                    this._setupCellsFomArray(layout);
                }else{
                    this._setupCellsFomObjectArray(layout);
                }                                
            },
            
            _setupCellsFomArray: function (layout) {
                for (var i in layout.cells) {
                    if (this.args.data.config.typeDef){
                        this._configCell(this.args.data.config.typeDef, layout, i);
                    }
                }                
            },
            
            _setupCellsFomObjectArray: function (layout) {

                this.inputOnNewRowFields = {};

                if (!this.args.fields) {
                    return;
                }

                for (var i in layout.cells) {
                    var cell = layout.cells[i];
                    var fieldName = this.colToField[cell.field];

                    if (this.args.fields && this.args.fields[fieldName]) {

                        var field = this.args.fields[fieldName];
                        
                        this._configCell(field['type'], layout, i, field['options']);


//                        // Els cellType estan definits com propietats a dojox/grid/cells/_Base.js
//                        switch (field['type']) {
//                            case 'date':
//
//                                cell.type = dojox.grid.cells.DateTextBox;
//                                cell.getValue = function () {
//                                    // Override the default getValue function for dojox.grid.cells.DateTextBox
//                                    return dojo.date.locale.format(this.widget.get('value'), {
//                                        selector: 'date',
//                                        datePattern: DATA_STORE_PATTERN
//                                    });
//                                };
//                                cell.formatter = function (datum) {
//                                    // Format the value in store, so as to be displayed.
//                                    var d = !datum ? (new Date()) : dojo.date.locale.parse(datum, {
//                                        selector: 'date',
//                                        datePattern: DATA_STORE_PATTERN
//                                    });
//                                    return dojo.date.locale.format(d, {
//                                        selector: 'date',
//                                        datePattern: DATA_DISPLAY_PATTERN
//                                    });
//                                };
//                                break;
//                                
//                            case 'decimal':
//                                cell.type = cells._Widget;
//                                cell.widgetClass = NumberTextBox;
////                                cell.widgetProps = {constraints: {places: 2, locale:'es'}}
////                                cell.getValue = function () {
////                                    var value = this.widget.get('value'); console.log ("decimal.getValue", dojo.number.parse(value.toString(), {places: 2}));
////                                    return this.widget.get('value').toString();
////                                }
//                                cell.formatter = function (value, row, attr) {
//                                    if (attr.constraints === undefined || attr.constraints === null) 
//                                        constraints = {places: 2};
//                                    else
//                                        constraints = JSON.parse(attr.constraints);
////                                    console.log ("decimal.formatter", value, dojo.number.format(value, constraints));
//                                    return dojo.number.format(value, constraints);
//                                };
//                                break;
//                                
//                            case 'number':
//                                cell.type = cells._Widget;
//                                cell.widgetClass = NumberSpinner;
//                                break;
//                                
//                            case 'select':
//                                cell.type = dojox.grid.cells.Select;
//                                cell.options = field['options'] || ['Error. No options added to default view'];
//                                break;
//
//                            case 'textarea':
//                                cell.type = cells._Widget;
//                                cell.widgetClass = ZoomableCell;
//                                cell.getValue = function () {
//                                    // Override the default getValue function for dojox.grid.cells.DateTextBox
//                                    var ret = this.widget.get("value");
//                                    return  ret.split("<br>").join("\n");
//                                };
//                                cell.formatter = function (datum) {
//                                    // Format the value in store, so as to be displayed.
//                                    var ret = !datum ? "" : datum.split("\n").join("<br>");
//                                    return ret;
//                                };
//                                break;                                
//                                break;
//
//                            case 'conditionalselect':
//                                cell.type = cells._Widget;
//                                cell.widgetClass = ConditionalSelectCell;
//                                break;
//
//                            case 'boolean':
//                            case 'bool':
//                                cell.type = dojox.grid.cells.Bool;
//                                break;
//
//                            default:
//                                cell.type = cells._Widget;
//                        }

                        if (field["input_on_new_row"] === true) {
                            this.inputOnNewRowFields[cell.name] = this.args.fields[cell.name];
                        }

                    } else {
                        console.error("Can't find data for the column", cell.name, this.args.fields[cell.name]);
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
                        });
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
                var ret;
                if(this.args.data.type=="array" || this.args.data.type=="aditableArray"){
                    ret = this._htmlToJsonFromArray($table);
                }else if(this.args.data.type=="table" || this.args.data.type=="aditableTable"){
                    ret = this._htmlToJsonFromTable($table);
                }else{
                    ret = this._htmlToJsonFromObjectArray($table);
                }
                return ret;
            },
            
            _htmlToJsonFromArray: function($table) {
                var data = {
                    columns: [],
                    rows: []
                };

                var $rows = $table.find('tr');
                var $col = jQuery($rows[0]).children()[0];
                
                var fieldData = {
                    name: " ",
                    field: 'col0',
                    editable: true
                };

                data.columns.push(fieldData);

                var field = jQuery($col).attr('data-field');
                
                this.fieldToCol[field] = fieldData.field;
                this.colToField[fieldData.field] = field;
                this.colToName[fieldData.field] = fieldData.name;

                // Extraiem les dades de la resta de files
                for (var i = 0; i < $rows.length; i++) {
                    $col = jQuery($rows[i]).children()[0];
                    var row = {id: i};
                    var field = jQuery($col).attr('data-field');
                    var colKey = this.fieldToCol[field];
                    var key = this.colToField[colKey];

                    var type = this.args.data.config.typeDef;
                    row[colKey] = this.normalizeValue(jQuery($col).attr("data-originalvalue"), type) || '';


                    data.rows.push(row);
                }
                return data;                
            },

            _htmlToJsonFromTable: function($table) {
                var data = {
                    columns: [],
                    rows: []
                };

                var $rows = $table.find('tr');
                var $columns = jQuery($rows[0]).children();
                var type = this.args.data.config.typeDef;
                
                for (var i = 0; i < this.args.data.config.array_columns; i++) {

                    var fieldData = {
                        name: " ".repeat(i+1),
                        field: 'col' + i,
                        editable: true
                    };

                    data.columns.push(fieldData);

                    var field = jQuery($columns[i]).attr('data-field');


                    this.fieldToCol[field] = fieldData.field;
                    this.colToField[fieldData.field] = field;
                    this.colToName[fieldData.field] = fieldData.name;
                }
                
                                // Extraiem les dades de la resta de files
                for (i = 0; i < $rows.length; i++) {    
                    $columns = jQuery($rows[i]).children();
                    var row = {id: i};

                    for (var j = 0; j < $columns.length; j++) {

                        // Cerquem la columna corresponent al camp
                        var field = jQuery($columns[j]).attr('data-field');
                        var colKey = this.fieldToCol[field];
                        var key = this.colToField[colKey];
                        row[colKey] = this.normalizeValue(jQuery($columns[j]).attr("data-originalvalue"), type) || '';

                    }

                    data.rows.push(row);
                }

                return data;                
            },

            _htmlToJsonFromObjectArray: function ($table) {
                var data = {
                    columns: [],
                    rows: []
                };

                var $rows = $table.find('tr');

                var $columns = jQuery($rows[0]).children();
                
                // La primera columna són les capçaleres
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

            normalizeValue: function (value, type) {
                // console.error(type, value);

                var normalizedValue;
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

            normalizeValueForKey: function (key, value) {
                var type = this.args.fields[key] ? this.args.fields[key].type : '';
                return this.normalizeValue(value, type);
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
                if(this.args.data.type=="array" || this.args.data.type=="aditableArray"){
                    this._updateFieldArray();
                }else if(this.args.data.type=="table" || this.args.data.type=="aditableTable"){
                    this._updateFieldTable();
                }else{
                    this._updateFieldObjectArray();
                }
            },
            
            _updateFieldArray: function () {
                var data = [];

                var updatedData = this.dataStore.objectStore.data;


                for (var i = 0; i < updatedData.length; i++) {
                    var newItem;

                    // console.log(this.columns[0],updatedData[i]);
                    //var key = this.colToField[this.columns[0].field];
                    newItem = updatedData[i][this.columns[0].field];

                    data.push(newItem);
                    this.addHiddenFieldValues(newItem, i);
                }


                data = this.normalizeData(data);

                this.$field.val(JSON.stringify(data));

                if (this.context.forceCheckChanges) {
                    this.context.forceCheckChanges();
                }
            },

            _updateFieldTable: function () {
                var data = [];

                var updatedData = this.dataStore.objectStore.data;


                for (var i = 0; i < updatedData.length; i++) {
                    var newItem = [];

                    for (var j = 0; j < this.columns.length; j++) {
                        // console.log(this.columns[j],updatedData[i]);
                        //var key = this.colToField[this.columns[j].field];
                        newItem.push(updatedData[i][this.columns[j].field]);
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

            _updateFieldObjectArray: function () {
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

            // @override
            getValue: function () {
                if (this.$field) {
                    return this.$field.val();
                } else {
                    // console.error("No hi ha $field:", this.$field);
                }

            },

            normalizeData: function (data) {
                // Recorrem totes les files
                for (var i = 0; i < data.length; i++) {

                    for (var key in data[i]) {
                        var type = (this.args.fields && this.args.fields[key]) ? this.args.fields[key].type : '';
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
                //[TODO] adaptar per array, table i objectArray

                // var originalValues = JSON.parse(this.args.data.value);
                var originalValues = this.args.data.value;

                if (typeof this.args.data.value === "string") {
                    originalValues = JSON.parse(this.args.data.value);
                } else {
                    originalValues = this.args.data.value;
                }

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
