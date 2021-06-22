define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    "dijit/form/ToggleButton",
    "dojo/dom-construct",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWiocclDialog',
    "dijit/registry",
    "dojo/dom",
    'dijit/Tooltip',
    'dojo/on',
    'dijit/place',
    'dojo/mouse'


], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, string, Button, domConstruct,
             Dialog, registry, dom, Tooltip, on, place, mouse) {

    let counter = 0;

    // // ALERTA! Aquestes classes no carregan correctament a la capçalera, cal fer un segon require
    let ajax = null;
    require(["ioc/dokuwiki/editors/Components/AjaxComponent"], function (AjaxComponent) {
        ajax = new AjaxComponent(); //ajax.send(urlBase, dataToSend, type)
        ajax.urlBase = '/lib/exe/ioc_ajax.php?call=wioccl&format=html';
        ajax.method = 'post';
    });

    // No funciona si es carrega directament, hem de fer la inicialització quan cal utilitzar-lo


    let WiocclButton = declare(AbstractParseableDojoPlugin, {

        // S'assigna quan es crea el diàleg

        wiocclDialog: null,

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
            this.editor.on('import', this.updateHandlers.bind(this));

            // console.log("wioccl structure:", this.editor.extra.wioccl_structure.structure);
        },

        addButton: function (config) {
            this.button = new Button(config);
        },

        updateHandlers: function () {
            // console.log("updating handlers", jQuery(this.editor.iframe).contents().find('[data-wioccl-ref]'));
            this._addHandlers(jQuery(this.editor.iframe).contents().find('[data-wioccl-ref]'), this);
        },

        updateCursorState: function (e) {

            if (e.state.indexOf(this.tag) > -1) {
                this.button.set('checked', true);
            } else {
                this.button.set('checked', false);
            }
        },

        process: function () {
            alert("TODO: s'ha d'insertar un codi wioccl que permeti obrir l'editor");
        },

        getStructure() {
            // console.log(this.editor.extra.wioccl_structure.structure);

            if (!this.backupStructure) {

                this.backupStructure = JSON.parse(JSON.stringify(this.editor.extra.wioccl_structure.structure));

                // Ajustem l'arrel
                this.backupStructure[0].open = '';
                this.backupStructure[0].type = 'root';
                this.backupStructure[0].close = '';

            }

            return this.backupStructure;
        },


        // _getWiocclChildrenNodes(children, parent, context) {
        _getWiocclChildrenNodes(children, parent, structure) {
            let nodes = [];

            for (let i = 0; i < children.length; i++) {


                let id = typeof children[i] === 'object' ? children[i].id : children[i];

                if (structure[id].isClone) {
                    // if (context.getStructure()[id].isClone) {
                    continue;
                }

                // console.log("Original:", id, context.getStructure()[id]);
                let node = JSON.parse(JSON.stringify(structure[id]));
                // let node = JSON.parse(JSON.stringify(context.getStructure()[id]));
                // console.log("Clon:", id,node);

                if (!node) {
                    console.error("Node not found:", id);
                }
                node.name = node.type ? node.type : node.open;

                node.parent = parent;
                if (node.children.length > 0) {
                    node.children = this._getWiocclChildrenNodes(node.children, node.id, structure);
                }

                nodes.push(node);
            }

            return nodes;
        },

        rebuildWioccl: function (data, structure) {
            // console.log("Rebuilding wioccl:", data);
            let wioccl = "";

            // Cal fer la conversió de &escapedgt; per \>
            data.attrs = data.attrs.replaceAll('&escapedgt;', '\\>');
            data.attrs = data.attrs.replaceAll('&mark;', '\\>');
            data.attrs = data.attrs.replaceAll('&markn;', "\n>");

            wioccl += data.open.replace('%s', data.attrs);

            for (let i = 0; i < data.children.length; i++) {

                // let node = typeof data.children[i] === 'object' ? data.children[i] : this.getStructure()[data.children[i]];
                let node = typeof data.children[i] === 'object' ? data.children[i] : structure[data.children[i]];

                // al servidor s'afegeix clone al item per indicar que aquest element es clonat i no cal reafegirlo
                // per exemple perquè és genera amb un for o foreach
                if (node.isClone) {
                    continue;
                }

                wioccl += this.rebuildWioccl(node, structure);
            }

            if (data.close !== null) {
                wioccl += data.close;
            }

            return wioccl;
        },


        _addHandlers: function ($node, context) {
            // console.log("$node", $node);

            $node.off('click');

            // ALERTA[Xavi] ho posem com una variable i no com una propietat perquè necessitem
            // accés al context (aquesta classe) i al this (el node on es dispara l'event) i
            // una referència per poder fer un off per no reafegir-lo

            let _enableHighlight = function (refId, isParent) {
                let $relatedNodes = jQuery(context.editor.iframe).contents().find('[data-wioccl-ref="' + refId + '"]');
                $relatedNodes.addClass('ref-highlight');

                if (!isParent) {
                    $relatedNodes.addClass('child');
                }


                let wioccl = context.getStructure()[refId];

                for (let child of wioccl.children) {
                    _enableHighlight(child, false);
                }
            }

            let _disableHighlight = function (refId) {
                let $relatedNodes = jQuery(context.editor.iframe).contents().find('[data-wioccl-ref="' + refId + '"]');
                $relatedNodes.removeClass('ref-highlight');
                $relatedNodes.removeClass('child');

                let wioccl = context.getStructure()[refId];

                if (!wioccl) {
                    return;
                }

                for (let child of wioccl.children) {
                    _disableHighlight(child);
                }
            }

            let _showTooltip = function (e) {

                e.stopPropagation();

                let node = this;
                let $this = jQuery(node);
                let refId = $this.attr('data-wioccl-ref');

                let wioccl = context.getStructure()[refId];

                let str = wioccl.open + wioccl.close;
                str = str.replace('%s', wioccl.attrs);

                $this.attr('title', '[' + refId + '] ' + str);
                $this.attr('data-tooltip', 'displaying');

                _enableHighlight(refId, true);
            };

            $node.off('mouseover', _showTooltip);

            $node.on('mouseover', _showTooltip);

            let _hideTooltip = function (e) {
                let $this = jQuery(this);
                let refId = $this.attr('data-wioccl-ref');
                // console.log("hide", refId);

                if ($this.attr('data-tooltip')) {
                    $this.removeAttr('title');
                    $this.removeAttr('data-tooltip');
                }

                _disableHighlight(refId);

            };

            $node.on('mouseout', _hideTooltip);

            $node.on('mouseout', _hideTooltip);

            $node.on('click', function (e) {

                let $item = jQuery(this);

                e.preventDefault();
                e.stopPropagation();

                let refId = $item.attr('data-wioccl-ref');

                let wioccl = context.getStructure()[refId];

                if (wioccl.isClone) {
                    alert("Aquest element es una copia, es mostrarà l'element pare");

                    while (wioccl.isClone) {
                        wioccl = context.getStructure()[wioccl.parent];
                        refId = wioccl.id;
                    }
                }

                // console.log("Establint root:", refId);
                context.root = refId;

                let tree = [];
                let node = JSON.parse(JSON.stringify(context.getStructure()[refId]));
                node.name = node.type ? node.type : node.open;
                tree.push(node);

                tree[0].children = context._getWiocclChildrenNodes(tree[0].children, tree[0].id, context.getStructure());

                let oldDialog = registry.byId('wioccl-dialog' + counter);

                if (oldDialog) {
                    oldDialog.destroyRecursive();
                    counter++;
                }

                let structure = context.getStructure();

                let wiocclDialog = new Dialog({
                    title: 'Edició wioccl',
                    // style: 'width:auto',
                    style: 'height:100%; width:100%; top:0; left:0; position:absolute; max-width: 80%; max-height: 80%;',
                    // style: 'height:100%; width:100%; top:0; left:0; position:absolute; max-width: 100%; max-height: 100%;',
                    onHide: function (e) { //Voliem detectar el event onClose i hem hagut de utilitzar onHide
                        this.destroyRecursive();
                        context.backupStructure = null;
                    },
                    id: 'wioccl-dialog' + counter,
                    draggable: false,
                    firstResize: true,
                    source: context,
                    args: {
                        id: 'wioccl-dialog' + counter,
                        value: context.rebuildWioccl(tree[0], structure)
                    },
                    wioccl: wioccl,
                    structure: structure,
                    tree: tree,
                    refId: refId,
                    saveCallback: context._save.bind(context),
                    updateCallback: context._update.bind(context)
                });

                context.wiocclDialog = wiocclDialog;
                wiocclDialog.startup();

                wiocclDialog.show();

                wiocclDialog.setFields(wiocclDialog._extractFields(tree[0].attrs, tree[0].type));
                wiocclDialog._updateDetail(tree[0]);
            });
        },

        _update(editor) {
            console.log("update", this.wiocclDialog);
            this.parseWioccl(editor.getValue(), editor.wioccl, this.getStructure(), this.wiocclDialog);
        },

        // Enviar el text
        // en aquest cas s'envia el text reconstruit a partir dels nodes i el rootRef, només cal fer la traducció
        // i reemplaçar les nodes

        // Si aquest no és el root, cal cercar el parent que té com a parent el node 0
        _save(editor) {
            // console.log("Estructura original:", this.editor.extra.wioccl_structure.structure);

            let context = this;
            // 0 actualitzar el contingut actual
            this.parseWioccl(editor.getValue(), editor.wioccl, this.getStructure(), this.wiocclDialog);

            // 1 reconstruir el wioccl del node pare (this._getStructure()[this.root], això és el que s'ha d'enviar al servidor
            // ALERTA! no cal enviar el text, cal enviar la estructura i el node a partir del qual s'ha de regenerar el codi wioccl
            let structure = this.getStructure();

            let rootRef = this.root;

            // Cal tenir en compte que el rootRef podria ser el node arrel i en aquest cas no cal cerca més
            while (structure[rootRef].id > 0 && structure[rootRef].parent > 0) {
                rootRef = structure[rootRef].parent;
            }

            // cal desar el parent per restaurar-lo, el que retorna del servidor no te cap parent assignat
            let originalParent = structure[rootRef].parent;
            let originalRef = rootRef;

            let text = this.rebuildWioccl(structure[rootRef], structure);

            // 2 enviar al servidor juntament amb el id del projecte per poder carregar el datasource, cal enviar també
            //      la propera referència, que serà la posició per inserir els nodes nous

            let globalState = this.editor.dispatcher.getGlobalState();

            // ALERTA! aquesta informació és necessaria perquè s'han d'afegir els spans amb la referència
            // let next = structure['next'];

            let dataToSend = {
                content: text,
                rootRef: rootRef,
                nextRef: structure['next'],
                projectOwner: globalState.getContent(globalState.currentTabId).projectOwner,
                projectSourceType: globalState.getContent(globalState.currentTabId).projectSourceType,
                sectok: this.editor.dispatcher.getSectok()
            };

            // console.log("Data to send:", dataToSend);


            // ALERTA! si el rootRef és 0 cal eliminar tot el document perquè es reemplaçarà
            // ALERTA[Xavi] no es permet això perquè fallava.
            // if (dataToSend.rootRef === "0") {
            //     context.editor.setValue('');
            // }

            // TODO: fer alguna cosa amb la resposta, es pot lligar amb .then perque retorna una promesa

            // 3 al servidor fer el parser wioccl, traduir a html i retornar-lo per inserir-lo al document editat (cal indicar el punt d'inserció)

            // Fem servir ajax perquè això no ha de passar pel processor

            ajax.setStandbyId(jQuery('body').get(0));

            context.wiocclDialog.hide();

            ajax.send(dataToSend).then(function (data) {
                // console.log("data:", data);

                // fem que l'editor dispari un event, això ho fa servir el DojoReadonlyToggle


                // retorn:
                // [0] objecte amb el resultat del command <-- diria que aquest és l'únic necessari
                //      value.content <-- contingut
                //      value.extra.wioccl_structure <-- estructura
                // [1] jsinfo
                // [n...] extraContentState

                // console.log(data[0].value.content);
                // console.log(data[0].value.extra.wioccl_structure.structure);

                // 4 eliminar tots els nodes que penjaven originalment de  this.root
                //      alerta! no es guarantit que els nodes del backupstructure siguin els mateixos
                //      que retorna el servidor, així que fem servir els valors retornats.

                // aquesta es la estructura original.
                let target = context.editor.extra.wioccl_structure.structure;
                context._removeChildren(rootRef, target, true);

                // Cal eliminar també les referències al node arrel (poden ser múltiple en el cas del foreach)
                // Cal inserir una marca pel node root
                let $rootNodes = jQuery(context.editor.iframe).contents().find('[data-wioccl-ref="' + rootRef + '"]');

                // 5 inserir el html que ha arribat del servidor
                // Afegim les noves i eliminem el cursor
                let $nouRoot = jQuery(data[0].value.content);

                if (dataToSend.rootRef === "0") {
                    alert("Alerta! es reemplaça tot el document").
                        // s'ha reemplaçat tot el document
                        context.editor.setValue(data[0].value.content);
                } else {
                    // console.log("S'inserta el nou contingut abans de:", $rootNodes.get(0))
                    // console.log("quin és el $nouroot??", $nouRoot);
                    jQuery($rootNodes.get(0)).before($nouRoot);
                }

                // Elimem les referencies
                $rootNodes.remove();

                // Actualitzem la estructura
                let source = data[0].value.extra.wioccl_structure.structure;

                // fusió del original i l'anterior
                Object.assign(target, source);

                // Restaurem el parent
                target[originalRef].parent = originalParent;

                // Afegim els handlers (ara s'afegeixen com a resposta al emit)
                // context._addHandlers($nouRoot.find("[data-wioccl-ref]").addBack('[data-wioccl-ref]'), context);
                context.editor.emit('import');

                context.editor.forceChange();


                jQuery(context.editor.iframe).contents().find('[data-wioccl-ref="' + originalRef + '"]')[0].scrollIntoView();

            });
        },

        parseWioccl: function (text, wioccl, structure, dialog, ignoreRebranch) {

            let outTokens = this._tokenize(text);


            // text és el text a parsejar
            // wioccl és el node actual que cal reescriure, és a dir, tot el que es parseji reemplaça al id d'aquest node

            // si hi han nous node s'han d'afegir a partir d'aquest index
            // let lastIndex = structure.length;


            // Reordenació dels nodes:
            //      - posem com false tots els nodes fills actuals ALERTA no els eliminem perquè canviaria l'ordre de tots
            //      - els elements de la estructura i les referencies del document ja no serien correctes.


            // En el cas de l'arrel d'un subdialeg no existeix el parent

            if (wioccl.parent) {
                this._removeChildren(wioccl.id, structure);

                // ALERTA! un cop eliminat els fills cal desvincular també aquest element, ja que s'afegirà automàticament al parent si escau
                let found = false;

                for (let i = 0; i < structure[wioccl.parent].children.length; i++) {

                    // Cal tenir en compte els dos casos (chidlren com id o com nodes) ja que un cop es fa
                    // a un update tots els childrens hauran canviat a nodes
                    if (structure[wioccl.parent].children[i] === wioccl.id || structure[wioccl.parent].children[i].id === wioccl.id) {
                        console.log("eliminat el ", wioccl.id, " de ", structure[wioccl.parent].children, " per reafegir-lo");
                        structure[wioccl.parent].children.splice(i, 1);
                        wioccl.index = i;
                        found = true;
                        break;
                    }
                }

                // perquè passa això de vegades?
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
                    outTokens = [];
                }
            }


            // TODO: considerar extreure això, el parser només hauria de parsejar els resultats
            // i no refer l'arbre. En el cas de la edició normal (sense fer update) no s'ha
            // de refer
            this._createTree(wioccl, outTokens, structure);

            // en el cas de sibblings cal determinar també en quina posició es troba de l'arbre
            this._setData(structure[this.root], wioccl, structure, this.wiocclDialog, ignoreRebranch);
            // this._setData(structure[this.root], wioccl, structure, dialog, ignoreRebranch);


        },

        parseWiocclNew: function (text, outRoot, outStructure, dialog, ignoreRebranch) {
            // console.log(text, outRoot, outStructure);
            let outTokens = this._tokenize(text);

            // console.log("out tokens?", outTokens);

            this._createTree(outRoot, outTokens, outStructure);


            // en el cas de sibblings cal determinar també en quina posició es troba de l'arbre
            // this._setData(outStructure[this.root], wioccl);

            // Alerta[Xavi] el _setData es crida manualment quan calgui (al update), no es fa servir el this.root
            // si no el refId que només és disponible quan es crea el subdialeg.

            // console.log(this.root, outStructure, outRoot);
            // this._setData(outStructure[this.root], outRoot, ignoreRebranch, dialog, ignoreRebranch);
            // console.warn("cal fer alguna cosa amb el _setData?"); // es necessari pel update?

        },

        _removeChildren: function (id, inStructure, removeNode) {
            let node = inStructure[id];

            if (!node.children) {
                console.error("no hi ha children?", node.children);
            }

            for (let i = node.children.length - 1; i >= 0; --i) {
                let childId = typeof node.children[i] === 'object' ? node.children[i].id : node.children[i];
                this._removeChildren(childId, inStructure, removeNode);
                // inStructure[childId] = false;

                if (removeNode) {
                    let $node = jQuery(this.editor.iframe).contents().find('[data-wioccl-ref="' + childId + '"]');
                    $node.remove();
                }

                delete (inStructure[childId]);
            }

            node.children = [];


        },

        // La structura es modifica i es retorna per referència
        _createTree(root, outTokens, structure) {
            // Només hi ha un tipus open/close, que son els que poden tenir fills:
            //      OPEN: comencen per "<WIOCCL:"
            //      CLOSE: comencen per "</WIOCCL:"


            let stack = [];

            // ALERTA! TODO: Cal gestionar el token inicial, aquest no s'ha d'afegira l'arbre
            // i el seu tancament tampoc

            // console.log("Next key:", structure.next);
            let nextKey = structure.next + "";

            let sibblings = 0;

            let first = true;

            /// Aquest serà el valor a retornar si el root es null inicialment
            let outRoot = null;

            // Si l'últim token és un salt de linia ho afegim al token anterior
            if (outTokens.length > 1 && outTokens[outTokens.length - 1].value === "\n") {
                outTokens[outTokens.length - 2].value += "\n";
                outTokens.pop();
            }


            if (root.type === 'temp') {
                // cal eliminar els childs perquè es tornaran a afegir
                this._removeChildren(root.id, structure, true);
                // root.children = [];
            }


            for (let i in outTokens) {

                // Cal un tractament especial per l'arrel perquè s'ha de col·locar a la posició del node arrel original
                // Si l'arrel és temporal el primer token és fill de l'arrel

                if (root.type === 'temp' && stack.length === 0) {
                    outTokens[i].id = nextKey;
                    root.children.push(outTokens[i].id);
                    outTokens[i].parent = root.id;

                } else if (i === '0') {
                    outTokens[i].id = root.id;
                    outTokens[i].parent = root.parent;
                    // this.root = tokens[i].id;


                } else {
                    outTokens[i].id = nextKey;
                }

                outTokens[i].children = [];

                if (outTokens[i].value.startsWith('</WIOCCL:')) {
                    outTokens[i].type = "wioccl";
                    let top = stack.pop();
                    top.close = outTokens[i].value;
                    continue;
                }


                if (stack.length > 0) {
                    stack[stack.length - 1].children.push(nextKey);
                    outTokens[i].parent = stack[stack.length - 1].id
                } else if (root != null) {
                    // Si no hi ha cap element a l'estack es que es troba al mateix nivell que l'element root
                    outTokens[i].parent = root.parent;
                } else {
                    outTokens[i].parent = -1;
                }

                // Si fem servir push s'afegeixen al final, això no serveix perquè cal inserir els nous nodes a la posició original (emmagatzemada a root.index)
                // si no hi ha root.index no cal reordenar, això passa amb un parse de múltiples tokens temporals

                // console.log(root !== null,  root.index,  outTokens[i].parent, root.parent);

                if (root !== null && root.index !== undefined && outTokens[i].parent === root.parent
                    && (Number(i) < outTokens.length - 1 || outTokens[i].value !== "\n")) {
                    structure[root.parent].children.splice(root.index + sibblings, 0, outTokens[i].id);
                    console.log("Reafegit a la posició:", root.index + sibblings, " amb id:", outTokens[i].id);
                    ++sibblings;
                }

                // No cal gestionar el type content perquè s'assigna al tokenizer

                if (outTokens[i].value.startsWith('<WIOCCL:')) {
                    // console.log("Value:", tokens[i].value);
                    let pattern = /<WIOCCL:.*? (.*?)>/gsm;

                    let matches;

                    if (matches = pattern.exec(outTokens[i].value)) {
                        outTokens[i].attrs = matches[1];
                    } else {
                        outTokens[i].attrs = "";
                    }

                    pattern = /(<WIOCCL:.*?)[ >]/gsm;

                    matches = pattern.exec(outTokens[i].value);
                    outTokens[i].open = matches[1] + ' %s>';

                    pattern = /<WIOCCL:(.*?)[ >]/gsm;
                    matches = pattern.exec(outTokens[i].value);
                    outTokens[i].type = matches[1].toLowerCase();

                    stack.push(outTokens[i]);
                }

                if (outTokens[i].value.startsWith('{##')) {
                    outTokens[i].type = "field";
                    outTokens[i].open = "{##%s";
                    outTokens[i].close = "##}";

                    let pattern = /{##(.*)##}/gsm;

                    let matches;
                    if (matches = pattern.exec(outTokens[i].value)) {
                        outTokens[i].attrs = matches[1];
                    } else {
                        console.error("S'ha trobat un camp però no el seu nom", outTokens[i].value);
                    }

                }

                if (outTokens[i].value.startsWith('{#_')) {
                    outTokens[i].type = "function";

                    let pattern = /{#_.*?\((.*)\)_#}/gsm;
                    let matches;

                    if (matches = pattern.exec(outTokens[i].value)) {
                        outTokens[i].attrs = matches[1];
                    } else {
                        outTokens[i].attrs = "";
                    }

                    pattern = /({#_.*?\()(.*)(\)_#})/gsm;
                    outTokens[i].open = outTokens[i].value.replace(pattern, "$1%s$3");

                    outTokens[i].close = "";
                }

                // Cal un tractament especial per l'arrel perquè s'ha de col·locar a la posició del node arrel original

                // TODO[Xavi] eliminar el root.isNull i el outRoot, no s'ha de fer servir, tots els nodes han de penjar d'un pare
                if (first && root.type !== 'temp') {
                    if (root.isNull) {
                        outRoot = outTokens[i];
                        structure[nextKey] = outTokens[i];
                        nextKey = (Number(nextKey) + 1) + "";
                    } else {
                        structure[root.id] = outTokens[i];
                    }
                    first = false;

                } else {
                    structure[nextKey] = outTokens[i];
                    nextKey = (Number(nextKey) + 1) + "";
                }


                // ALERTA[Xavi] Si s'afegeixen sibblings a un element que penji directament del root aquest es descartaran
                if (sibblings > 1 && Number(root.id) === Number(this.root) && Number(structure[root.id]['parent']) !== 0) {
                    root.addedsibblings = true;
                }

            }

            // console.log("hi ha outRoot?", outRoot);
            if (outRoot !== null) {
                Object.assign(root, outRoot);
                delete root.isNull;
            }

            // console.log("Nou root:", outRoot);
            structure.next = Number(nextKey);


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

                // console.log(token);

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
        }
        ,

        // _setData: function (root, selected, ignoreRebranch) {
        _setData: function (root, selected, structure, dialog, ignoreRebranch) {
            // console.log("root:", root);

            let tree = [];

            // let structure = this.getStructure();

            if (selected.addedsibblings) {
                root = structure[root.parent];
                console.error("Modificant el root, canviat ", this.root, "per:", root.id);
                this.root = root.id;
            }

            root.name = root.type ? root.type : root.open;

            tree.push(root);


            // root.children = this._getWiocclChildrenNodes(root.children, root.id, this.getStructure());
            root.children = this._getWiocclChildrenNodes(root.children, root.id, structure);

            if (!ignoreRebranch) {
                dialog.updateTree(tree, root, selected, structure);
                // this.wiocclDialog.updateTree(tree, root, selected, structure);
            }


            // ALERTA! és diferent fer això que agafar el selected, ja que el selected era l'element original que hara
            // pot trobar-se dividit en múltiples tokens
            dialog._updateDetail(structure[selected.id]);
            // this.wiocclDialog._updateDetail(structure[selected.id]);
        },

        parse: function () {

            let $nodes = jQuery(this.editor.iframe).contents().find('[data-wioccl-ref]');
            let context = this;

            // perquè no ho fem en general? si aquí no funciona, es válid pel import'
            context._addHandlers($nodes, context)

        }
        ,
    });

    // Register this plugin.
    _Plugin.registry["insert_wioccl"] = function () {
        return new WiocclButton({command: "insert_wioccl"});
    };

    return WiocclButton;
});