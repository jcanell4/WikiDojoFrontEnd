define([
    'dojo/_base/declare',
    "dojox/grid/DataGrid",

    
], function (declare, DataGrid) {

    return declare([DataGrid],
        {
            addingRow: false,

            _onFetchBegin :  function(size, req) {

                // Fix per evitar que s'esborri tota la taula en fer una inserció després d'eliminar 1 fila
                if (size) {
                    this.updateRowCount(size);
                }

                this.inherited(arguments);

            },

            getSortProps: function(inSortInfo){

                var ret = this.inherited(arguments);

                if (this.addingRow) {
                    return {};
                }

                return ret;
            },

        });

});
