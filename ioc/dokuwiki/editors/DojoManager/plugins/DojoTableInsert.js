define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dijit/_editor/_Plugin",
    "dojox/editor/plugins/TablePlugins",
    "dijit/Dialog",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/insertTable.html",
    // "ioc/dokuwiki/editors/DojoManager/plugins/templates/insertTable.html",
    "dojo/i18n!./nls/TableDialog",

], function (declare, AbstractDojoPlugin, _Plugin, TablePlugins, Dialog,
             lang, _WidgetBase,
             _TemplatedMixin, _WidgetsInTemplateMixin,
             insertTableTemplate,
             tableDialogStrings
) {


    var EditorTableDialog = declare("dojox.editor.plugins.EditorTableDialog", [Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //		Dialog box with options for table creation

        baseClass: "EditorTableDialog",

        templateString: insertTableTemplate,

        tableId: 'Identificador',

        postMixInProperties: function () {
            dojo.mixin(this, tableDialogStrings);
            this.inherited(arguments);
        },

        postCreate: function () {
            dojo.addClass(this.domNode, this.baseClass); //FIXME - why isn't Dialog accepting the baseClass?
            this.inherited(arguments);
        },

        onInsert: function () {
            console.log("insert");

            var rows = this.selectRow.get("value") || 1,
                cols = this.selectCol.get("value") || 1,
                _id = "tbl_" + (new Date().getTime()),


                // TODO: Afegir abans l'apertura de la taula

                pre = '<div class="ioctable ' + this.inputType.get("value") + '" data-dw-type="'
                    + this.inputType.get("value") + "\" data-dw-box=\"table\">\n",
                info = '<div class="iocinfo"><b data-dw-field="id">ID:</b> ' + this.inputTableId.get("value") + '<br>'
                    + '<b data-dw-field="title">Títol:</b> ' + this.inputTitle.get("value") + '<br>'
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
            console.log("tableText:", tableText);
        }
    });

    var InsertTable = declare("dojox.editor.plugins.InsertTable", TablePlugins, {
        alwaysAvailable: true,

        modTable: function () {
            var w = new EditorTableDialog({});
            w.show();
            var c = dojo.connect(w, "onBuildTable", this, function (obj) {
                dojo.disconnect(c);

                this.editor.focus();
                var res = this.editor.execCommand('inserthtml', obj.htmlText);

                // commenting this line, due to msg below
                //var td = this.editor.query("td", this.editor.byId(obj.id));

                //HMMMM.... This throws a security error now. didn't used to.
                //this.editor.selectElement(td);
            });
        }
    });


    function registerGeneric(args) {
        return new TablePlugins(args);
    }

    _Plugin.registry["insertTable"] = function (args) {
        return new InsertTable(args);
    };


    var TableInsertClass = declare([TablePlugins, AbstractDojoPlugin], {


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

            if (selectedCells.length > 1) {
                this.button.set('disabled', true);
            } else {
                this.button.set('disabled', false);
            }
        },

        process: function () {
            // TODO: Eque fem al process?
            alert("process insert table");
            // var selectedCells = this.getSelectedCells();
            // // jQuery(this.getSelectedCells()[0]).attr('colspan', 2);
            //
            //
            // var $firstCell = jQuery(selectedCells[0]);
            // // var $previousRow = $firstCell.parent()[0];
            // var cols = $firstCell.attr('colspan') ? $firstCell.attr('colspan') : 1;
            // var rows = 1;
            // var maxCols = cols;
            // var maxRows = $firstCell.attr('rowspan') ? $firstCell.attr('rowspan') : 1;
            //
            // var previousRows = [];
            // previousRows.push($firstCell.parent()[0]);
            //
            // // El recorregut de les cel·les seleccionades es fa d'esquerra a dreta i d'adalt cap avall
            // for (var i = 1; i < selectedCells.length; i++) {
            //     var $selectedCell = jQuery(selectedCells[i]);
            //
            //     if (previousRows.indexOf($selectedCell.parent()[0]) > -1) {
            //
            //         if ($selectedCell.attr('colspan')) {
            //             cols += $selectedCell.attr('colspan');
            //         } else {
            //             cols++;
            //         }
            //
            //
            //     } else {
            //         // ALERTA[Xavi] si es fa un merge amb una cel·la amb rowspawn el càlcul no serà correcte
            //         // - calcular un valor auxiliar com a maxrows
            //
            //
            //         if ($selectedCell.attr('rowspan')) {
            //             maxRows = Math.max(rows + $selectedCell.attr('rowspan'), maxRows);
            //         }
            //
            //         rows++;
            //         previousRows.push($selectedCell.parent()[0]);
            //
            //         if (cols > maxCols) {
            //             maxCols = cols;
            //         }
            //
            //         cols = 1;
            //         console.log("rows:", rows);
            //
            //     }
            //
            //     maxRows = Math.max(rows, maxRows);
            //
            //
            //     $selectedCell.remove();
            // }
            //
            // $firstCell.attr('colspan', maxCols);
            // $firstCell.attr('rowspan', maxRows);
            // $firstCell.attr('data-ioc-merged', true);
            //
            //
            // this.makeColumnsEven();
        }


    });


    return TableInsertClass;
});