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

        // S'assigna quan es crea el diàleg
        treeWidget: null,

        dialogEditor: null,

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

        _getStructure() {


            // console.log("hi ha estructura?", this.editor.extra.wioccl_structure.structure)
            if (!this.backupStructure) {
                alert("copiada estructura");
                this.backupStructure = JSON.parse(JSON.stringify(this.editor.extra.wioccl_structure.structure));
            }

            return this.backupStructure;

        },

        _getWiocclChildrenNodes(children, parent, context) {
            let nodes = [];
            for (let i = 0; i < children.length; i++) {

                if (children[i] === 'object') {
                    console.log("* node");
                } else {
                    console.log("* id");
                }

                let id = typeof children[i] === 'object' ? children[i].id : children[i];

                console.log("Trying to copy (child):", id);
                console.log("Trying to copy:", context._getStructure()[id]);
                console.log("Stringify:", JSON.parse(JSON.stringify(context._getStructure()[id])));



                let node = JSON.parse(JSON.stringify(context._getStructure()[id]));

                // console.log("Trying to copy:", context.editor.extra.wioccl_structure.structure[children[i]]);
                // let node = JSON.parse(JSON.stringify(context.editor.extra.wioccl_structure.structure[children[i]]));

                if (!node) {
                    console.error("Node not found:", id);
                }
                node.name = node.type ? node.type : node.open;


                node.parent = parent;
                if (node.children.length > 0) {
                    node.children = this._getWiocclChildrenNodes(node.children, node.id, context);
                }



                nodes.push(node);
            }


            return nodes;
        },

        rebuildWioccl: function (data) {

            console.log("Rebuilding wioccl:", data);
            let wioccl = "";

            wioccl += data.open.replace('%s', data.attrs);
            for (let i = 0; i < data.children.length; i++) {
                wioccl += this.rebuildWioccl(data.children[i]);
            }

            if (data.close !== null) {
                wioccl += data.close;
            }



            return wioccl;
        },

        _addHandlers: function ($node, context) {


            $node.on('click', function (e) {

                e.preventDefault();
                e.stopPropagation();


                let refId = $node.attr('data-wioccl-ref');
                // let wioccl = context.editor.extra.wioccl_structure.structure[refId];
                let wioccl = context._getStructure()[refId];

                context.root = refId;

                console.log("Setting root:", context.root, refId);

                console.log("refId:", refId);
                console.log(wioccl);


                let tree = [];
                // let node = JSON.parse(JSON.stringify(context.editor.extra.wioccl_structure.structure[refId]));
                let node = JSON.parse(JSON.stringify(context._getStructure()[refId]));
                node.name = node.type ? node.type : node.open;
                tree.push(node);

                tree[0].children = context._getWiocclChildrenNodes(tree[0].children, tree[0].id, context);

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
                        context.backupStructure = null;
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
                context.attrContainer = attrContainer;

                let treeContainer = domConstruct.create("div", {
                    id: "treeContainer_" + "test",
                    "style": "width:150px",
                    "class": "wioccl-tree"
                });
                context.treeContainer = treeContainer;

                let actionBar = domConstruct.create("div", {
                    "class": "dijitDialogPaneActionBar",
                    "style": "height:35px"
                });

                console.log("### Que pasem com a data al New Memory:", tree);

                let store = new Memory({
                    data: tree,
                    getChildren: function (object) {
                        return object.children || [];
                    }
                });

                context.store = store;

                let model = new ObjectStoreModel({
                    store: store,
                    query: {id: refId},
                    mayHaveChildren: function (item) {
                        // return "children" in item;
                        return item.children.length > 0;
                    }
                });

                context.model = model;



                let widgetTree = new Tree({
                    id: Date.now(),
                    model: model,
                    onOpenClick: true,
                    onLoad: function () {
                        // dom.byId('image').src = '../resources/images/root.jpg';
                    },
                    onClick: function (item) {
                        console.log(item);
                        // TODO: reconstruir el codi wioccl, no mostrar el json del item
                        jQuery(attrContainer).empty();
                        jQuery(attrContainer).append(context._generateHtmlForFields(context._extractFields(item.attrs, item.type)));
                        let auxItem = context.rebuildWioccl(item);
                        context.dialogEditor.setValue(auxItem);
                        context.dialogEditor.wioccl = item;
                        console.log("Editor:", context.dialogEditor);
                    }
                });

                context.treeWidget = widgetTree;

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

                    context.dialogEditor = editor;


                    this.widgetInitialized = true;

                    // Per defecte s'assigna el primer node
                    editor.wioccl = wioccl;

                    return editor;

                };


                let valor = context.rebuildWioccl(tree[0]);

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

                console.log("desat container?", context.treeContainer);

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


                let $paneContainer = jQuery(paneContainer);
                let $treeContainer = jQuery(treeContainer);
                let $detailContainer = jQuery(detailContainer);

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

                let height = $paneContainer.height() - 30;

                $treeContainer.css('height', height);
                let treeWidth = $treeContainer.width();
                let paneWidth = $paneContainer.width();

                $detailContainer.css('height', height);
                $detailContainer.css('width', paneWidth - treeWidth - 90);

                let $attrContainer = jQuery(attrContainer);

                $attrContainer.empty();
                $attrContainer.append(context._generateHtmlForFields(context._extractFields(tree[0].attrs, tree[0].type)));


                editor.setHeightForced($detailContainer.height() - $attrContainer.height() - 20);


                // ALERTA! aquesta funció es crida automáticament quan canvia la mida de la finestra del navegador o es fa scroll
                // Com que hem fet que els elements del dialog s'ajustin via jQuery quan es crida al resize es
                // fa malbé la composició.

                // Per alguna raó desconeguda si es sobreescriu aquesta funció i s'intenta cridar al this.inherited()
                // no funciona, i si es sobreescriu a la inicialització no es crida la primera vegada i no es
                // genera correctament, per aquest motiu es fa la reescriptura en aquest punt, on ja tenim la mida final
                wiocclDialog.resize = function (args) {
                };


                $updateButton.on('click', function () {

                    // context.backupStructure = JSON.parse(JSON.stringify(context.editor.extra.wioccl_structure.structure));

                    context.parseWioccl(editor.getValue(), editor.wioccl, context._getStructure());

                    // TODO: cal regenerar l'arbre treeWidget o cal aplicar els canvis de la structura al model?
                    console.log("Structura modificada?", context._getStructure());

                });

            });
        },

        _generateHtmlForFields: function (fields) {
            let html = '<fieldset class="wioccl-fields">';
            html += '<legend>Atributs, nom de la variable o paràmetres</legend>';

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

        },

        _extractFields : function (attrs, type) {
            console.log("Fields to extract:", attrs, type);

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
        },

        parseWioccl: function (text, wioccl, structure) {


            let tokens = this._tokenize(text);

            console.log(tokens);



            // text és el text a parsejar

            // wioccl és el node actual que cal reescriure, és a dir, tot el que es parseji reemplaça al id d'aquest node

            // si hi han nous node s'han d'afegir a partir d'aquest index
            // let lastIndex = structure.length;


            // Reordenació dels nodes:
            //      - posem com false tots els nodes fills actuals ALERTA no els eliminem perquè canviaria l'ordre de tots
            //      - els elements de la estructura i les referencies del document ja no serien correctes.
            let removeChildren = function (id, inStructure) {
                console.log("Cercant childrens pel node:", id, inStructure[id]);
                let node = inStructure[id];
                for (let i = node.children.length - 1; i >= 0; --i) {
                    removeChildren(node.children[i], inStructure);
                    inStructure[node.children[i]] = false;
                }
            };


            removeChildren(wioccl.id, structure);


            // ALERTA! un cop eliminat els fills cal desvincular també aquest element, ja que s'afegirà automàticament al parent si escau
            let found = false;
            console.log("Parent comprovat:", structure[wioccl.parent]);
            for (let i=0; i<structure[wioccl.parent].children.length; i++) {
                console.log("Comprovant child (contra id):", structure[wioccl.parent].children[i], wioccl.id)
                if (structure[wioccl.parent].children[i] === wioccl.id) {
                    structure[wioccl.parent].children.splice(i, 1);
                    wioccl.index = i;
                    console.log("*** afegit index al wioccl ***", wioccl.index);
                    alert("eliminat aquest node del parent");
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.error("no s'ha trobat aquest node al propi pare");
                console.log(structure, wioccl);
                alert("node no trobat al pare");
            }

            structure[wioccl.id] = false;


            // console.log("Last index:", lastIndex);
            //      - afegim tots els nodes generats pel parse a partir del last index i els afegim com a children com
            //        correspongui
            //      !!ALERTA!! cal crear un stack amb els open-close del wioccl per reassignar els fills
            //      Només els desdendents directes del primer node s'assignen com a children del wioccl original


            // TEST: Duplicació de la estructura

            // let newStructure = JSON.parse(JSON.stringify(structure));

            // this._createTree(wioccl, tokens, newStructure);
            this._createTree(wioccl, tokens, structure);




            console.log("Id:", this.root);
            console.log("Node root?",structure[this.root]);

            this._setData(structure[this.root]);
            // this._setData(structure[wioccl.id]);

        },

        _createTree(root, tokens, structure) {
            // Només hi ha un tipus open/close, que son els que poden tenir fills:
            //      OPEN: comencen per "<WIOCCL:"
            //      CLOSE: comencen per "</WIOCCL:"




            let stack = [];

            // ALERTA! TODO: Cal gestionar el token inicial, aquest no s'ha d'afegira l'arbre
            // i el seu tancament tampoc



            let nextIndex = structure.length;
            for (let i = 0; i < tokens.length; i++) {

                tokens[i].rebuild = true;

                // Cal un tractament especial per l'arrel perquè s'ha de col·locar a la posició del node arrel original
                if (i === 0) {
                    tokens[i].id = root.id;
                    tokens[i].parent = root.parent;
                    // this.root = tokens[i].id;

                } else {
                    tokens[i].id = nextIndex;
                }



                tokens[i].children = [];

                if (tokens[i].value.startsWith('</WIOCCL:')) {
                    tokens[i].type = "wioccl";
                    let top = stack.pop();
                    top.close = tokens[i].value;
                    continue;
                }



                if (stack.length > 0) {
                    console.log("Afegint a: ", stack[stack.length - 1], "el child:", nextIndex);
                    stack[stack.length - 1].children.push(nextIndex);
                    tokens[i].parent = stack[stack.length - 1].id
                } else {
                    // Si no hi ha cap element a l'estack es que es troba al mateix nivell que l'element root
                    tokens[i].parent = root.parent
                }

                // Si fem servir push s'afegeixen al final, això no serveix perquè cal inserir els nous nodes a la posició original (emmagatzemada a root.index)
                // structure[root.parent].children.push(tokens[i].id);



                if (tokens[i].parent === root.parent) {
                    if (root.index === undefined) {
                        console.log("Root?", root);
                        alert("El root no té index!");
                    }
                    structure[root.parent].children.splice(root.index+i, 0, tokens[i].id);
                }



                // No cal gestionar el type content perquè s'assigna al tokenizer

                if (tokens[i].value.startsWith('<WIOCCL:')) {
                    let pattern = /<WIOCCL:.* (.*)>/gsm;

                    let matches;

                    if (matches = pattern.exec(tokens[i].value)) {
                        tokens[i].attrs = matches[1];
                    } else {
                        tokens[i].attrs = "";
                    }

                    pattern = /(<WIOCCL:.*?)[ >]/gsm;

                    matches = pattern.exec(tokens[i].value);
                    tokens[i].open = matches[1] + ' %s>';

                    pattern = /<WIOCCL:(.*?)[ >]/gsm;
                    matches = pattern.exec(tokens[i].value);
                    tokens[i].type = matches[1].toLowerCase();

                    // tokens[i].type = "wioccl";
                    stack.push(tokens[i]);
                }



                if (tokens[i].value.startsWith('{##')) {
                    tokens[i].type = "field";
                    tokens[i].open = "{##%s";
                    tokens[i].close = "##}";

                    let pattern = /{##(.*)##}/gsm;


                    let matches = pattern.exec(tokens[i].value);
                    tokens[i].attrs = matches[1];
                }



                if (tokens[i].value.startsWith('{#_')) {
                    tokens[i].type = "function";

                    let pattern = /{#_.*?\((.*)\)_#}/gsm;
                    let matches;

                    if (matches = pattern.exec(tokens[i].value)) {
                        tokens[i].attrs = matches[1];
                    } else {
                        tokens[i].attrs = "";
                    }

                    pattern = /({#_.*?\()(.*)(\)_#})/gsm;
                    tokens[i].open = tokens[i].value.replace(pattern, "$1%s$3");

                    tokens[i].close = "";

                }





                // Cal un tractament especial per l'arrel perquè s'ha de col·locar a la posició del node arrel original
                if (i === 0) {
                    console.log("Token establert al root.id:", root.id, tokens[i]);
                    structure[root.id] = tokens[i];
                } else {
                    structure.push(tokens[i]);
                    nextIndex++;
                }


            }

            console.log('end Create Tree');

        },

        _tokenize(text) {
            //  Dividim en en els 4 tipus:
            //      Open wioccl
            //      Close wioccl
            //      Function <-- cal fer parse dels atributs?
            //      Field
            //      Contingut <-- tot el que hi hagi entre el final d'un token i el principi del següent és contingut
            let pattern = /<WIOCCL:.*?>|<\/WIOCCL:.*?>|{##.*?##}|{#_.*?_#}/gsm;


            // PROBLEMA: no podem capturar > sense capturar \>, fem una conversió de \> abans de fer el parse i ho restaurem després

            // Hi han dos casos, amb salt de línia i sense, per poder restaurar-los fem servir dues marques diferents: &markn; i &mark;
            let originalText = text;
            text = text.replaceAll(/\\[\n]>/gsm, '&markn;');
            text = text.replaceAll(/\\>/gsm, '&mark;');

            // PROBLEMA: això suposa un problema en el recompte de caràcteres, perquè les posicions no corresponen


            let tokens = [];
            let xArray;
            while (xArray = pattern.exec(text)) {

                let value = xArray[0];

                // Actualitzem el valor del token


                let token = {};
                token.startIndex = xArray.index;
                token.lastIndex = pattern.lastIndex - 1; // El lastIndex sembla correspondre a la posició on comença el token següent
                token.value = value;
                tokens.push(token);

            }
            // console.log("tokens (tentative)", tokens);


            // Si aquesta llista es vàlida cal extreure d'aquí el content (diferencia de lastindex i index del següent token

            // Cal recorrer l'array des del final, ja que cal afegir (si escau) el token de content a la posició de l'index

            let currentPos = text.length - 1;



            console.log("### Tokens:", tokens);

            if (tokens.length>0) {
                console.log("### final: currentPost/lastTokenlast", currentPos, tokens[tokens.length-1].lastIndex);

                // TODO: si el lastIndex no es == currentPos, cal crear un token de currentPos+1 fins a text.length

                if (tokens[tokens.length-1].lastIndex<currentPos) {
                    alert("Detectat contingut al final, s'ha d'extreure el token");

                    let token = {};
                    token.type = 'content';
                    token.value = text.substring(tokens[tokens.length-1].lastIndex+1, text.length);
                    token.attrs= '';
                    token.open = token.value;
                    token.close = '';

                    // Això no és realment necessari
                    token.startIndex = tokens[tokens.length-1].lastIndex+1;
                    token.lastIndex = currentPos;
                    tokens.push(token);

                    console.log('### final: afegit token amb content desde 0 fins a la posició de l\'últim node', token);

                }

            } else {
                console.log("### final: currentPost (no hi ha cap token, tot és content)", currentPos);
            }





            for (let i = tokens.length - 1; i >= 0; --i) {


                if (tokens[i].lastIndex === currentPos || i === tokens.length - 1) {
                    // console.log("** consecutiu: ");
                    // és consecutiu, no hi ha content entre aquest element i el següent
                } else {
                    let token = {};
                    token.type = 'content';
                    token.value = text.substring(tokens[i].lastIndex + 1, currentPos + 1);
                    token.attrs= '';
                    token.open = token.value;
                    token.close = '';

                    // Això no és realment necessari
                    token.startIndex = tokens[i].lastIndex + 1;
                    token.lastIndex = currentPos;

                    // Afegit entre el token actual i el següent
                    tokens.splice(i + 1, 0, token);

                    // console.log("** afegint token amb contingut a l'index:", i, token);
                }

                currentPos = tokens[i].startIndex - 1;

            }

            if (tokens.length===0) {
                // CAS: tot el text es content
                // TODO: s'ha d'afegir un token de content amb el text complet
                let token = {};
                token.type = 'content';
                token.value = text;
                token.attrs= '';
                token.open = text;
                token.close = '';

                // Això no és realment necessari
                token.startIndex = 0;
                token.lastIndex = currentPos;
                tokens.push(token);
                console.log('### principi: no hi ha tokens s\'afegeix el content com a nou token');
                console.log("### principi: currentPost (no hi ha tokens, tot es content", currentPos);
            } else {

                console.log("### principi: currentPost/firstTokenStart", currentPos, tokens[0].startIndex);

                if (tokens[0].startIndex>0) {

                    let token = {};
                    token.type = 'content';
                    token.value = text.substring(0, tokens[0].startIndex);
                    token.attrs= '';
                    token.open = token.value;
                    token.close = '';

                    // Això no és realment necessari
                    token.startIndex = 0;
                    token.lastIndex = currentPos;
                    tokens.unshift(token);
                    console.log('### final: afegit token amb content desde 0 fins a la posició de l\'últim node');

                }

            }



            // ALERTA! no pot haver res abans del primer token ni res després de l'últim. Quan s'obre l'editor s'afegeix
            // un salt de línia adicional que s'ha de descartar, no cal fer res per gestionar-lo, però s'ha de tenir
            // en compte per la validació


            console.log("### tokens amb content", tokens);

            // Comprovació de les posicions de les cadenes
            // ALERTA! subsgring 0,3 mostra els 3 primers caràcters
            for (let i = 0; i < tokens.length; i++) {


                let equal = text.substring(tokens[i].startIndex, tokens[i].lastIndex + 1) === tokens[i].value
                    || text.substring(tokens[i].startIndex, tokens[i].lastIndex + 1) === tokens[i].value + "\n";
                // console.log ("length:", text.substring(tokens[i].startIndex, tokens[i].lastIndex+1), tokens[i].value);


                if (!equal) {
                    console.error("i:", 1);
                    console.error("start char:", text.charAt(tokens[i].startIndex), "end char:", text.charAt(tokens[i].lastIndex));
                    console.error("substring:", text.substring(tokens[i].startIndex, tokens[i].lastIndex + 1).length, "*" + text.substring(tokens[i].startIndex, tokens[i].lastIndex + 1) + "*");
                    console.error("value    :", tokens[i].value.length, "*" + tokens[i].value + "*");

                }

            }

            // Reemplacem les markes pels valors correctes, ho fem després de la validació perquè un
            // un cop es fa un reemplaçament els valors dels startIndex i lastIndex ja no coincideixen amb
            // el text original. Com aquests valors només són necessaris per fer la divisio i extreure
            // els continguts, no cal corregir aquestes posicions

            // Validem que el contingut concatnat de tots els tokens correspon al valor original_
            let validationText = "";
            for (let i = 0; i < tokens.length; i++) {

                tokens[i].value = tokens[i].value.replaceAll(/&markn;/gsm, "\\\n>");
                tokens[i].value = tokens[i].value.replaceAll(/&mark;/gsm, '\>');

                validationText += tokens[i].value;
            }

            // console.log("Original text:", "*"+ originalText+"*");
            // console.log("Validate text:", "*"+validationText+"*");
            if (originalText !== validationText && originalText !== validationText + "\n") {
                console.error("ERROR: son diferents", originalText.length, validationText.length);
            }

            return tokens;
        },

        _setData: function (root) {


            let tree = [];
            // let node = JSON.parse(JSON.stringify(context.editor.extra.wioccl_structure.structure[refId]));
            root.name = root.type ? root.type : root.open;

            tree.push(root);

            console.log("SetData:", root);

            root.children = this._getWiocclChildrenNodes(root.children, root.id, this);

            console.log("new tree:", tree);


            this.treeWidget.destroyRecursive();

            // console.log("s'ha destruit el vell?");
            // return;


            console.log("### Que pasem com a data al New Memory:", tree);

            let store = new Memory({
                data: tree,
                // data: {name: 'test'},
                getChildren: function (object) {
                    return object.children || [];
                }
            });

            let model = new ObjectStoreModel({
                store: store,
                query: {id: root.id},
                mayHaveChildren: function (item) {
                    // return "children" in item;
                    return item.children.length > 0;
                }
            });


            // console.log("data al store: (abans)", this.store.data);

            // for (let i = this.store.data.length-1; i>=0; --i) {
            //     this.store.remove(this.store.data[i].id);
            // }

            // this.store.put(root, {parent: root.id});

            // console.log("data al store (després):", this.store.data);

            // no existeix query ni sembla que hi hagi manera de refrescar
            // this.model.query({id: root.id});

            // En aquest punt el store es buit, però no s'ha actualitzat l'arbre

// alert("stop");

            let context = this;

            let newTree = new Tree({
                id: Date.now(),
                model: model,
                onOpenClick: true,
                onLoad: function () {
                    // dom.byId('image').src = '../resources/images/root.jpg';
                },
                onClick: function (item) {
                    // PROBLEMA s'ha de resoldre en el click
                    console.log(item);
                    // alert("TODO: extreure la funció de la implementacio original (o tota la generació del tree")
                    // TODO: reconstruir el codi wioccl, no mostrar el json del item
                    jQuery(context.attrContainer).empty();
                    console.log("click al item:", item);
                    jQuery(context.attrContainer).append(context._generateHtmlForFields(context._extractFields(item.attrs, item.type)));
                    let auxItem = context.rebuildWioccl(item);

                    console.log("aux item?", auxItem);
                    context.dialogEditor.setValue(auxItem);
                    context.dialogEditor.wioccl = item;
                    // console.log("Editor:", context.editor);

                    console.warn("Structura actual:", context._getStructure());
                },

            });


            newTree.startup();
            newTree.placeAt(this.treeContainer);




            this.treeWidget = newTree;

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