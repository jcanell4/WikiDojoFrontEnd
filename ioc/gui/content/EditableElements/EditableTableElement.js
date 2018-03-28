define([
    'dojo/_base/declare',
    'ioc/gui/content/EditableElements/AbstractEditableElement',
    "dojox/grid/DataGrid",
    "dojox/grid/cells",
    "dojox/grid/cells/dijit",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "dijit/form/Button",
], function (declare, AbstractEditableElement, DataGrid, cells, cellsDijit, Memory, ObjectStore, Button) {

    return declare([AbstractEditableElement],
        {

            init: function() {
                this.inherited(arguments);
                this._createIcon();
                // this.defaultDisplay = 'table';
            },

            // ALERTA! De moment només canvia aquest, la resta es igual, es pot moure cap amun en la jerarquia.
            createWidget: function () {

                var tableData = this.htmlToJson(this.$node);
                console.log("Taula parsejada:", tableData);
                this.columns = tableData.columns;
                this.args.id = ('' + Date.now() + Math.random()).replace('.', '-'); // id única

                var args = this.args;

                var $container = jQuery('<div id="grid_container"></div>');
                this.$editableNode.css('display', 'block'); // S'ha de fer visible abans de crear el grid o l'alçada es 0.


                var $toolbar= jQuery('<div id="toolbar_container"></div>');
                $container.append($toolbar);

                this.$editableNode.append($container);

                var width = 100/tableData.columns.length;

                var gridLayout = [{
                    defaultCell: {
                        width: width + "%",
                        editable: true,
                        type: cells._Widget,
                        styles: 'text-align: left;',
                    },
                    cells: tableData.columns
                }];

                var objectStore = new Memory({data: tableData.rows});
                this.dataStore = new ObjectStore({objectStore: objectStore});
                this.backupData = jQuery.extend(true, {}, tableData.rows);

                var grid = new DataGrid({
                    store: this.dataStore,
                    structure: gridLayout,
                    escapeHTMLInData: false,
                    height: (tableData.rows.length * 45)+'px', // la alçada de cada fila
                });


                this.grid = grid;


                grid.placeAt($container[0]);
                grid.startup();



                console.log("current data:", objectStore.data);

                // AFEGIR Buttons
                var context = this;


                var addKeyButton = new Button({
                    label: "Afegir clau",

                    onClick: function () {

                        var key = prompt("TODO: Afegir un diàleg com cal. Introdueix la clau:");

                        context.dataStore.newItem({
                            id: objectStore.data.length,
                            col0: key,
                            col1: '',
                            col2: '',
                        });

                        // ALERTA[Xavi] Un cop es desa ja no es pot fer revert, hem d'implementar el nostre propi revert
                        context.dataStore.save();
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

                        for (var i=0; i<selected.length; i++) {
                            context.dataStore.deleteItem(selected[i]);
                        }

                        context.dataStore.save();


                    }
                });
                removeKeyButton.placeAt($toolbar[0]);
                removeKeyButton.startup();

                var saveKeyButton = new Button({
                    label: "Desar",
                    onClick: function () {

                        context.save();
                        context.hide();
                    }
                });
                saveKeyButton.placeAt($toolbar[0]);
                saveKeyButton.startup();

                var cancelKeyButton = new Button({
                    label: "Cancel·lar",

                    onClick: function () {
                        context.revert();
                        context.hide();

                    }
                });
                cancelKeyButton.placeAt($toolbar[0]);
                cancelKeyButton.startup();



                //     editor.editor.on('CancelDialog', cancelCallback);
                //     editor.editor.on('SaveDialog', saveCallback);

                this.widgetInitialized = true;
            },


            revert: function() {
                console.log("Revert!");
                var data = jQuery.extend(true, {}, this.backupData);
                // var objectStore = new Memory({data: data});
                // this.dataStore = new ObjectStore({objectStore: objectStore});
                var store = this.dataStore;

                store.fetch({query:{id:"*"}, onComplete: function(results){
                    results.forEach(function(i) {
                        store.deleteItem(i);

                    })

                }});

                for (var i in data) {
                    this.dataStore.newItem(data[i]);
                }

                this.dataStore.save();
                this.grid.update();

            },
            save: function() {
                this.backupData = jQuery.extend(true, {}, this.dataStore.objectStore.data);

                console.log(this.backupData);
                console.log("Save!");

                this.jsonToHTML(this.backupData);

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
                    data.columns.push({
                        name: jQuery($columns[i]).text(),
                        field: 'col' + i,
                        editable: jQuery($columns[i]).attr('readonly') === undefined,
                        //formatter:,
                        //constraint:,

                    });
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


            jsonToHTML: function(data) {
                console.log(data);
              var $table = this.$node.find('tbody');
              $table.html("");

              console.log(data);


              var cols = this.columns.length;

              for (var i in data) {

                  var $row =jQuery("<tr>");

                  for (var j=0; j<cols; j++) {
                        var $col;
                      if (!this.columns[j].editable) {
                          $col = jQuery('<th>');
                      } else {
                          $col = jQuery('<td>');
                      }
                      $col.text(data[i]["col"+j]);

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

            hide: function() {
                this.inherited(arguments);

                if (this.$icon) {
                    this.$icon.css('display', 'block');
                }


            },

            _createIcon: function () {

                // Afegim un contenidor per l'icona i l'input
                this.$container = jQuery('<div>');
                this.$container.css('position', 'relative');

                this.$node.before(this.$container);
                this.$container.append(this.$node);

                this.$icon = jQuery('<img src="/iocjslib/ioc/gui/img/edit.png" alt="" height="16" width="16">');
                this.$icon.css('position', 'absolute');
                this.$icon.css('top', '2px');
                this.$icon.css('right', '2px');
                this.$icon.css('display', 'block');
                this.$icon.css('cursor', 'pointer');
                this.$node.before(this.$icon);

                //
                //
                // this.$node.on('mouseover', function() {
                //     console.log("mouseover");
                //     this.$icon.css('display', 'block'); // TODO: Comprovar que no sigui ja en edició
                // }.bind(this));
                //
                // this.$node.on('mouseout', function() {
                //     console.log("mouseout");
                //     this.$icon.css('display', 'none');
                // }.bind(this));
                //
                //
                //
                // this.$icon.on('mouseover', function () {
                //     this.hover = true;
                // }.bind(this));
                //
                // this.$icon.on('mouseout', function () {
                //     this.hover = false;
                // }.bind(this));

                this.$icon.on('click', this.show.bind(this));
            },


        });


});
