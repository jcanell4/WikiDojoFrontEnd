define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/form/ToggleButton",
    "dojo/dom-construct",
    'dijit/Dialog',
    // "dojo/parser",
    "dojo/store/Memory",
    "dijit/tree/ObjectStoreModel",
    "dijit/Tree",
    "dijit/registry",
    "dojo/dom",
    // 'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',

], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, string, Button, domConstruct, Dialog, Memory, ObjectStoreModel, Tree, registry, dom, /*AceFacade, */toolbarManager) {

    // No funciona si es carrega directament, hem de fer la inicialització quan cal utilitzar-lo
    let AceFacade = null;

    let FormatButton = declare(AbstractParseableDojoPlugin, {

        init: function (args) {
            this.inherited(arguments);

            this.tag = 'wioccl';

            let config = {
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

            this.editor.on('changeCursor', this.updateCursorState.bind(this));
        },

        addButton: function (config) {
            this.button = new Button(config);
        },

        updateCursorState: function (e) {

            if (e.state.indexOf(this.tag) > -1) {
                this.button.set('checked', true);
            } else {
                this.button.set('checked', false);
            }
        },

        process: function () {

            alert("TODO");

        },

        _addHandlers: function ($node, context) {


            $node.on('click', function (e) {

                e.preventDefault();
                e.stopPropagation();

                let refId = $node.attr('data-wioccl-ref');
                let wioccl = context.editor.extra.wioccl_structure.structure[refId];
                // console.log("wioccl:", refId, wioccl);

                // TODO: extreure?
                function getChildrenNodes(children, parent) {
                    let nodes = [];
                    for (let i = 0; i < children.length; i++) {


                        let node = JSON.parse(JSON.stringify(context.editor.extra.wioccl_structure.structure[children[i]]));

                        if (!node) {
                            console.error("Node not found:", children[i]);
                        }
                        node.name = node.type ? node.type : node.open;
                        node.parent = parent;
                        if (node.children.length > 0) {
                            node.children = getChildrenNodes(node.children, node.id);
                        }
                        nodes.push(node);
                    }

                    return nodes;
                }

                let tree = [];
                let node = JSON.parse(JSON.stringify(context.editor.extra.wioccl_structure.structure[refId]));
                node.name = node.type ? node.type : node.open;
                tree.push(node);

                tree[0].children = getChildrenNodes(tree[0].children, tree[0].id);

                let oldDialog = registry.byId('wioccl-dialog');

                if (oldDialog) {
                    oldDialog.destroyRecursive();
                }


                let wiocclDialog = new Dialog({

                    title: 'Edició wioccl',
                    // style: 'width:auto',
                    style: 'height:100%; width:100%; top:0; left:0; position:absolute; max-width: 100%; max-height: 100%;',
                    // style: 'height:100%; width:100%; top:0; left:0; position:absolute; max-width: 100%; max-height: 100%;',
                    onHide: function (e) { //Voliem detectar el event onClose i hem hagut de utilitzar onHide
                        this.destroyRecursive();
                    },
                    id: 'wioccl-dialog',
                    draggable: false,

                    firstResize: true,

                });


                wiocclDialog.startup();


                let dialogContainer = domConstruct.create("div", {
                    id: "dialogContainer_wioccl"
                });

                let paneContainer = domConstruct.create("div", {
                    "class": "dijitDialogPaneContentArea",
                    "style": "max-width: 99%; max-height: 100%"
                    // "style": "width:680px; height: 550px"
                });

                let detailContainer = domConstruct.create("div", {
                    id: "detailContainer_" + "test",
                    // "style": "width:400px",
                    "class": "wioccl-detail",
                    // "innerHTML": testContent
                });

                let contentContainer = domConstruct.create("div", {
                    id: "contentContainer_" + "test",
                    "style": "width:100%",
                    "class": "wioccl-content",
                    // "innerHTML": testContent
                });

                let attrContainer = domConstruct.create("div", {
                    id: "attrContainer_" + "test",
                    "style": "width:100%",
                    "class": "wioccl-attr",
                });

                let treeContainer = domConstruct.create("div", {
                    id: "treeContainer_" + "test",
                    "style": "width:150px",
                    "class": "wioccl-tree"
                });
                let actionBar = domConstruct.create("div", {
                    "class": "dijitDialogPaneActionBar",
                    "style": "height:35px"
                });

                let store = new Memory({
                    data: tree,
                    getChildren: function (object) {
                        return object.children || [];
                    }
                });

                let model = new ObjectStoreModel({
                    store: store,
                    query: {id: refId},
                    mayHaveChildren: function (item) {
                        // return "children" in item;
                        return item.children.length > 0;
                    }
                });

                let extractFields = function (attrs, type) {
                    // console.log("Fields to extract:", attrs);

                    let fields = {};

                    switch (type) {

                        case 'field':
                            fields['field'] = attrs;
                            break;

                        case 'function':

                            let paramsPattern = /(\[.*?\])|(".*?")|-?\d+/g;
                            let tokens = attrs.match(paramsPattern);
                            // console.log("Tokens:", tokens);
                            for (let i = 0; i < tokens.length; i++) {
                                fields['param' + i] = tokens[i].trim();
                            }

                            break;

                        default:
                            const pattern = / *((.*?)="(.*?)")/g;

                            const array = [...attrs.matchAll(pattern)];

                            for (let i = 0; i < array.length; i++) {
                                fields[array[i][2].trim()] = array[i][3].trim();
                            }
                    }

                    return fields;
                };

                let generateHtmlForFields = function (fields) {
                    let html = '<fieldset class="wioccl-fields">';
                    html += '<legend>Atributs, nom de la variable o paràmetres</legend>'

                    for (let field in fields) {

                        // Es necessari eliminar el escape de les dobles cometes
                        // TODO: ALERTA! Caldrà tornar-lo a afegir abans d'enviar-lo
                        let valor = fields[field].replaceAll('\"', '&quot;');

                        html += '<div class="wioccl-field">';
                        html += '<label>' + field + ':</label>';
                        html += '<input type="text" name="' + field + '" value="' + valor + '"/>';
                        html += '</div>';
                    }

                    html += "</fieldset>";
                    return html;

                };

                let rebuildWioccl = function (data) {
                    let wioccl = "";

                    wioccl += data.open.replace('%s', data.attrs);
                    for (let i = 0; i < data.children.length; i++) {
                        wioccl += rebuildWioccl(data.children[i]);
                    }

                    wioccl += data.close;

                    return wioccl;
                };


                let widgetTree = new Tree({
                    model: model,
                    onOpenClick: true,
                    onLoad: function () {
                        // dom.byId('image').src = '../resources/images/root.jpg';
                    },
                    onClick: function (item) {
                        // TODO: reconstruir el codi wioccl, no mostrar el json del item
                        jQuery(attrContainer).empty();
                        jQuery(attrContainer).append(generateHtmlForFields(extractFields(item.attrs, item.type)));
                        let auxItem = rebuildWioccl(item);
                        editor.setValue(auxItem);
                    }
                });


                let createEditor = function ($textarea, $node, args, context) {

                    args.id = (args.id + Date.now() + Math.random()).replace('.', '-'); // id única


                    // ALERTA! per alguna raó si s'afegeix el contentToolFactory com a dependència no funciona (exactament el mateix codi al DataContentProcessor sí que ho fa), la alternativa és utilitzar la factoria del content tool actual:
                    let id = context.editor.dispatcher.getGlobalState().getCurrentId();
                    let contentToolFactory = context.editor.dispatcher.getContentCache(id).getMainContentTool().contentToolFactory;

                    let editorWidget = contentToolFactory.generate(contentToolFactory.generation.BASE, args);
                    let toolbarId = 'FormToolbar_' + (args.id);

                    let $container = jQuery('<div id="container_' + args.id + '">');
                    // this.$node.before($container);


                    let $toolbar = jQuery('<div id="toolbar_' + args.id + '"></div>');

                    $textarea.css('height', '200px');

                    $textarea.attr('id', 'textarea_' + args.id);

                    $container.append($toolbar);
                    $container.append($textarea);
                    $container.append(editorWidget);

                    $node.append($container);


                    toolbarManager.createToolbar(toolbarId, 'simple');


                    if (AceFacade === null) {
                        // ALERTA[Xavi] Ho carregam de manera sincrona perquè no carrega si es posa a la capçalera
                        // cal investigar-ho
                        require(["ioc/dokuwiki/editors/AceManager/AceEditorFullFacade"], function (AuxClass) {
                            AceFacade = AuxClass;
                        });

                    }


                    let editor = new AceFacade({
                        id: args.id,
                        auxId: args.id,
                        containerId: editorWidget.id,
                        textareaId: 'textarea_' + args.id,
                        theme: JSINFO.plugin_aceeditor.colortheme,
                        wraplimit: JSINFO.plugin_aceeditor.wraplimit, // TODO: determinar el lmit correcte
                        wrapMode: true,
                        dispatcher: context.editor.dispatcher,
                        content: args.value,
                        originalContent: args.value,
                        // TOOLBAR_ID: toolbarId,
                        TOOLBAR_ID: 'full-editor',
                        ignorePatching: true,
                        plugins: [],
                    });


                    this.widgetInitialized = true;

                    return editor;

                };


                let valor = rebuildWioccl(tree[0]);

                //col·locar en el lloc adequat
                domConstruct.place(paneContainer, dialogContainer, "last");
                domConstruct.place(actionBar, dialogContainer, "last");
                domConstruct.place(treeContainer, paneContainer, "last");
                domConstruct.place(detailContainer, paneContainer, "last");
                domConstruct.place(contentContainer, detailContainer, "last");
                domConstruct.place(attrContainer, detailContainer, "first");

                //assignar i mostrar
                wiocclDialog.set("content", dialogContainer);
                wiocclDialog.show();

                widgetTree.placeAt(treeContainer);
                widgetTree.startup();


                // L'editor no es pot afegir fins que el dialog no és creat:
                let $contentContainer = jQuery(contentContainer);
                let $textarea = jQuery('<textarea>' + valor + '</textarea>');
                $contentContainer.append($textarea);

                let args = {
                    id: 'wioccl-dialog',
                    value: valor
                };

                let editor = createEditor($textarea, $contentContainer, args, context);
                editor.setValue(valor);


                // editor.fillEditorContainer();


                // Resize:
                let fullSize = function () {
                    let $paneContainer = jQuery(paneContainer);
                    let $treeContainer = jQuery(treeContainer);
                    let $detailContainer = jQuery(detailContainer);

                    // jQuery(wiocclDialog.domNode).toggleClass('full-screen'); // això amplia la mida de la finestra al 90% del viewport

                    $paneContainer.css('position', 'absolute');
                    $paneContainer.css('top', 0);
                    $paneContainer.css('bottom', '45px');
                    $paneContainer.css('left', 0);
                    $paneContainer.css('right', 0);

                    let $updateButton = jQuery("<button>Actualitzar</button>");
                    $updateButton.css('margin', '5px');
                    $updateButton.css('margin-right', '15px');
                    $updateButton.css('padding', '5px');
                    let $actionBar = jQuery(actionBar);
                    $actionBar.append($updateButton);
                    $actionBar.css('margin', 0);
                    $actionBar.css('padding', 0);

                    $updateButton.on('click', function() {
                        alert("TODO");
                    });

                    // pas 1: ajustar l'alçada del contingut
                    let height = $paneContainer.height() -30;

                    $treeContainer.css('height', height);
                    let treeWidth = $treeContainer.width();
                    let paneWidth = $paneContainer.width();

                    $detailContainer.css('height', height);
                    $detailContainer.css('width', paneWidth - treeWidth - 90);

                    let $attrContainer = jQuery(attrContainer);

                    $attrContainer.empty();
                    $attrContainer.append(generateHtmlForFields(extractFields(tree[0].attrs, tree[0].type)));


                    let offset = 20;
                    editor.setHeightForced($detailContainer.height() - $attrContainer.height() - offset);
                };

                fullSize();


                // ALERTA! aquesta funció es crida automáticament quan canvia la mida de la finestra del navegador o es fa scroll
                // Com que hem fet que els elements del dialog s'ajustin via jQuery quan es crida al resize es
                // fa malbé la composició.

                // Per alguna raó desconeguda si es sobreescriu aquesta funció i s'intenta cridar al this.inherited()
                // no funciona, i si es sobreescriu a la inicialització no es crida la primera vegada i no es
                // genera correctament, per aquest motiu es fa la reescriptura en aquest punt, on ja tenim la mida final
                wiocclDialog.resize = function(args) {};



            });


            // dojoActions.addParagraphAfterAction($actions, this.editor);
            // dojoActions.addParagraphBeforeAction($actions, this.editor);
            // dojoActions.setupContainer($node, $actions);

        },

        parse: function () {

            let $nodes = jQuery(this.editor.iframe).contents().find('[data-wioccl-ref]');
            let context = this;

            $nodes.each(function () {
                let $node = jQuery(this);
                // let id = $node.attr('data-wioccl-ref');

                context._addHandlers($node, context);
            });

        },
    });


    // Register this plugin.
    _Plugin.registry["insert_wioccl"] = function () {
        return new FormatButton({command: "insert_wioccl"});
    };

    return FormatButton;
});