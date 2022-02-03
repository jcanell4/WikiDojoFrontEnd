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

    let idCounter = 0;

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
            this._openDialog(this.insertHtml.bind(this));
        },

        _openDialog: function (callback) {

            let includeComponent = null;

            switch (this.includeType) {
                case "page":
                    includeComponent = ShowIncludePageComponent();
                    includeComponent.show(this.getEditor(), callback, true);
                    break;

                case "section":
                    includeComponent = new ShowIncludeSectionComponent();
                    includeComponent.show(this.getEditor(), callback, true);
                    break;

                default:
                    console.error("Tipus de include desconegut: ", this.includeType);
            }

            return includeComponent;
        },


        insertHtml: function (value, isHighlighted) {
            // console.log("Value retornat:", value, isHighlighted);

            isHighlighted = isHighlighted ? "true" : "false";

            let includeId = 'include-' + idCounter;
            idCounter++;

            let html = string.substitute(this.htmlTemplate,
                {
                    ns: value,
                    include: "incloent [" + this.includeType + "]: " + value,
                    highlighted: isHighlighted,
                    extra: " data-ioc-id=\"" + includeId + "\""
                });

            this.editor.execCommand('inserthtml', html);

            // ALERTA: Per alguna raó el .find() no troba els id normals d'html, per això es fa servir atribut propi
            var $node = jQuery(this.editor.iframe).contents().find('[data-ioc-id="' + includeId + '"]');


            this._addHandlers($node);

            this.editor.forceChange();
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

            var context = this;

            $node.on('dblclick', function (e) {
                e.preventDefault();
                e.stopPropagation();

                let $node = jQuery(this);

                let includeComponent = context._openDialog((value, isHighlighted) => {
                        // console.log(value, isHighlighted);

                        $node.attr('data-dw-include', value);
                        if (isHighlighted) {
                            $node.attr('data-dw-highlighted', isHighlighted);
                        } else {
                            $node.removeAttr("data-dw-highlighted");
                        }

                        // Capturem les accions perquè en substituir el html es perd el node
                        $node.find('span').get(0).innerHTML = 'incloent ' + context.includeType + ": " + value;
                        context.editor.forceChange();
                    }
                );
                includeComponent.setValue($node.attr('data-dw-include'), $node.attr('data-dw-highlighted') === "true");
            });
        },

        parse: function () {
            var $nodes = jQuery(this.editor.iframe).contents().find('[data-dw-include-type="' + this.includeType + '"]');
            var context = this;

            $nodes.each(function () {
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