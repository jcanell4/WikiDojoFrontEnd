define([
    'dojo/_base/declare',
    'ioc/gui/content/EditableElements/AbstractEditableElement',
    "dojox/grid/DataGrid",
    "dojox/grid/cells",
    "dojox/grid/cells/dijit",
    "dojo/store/Memory",
    "dojo/data/ObjectStore",
    "dijit/form/Button"
], function (declare, AbstractEditableElement, DataGrid, cells, cellsDijit, Memory, ObjectStore, Button) {

    return declare([AbstractEditableElement],
        {


            // ALERTA! De moment només canvia aquest, la resta es igual, es pot moure cap amun en la jerarquia.
            createWidget: function () {


                console.log("Generada Taula Editable per:", this.$node);

                // TODO: parsejar la taula (html->json)


                var tableData = this.htmlToJson(this.$node);
                console.log("Taula parsejada:", tableData);


                // Generar el grid widget amb la informació parsejada
                // En desar els canvis de la taula actualizar el contingut del node (json->html)


                // TODO:Xavi, exposar com id de l'element directament
                this.args.id = ('' + Date.now() + Math.random()).replace('.', '-'); // id única

                var args = this.args;

                var $container = jQuery('<div id="grid_container"></div>');
                // $container.css('height','100%');
                // $container.css('background-color','pink');
                this.$editableNode.css('display', 'block'); // S'ha de fer visible abans de crear el grid o l'alçada es 0.


                var $toolbar= jQuery('<div id="toolbar_container"></div>');
                $container.append($toolbar);

                // TODO: Afegir contenidor amb els botons


                this.$editableNode.append($container);

                var width = 100/tableData.columns.length;

                var gridLayout = [{
                    defaultCell: {
                        width: width + "%",
                        editable: true,
                        type: cells._Widget,
                        styles: 'text-align: right;'
                    },
                    cells: tableData.columns
                }];

                var objectStore = new Memory({data: tableData.rows});
                this.dataStore = new ObjectStore({objectStore: objectStore});
                this.backupData = jQuery.extend(true, {}, tableData);



                //	create the grid.
                var grid = new DataGrid({
                    store: this.dataStore,
                    structure: gridLayout,
                    escapeHTMLInData: false,
                    height: (tableData.rows.length * 45)+'px', // la alçada de cada fila
                });

                grid.placeAt($container[0]);
                grid.startup();


                // AFEGIR Buttons
                var context = this;


                var addKeyButton = new Button({
                    label: "Afegir clau!",

                    onClick: function () {
                        alert("TODO: afegir clau");
                    }
                });
                addKeyButton.placeAt($toolbar[0])
                addKeyButton.startup();


                var removeKeyButton = new Button({
                    label: "Eliminar clau!",

                    onClick: function () {
                        alert("TODO: remove clau");
                    }
                });
                removeKeyButton.placeAt($toolbar[0]);
                removeKeyButton.startup();

                var saveKeyButton = new Button({
                    label: "Desar!",

                    onClick: function () {
                        // TODO! actualitzar el backupData

                        alert("TODO: clicked desar");
                        context.hide();
                    }
                });
                saveKeyButton.placeAt($toolbar[0]);
                saveKeyButton.startup();

                var cancelKeyButton = new Button({
                    label: "Cancel·lar!",

                    onClick: function () {

                        console.log("Datastore?", grid.store);
                        console.log("Original data?", context.backupData);

                        // TEST1: Eliminar els elements d'un en un
                        // Primer eliminem tots els elements del store
                        // var removeIds = [];
                        //
                        // for (var i in grid.store.objectStore.data) {
                        //     console.log("Eborrant id", grid.store.objectStore.data[i].id);
                        //     removeIds.push(grid.store.objectStore.data[i].id);
                        // }
                        //
                        // for (i = 0; i<removeIds.length; i++) {
                        //     grid.store.objectStore.remove(removeIds[i]);
                        // }
                        //
                        //
                        // console.log("Esborrats?", grid.store);
                        //
                        // alert("stop");
                        // // A continuació afegim les files
                        // for (i=0; i<context.backupData.rows.length; i++) {
                        //     grid.store.objectStore.add(context.backupData.rows[i]);
                        // }

                        // TEST2: Reemplaçar l'store <-- cap efecte al grid
                        var objectStore = new Memory({data: context.backupData.rows});
                        context.dataStore = new ObjectStore({objectStore: objectStore});

                        grid.setStore(context.dataStore);


                        context.hide();

                    }
                });
                cancelKeyButton.placeAt($toolbar[0]);
                cancelKeyButton.startup();













                //     editor.editor.on('CancelDialog', cancelCallback);
                //     editor.editor.on('SaveDialog', saveCallback);

                this.widgetInitialized = true;
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
            }

        });


});
