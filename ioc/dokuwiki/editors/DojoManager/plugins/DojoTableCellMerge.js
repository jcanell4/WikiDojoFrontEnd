define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dijit/_editor/_Plugin",
    // "dojox/editor/plugins/TablePlugins",
    "ioc/dokuwiki/editors/DojoManager/plugins/CustomTablePlugins",
    "dojo/_base/lang",
], function (declare, AbstractDojoPlugin, _Plugin, TablePlugins, lang) {

    var TableCellMerge = declare([TablePlugins, AbstractDojoPlugin], {


        init: function (args) {
            this.inherited(arguments);

            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon,
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };

            this.addButton(config);

            this.button.set('disabled', true);

            this.editor.on('changeCursor', this.updateCursorState.bind(this));


        },

        updateCursorState: function (e) {

            var selectedCells = this.getSelectedCells();
            // console.log("Selected Cells:", selectedCells);

            if (selectedCells.length > 1) {
                this.button.set('disabled', false);
            } else {
                this.button.set('disabled', true);
            }
        },

        process: function () {

            var selectedCells = this.getSelectedCells();

            // console.log("Cel·las seleccionades:", selectedCells);

            var $parent;

            var cols = 0;
            var rows = 1;

            var mergeDetected = false;

            // 1: Primer cálculem el nombre de files i col·lumnes i comprovem que no contingui cap altre cel·la fusionada

            for (var i = 0; i < selectedCells.length; i++) {
                var $cell = jQuery(selectedCells[i]);

                if (!$parent) {
                    // és la primera cel·la
                    $parent = $cell.parent();
                }

                // 2. per les següents comprovem si el parent és el TRParent o no
                if (jQuery.contains($parent.get(0), $cell.get(0))) {
                    //      2.1 si ho és, es la mateixa fila, Cols++
                    cols++;
                } else {
                    //      2.2 si no ho és, es una nova fila, Rows++;
                    $parent = $cell.parent();
                    cols = 1;
                    rows++;
                }

                if ($cell.attr('data-ioc-merged')) {
                    mergeDetected = true;
                    break;
                }
            }


            if (mergeDetected) {
                console.log("Merge detectat, no es pot fusionar");
                alert("No es poden fusionar cel·las que ja han estat fusionades");

                return;
            }

            var $firstCell = jQuery(selectedCells[0]);

            var previousRows = [];
            previousRows.push($firstCell.parent()[0]);

            // 2: Eliminem totes les cel·les excepte la primera (esquina superior esquerra)
            for (var i = 1; i < selectedCells.length; i++) {

                var $selectedCell = jQuery(selectedCells[i]);

                // console.log("Eliminada ce·la", $selectedCell);
                $selectedCell.remove();
            }

            // 3: Afegim el colspanw, rowspan i data-ioc-merged a la cel·la restant
            $firstCell.prop('colspan', cols);
            $firstCell.prop('rowspan', rows);
            $firstCell.attr('data-ioc-merged', true);

            // console.log(cols, rows);

            this.editor.forceChange();

            this.makeColumnsEven();
        }


    });


    // Register this plugin.
    _Plugin.registry["table_merge_cell"] = function () {
        return new TableCellMerge({command: "table_merge_cell"});
    };


    // Modificiació dels plugins removeRow i removeCol
    function registerGeneric(args) {
        // TODO: sobreescriure al args alguna funció que faci que s'ignori si una cel·la seleccionada te l'atribut data-ioc-merged
        // args.startup = function() {alert("lalala")};


        args.modTable = function (cmd, args) {
            // summary:
            //		Where each plugin performs its action.
            //		Note: not using execCommand. In spite of their presence in the
            //		Editor as query-able plugins, I was not able to find any evidence
            //		that they are supported (especially in NOT IE). If they are
            //		supported in other browsers, it may help with the undo problem.

            if (dojo.isIE) {
                // IE can lose selections on focus changes, so focus back
                // in order to restore it.
                this.editor.focus();
            }

            this.begEdit();
            var o = this.getTableInfo();
            var sw = (dojo.isString(cmd)) ? cmd : this.name;
            var r, c, i;
            var adjustColWidth = false;

            switch (sw) {
                case "insertTableRowBefore":
                    r = o.tbl.insertRow(o.trIndex);
                    for (i = 0; i < o.cols; i++) {
                        c = r.insertCell(-1);
                        c.innerHTML = "&nbsp;";
                    }
                    break;
                case "insertTableRowAfter":
                    r = o.tbl.insertRow(o.trIndex + 1);
                    for (i = 0; i < o.cols; i++) {
                        c = r.insertCell(-1);
                        c.innerHTML = "&nbsp;";
                    }
                    break;
                case "insertTableColumnBefore":
                    o.trs.forEach(function (r) {
                        c = r.insertCell(o.colIndex);
                        c.innerHTML = "&nbsp;";
                    });
                    adjustColWidth = true;
                    break;
                case "insertTableColumnAfter":
                    o.trs.forEach(function (r) {
                        c = r.insertCell(o.colIndex + 1);
                        c.innerHTML = "&nbsp;";
                    });
                    adjustColWidth = true;
                    break;
                case "deleteTableRow":


                    var merged = false;

                    for (var i = o.trIndex; i >= 0; i--) {

                        for (var j = 0; j < o.trs[i].cells.length; j++) {
                            var td = o.trs[i].cells[j];


                            var rowspan = Number(jQuery(td).prop('rowspan'));

                            if (rowspan) {
                                if (o.trIndex >= i && o.trIndex <= i + rowspan - 1) {
                                    merged = true;
                                }
                            }
                        }
                        ;
                    }


                    if (merged) {
                        alert("No es poden eliminar files amb cel·les fusionades"); // TODO: canviar per un dialog de dojo i localitzar
                    } else {
                        o.tbl.deleteRow(o.trIndex);
                    }

                    break;
                case "deleteTableColumn":

                    // Comprovem que no hi hagi cap merge
                    var merged = false;

                    o.trs.forEach(function (tr) {
                        if (jQuery(tr.cells[o.colIndex]).attr('data-ioc-merged') || tr.cells[o.colIndex] === undefined) {
                            //console.log("Merged, raó:", jQuery(tr.cells[o.colIndex]).attr('data-ioc-merged'), tr.cells[o.colIndex], tr, tr.cells)
                            merged = true;
                        }
                    });

                    if (!merged) {
                        o.trs.forEach(function (tr) {
                            tr.deleteCell(o.colIndex);
                        });
                        adjustColWidth = true;
                    } else {
                        alert("No es poden eliminar columnes amb cel·les fusionades"); // TODO: canviar per un dialog de dojo i localitzar
                    }
                    break;

                case "modifyTable":
                    break;
                case "insertTable":
                    break;

            }
            if (adjustColWidth) {
                this.makeColumnsEven();
            }
            this.endEdit();
        };

        return new TablePlugins(args);
    }

    _Plugin.registry["deleteTableRow"] = registerGeneric;
    _Plugin.registry["deleteTableColumn"] = registerGeneric;


    return TableCellMerge;
});