define([
    "dojo/_base/declare",
    // 'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoEditorUtils',
    'ioc/dokuwiki/editors/Components/ShowIncludePageComponent',
    'ioc/dokuwiki/editors/Components/ShowIncludeSectionComponent',
    "dojo/string",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoActions',
], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, DojoEditorUtils,
             ShowIncludePageComponent, ShowIncludeSectionComponent, string, dojoActions) {



    var DojoInclude = declare(AbstractParseableDojoPlugin, {

        init: function (args) {

            this.inherited(arguments);

            this.includeType = args.includeType;
            this.htmlTemplate = args.htmlTemplate;

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

            this.open = args.open;
            this.close = args.close;
            this.linkClass = args.class;

            this.addButton(config);
        },


        _processFull: function () {
            console.log("TODO processar!", this.htmlTemplate);

            switch (this.includeType) {
                case "page":
                    new ShowIncludePageComponent().show(this.getEditor(), this.insertHtml.bind(this));
                    break;

                case "section":
                    new ShowIncludeSectionComponent().show(this.getEditor(), this.insertHtml.bind(this));
                    break;

                default:
                    console.error("Tipus de include desconegut: ", this.includeType);
            }

            // this._openEditor();
        },


        insertHtml: function (value) {
            // console.log("Value retornat:", value);

            var html = string.substitute(this.htmlTemplate, {ns : value, include : "incloent: " +  value});

            // var html = this.wikiImageToHTML(value);
            this.editor.execCommand('inserthtml', html);
            var id = jQuery(html).attr('data-ioc-id');

            // ALERTA: Per alguna raó el .find() no troba els id normals d'html, per això es fa servir atribut propi
            var $node = jQuery(this.editor.iframe).contents().find('[data-ioc-id="' + id +'"]');

            // TODO: Afegir aquí els botons que calguin

            this._addHandlers($node);
        },

        addActionButtons: function ($node) {

            var $aux = dojoActions.getActionContainer($node);

            $aux.empty();

            dojoActions.addParagraphAfterAction($node, this.editor);
            dojoActions.addParagraphBeforeAction($node, this.editor);
            dojoActions.deleteAction($node, this.editor, 'include');
            dojoActions.setupContainer($node, $node.find('.no-render.action'));

        },



        _addHandlers: function ($node) {
            this.addActionButtons($node);

            // var context = this;
            //
            // $node.on('dblclick', function (e) {
            //     e.preventDefault();
            //     e.stopPropagation();
            //
            //     var $this = jQuery(this);
            //
            //     if (!dw_linkwiz.$entry) {
            //         dw_linkwiz.$entry = jQuery('<input>');
            //     }
            //
            //     // Només s'afegeix el valor si es troba dins d'un espai de noms
            //     var value = $this.attr('data-dw-ns');
            //     dw_linkwiz.$entry.val(value.indexOf(':') === -1 ? '' : value);
            //
            //     context._openEditor();
            // })
        },

        parse: function () {
            var $nodes = jQuery(this.editor.iframe).contents().find('[data-dw-include]');
            var context = this;

            $nodes.each(function () {
                console.log("Afegint handlers a ", jQuery(this));
                context._addHandlers(jQuery(this)/*, context*/);
            });

        },

    });


    // Register this plugin.
    _Plugin.registry["include_link"] = function () {
        return new DojoInclude({command: "include_link"});
    };

    return DojoInclude;
});