define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoMediaFormat',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    'dojo/i18n!ioc/dokuwiki/editors/nls/commands',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActions',
], function (declare, AbstractParseableDojoPlugin, DojoMediaFormat, lang, _Plugin, string, localization, dojoActions) {

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


    var WikiMediaFormatFigure = declare([AbstractParseableDojoPlugin, DojoMediaFormat], {

        init: function (args) {
            this.inherited(arguments);

            this.prompt = args.prompt;
            this.htmlTemplate = args.htmlTemplate;
            this.data = args.data;
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

            this.addButton(config);

            this.button.set('disabled', true);

            this.editor.on('changeCursor', this.updateCursorState.bind(this));
        },

        updateCursorState: function (e) {

            // console.log(e);

            // només es permet inserir images fora de contenidors
            if (e.state && e.state !== 'p') {
                this.button.set('disabled', true);
            } else {
                this.button.set('disabled', false);
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

        _callback: function (data) {

            console.log('data', data);
            if (!data.image) {
                alert("No s'ha afegit cap imatge.");
                return;
            }

            var volatileId = false;

            if (data.id === undefined) {
                data.id = Date.now();
                volatileId = true;
            }

            this.id = data.id;

            // el json es genera al DialogManager#_getFormDialog()

            var html = string.substitute(this.htmlTemplate, data);

            var $html = jQuery(html);

            $html.attr('data-ioc-id', this.normalize($html.attr('data-ioc-id')));
            var id = jQuery(html).attr('data-ioc-id');
            var text = '';

            if (this.previousId) {
                var $contents = jQuery(this.editor.iframe).contents();

                text = $contents.find('[data-ioc-id="' + this.previousId + '"] .editable-text').html();
                $contents.find('[data-ioc-id="' + this.previousId + '"]').remove();
            }

            // Si un node opcional es buit l'eliminem
            $html.find('[data-ioc-optional]').each(function () {
                    var $this = jQuery(this);

                    if ($this.text().length === 0) {
                        $this.remove();
                    }
                }
            );


            this.editor.execCommand('inserthtml', html);

            var $node = jQuery(this.editor.iframe).contents().find('[data-ioc-id="' + id + '"]');
            $node.attr('data-ioc-block-' + this.normalize(this.title), true);

            $node.find('img').remove();

            var $img = jQuery(data.image);
            $node.append($img);


            this.lastId = id;

            // S'ha de restaurar el text aquí
            if (text && text.length > 0) {
                $node.find('.editable-text').html(text);
            }

            this._addHandlers($node);

            var $prev = $node.prev();
            var $next = $node.next();

            if ($prev.length === 0 || !$prev.is('p')) {
                // Afegim un salt de línia com a separador
                console.log("inserint paràgraf anterior");
                $node.before(jQuery('<p>&nbsp;</p>'));
            }

            if ($next.length === 0 || !$next.is('p')) {
                // Afegim un salt de línia com a separador
                console.log("inserint paràgraf posterior");
                $node.after(jQuery('<p>&nbsp;</p>'));
            }




            // Com que el valor de data.id pot venir de this.data si s'asigna un cop es queda fixat per a tots els nous elements generats
            if (volatileId) {
                data.id = undefined;
            }
        },

        _addHandlers: function ($node) {

            // ALERTA! Aquest és el problema, s'elimina el contenidor .no-render i per això es perd el action del paràgraph
            // Això es fa també a un altre parell de plugins (com a mínim a bloc)

            //$node.find('.no-render').remove();

            var context = this;

            // var $container = $node.find('.action');
            //
            // if ($container.length === 0) {
            //     $container = jQuery('<div class="no-render action" >');
            //     $node.append($container);
            // }

            // var $delete = $container.find('.delete');
            //
            // if ($delete.length === 0) {
            //     $delete = jQuery('<a contenteditable="false" class="delete">eliminar</a>');
            //     $container.prepend($delete);
            // }

            $node.prop('contenteditable', false);
            $node.find('.iocinfo').prop('contenteditable', true);

            $node.find('img').off('dblclick');

            $node.find('img').on('dblclick', function (e) {


                var edid = 'textarea_' + context.id + '_media';


                // eliminem qualsevol textarea anterior. Alternativa: si existeix deixar aquest i no crear cap de nou
                jQuery('textarea#' + edid).remove();
                clearInterval(timer);

                // Afegim un de nou
                var $textarea = jQuery('<textarea>').attr('id', edid);
                $textarea.css('display', 'none');

                jQuery('body').append($textarea);


                // Canvia al textarea es fa mitjançant expresions regulars directament sobre el text,
                // no es dispara cap event

                var $img = jQuery(this);

                $img.attr('contenteditable', false);


                timer = setInterval(function () {
                    var value = $textarea.val();
                    if (value.length > 0) {
                        clearInterval(timer);
                        // this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));

                        var html = context.wikiImageToHTML(value);

                        // $hidden.val(html);

                        var $auxImg = jQuery(html);
                        $img.attr('src', $auxImg.attr('src'));
                        $img.attr('_djrealurl', $auxImg.attr('src')); // si no es canvia aquest també no funciona

                        timer = null;
                        $textarea.remove();
                        context.editor.forceChange();
                    }

                }, 0.1);

                tb_mediapopup(
                    null,
                    {
                        name: 'mediaselect', // name per la segona opció de window.open()
                        options: 'width=750,height=500,left=20,top=20,scrollbars=yes,resizable=yes', // options pel tercer paràmetre de la funció window.open()
                        url: 'lib/exe/mediamanager.php?ns='
                    },
                    edid
                );

            });
            //
            // $delete.off('click');
            //
            // $delete.on('click', function (e) {
            //     e.preventDefault();
            //     $node.remove();
            //     context.editor.forceChange();
            //
            // });

            dojoActions.deleteAction($node, context.editor, 'figura');
            dojoActions.addParagraphAfterAction($node, context.editor);
            dojoActions.addParagraphBeforeAction($node, context.editor);
            dojoActions.setupContainer($node, $node.find('.no-render.action'));

        },

        // TODO: duplicat al Dialog Builder
        wikiImageToHTML: function (value) {
            // Entrada: {{:0xb6mp.jpg?200|}};

            // var reg = new RegExp('{{:(.*)\\?');
            var reg = new RegExp('{{:(.*?)(?:[\\?\\|\\}])');
            var file = value.match(reg);

            var width = value.match(/\?(.*?)\|/);

            var tok = '' // Es necessari el tok per canviar la mida, si no es pasa dona error 412 però aquesta
            // informació no es passa desde la finestra. De totes maneres no cal passar el paràmetre, la mida
            // la podem ajustar directament a la etiqueta

            var url = 'lib/exe/fetch.php?'
                // +'w=' + width[1]
                + 'media=' + file[1];
            // +'&media=' + file[1];
            // +'&tok=' + tok;

            var id = file[1] + Date.now();

            var auxWidth = width ? 'width:' + width[1] + 'px;' : '';

            var html = '<img data-ioc-media data-ioc-id="' + id + '" src="' + url + '"/ style="' + auxWidth + '"/>'; // TODO: cal ficar alt o títol?


            // TODO: Alineació desde el botó: hi han tres combinacions posibles que depén de les etiquetes (però no es fan servir a la wiki):
            // {{ wiki:dokuwiki-128.png}}
            // {{wiki:dokuwiki-128.png }}
            // {{ wiki:dokuwiki-128.png }}
            return html;
        },

        parse: function () {

            // var $nodes = jQuery(this.editor.iframe).contents().find('[data-ioc-block-' + this.normalize(this.title) + ']');
            var $nodes = jQuery(this.editor.iframe).contents().find('[data-dw-box="figure"]');


            // console.log("Query cercat:", '[data-ioc-block-' + this.normalize(this.title) + ']');
            var context = this;



            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });
        },

        // Canviem els espais per guions i eliminem la resta de caràcters conflictius habituals
        normalize: function (string) {
            if (!string) {
                console.warn("No es pot normalitzar:", string);
                return '';
            }

            var normalized = string.split(' ').join('-');

            normalized = normalized.toLowerCase().replace(/[ñçàèòáéíóúüï'·]+/g, '');

            return normalized;
        }


    });


    // Register this plugin.
    _Plugin.registry["insert_wiki_block"] = function () {
        return new WikiMediaFormatFigure({command: "insert_media_figure"});
    };

    return WikiMediaFormatFigure;
});