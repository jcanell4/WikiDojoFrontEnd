define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dijit/_editor/_Plugin",
    // "dojox/editor/plugins/CustomTablePlugins",
    "ioc/dokuwiki/editors/DojoManager/plugins/CustomTablePlugins",
    "dijit/Dialog",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/insertTable.html",
    "dojo/i18n!./nls/TableDialog",
    'dojo/i18n!ioc/dokuwiki/editors/nls/commands',

], function (declare, AbstractDojoPlugin, _Plugin, TablePlugins, Dialog,
             lang, _WidgetBase,
             _TemplatedMixin, _WidgetsInTemplateMixin,
             insertTableTemplate,
             tableDialogStrings,
             localization
) {


    var EditorTableDialog = declare("dojox.editor.plugins.EditorTableDialog", [Dialog, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //		Dialog box with options for table creation

        baseClass: "EditorTableDialog",

        templateString: insertTableTemplate,

        tableId: 'Identificador',

        inputType: '',
        inputFooter: '',
        inputTableId: '',
        boxType: '',

        postMixInProperties: function () {
            dojo.mixin(this, tableDialogStrings);
            this.inherited(arguments);
        },

        postCreate: function () {
            dojo.addClass(this.domNode, this.baseClass); //FIXME - why isn't Dialog accepting the baseClass?
            this.inherited(arguments);
        },

        onInsert: function () {

            var rows = this.selectRow.get("value") || 1,
                cols = this.selectCol.get("value") || 1,
                _id = "tbl_" + (new Date().getTime()),


                // El template conté la informació a mostrar pel dialog, aquesta es la que s'insereix al document

                pre = '<div data-dw-box="' + this.boxType.get("value") + '" id="box_' + _id + '" class="ioctable'
                    + ' ' +this.inputType.get("value")
                    + ' ioc' +this.boxType.get("value")
                    + '" data-dw-type="' + this.inputType.get("value") + "\">\n",
                info = '<div class="iocinfo"><a id="' + this.inputTableId.get("value")+ '" data-dw-link="table"><b contenteditable="false" data-dw-field="id">ID:</b> ' + this.inputTableId.get("value") + '<br></a>'
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
                console.log("inserint paràgraf anterior");
                $node.before(jQuery('<p>&nbsp;</p>'));
            }

            if ($next.length === 0 || !$next.is('p')) {
                // Afegim un salt de línia com a separador
                $node.after(jQuery('<p>&nbsp;</p>'));
            }

            // Aquest codi és el mateix que es troba a DojoActionAddParagraph, s'ha de duplicar perquè
            // aquesta classe hereta de la taula original de dojo, no es propia i no fa servir el nostre
            // sistema de parse
            var $aux = jQuery('<div class="no-render action" contenteditable="false"><span>' + localization["ioc-action-add-paragraph"] + '</span></div>');


            $aux.on('click', function () {
                // Afegim un salt de línia com a separador
                // console.log("inserint paràgraf anterior");
                $node.after(jQuery('<p>' + localization["ioc-action-add-paragraph-placeholder"] + '</p>'));
            });
            $node.append($aux);


            // Eliminem el listener per editar els enllaços del info (que no han de tractar-se com enllaços)
            $node.find('[data-dw-link]').on('dblclick', function(e) {
                e.preventDefault();
                return false;
            })

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
            // alert("taula construida");
        }
    });

    var InsertTable = declare("dojox.editor.plugins.InsertTable", [TablePlugins, AbstractDojoPlugin], {
        alwaysAvailable: true,

        modTable: function () {
            var w = new EditorTableDialog({plugin: this, editor: this.editor, boxType: this.boxType});
            w.show();

            var c = dojo.connect(w, "onBuildTable", this, function (obj) {
                dojo.disconnect(c);


                // console.log("insertant taula", obj.htmlText);

                this.editor.focus();
                this.editor.execCommand('inserthtml', obj.htmlText);

            });
        },

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
                onClick: lang.hitch(this, "process"),

            };

            this.footer = args.footer;

            this.addButton(config);

            this.button.set('disabled', false);

            this.editor.on('changeCursor', this.updateCursorState.bind(this));


        },

        updateCursorState: function (e) {

            // console.log(e);

            if (e.$node) {
                if (e.$node.closest('table, [data-dw-box]').length > 0) {
                    this.button.set('disabled', true);
                } else {
                    this.button.set('disabled', false);
                }

            }

        },

        process: function () {
            this.modTable();
        },

    });


    _Plugin.registry["insertTable"] = function (args) {
        return new InsertTable(args);
    };


    return InsertTable;

});