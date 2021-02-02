define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
], function (declare, AbstractParseableDojoPlugin, lang, _Plugin) {

    var TIMER_INTERVAL = 0.1;
    var timer = null;


    var MediaButton = declare(AbstractParseableDojoPlugin, {

        init: function (args) {
            this.inherited(arguments);

            //this.documentPreviewComponent= new DocumentPreviewComponent(this.editor.dispatcher);

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

        _processFull: function () {
            //this.documentPreviewComponent.send();
            // Opció 1: cridar directament a tb_mediapopup(btn, props, edid)

            // obtenir el id del document

            var edid = 'textarea_' + this.editor.id+'_media';


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

                    context.insertHtml(value);


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
                    // url: 'lib/exe/mediamanager.php?ns='
                    url: 'lib/exe/mediamanager.php?filler=true&onselect=dw_mediamanager_item_select_without_align&ns='
                },
                edid
            );


            // Opció 2: copiar el codi de la funció:

            // function tb_mediapopup(btn, props, edid) {
            //     console.log("tb_mediapopup", btn,props, edid, NS)
            //     console.log("Obrint el mediapopup:", DOKU_BASE+props.url+encodeURIComponent(NS)+'&edid='+encodeURIComponent(edid))
            //     window.open(
            //         DOKU_BASE+props.url+encodeURIComponent(NS)+'&edid='+encodeURIComponent(edid),
            //         props.name,
            //         props.options);
            //     return false;
            // }

        },

        insertHtml: function (value) {
            var html = this.wikiImageToHTML(value);
            this.editor.execCommand('inserthtml', html);
            var id = jQuery(html).attr('data-ioc-id');

            // ALERTA: Per alguna raó el .find() no troba els id normals d'html, per això es fa servir atribut propi
            var $node = jQuery(this.editor.iframe).contents().find('[data-ioc-id="' + id +'"]');

            // TODO: Afegir aquí els botons que calguin

            this._addHandlers($node);
        },

        wikiImageToHTML: function (value) {
            // Entrada: {{:0xb6mp.jpg?200|}};

            var reg = new RegExp('{{:(.*)\\?');
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

            var html = '<img data-ioc-media data-ioc-id="' + id + '" src="' + url + '"/ style="width:' + width[1] + 'px;">'; // TODO: cal ficar alt o títol?


            // TODO: Alineació desde el botó: hi han tres combinacions posibles que depén de les etiquetes:
            // {{ wiki:dokuwiki-128.png}}
            // {{wiki:dokuwiki-128.png }}
            // {{ wiki:dokuwiki-128.png }}
            return html;
        },

        parse: function () {
            var $nodes = jQuery(this.editor.iframe).contents().find('[data-ioc-media]');
            var context = this;

            $nodes.each(function () {
                context._addHandlers(jQuery(this)/*, context*/);
            });

        },

        _addHandlers: function ($node) {
            // ALERTA[Xavi] ens assegurem que s'esborre el node al premer les tecles delete o backspace
            $node.on('keyup', function (e) {
                var $this = jQuery(this);

                switch (e.keyCode) {
                    case 8:  // Backspace
                    case 46:  // Delete
                        // console.log("Backspace/delete pressed");
                        $this.off();
                        $this.remove();
                        break;
                }
            });

            //Codi de prova, per ara no es necessari gestionar el click, però ens assegurem que funciona
            // $node.on('click', function (e) {
            //
            //     console.log('click',this);
            // });
        }

    });


    // Register this plugin.
    _Plugin.registry["insert_media"] = function () {
        return new MediaButton({command: "insert_media"});
    };

    return MediaButton;
});