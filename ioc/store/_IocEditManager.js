define([
    "dojox/grid/_EditManager",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/connect",
    "dojo/_base/sniff",
    "dojox/grid/util",
    "dijit/registry"
], function (_EditManager, lang, array, declare, connect, has, util, registry) {

    return declare("ioc.store._IocEditManager", [_EditManager], {


        setEditCell: function (inCell, inRowIndex) {
            // summary:
            //		Set the given cell to be edited
            // inRowIndex: Integer
            //		Grid row index
            // inCell: Object
            //		Grid cell object




            if (!this.isEditCell(inRowIndex, inCell.index) && this.grid.canEdit && this.grid.canEdit(inCell, inRowIndex)) {
                this.start(inCell, inRowIndex, this.isEditRow(inRowIndex) || inCell.editable);
            }

            // delay widget injection

            var context = this;

            var timerId = setInterval(function() {
                // console.log("Works?", inCell, inRowIndex);
                // console.log("View?", inCell.view);

                var colIndex = inCell.index;
                // console.log("colIndex", colIndex);
                //
                var cellInfo = inCell.view.structure.cells[0][colIndex];
                // console.log("Cell?", cellInfo);
                // console.log("Widget?", cellInfo.widget);

                if (cellInfo.widget) {
                    clearInterval(timerId);

                    // ALERTA! No fem servir un setter perquè no tots els EditableElement fan servir aquesta informació
                    cellInfo.widget.datasource = context.datasource;
                    cellInfo.widget.gridData = {
                        cell: inCell,
                        rowIndex: inRowIndex,
                        colIndex: inCell.index,
                        grid: context.grid
                    };
                }
            }, 500);



        },

        setDataSource: function(datasource) {
            this.datasource = datasource;
        },

    });
});