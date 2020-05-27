define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActions',
    // 'ioc/dokuwiki/editors/DojoManager/plugins/DojoMediaFormatFigure',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
], function (declare, AbstractParseableDojoPlugin, dojoActions, /*DojoMediaFormatFigure,*/ lang, _Plugin, string) {

    var TIMER_INTERVAL = 0.1;
    var timer = null;


    // var MediaButton = declare([AbstractParseableDojoPlugin, DojoMediaFormatFigure], {
    var MediaButton = declare(AbstractParseableDojoPlugin, {

        init: function (args) {
            this.inherited(arguments);

            //this.documentPreviewComponent= new DocumentPreviewComponent(this.editor.dispatcher);

            this.template = args.htmlTemplate;

            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon, // TODO[Xavi] el prefix ha de canviar per correspondre amb una classe CSS que mostri la icona
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };

            this.addButton(config);
        },


        _showDialog: function ($previousNode) {
            //this.documentPreviewComponent.send();
            // Opció 1: cridar directament a tb_mediapopup(btn, props, edid)

            // obtenir el id del document

            var edid = 'textarea_' + this.editor.id + '_media';


            // eliminem qualsevol textarea anterior. Alternativa: si existeix deixar aquest i no crear cap de nou
            jQuery('textarea#' + edid).remove();
            clearInterval(timer);

            // Afegim un de nou
            var $textarea = jQuery('<textarea>').attr('id', edid);
            $textarea.css('display', 'none');

            jQuery('body').append($textarea);


            // Canvia al textarea es fa mitjançant expresions regulars directament sobre el text,
            // no es dispara cap event

            var context = this;

            timer = setInterval(function () {
                var value = $textarea.val();
                if (value.length > 0) {
                    clearInterval(timer);
                    // this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));

                    context.insertHtml(value, $previousNode);


                    // context.editor.execCommand('inserthtml', value);

                    timer = null;
                    $textarea.remove();
                }

            }, TIMER_INTERVAL);

            tb_mediapopup(
                null,
                {
                    name: 'mediaselect', // name per la segona opció de window.open()
                    options: 'width=750,height=500,left=20,top=20,scrollbars=yes,resizable=yes', // options pel tercer paràmetre de la funció window.open()
                    url: 'lib/exe/mediamanager.php?ns='
                },
                edid
            );

        },

        _processFull: function () {
            this._showDialog();

        },

        insertHtml: function (value, $previousNode) {


            var html = this.wikiImageToHTML(value);

            // Fem servir el mateix sistema que al DojoWikiBlock, creem un node com a ancla
            this.editor.execCommand('insertparagraph');
            $previousNode = jQuery(this.editor.getCurrentNode()[0]);


            var $node;


            if ($previousNode) {
                $node = jQuery(html);
                $previousNode.replaceWith($node);
            } // else {
            //     this.editor.execCommand('inserthtml', html);
            //     var id = jQuery(html).attr('data-ioc-id');
            //
            //     // ALERTA: Per alguna raó el .find() no troba els id normals d'html, per això es fa servir atribut propi
            //     var $node = jQuery(this.editor.iframe).contents().find('[data-ioc-id="' + id +'"]');
            // }

            this.editor.forceChange();

            // TODO: Afegir aquí els botons que calguin

            this._addHandlers($node);
        },

        wikiImageToHTML: function (value) {
            // Entrada: {{:0xb6mp.jpg?200|}};

            var reg = new RegExp('{{:(.*)\\?');
            var file = value.match(reg);


            var chunks = file[1].split('|');
            var ns = chunks[0];

            // Si es troba a l'arrel cal incloure els :
            if (ns.indexOf(':') === -1) {
                ns = ':' + ns;
            }

            var title = '';
            if (chunks.length > 1) {
                title = chunks[1];
            }


            var tok = ''; // Es necessari el tok per canviar la mida, si no es pasa dona error 412 però aquesta
            // informació no es passa desde la finestra. De totes maneres no cal passar el paràmetre, la mida
            // la podem ajustar directament a la etiqueta

            var url = 'lib/exe/fetch.php?'
                // +'w=' + width[1]
                + 'media=' + ns;
            // +'&media=' + file[1];
            // +'&tok=' + tok;

            var id = ns + Date.now();

            // var html = '<img data-ioc-media data-ioc-id="' + id + '" src="' + url + '"/ style="width:' + width[1] + 'px;">'; // TODO: cal ficar alt o títol?

            // '<div class="iocgif"><img src="${url}" alt="${title}" title="${title}" "/></div>',

            var data = {
                url: url,
                id: id,
                title: title,
                ns: ns
            };

            return string.substitute(this.template, data);
        },

        parse: function () {
            var $nodes = jQuery(this.editor.iframe).contents().find('.iocgif');
            var context = this;

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });

        },

        _addHandlers: function ($node) {

            console.log("Afegint handlers a media format gif. node:", $node);

            // ALERTA! No es pot controalr si es prem la tecla d'esborrar aquí perque el keypress es gestionat pel editor

            var context = this;

            $node.find('.no-render').remove();

            var $actions = jQuery('<div class="no-render action" contenteditable="false">');

            $node.append($actions);

            $node.on('dblclick', function (e) {
                e.preventDefault();
                e.stopPropagation();

                context._showDialog(jQuery(this));
            });

            dojoActions.addParagraphAfterAction($node, context.editor);
            dojoActions.addParagraphBeforeAction($node, context.editor);
            dojoActions.deleteAction($node, context.editor, this.elementType);
            dojoActions.setupContainer($node, $actions);
        }

    });


    // Register this plugin.
    _Plugin.registry["insert_media"] = function () {
        return new MediaButton({command: "insert_media"});
    };

    return MediaButton;
});