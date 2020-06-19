define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActions',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",


], function (declare, AbstractParseableDojoPlugin, dojoActions, lang, _Plugin, string) {


    /*
     Al node generat per aquest plugin trobem dos tipus d'atributs propis:
        * Tipus de bloc, aquests son generics i permet agrupar-los, per exemple les taules normals i de contabilitat son data-ioc-table:
            - data-ioc-table
            - data-ioc-figure
            - data-ioc-etc

        * Tipus de plugin, aquests son individuals per cada configuració del plugin i permeten discriminar entre els elements del mateix tipus per obrir el dialeg corresponent al botó (es generen a partir del títol del botó), per exemple:
             - data-ioc-block-sintaxi-de-taula
             - data-ioc-block-sintaxi-de-quote

     Nota: pel correcte funcionament s'ha de generar un ID únic per cada element, aquest es genera automàticament
     en base al timestamp si no es troba l'atribut id a les dades. En cas contrari no funcionaran correctament les opcions
     d'editar i eliminar.
     */


    var WikiBlockButton = declare(AbstractParseableDojoPlugin, {

        elementType: 'bloc',

        init: function (args) {
            this.inherited(arguments);

            this.prompt = args.prompt;
            this.htmlTemplate = args.htmlTemplate;
            this.data = args.data;
            this.requiredData = args.requiredData;
            this.sample = args.sample;
            this.title = args.title;


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

            this.editor.on('changeCursor', this.updateCursorState.bind(this));

            this.addButton(config);
        },


        updateCursorState: function (e) {
            // console.log("state:", e.state);

            // Si hi ha algun guió es que es troba a més d'un node de profunditat, en principi l'unic node que es pot
            // trobar es 'p', en qualsevol cas no es pot afegir.
            if (e.state.indexOf('-') > -1) {
                // this.button.set('checked', false);
                this.button.setDisabled(true);
            } else {
                // this.button.set('checked', true);
                this.button.setDisabled(false);
            }
        },


        process: function () {

            if (this.data.length > 0) {
                this._showDialog(this.data);
            } else {
                this.data.json = "[]";
                this._callback(this.data);
            }
        },

        _showDialog: function (data, previousId) {


            var dialogManager = this.editor.dispatcher.getDialogManager();

            this.previousId = previousId;

            if (!previousId) {
                for (var i = 0; i < data.length; i++) {
                    data[i].value = '';
                }
            }


            var dialog = dialogManager.getDialog('form', this.editor.id, {
                title: this.title,
                id: previousId || Math.random(),
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

            return dialog;
        },

        _substitute: function (template, data) {
            return string.substitute(template, data);
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

            var $html = jQuery(html);

            $html.attr('data-ioc-id', this.normalize($html.attr('data-ioc-id')));
            var id = jQuery(html).attr('data-ioc-id');
            // var text = '';

            var $previousNode;

            if (this.previousId) {
                $previousNode = jQuery(this.editor.iframe).contents().find('[data-ioc-id="' + this.previousId + '"]');
            }

            // Si un node opcional es buit l'eliminem
            $html.find('[data-ioc-optional]').each(function () {
                    var $this = jQuery(this);

                    if ($this.text().length === 0) {
                        $this.remove();
                    }
                }
            );

            var $nodeCursor;
            var $node;

            console.log('Current node state', this.editor.getCurrentNodeState());

            if ($previousNode) {
                console.log("Trobat $previousNode", $previousNode);

                var $cursor = jQuery('<div>esborrar</div>');
                $cursor.insertBefore($previousNode);

                this.editor.setCursorToNodePosition($cursor.get(0));

                $nodeCursor = jQuery(html);
                $previousNode.replaceWith($nodeCursor);


                $cursor.remove();


            } else {

                // Inserim un node per fer servir d'ancla per inserir el nou contingut, execCommand('inserthtml') és inconsistent entre navegadors

                // Problema! això insereix un block complet, no es vàlid en el cas dels links

                switch (this.elementType) {
                    case 'element':
                        console.log("element");
                        this.editor.execCommand('insertHtml', html);
                        $node = jQuery(this.editor.getCurrentNode()[0]);
                        break;

                    case 'bloc':
                        console.log("bloc");
                        this.editor.execCommand('insertparagraph');
                        $previousNode = jQuery(this.editor.getCurrentNode()[0]);
                        $cursor = $previousNode.prev();
                        $cursor.replaceWith($html);
                        $node = $html;

                        break;

                }


            }

            console.log("$node", $node);


            this._addHandlers($node);

            this.editor.forceChange();

            // Com que el valor de data.id pot venir de this.data si s'asigna un cop es queda fixat per a tots els nous elements generats
            if (volatileId) {
                data.id = undefined;
            }
        },


        _addHandlers: function ($node) {

            // Eliminem tots els elements 'no-render' ja que aquests són elements que s'afegeixen dinàmicament.
            $node.find('.no-render').remove();

            // $node.css('border-width', '1px');
            // $node.css('border-style', 'dotted');
            // $node.css('border-color', 'dodgerblue');


            var context = this;

            var $actions = jQuery('<div class="no-render action" contenteditable="false">');

            $node.append($actions);

            if (!$node.attr('data-ioc-link')) {
                dojoActions.addParagraphAfterAction($node, context.editor);
                dojoActions.addParagraphBeforeAction($node, context.editor);

            }
            dojoActions.deleteAction($node, context.editor, this.elementType);

            dojoActions.setupContainer($node, $actions);

        },

        parse: function () {

            var $nodes = jQuery(this.editor.iframe).contents().find('[data-ioc-block-' + this.normalize(this.title) + ']');

            if ($nodes.length === 0) {
                $nodes = jQuery(this.editor.iframe).contents().find('[data-dw-box-text]');
            } else {
                console.warn('S\'ha detectat l\'ús de data-ioc-block-');
            }

            var context = this;

            // console.log("parsing nodes:", $nodes)

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });
        },

        // Canviem els espais per guions i eliminem la resta de caràcters conflictius habituals
        normalize: function (string) {
            var normalized = string.split(' ').join('-');

            normalized = normalized.toLowerCase().replace(/[ñçàèòáéíóúüï'·]+/g, '');

            return normalized;
        }


    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_block"] = function () {
        return new WikiBlockButton({command: "insert_wiki_block"});
    };

    return WikiBlockButton;
});