// Aquesta classe és un wrapper per les estructures wioccl enviades des del servidor que incluen
// les funcions per gestionar-les i modificar-les des del plugin per Dojo Editor DojoWioccl i DojoWiocclDialog
define([
    'dojo/_base/declare',
], function (declare) {


    // TODO: Solució temporal, en lloc de rebre la definició de WIOCC des del servidor la establim aquí


    // TODO: comprovar quines falten!

    let wiocclDefinition = {
        function: {
            open: "{#_",
            close: "(%s)_#}",
            defs: {
                STR_REPLACE: {
                    params: [
                        {name: "param A", type: ["TODO"]},
                        {name: "param B", type: ["TODO"]},
                        {name: "param C", type: ["TODO"]},
                        {name: "param D", type: ["TODO"]}
                    ]
                },
                GET_PERCENT: {
                    params: [
                        {name: "param0", type: ["TODO"]},
                        {name: "param1", type: ["TODO"]},
                    ]
                },
                IS_STR_EMPTY: {
                    params: [
                        {name: "param0", type: ["TODO"]},
                    ]
                },
                STR_CONTAINS: {
                    params: [
                        {name: "param0", type: ["TODO"]},
                        {name: "param1", type: ["TODO"]},
                    ]
                },
                ARRAY_LENGTH: {
                    params: [
                        {name: "param0", type: ["TODO"]},
                    ]
                },
                MAX: {
                    params: [
                        {name: "param0", type: ["TODO"]},
                        {name: "param1", type: ["TODO"]},
                        {name: "param2", type: ["TODO"]},
                    ]
                },
                DATE: {
                    params: [
                        {name: "param0", type: ["TODO"]},
                        {name: "param1", type: ["TODO"]},
                    ]
                },
                FIRST: {
                    params: [
                        {name: "param0", type: ["TODO"]},
                        {name: "param1", type: ["TODO"]},
                    ]
                },
                LAST: {
                    params: [
                        {name: "param0", type: ["TODO"]},
                        {name: "param1", type: ["TODO"]},
                    ]
                },
                SUBS: {
                    params: [
                        {name: "param0", type: ["TODO"]},
                        {name: "param1", type: ["TODO"]},
                    ]
                },
                ARRAY_GET_SUM: {
                    params: [
                        {name: "param0", type: ["TODO"]},
                        {name: "param1", type: ["TODO"]},
                    ]
                },
                COUNTINARRAY: {
                    params: [
                        {name: "param0", type: ["TODO"]},
                        {name: "param1", type: ["TODO"]},
                        {name: "param2", type: ["TODO"]},
                    ]
                },
                UCFIRST: {
                    params: [
                        {name: "param0", type: ["TODO"]}
                    ]
                }
            }
        }

    };

    return declare([], {

        /**
         * @namespace
         * @property {bool}  temp               - indica que es tracta d'una estructura temporal
         * @property {string[]} siblings        - nous nodes germans creats temporalment

         */
        structure: null,

        updating: false,

        /** @type {Map<int, wioccl>} - relació de nodes per posició */
        posMap: null,

        /** @type {wioccl} - copia del node per poder restarurar-lo **/
        backupNode: null,

        /** @type {string} - identificador del node arrel inicial (seleccionat inicialment)**/
        // TODO: Canviar el nom per selected root per no confondre amb l'arrel real ('0') de la estructura
        root: '',

        /** @type {string[]} siblings creats temporalment **/
        siblings: null,

        /**
         *
         * TODO: crear subclasses de manera que no calgui
         *
         *
         * Opcions de configuració:
         * @param {object} config.structure -   objecte literal amb la estructura wioccl (enviada des del servidor). Si
         *                                      no es passa es crea una estructura temporal automàticament.
         * @param {bool} [config.clone=true] -  indica si s'ha d'enllaçar la estructura passada com argument.
         *                                      (els canvis s'aplicaràn sobre aquesta).
         */
        constructor: function (config) {
            // console.log(config);
            // Aquí no fem res perquè cada subclasse ha d'implementar la seva propia lògica

            this.siblings = [];
        },

        setStructure: function (structure) {
            throw error('This methos must be implemented by subclasses');
        },


        setNode: function (node) {
            this.structure[node.id] = node;
        },

        // Actualment l'arrel sempre és el 0, fem servir el mètode per si cal canviar-lo en algun moment
        getRoot: function () {
            return this.structure['0'];
        },

        getFunctionDefinition: function (name) {
            if (wiocclDefinition.function.defs[name]) {
                return wiocclDefinition.function.defs[name]
            } else {
                console.error("Error: la funció " + name + " no es troba definida");
            }
        },
        getFunctionNames: function () {
            return Object.keys(wiocclDefinition.function.defs);
        },

        updateFunctionName(wiocclNode, value) {
            // console.log(wiocclNode);
            let open = wiocclDefinition.function.open + value + wiocclDefinition.function.close;
            this.structure[wiocclNode.id].open = open;
        },

        getInstructionName: function (node) {
            let instruction = '';

            switch (node.type) {
                case 'function':

                    let pattern = new RegExp('{#_(.*?)\\(');
                    let match = pattern.exec(node.open);

                    if (match.length > 1) {
                        instruction = match[1];
                    } else {
                        console.error("Error, no s'ha pogut extreure el nom de la funció:", wiocclNode.open);
                    }
                    break;

            }

            return instruction;

        },

        getNodeById: function (id) {
            if (!this.structure[id]) {
                console.error(`No existeix a la estructura cap element amb id ${id}`, this.structure);
            }
            return this.structure[id];
        },

        // l'arbre sempre es construeix a partir de nodes clonats
        getTreeFromNode: function (refId) {
            let tree = [];

            let node;
            // if (asClone) {
            // així es crida en iniciar el diàleg principal
            node = JSON.parse(JSON.stringify(this.getNodeById(refId)));
            // } else {
            //     // així es crida en iniciar un subdiàleg
            //     node = this.structure[refId];
            // }

            node.name = node.type ? node.type : node.open;
            tree.push(node);

            tree[0].children = this._getChildrenNodes(tree[0].children, tree[0].id);

            // console.log("Tree?", tree);

            return tree;
        },

        /**
         * Reemplaça el array d'identificadors children per una copia dels elements i assigna un nom a cada node
         * que es fa servir per mostrar-lo al treeWidget.
         *
         * @param children
         * @param parent
         * @returns {*[]}
         * @private
         */
        _getChildrenNodes(children, parent) {
            let nodes = [];

            for (let i = 0; i < children.length; i++) {

                let id = typeof children[i] === 'object' ? children[i].id : children[i];

                if (this.structure[id].isClone) {
                    // if (context.getStructure()[id].isClone) {
                    continue;
                }

                let node = JSON.parse(JSON.stringify(this.structure[id]));

                if (!node) {
                    console.error("Node not found:", id);
                }
                node.name = node.type ? node.type : node.open;

                node.parent = parent;
                if (node.children.length > 0) {
                    node.children = this._getChildrenNodes(node.children, node.id);
                }

                nodes.push(node);
            }


            return nodes;
        },

        getCode: function (node) {
            // console.log("Rebuilding wioccl:", data, structure);
            let code = "";

            // Cal fer la conversió de &escapedgt; per \>
            node.attrs = node.attrs.replaceAll('&escapedgt;', '\\>');
            node.attrs = node.attrs.replaceAll('&mark;', '\\>');
            node.attrs = node.attrs.replaceAll('&markn;', "\n>");

            code += node.open.replace('%s', node.attrs);

            // console.log("Comprovant childrens:", data.children);
            for (let i = 0; i < node.children.length; i++) {

                // let node = typeof data.children[i] === 'object' ? data.children[i] : this.getStructure()[data.children[i]];
                // Si com a fill hi ha un node és una copia, cal recuperar-lo de la estructura sempre
                let id = typeof node.children[i] === 'object' ? node.children[i].id : node.children[i];
                // console.log("Quin node s'intenta comprovar?", id);
                let child = this.structure[id];

                // al servidor s'afegeix clone al item per indicar que aquest element es clonat i no cal reafegirlo
                // per exemple perquè és genera amb un for o foreach
                if (child.isClone) {
                    continue;
                }

                code += this.getCode(child, this.structure);
            }

            if (node.close !== null) {
                code += node.close;
            }


            // console.log("Rebuild:", wioccl);
            return code;
        },

        rebuildPosMap: function (item) {
            // console.error("Rebuilding chunkmap for", item);
            let outChunkMap = new Map();

            // s'han de tenir en compte els siblings temporals
            // creem un nou item que els contingui i aquest és el que reconstruim
            let wrapper = {
                open: '',
                close: '',
                attrs: '',
                // ALERTA! Cal crear una copia perquè si no es modifiquen els siblings!!
                children: this.siblings ? JSON.parse(JSON.stringify(this.siblings)) : []
            }

            wrapper.children.unshift(item);

            // console.log("Wrapper", wrapper);
            let rebuild = this._createPosMap(wrapper, 0, outChunkMap);
            // let rebuild = this._createPosMap(item, this.structure, 0, outChunkMap);
            // let rebuild = this._createPosMap(item, this.source.getStructure(), 0, outChunkMap);
            // console.log(rebuild, outChunkMap);
            this.posMap = outChunkMap;
            // alert("Check rebuild");
        },

        // el pos map és un mapa que indica en quina posició comença una línia wioccl: map<int pos, int ref>
        _createPosMap: function (node, pos, outPosMap) {

            // console.error("_createPosMap", item, pos);
            // Cal fer la conversió de &escapedgt; per \>
            let attrs = node.attrs;
            attrs = attrs.replaceAll('&escapedgt;', '\\>');
            attrs = attrs.replaceAll('&mark;', '\\>');
            attrs = attrs.replaceAll('&markn;', "\n>");

            let code = node.open.replace('%s', attrs);
            outPosMap.set(pos, node);

            let cursorPos = pos + code.length;

            for (let i = 0; i < node.children.length; i++) {

                let child = typeof node.children[i] === 'object' ? node.children[i] : this.structure[node.children[i]];

                // al servidor s'afegeix clone al item per indicar que aquest element es clonat i no cal reafegirlo
                // per exemple perquè és genera amb un for o foreach
                if (child.isClone) {
                    continue;
                }

                let childCode = this._createPosMap(child, cursorPos, outPosMap);
                code += childCode;
                cursorPos += childCode.length;
            }

            // console.log("item", item);
            if (node.close !== undefined && node.close.length > 0) {
                // si hi ha un close en clicar a sobre d'aquest també es seleccionarà l'item
                // console.log("Afegint posició al close per:", item.close, cursorPos);
                outPosMap.set(cursorPos, node);
                code += node.close;
            }

            return code;

        },

        _getNodeForPos: function (pos) {
            // console.log("pos, chunkmap?", pos, this.posMap);

            // Cerquem el node corresponent
            let candidate;
            let found;
            // let first;
            let last;

            // Recorrem el mapa (que ha d'estar ordenat) fins que trobem una posició superior al punt que hem clicat
            // S'agafarà l'anterior
            for (let [start, node] of this.posMap) {

                last = node;

                if (start > pos && candidate) {
                    found = true;
                    break;
                }

                // s'estableix a la següent iteració
                candidate = node;
            }

            if (!found) {
                candidate = last;
            }

            return candidate;
        },

        _purge: function (node) {
            // console.log("purging:", node);
            for (let i = 0; i < node.children.length; i++) {
                let id = typeof node.children[i] === 'object' ? node.children[i].id : node.children[i];
                // console.log("child id:", id, structure);
                this._purge(this.structure[id]);
            }
            delete (this.structure[node.id]);
        },


        _restore: function (node) {
            // console.log("Restoring node id", node.id);

            // console.log("Restaurant:", node.id, node);
            this.structure[node.id] = node;
            for (let i = 0; i < node.children.length; i++) {
                let child = node.children[i];
                this._restore(child);
            }
        },

        restore: function () {

            if (this.structure.backupNode) {
                // El purge s'ha de cridar només un cop perquè és recursiu sobre l'element que conté els childs actualment
                this.discardSiblings();
                this._purge(this.structure[this.structure.backupNode.id]);

                this._restore(this.structure.backupNode);
                // console.log("Restaurat:", this.structure.backupNode.id, this.structure);
                delete (this.structure.backupNode);
                //

                // alert("stop!");
            }
        },

        _backup: function (node) {
            // console.error("_backup", node);
            let id = typeof node === 'object' ? node.id : node;
            // let backup = JSON.parse(JSON.stringify(this.structure[node.id]));
            let backup = JSON.parse(JSON.stringify(this.structure[id]));

            for (let i = 0; i < backup.children.length; i++) {
                // Canviem els ids per la copia de l'objecte
                let id = typeof backup.children[i] === 'object' ? backup.children[i].id : backup.children[i];
                backup.children[i] = this._backup(this.structure[id]);
            }
            return backup;
        },

        backup: function (node) {
            this.structure.backupNode = this._backup(node);
        },

        parse: function (text, node) {

            let outTokens = this._tokenize(text);


            // text és el text a parsejar
            // wioccl és el node actual que cal reescriure, és a dir, tot el que es parseji reemplaça al id d'aquest node

            // si hi han nous node s'han d'afegir a partir d'aquest index
            // let lastIndex = structure.length;


            // Reordenació dels nodes:
            //      - posem com false tots els nodes fills actuals ALERTA no els eliminem perquè canviaria l'ordre de tots
            //      - els elements de la estructura i les referencies del document ja no serien correctes.


            // En el cas de l'arrel d'un subdialeg no existeix el parent

            if (node.parent) {
                this._removeChildren(node.id);

                // ALERTA! un cop eliminat els fills cal desvincular també aquest element, ja que s'afegirà automàticament al parent si escau
                let found = false;

                for (let i = 0; i < this.structure[node.parent].children.length; i++) {

                    // Cal tenir en compte els dos casos (chidlren com id o com nodes) ja que un cop es fa
                    // a un update tots els childrens hauran canviat a nodes
                    if (this.structure[node.parent].children[i] === node.id || this.structure[node.parent].children[i].id === node.id) {
                        // console.log("eliminat el ", wioccl.id, " de ", structure[wioccl.parent].children, " per reafegir-lo");
                        this.structure[node.parent].children.splice(i, 1);
                        node.index = i;
                        found = true;
                        break;
                    }
                }

                // perquè passa això de vegades?
                if (!found) {
                    console.error("no s'ha trobat aquest node al propi pare");
                    console.log(this.structure, node);
                    alert("node no trobat al pare");
                }

                if (text.length === 0) {

                    if (Number(node.id) === Number(this.root)) {
                        alert("L'arrel s'ha eliminat, es mostrarà la branca superior.");
                        // si aquest és el node arrel de l'arbre cal actualitzar l'arrel també
                        console.error("TODO: determinar que fer amb això, el this.root no és correcte, era el this.root del DojoWioccl")
                        this.root = node.parent;
                    } else {
                        alert("La branca s'ha eliminat.");
                    }

                    node = this.structure[node.parent];
                    outTokens = [];
                }
            }


            this._createTree(node, outTokens, this.structure);

            return node;

        },

        _createTree(root, outTokens) {

            // console.error("_createTree", outTokens);

            this.discardSiblings();


            // Només hi ha un tipus open/close, que son els que poden tenir fills:
            //      OPEN: comencen per "<WIOCCL:"
            //      CLOSE: comencen per "</WIOCCL:"


            let stack = [];

            // ALERTA! TODO: Cal gestionar el token inicial, aquest no s'ha d'afegira l'arbre
            // i el seu tancament tampoc

            // console.log("Next key:", structure.next);
            let nextKey = this.structure.next + "";

            let siblings = 0;

            let first = true;

            /// Aquest serà el valor a retornar si el root es null inicialment
            let outRoot = null;

            // Si l'últim token és un salt de linia ho afegim al token anterior
            if (outTokens.length > 1 && outTokens[outTokens.length - 1].value === "\n") {
                outTokens[outTokens.length - 2].value += "\n";
                outTokens.pop();
            }


            let errorDetected = false;

            for (let i in outTokens) {
                // console.log(i, stack);

                // Cal un tractament especial per l'arrel perquè s'ha de col·locar a la posició del node arrel original
                // Si l'arrel és temporal el primer token és fill de l'arrel

                // if (root.type === 'temp' && stack.length === 0) {
                // TODO: Alerta, això correspon a WiocclStructureTemp, però llavors cal copiar tota la funció canviant
                // només aquest cas
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
                    // console.log("Tancant", outTokens[i].value)
                    outTokens[i].type = "wioccl";
                    let top = stack.pop();

                    if (!top) {
                        // Aquest error es produeix quan s'afegeix l'apertura d'una instrucció però encara no s'ha
                        // afegit el tancament, per exemple amb {## es capturarà tot el text fins el primer ##} i aquest
                        // pot correspondre a un attribut d'una altra instrucció, per exemple un if.
                        console.error("S'ha produit un error en la detecció del tancament", outTokens[i].value);
                        errorDetected = true;
                    } else {
                        top.close = outTokens[i].value;
                    }

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
                    let id = outTokens[i].id;
                    this.structure[root.parent].children.splice(root.index + siblings, 0, id);
                    // console.log("Reafegit a la posició:", root.index + siblings, " amb id:", id);
                    ++siblings;

                    // el root.id és l'element seleccionat, aquest no cal marcar-lo com a sibling perquè
                    // existeix a l'estructura
                    if (!this.updating && id !== root.id) {
                        if (this.siblings === undefined) {
                            this.siblings = [];
                        }
                        // console.log("Afegint sibling", id);
                        this.siblings.push(id);
                    }

                }

                // No cal gestionar el type content perquè s'assigna al tokenizer

                if (outTokens[i].value.startsWith('<WIOCCL:')) {
                    // console.log("Obrint", outTokens[i].value)
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
                        errorDetected = true;
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
                        this.structure[nextKey] = outTokens[i];
                        nextKey = (Number(nextKey) + 1) + "";
                    } else {
                        this.structure[root.id] = outTokens[i];
                    }
                    first = false;

                } else {
                    this.structure[nextKey] = outTokens[i];
                    nextKey = (Number(nextKey) + 1) + "";
                }


                // ALERTA[Xavi] Si s'afegeixen siblings a un element que penji directament del root aquest es descartaran
                // Si es detecta cap error
                if (siblings > 1 && Number(root.id) === Number(this.root)
                    && Number(this.structure[root.id]['parent']) !== 0 && stack.length > 0) {
                    // console.log("structure siblings (id i parent):", this.siblings);
                    // for (let childId of this.siblings) {
                    //     let child = this.structure[childId];
                    //     console.log(child.id, child.parent);
                    // }

                    root.addedsiblings = true;
                }

            }

            // Si es produeix cap error ho descartem
            if (errorDetected) {
                root.addedsiblings = false;
            }

            // console.log("hi ha outRoot?", outRoot);
            if (outRoot !== null) {
                console.error("esborrar això");
                alert("ERROR, això s'executa??");
                Object.assign(root, outRoot);
                delete root.isNull;
            }

            // console.log("Nou root:", outRoot);
            this.structure.next = Number(nextKey);


            // console.warn("siblings afegits:", structure.siblings);
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
        },

        _removeChildren: function (id) {

            let node = this.structure[id];
            let ids = [];

            if (!node) {
                console.error("Node no trobat", id, node, inStructure);
            }

            if (!node.children) {
                console.error("no hi ha children?", node.children);
            }

            for (let i = node.children.length - 1; i >= 0; --i) {
                let childId = typeof node.children[i] === 'object' ? node.children[i].id : node.children[i];
                ids.push(childId);
                ids = ids.concat(this._removeChildren(childId));
                // inStructure[childId] = false;

                // ALERTA! això no es fa a aquesta classe, per això retornem un array amb els ids
                // if (removeNode) {
                //     let $node = jQuery(this.editor.iframe).contents().find('[data-wioccl-ref="' + childId + '"]');
                //     $node.remove();
                // }

                delete (this.structure[childId]);
            }

            node.children = [];

            return ids;
        },

        _removeNode: function (id) {
            let node = this.structure[id];
            // console.log("Fent remove node de id", node.id, node.parent);

            if (!node.parent) {
                console.error("no hi ha parent?", node.children);
            }

            let parent = this.structure[node.parent];

            for (let i = parent.children.length - 1; i >= 0; --i) {

                let childId = typeof parent.children[i] === 'object' ? parent.children[i].id : parent.children[i];
                if (childId === id) {
                    parent.children.splice(i, 1);
                    break;
                }
                delete (this.structure[id]);
            }

        },

        discardSiblings: function () {

            for (let i = this.siblings.length - 1; i >= 0; i--) {
                this._removeNode(this.siblings[i]);
            }
            this.siblings = [];
        },

        // les claus són a l'estructura i només es manipulan en aquesta classe
        getNextKey: function () {
            return this.structure.next + '';
        },


    });
});
