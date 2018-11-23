define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    'ioc/dokuwiki/editors/Components/DocumentPreviewComponent',
], function (declare, AbstractDojoPlugin, lang, _Plugin, DocumentPreviewComponent) {

    var TIMER_INTERVAL = 0.1;
    var DEFAULT_WIDTH = 200;
    var timer = null;


    var MediaButton = declare(AbstractDojoPlugin, {

        init: function(args) {
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

            this.events = args.event;

            this.addButton(config);
        },

        _processFull:function() {
            //this.documentPreviewComponent.send();
            // Opció 1: cridar directament a tb_mediapopup(btn, props, edid)

            // obtenir el id del document

            console.log("Te id l'editor?", this.editor.id);
            var edid = 'textarea_' + this.editor.id;

            console.log("edid:", edid);

            // eliminem qualsevol textarea anterior. Alternativa: si existeix deixar aquest i no crear cap de nou
            jQuery('textarea#'+edid).remove();
            clearInterval(timer);

            // Afegim un de nou
            var $textarea = jQuery('<textarea>').attr('id', edid);
            $textarea.css('display', 'none');

            jQuery('body').append($textarea);


            // Canvia al textarea es fa mitjançant expresions regulars directament sobre el text,
            // no es dispara cap event

            var context = this;

            timer = setInterval(function() {
                var value = $textarea.val();
               if (value.length>0) {
                   clearInterval(timer);
                   // this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, args));


                   context.editor.execCommand('inserthtml', context.wikiImageToHTML(value));
                   // context.editor.execCommand('inserthtml', value);

                   timer = null;
               }

            }, TIMER_INTERVAL);

            $textarea.on('focus', function(e) {
                console.log($textarea.val());
                alert("Canvis!");
            });

            tb_mediapopup(
                null,
                {
                    name: 'mediaselect', // name per la segona opció de window.open()
                    options:'width=750,height=500,left=20,top=20,scrollbars=yes,resizable=yes', // options pel tercer paràmetre de la funció window.open()
                    url: 'lib/exe/mediamanager.php?ns='
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

        wikiImageToHTML : function (value) {
            // Entrada: {{:0xb6mp.jpg?200|}};

            var reg= new RegExp('{{:(.*)\\?');
            var file= value.match(reg);

            var width = value.match(/\?(.*?)\|/);


            console.log("file:", file[1]);
            console.log("width:", width[1]);

            var tok = '' // Es necessari el tok per canviar la mida, si no es pasa dona error 412 però aquesta
            // informació no es passa desde la finestra. De totes maneres no cal passar el paràmetre, la mida
            // la podem ajustar directament a la etiqueta

            var url = 'lib/exe/fetch.php?'
                // +'w=' + width[1]
                +'media=' + file[1];
                // +'&media=' + file[1];
                // +'&tok=' + tok;



            // Sortida: <img class="media"
            // src="http://iocwiki.devv/dokuwiki_30/lib/exe/fetch.php?w=200&tok=0883bb&media=0xb6mp.jpg"
            // alt="" width=""

            var html = '<img src="' +url+'"/ style="width:'+ width[1] +'px;">'; // TODO: cal ficar alt o títol?

            // TODO: Afegir aquí els handlers que calguin. Botons per editar/eliminar.
            // TODO: Alineació desde el botó: hi han tres combinacions posibles que depén de les etiquetes:
            // {{ wiki:dokuwiki-128.png}}
            // {{wiki:dokuwiki-128.png }}
            // {{ wiki:dokuwiki-128.png }}
            return html;
        }


    });


    // Register this plugin.
    _Plugin.registry["document_preview"] = function () {
        return new MediaButton({command: "document_preview"});
    };

    return MediaButton;
});