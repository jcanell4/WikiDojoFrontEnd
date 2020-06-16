define([
    'dojo/_base/declare',
    "dojox/grid/DataGrid",
    "dojox/grid/_RowManager",
    "dojox/grid/_FocusManager",
    "ioc/store/_IocEditManager"

], function (declare, DataGrid, _RowManager, _FocusManager, _EditManager) {

    return declare([DataGrid],
        {
            addingRow: false,

            _onFetchBegin: function (size, req) {

                // Fix per evitar que s'esborri tota la taula en fer una inserció després d'eliminar 1 fila
                if (size) {
                    this.updateRowCount(size);
                }

                this.inherited(arguments);

            },

            getSortProps: function (inSortInfo) {

                var ret = this.inherited(arguments);

                if (this.addingRow) {
                    return {};
                }

                return ret;
            },


            // setEditCell: function()
            //
            // postCreate: function () {
            //     this.inherited(arguments);
            //
            //     var func = this.edit.setEditCell;
            //     var editManager = this.edit;
            //
            //     this.edit.setEditCell = function (inCell, inRowIndex) {
            //         console.log("inCell", inCell);
            //         console.log("inRowIndex", inRowIndex);
            //         // alert("Works!");
            //
            //         console.log("this:", this);
            //         func(arguments);
            //     }.bind(this);
            //
            //     // this.start(inCell, inRowIndex, this.isEditRow(inRowIndex) || inCell.editable);
            //
            // },

            // @override, canviem el editmanager
            createManagers: function(){
                // summary:
                //		create grid managers for various tasks including rows, focus, selection, editing

                // row manager
                this.rows = new _RowManager(this);
                // focus manager
                this.focus = new _FocusManager(this);
                // edit manager
                this.edit = new _EditManager(this);
            },
        });

});
