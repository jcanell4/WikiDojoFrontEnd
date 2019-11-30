define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    "dijit/_editor/_Plugin",
    "dojox/editor/plugins/TablePlugins",
    "dijit/Dialog",
    "dojo/_base/lang",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dojo/text!./templates/insertTable.html",
    "dojo/i18n!./nls/TableDialog",

], function (declare, AbstractParseableDojoPlugin, _Plugin, TablePlugins, Dialog,
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

                pre = '<div id="box_' + _id + '" class="ioctable ' + this.inputType.get("value") + '" data-dw-type="'
                    + this.inputType.get("value") + "\" data-dw-box=\"table\">\n",
                info = '<div class="iocinfo"><b contenteditable="false" data-dw-field="id">ID:</b> ' + this.inputTableId.get("value") + '<br>'
                    + '<b contenteditable="false" data-dw-field="title">Títol:</b> ' + this.inputTitle.get("value") + '<br>'
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

            // TODO: suposem que en aquest punt s'ha de trobar al editor el html inserit, cerquem els camps
            var $node = jQuery(this.plugin.editor.iframe).contents().find('#box_' + _id).find('[data-dw-field]');

            this.plugin._addHandlers($node/*, this*/);

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

        // onBuildTable: function (tableText) {
        //     //stub
        //     // console.log("tableText:", tableText);
        // }
    });

    var InsertTable = declare("dojox.editor.plugins.InsertTable", [TablePlugins, AbstractParseableDojoPlugin], {
        alwaysAvailable: true,

        modTable: function () {
            var w = new EditorTableDialog({plugin: this});
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
                onClick: lang.hitch(this, "process")
            };

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

        parse: function () {

            // TODO
            var $nodes = jQuery(this.editor.iframe).contents().find('.ioc-comment-block');
            var context = this;

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });

        },

        _addHandlers: function ($nodes/*, context*/) {
            // TODO
            console.log("Adding handlers (fields?)", $nodes);

            $nodes.each(function () {
                var $node = jQuery(this);
                console.log($node);
                // Els events keypress no funcionen
                // $node.on('keypress keydown keyup paste cut', function (e) {
                //     e.preventDefault();
                //     e.stopPropagation();
                //     alert("Ignorem event");
                // });


                // $node.on('click dblclick', function (e) {
                //     console.log(e);
                //     e.preventDefault();
                //     e.stopPropagation();
                //     alert("Ignorem event");
                // });

                // $node.keypress(function (e) {
                //     e.preventDefault();
                //     e.stopPropagation();
                //     alert("Ignorem event específic");
                // });
            });



        },


    });


    _Plugin.registry["insertTable"] = function (args) {
        return new InsertTable(args);
    };


    return InsertTable;

});