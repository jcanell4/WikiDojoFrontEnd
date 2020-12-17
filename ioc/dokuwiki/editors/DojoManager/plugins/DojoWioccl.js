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
    'ioc/dokuwiki/editors/Components/RequestComponent',



], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, string, Button, domConstruct, Dialog, Memory, ObjectStoreModel, Tree, registry, dom, /*AceFacade, */toolbarManager, RequestComponent) {


    let AceFacade = null;

    // ALERTA! Aquestes classes no carregan correctament a la capçalera, cal fer un segon require
    require(["ioc/dokuwiki/editors/AceManager/AceEditorFullFacade"], function (AuxClass) {
        AceFacade = AuxClass;
    });

    let ajax = null;
    require(["ioc/dokuwiki/editors/Components/AjaxComponent"], function (AjaxComponent) {
        ajax = new AjaxComponent(); //ajax.send(urlBase, dataToSend, type)
        ajax.urlBase = '/dokuwiki_30/lib/exe/ioc_ajax.php?call=wioccl&format=html';
        ajax.method = 'post';
    });


    // No funciona si es carrega directament, hem de fer la inicialització quan cal utilitzar-lo


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

            // this.requestComponent = new RequestComponent(this.editor.dispatcher);


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
                this.backupStructure = JSON.parse(JSON.stringify(this.editor.extra.wioccl_structure.structure));

                // Ajustem l'arrel
                this.backupStructure[0].open = '';
                this.backupStructure[0].type = 'root';
                this.backupStructure[0].close = '';

            }

            return this.backupStructure;

        },

        _getWiocclChildrenNodes(children, parent, context) {
            let nodes = [];
            for (let i = 0; i < children.length; i++) {

                let id = typeof children[i] === 'object' ? children[i].id : children[i];


                let node = JSON.parse(JSON.stringify(context._getStructure()[id]));

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

            // console.error("Rebuilding wioccl:", data);
            let wioccl = "";

            wioccl += data.open.replace('%s', data.attrs);
            for (let i = 0; i < data.children.length; i++) {
                let node = typeof data.children[i] === 'object' ? data.children[i] : this._getStructure()[data.children[i]];
                wioccl += this.rebuildWioccl(node);
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
                let wioccl = context._getStructure()[refId];

                context.root = refId;

                let tree = [];
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
                context.detailContainer = detailContainer;

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
                        context._updateDetail(item);
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

                // L'editor no es pot afegir fins que el dialog no és creat:
                let $contentContainer = jQuery(contentContainer);
                let $textarea = jQuery('<textarea></textarea>');
                // let $textarea = jQuery('<textarea>' + valor + '</textarea>');
                $contentContainer.append($textarea);

                let args = {
                    id: 'wioccl-dialog',
                    value: valor
                };

                let editor = createEditor($textarea, $contentContainer, args, context);
                // editor.setValue(valor);


                let $paneContainer = jQuery(paneContainer);
                let $treeContainer = jQuery(treeContainer);
                let $detailContainer = jQuery(detailContainer);

                $paneContainer.css('position', 'absolute');
                $paneContainer.css('top', 0);
                $paneContainer.css('bottom', '45px');
                $paneContainer.css('left', 0);
                $paneContainer.css('right', 0);

                let $actionBar = jQuery(actionBar);
                $actionBar.css('margin', 0);
                $actionBar.css('padding', 0);

                let $updateButton = jQuery("<button class='wioccl-btn'>Actualitzar</button>");
                $actionBar.append($updateButton);

                let $saveButton = jQuery("<button class='wioccl-btn'>Save</button>");
                $actionBar.append($saveButton);


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
                    context.parseWioccl(editor.getValue(), editor.wioccl, context._getStructure());
                });

                $saveButton.on('click', function () {
                    context._save(editor);
                });

                context._updateDetail(tree[0]);

            });
        },


        // IDEA1: enviar el text
        // en aquest cas s'envia el text reconstruit a partir dels nodes i el rootRef, només cal fer la traducció
        // i reemplaçar les nodes

        // Si aquest no és el root, cal cercar el parent que té com a parent el node 0

        _save(editor) {
            // TODO passos a executar
            // 0 actualitzar el contingut actual
            this.parseWioccl(editor.getValue(), editor.wioccl, this._getStructure());

            // 1 reconstruir el wioccl del node pare (this._getStructure()[this.root], això és el que s'ha d'enviar al servidor
            // ALERTA! no cal enviar el text, cal enviar la estructura i el node a partir del qual s'ha de regenerar el codi wioccl
            let structure = this._getStructure();
            // let text = this.rebuildWioccl(structure[this.root]);
            let rootRef = this.root;

            // Cal tenir en compte que el rootRef podria ser el node arrel i en aquest cas no cal cerca més
            while (structure[rootRef].id > 0 && structure[rootRef].parent > 0) {
                rootRef = structure[rootRef].parent;
            }

            let text = this.rebuildWioccl(structure[rootRef]);

            console.log("Dades a enviar", text, rootRef);


            // 2 enviar al servidor juntament amb el id del projecte per poder carregar el datasource, cal enviar també
            //      la propera referència, que serà la posició per inserir els nodes nous

            console.log("hi ha dispatcher a l'editor?", this.editor.dispatcher);
            let globalState = this.editor.dispatcher.getGlobalState();

            // ALERTA! aquesta informació és necessaria perquè s'han d'afegir els spans amb la referència
            let dataToSend = {
                content: text,
                rootRef: rootRef,
                nextRef: Number(structure[structure.length-1].id)+1,
                projectOwner: globalState.getContent(globalState.currentTabId).projectOwner,
                projectSourceType: globalState.getContent(globalState.currentTabId).projectSourceType,
                sectok: this.editor.dispatcher.getSectok()
            };

            console.log("Data to send:", dataToSend);


            // TODO: fer alguna cosa amb la resposta, es pot lligar amb .then perque retorna una promesa

            // 3 al servidor fer el parser wioccl, traduir a html i retornar-lo per inserir-lo al document editat (cal indicar el punt d'inserció)

            // Fem servir ajax perquè això no ha de passar pel processor

            ajax.send(dataToSend).then(function(data) {
                    console.log("data:", data);

                    // retorn:
                    // [0] objecte amb el resultat del command <-- diria que aquest és l'únic necessari
                    //      value.content <-- contingut
                    //      value.extra.wioccl_structure <-- estructura
                    // [1] jsinfo
                    // [n...] extraContentState


                console.log(data[0].value.content);
                console.log(data[0].value.extra.wioccl_structure);


                    console.log("TODO: gestionar aquí el retorn")

                    // 4 eliminar tots els nodes que penjaven originalment de  this.root
                    // 5 inserir el html que ha arribat del servidor
                    // 6 afegir els handlers
            });

            //
            // this.requestComponent.on('completed', function(data) {
            //     console.log("data:", data);
            //
            //     console.log("TODO: gestionar aquí el retorn")
            //
            //     // 4 eliminar tots els nodes que penjaven originalment de  this.root
            //     // 5 inserir el html que ha arribat del servidor
            //     // 6 afegir els handlers
            // });
            //
            // this.requestComponent.send(urlBase, dataToSend);

            console.log("ajax request enviada");




        },


        // IDEA1: enviar la estructura
        _save2(editor) {
            // TODO passos a executar
            // 0 actualitzar el contingut actual
            this.parseWioccl(editor.getValue(), editor.wioccl, this._getStructure());

            // 1 reconstruir el wioccl del node pare (this._getStructure()[this.root], això és el que s'ha d'enviar al servidor
            // ALERTA! no cal enviar el text, cal enviar la estructura i el node a partir del qual s'ha de regenerar el codi wioccl
            let structure = {};
            // let text = this.rebuildWioccl(structure[this.root]);
            let rootRef = this.root;


            // No te sentit enviar tota la estructura porque inclou nodes de contingut extern que no s'han de processar
            // (aquests nodes poden haver canviat a l'editor normal i no es troban actualitzants)
            let addChildrenIdToStructure = function (nodeId, context, structure) {
                let node = context._getStructure()[nodeId];

                node.children = context._getWiocclChildrenNodes(node.children, node.id, context);

                for (let i = 0; i < node.children.length; i++) {
                    if (node.children[i]) {
                        addChildrenIdToStructure(node.children[i].id, context, structure);
                    }
                }
                structure[node.id + ""] = node;
            };

            addChildrenIdToStructure(rootRef, this, structure);


            console.log("Dades a enviar", structure, rootRef);


            // 2 enviar al servidor juntament amb el id del projecte per poder carregar el datasource, cal enviar també
            //      la propera referència, que serà la posició per inserir els nodes nous


            // 3 al servidor fer el parser wioccl, traduir a html i retornar-lo per inserir-lo al document editat (cal indicar el punt d'inserció)
            // 4 eliminar tots els nodes que penjaven originalment de  this.root
            // 5 inserir el html que ha arribat del servidor
            // 6 afegir els handlers


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

        _extractFields: function (attrs, type) {
            // console.log("Fields to extract:", attrs, type);

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
            // console.log(tokens);

            // text és el text a parsejar
            // wioccl és el node actual que cal reescriure, és a dir, tot el que es parseji reemplaça al id d'aquest node

            // si hi han nous node s'han d'afegir a partir d'aquest index
            // let lastIndex = structure.length;


            // Reordenació dels nodes:
            //      - posem com false tots els nodes fills actuals ALERTA no els eliminem perquè canviaria l'ordre de tots
            //      - els elements de la estructura i les referencies del document ja no serien correctes.
            let removeChildren = function (id, inStructure) {
                let node = inStructure[id];

                // console.log("Hi ha node?", node, id, structure);
                if (!node.children) {
                    console.error("no hi ha children?", node.children);
                }

                for (let i = node.children.length - 1; i >= 0; --i) {
                    let childId = typeof node.children[i] === 'object' ? node.children[i].id : node.children[i];
                    removeChildren(childId, inStructure);
                    inStructure[childId] = false;
                }
            };


            removeChildren(wioccl.id, structure);


            // ALERTA! un cop eliminat els fills cal desvincular també aquest element, ja que s'afegirà automàticament al parent si escau

            console.log("structure:", structure, wioccl);

            let found = false;
            for (let i = 0; i < structure[wioccl.parent].children.length; i++) {

                // Cal tenir en compte els dos casos ja que un cop es fa un update tots els childrens hauran
                // canviat a nodes
                if (structure[wioccl.parent].children[i] === wioccl.id || structure[wioccl.parent].children[i].id === wioccl.id) {
                    structure[wioccl.parent].children.splice(i, 1);
                    wioccl.index = i;
                    found = true;
                    break;
                }
            }

            if (!found) {
                console.error("no s'ha trobat aquest node al propi pare");
                console.log(structure, wioccl);
                alert("node no trobat al pare");
            }

            if (text.length === 0) {

                if (Number(wioccl.id) === Number(this.root)) {
                    alert("L'arrel s'ha eliminat, es mostrarà la branca superior.");
                    // si aquest és el node arrel de l'arbre cal actualitzar l'arrel també
                    this.root = wioccl.parent;
                } else {
                    alert("La branca s'ha eliminat.");
                }

                wioccl = structure[wioccl.parent];
                tokens = [];
            }


            this._createTree(wioccl, tokens, structure);

            // en el cas de siblings cal determinar també en quina posició es troba de l'arbre
            this._setData(structure[this.root], wioccl);

        },

        // La structura es modifica i es retorna per referència
        _createTree(root, tokens, structure) {
            // Només hi ha un tipus open/close, que son els que poden tenir fills:
            //      OPEN: comencen per "<WIOCCL:"
            //      CLOSE: comencen per "</WIOCCL:"


            let stack = [];

            // ALERTA! TODO: Cal gestionar el token inicial, aquest no s'ha d'afegira l'arbre
            // i el seu tancament tampoc


            let nextIndex = structure.length;

            let siblings = 0;

            for (let i = 0; i < tokens.length; i++) {

                // tokens[i].rebuild = true;

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
                    stack[stack.length - 1].children.push(nextIndex);
                    tokens[i].parent = stack[stack.length - 1].id
                } else {
                    // Si no hi ha cap element a l'estack es que es troba al mateix nivell que l'element root
                    tokens[i].parent = root.parent
                }

                // Si fem servir push s'afegeixen al final, això no serveix perquè cal inserir els nous nodes a la posició original (emmagatzemada a root.index)
                // structure[root.parent].children.push(tokens[i].id);


                if (tokens[i].parent === root.parent) {
                    structure[root.parent].children.splice(root.index + siblings, 0, tokens[i].id);
                    ++siblings;
                }


                // No cal gestionar el type content perquè s'assigna al tokenizer

                if (tokens[i].value.startsWith('<WIOCCL:')) {
                    console.log("Value:", tokens[i].value);
                    let pattern = /<WIOCCL:.*? (.*?)>/gsm;

                    let matches;

                    if (matches = pattern.exec(tokens[i].value)) {
                        console.log()
                        tokens[i].attrs = matches[1];
                    } else {
                        tokens[i].attrs = "";
                    }

                    console.log("Attrs:", tokens[i].attrs);

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
                    structure[root.id] = tokens[i];
                } else {
                    structure.push(tokens[i]);
                    nextIndex++;
                }

            }

            if (siblings > 1 && Number(root.id) === Number(this.root)) {
                root.addedsiblings = true;
            }


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
            // let originalText = text;
            text = text.replaceAll(/\\[\n]>/gsm, '&markn;');
            text = text.replaceAll(/\\>/gsm, '&mark;');

            // ALERTA: això suposa un canvi en el recompte de caràcteres, perquè les posicions no corresponen


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

            // Si aquesta llista es vàlida cal extreure d'aquí el content (diferencia de lastindex i index del següent token
            // Cal recorrer l'array des del final, ja que cal afegir (si escau) el token de content a la posició de l'index
            let currentPos = text.length - 1;

            if (tokens.length > 0) {
                if (tokens[tokens.length - 1].lastIndex < currentPos) {
                    let token = {};
                    token.type = 'content';
                    token.value = text.substring(tokens[tokens.length - 1].lastIndex + 1, text.length);
                    token.attrs = '';
                    token.open = token.value;
                    token.close = '';

                    // Això no és realment necessari
                    token.startIndex = tokens[tokens.length - 1].lastIndex + 1;
                    token.lastIndex = currentPos;
                    tokens.push(token);
                }

            }

            for (let i = tokens.length - 1; i >= 0; --i) {


                if (tokens[i].lastIndex === currentPos || i === tokens.length - 1) {
                    // console.log("** consecutiu: ");
                    // és consecutiu, no hi ha content entre aquest element i el següent
                } else {
                    let token = {};
                    token.type = 'content';
                    token.value = text.substring(tokens[i].lastIndex + 1, currentPos + 1);
                    token.attrs = '';
                    token.open = token.value;
                    token.close = '';

                    // Això no és realment necessari
                    token.startIndex = tokens[i].lastIndex + 1;
                    token.lastIndex = currentPos;

                    // Afegit entre el token actual i el següent
                    tokens.splice(i + 1, 0, token);

                }

                currentPos = tokens[i].startIndex - 1;

            }

            if (tokens.length === 0) {
                // CAS: tot el text es content
                let token = {};
                token.type = 'content';
                token.value = text;
                token.attrs = '';
                token.open = text;
                token.close = '';

                // Això no és realment necessari
                token.startIndex = 0;
                token.lastIndex = currentPos;
                tokens.push(token);
            } else {

                if (tokens[0].startIndex > 0) {

                    let token = {};
                    token.type = 'content';
                    token.value = text.substring(0, tokens[0].startIndex);
                    token.attrs = '';
                    token.open = token.value;
                    token.close = '';

                    // Això no és realment necessari
                    token.startIndex = 0;
                    token.lastIndex = currentPos;
                    tokens.unshift(token);
                }

            }

            return tokens;
        },

        _updateDetail: function (item) {
            // console.log("Updating:", item);


            jQuery(this.attrContainer).empty();
            jQuery(this.attrContainer).append(this._generateHtmlForFields(this._extractFields(item.attrs, item.type)));

            let auxItem = this.rebuildWioccl(item);

            // Eliminem el salt de línia final, no forma part del valor del token (per determinar perquè s'afegeix)
            if (auxItem.substr(-1) === "\n") {
                auxItem = auxItem.substring(0, auxItem.length - 1);
            }

            this.dialogEditor.setValue(auxItem);

            this.dialogEditor.wioccl = item;


            if (item.id === 0) {
                this.dialogEditor.lockEditor();
                jQuery(this.detailContainer).css('opacity', '0.5');
            } else {
                this.dialogEditor.unlockEditor();
                jQuery(this.detailContainer).css('opacity', '1');
            }

        },

        _setData: function (root, selected) {
            let tree = [];

            let structure = this._getStructure();

            if (selected.addedsiblings) {
                root = structure[root.parent];
                this.root = root.id;
            }

            root.name = root.type ? root.type : root.open;

            tree.push(root);

            root.children = this._getWiocclChildrenNodes(root.children, root.id, this);

            this.treeWidget.destroyRecursive();

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


            let context = this;

            let newTree = new Tree({
                id: Date.now(),
                model: model,
                onOpenClick: true,
                onLoad: function () {
                    // dom.byId('image').src = '../resources/images/root.jpg';
                },
                onClick: function (item) {
                    context._updateDetail(item);
                },

            });


            newTree.startup();
            newTree.placeAt(this.treeContainer);


            // actualitzem el contingut del dialog

            // Seleccionem el node en el nou arbre:
            // Cas 1: no s'ha creat cap node nou (s'ha canviat l'existent), seleccionem el mateix

            let node = selected;
            /// corresponent al cas1, es seleccionarà el node original
            let path = [];


            while (node.parent !== null && node.id !== root.id) {
                path.unshift(node.id + "");
                node = structure[node.parent];
            }

            // Finalment s'afegeix el node root
            path.unshift(root.id + "");

            // console.log("Selected?", selected);
            // console.log("Path:", path);
            newTree.set('path', path);

            // ALERTA! és diferent fer això que agafar el selected, ja que el selected era l'element original que hara
            // pot trobar-se dividit en múltiples tokens
            this._updateDetail(structure[selected.id]);

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