define([
    "dojo/_base/declare",
    // 'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWikiBlock',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/_editor/range",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoUtils',
], function (declare, DojoWikiBlock, lang, _Plugin, string, range, DojoUtils) {


    var WikiBlockButton = declare(DojoWikiBlock, {

        elementType : 'element',

        init: function (args) {
            this.inherited(arguments);

            this.prompt = args.prompt;
            this.htmlTemplate = args.htmlTemplate;
            this.requiredData = args.requiredData;
            this.data = args.data;
            this.title = args.title;
            //this.target = args.target;
            this.targets = args.targets;
            this.types = args.types;

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
        },

        _showDialog: function (data, previousId) {

            var $contents = jQuery(this.editor.iframe).contents();

            if (previousId) {
                var node = $contents.find('[data-ioc-id="' + previousId + '"]').get(0); // aquesta es la part que s'eliminarà
                this.editor.setCursorToNodePosition(node);
            }

            var dialogManager = this.editor.dispatcher.getDialogManager();

            this.previousId = previousId;

            data[0].options = [];

            for (var i=0; i<this.targets.length; i++) {
                data[0].options = data[0].options.concat(this._getLinkIds(this.targets[i]));
            }

            var selectedOption;
            // Cerquem el index corresponent al node previous
            if (node) {
                for (i = 0; i < data[0].options.length; i++) {

                    if ('#' + data[0].options[i] === jQuery(node).attr('href')) {
                        selectedOption = data[0].options[i];
                        break;
                    }
                }
            }

            if (selectedOption) {
                data[0].value = selectedOption;
            }


            var dialog = dialogManager.getDialog('form', this.editor.id, {
                title: this.title,
                message: this.prompt, // TODO: localitzar
                data: data,
                ok: {
                    text: 'Inserir' // localitzar
                },
                cancel: {
                    text: 'Cancel·lar' // localitzar
                },
                callback: this._callback.bind(this)
            });

            dialog.show();
        },

        _getLinkIds: function(target) {
            var $contents = jQuery(this.editor.iframe).contents();
            var $targets = $contents.find('[' + target + '] .iocinfo a');

            var linkIds = [];
                $targets.each(function() {

                    var $this = jQuery(this);
                    // Si no s'ha especificat un ID ho ignorem
                    if ($this.html()) {

                        var text = ($this.text().replace('ID: ', '')).trim();

                        $this.attr('name', text);
                        linkIds.push(text);
                    }

                });

            return linkIds;

        },

        parse: function () {

            // No modifiquem el pare perque no tinc clar a quines classes afecta
            var counter = 0;

            for (var i=0; i<this.types.length; i++) {
                var type = this.types[i];
                var $nodes = jQuery(this.editor.iframe).contents().find('[data-ioc-link="' + type +'"]');
                var context = this;

                $nodes.each(function () {

                    // Afegim els ids
                    var nodeId = 'link_' + type + '_' + counter++;

                    jQuery(this).attr('data-ioc-id', nodeId);
                    context._addHandlers(jQuery(this)/*, context*/);
                });
            }

        },

        _addHandlers: function ($node) {

            // Eliminem tots els elements 'no-render' ja que aquests són elements que s'afegeixen dinàmicament.
            // En el cas dels enllaços no es troba dins, si no a continuació
            $node.siblings('.no-render').remove();

            $node.on('click', function (e) {
               // Desactivem el click al node
               e.preventDefault();
            });

            var context = this;

            $node.off('dblclick');
            $node.on('dblclick', function(e) {
                e.preventDefault();
                e.stopPropagation();

                //context.editor.setCursorToNodePosition(this);

                // TODO, obtenir el previousId;
                context._showDialog(context.data, jQuery(this).attr('data-ioc-id'));
                //this._showDialog(this.data, previousId);
            });

            this.inherited(arguments);
            $node.css('cursor', 'default');
            $node.find('a').css('cursor', 'pointer');
        },

        _callback: function (data) {

            for (var i = 0; i < this.requiredData.length; i++) {
                var key = this.requiredData[i];
                if (data[key] === undefined) {
                    console.warn('Missing data: ' + key);
                    return;
                }
            }

            var volatileId = false;

            if (data.id === undefined) {
                data.id = Date.now();
                volatileId = true;
            }

            // el json es genera al DialogManager#_getFormDialog()
            var html = this._substitute(this.htmlTemplate, data);

            var $node = DojoUtils.insertHtmlInline(html, this.editor);

            this._addHandlers($node);

            this.editor.forceChange();

            // Com que el valor de data.id pot venir de this.data si s'asigna un cop es queda fixat per a tots els nous elements generats
            if (volatileId) {
                data.id = undefined;
            }
        },


    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_link"] = function () {
        return new WikiBlockButton({command: "insert_wiki_link"});
    };

    return WikiBlockButton;
});