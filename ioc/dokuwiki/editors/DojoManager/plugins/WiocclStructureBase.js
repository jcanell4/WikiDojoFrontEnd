// Aquesta classe és un wrapper per les estructures wioccl enviades des del servidor que incluen
// les funcions per gestionar-les i modificar-les des del plugin per Dojo Editor DojoWioccl i DojoWiocclDialog
define([
    'dojo/_base/declare',
    'dojo/Evented'
], function (declare, Evented) {


    // TODO: Solució temporal, en lloc de rebre la definició de WIOCC des del servidor la establim aquí

    // ALERTA! es contempla l'opció de que els parámetres siguin opcionals, però cal tenir en compte que un parámetre
    // opcional obligaria a escriure els anteriors, perque la posició a la llista de paràmetres canviarà
    let wiocclDefinition = {
        function: {
            open: "{#_",
            close: "(%s)_#}",
            defs: {
                IS_STR_EMPTY: {
                    params: [
                        {name: "text", type: "string", default: ""}
                    ]
                },

                YEAR: {
                    params: [
                        {name: "date", type: "date"}
                    ]
                },

                DATE: {
                    params: [
                        {name: "date", type: "date"},
                        {name: "sep", type: "string", default: "-"}
                    ]
                },

                LONG_DATE: {
                    params: [
                        {name: "date", type: "date"},
                        {name: "includeDay", type: "bool", default: false}
                    ]
                },

                SUM_DATE: {
                    params: [
                        {name: "date", type: "date"},
                        {name: "days", type: "int"},
                        {name: "months", type: "int", default: 0},
                        {name: "years", type: "int", default: 0},
                        {name: "sep", type: "string", default: "-"}
                    ]
                },

                IN_ARRAY: {
                    params: [
                        {name: "value", type: "string"},
                        {name: "array", type: "array"}
                    ]
                },

                SEARCH_ROW: {
                    params: [
                        {name: "toSearch", type: "string"},
                        {name: "array", type: "array"},
                        {name: "column", type: "string"},
                        {name: "default", type: "bool", default: false}
                    ]
                },

                SEARCH_VALUE: {
                    params: [
                        {name: "toSearch", type: "string"},
                        {name: "array", type: "array"},
                        {name: "column", type: "string"}
                    ]
                },

                SEARCH_KEY: {
                    params: [
                        {name: "toSearch", type: ["string", "array"]},
                        {name: "array", type: "array"},
                        {name: "column", type: ["string", "array"]}
                    ]
                },

                ARRAY_GET_VALUE: {
                    params: [
                        {name: "key", type: "string"},
                        {name: "array", type: "array"},
                        {name: "defaultValue", type: "bool", default: false}
                    ]
                },

                ARRAY_LENGTH: {
                    params: [
                        {name: "array", type: "array"}
                    ]
                },

                COUNTDISTINCT: {
                    params: [
                        {name: "array", type: "array"},
                        {name: "fields", type: "array"}
                    ]
                },

                FIRST: {
                    params: [
                        {name: "array", type: "array"},
                        {name: "template", type: "string"}
                    ]
                },

                LAST: {
                    params: [
                        {name: "array", type: "array"},
                        {name: "template", type: "string"}
                    ]
                },

                MIN: {
                    params: [
                        {name: "array", type: "array"},
                        {name: "template", type: "string", default: "MIN"},
                        {name: "fields", type: "array"}
                    ]
                },

                MAX: {
                    params: [
                        {name: "array", type: "array"},
                        {name: "template", type: "string", default: "MAX"},
                        {name: "fields", type: "array"}
                    ]
                },

                SUBS: {
                    params: [
                        {name: "value1", type: "int"},
                        {name: "value2", type: "int"}
                    ]
                },

                SUMA: {
                    params: [
                        {name: "value1", type: "int"},
                        {name: "value2", type: "int"}
                    ]
                },

                UPPERCASE: {
                    params: [
                        {name: "value1", type: "string"},
                        {name: "value2", type: "int"},
                        {name: "value3", type: "int", default: 0}
                    ]
                },

                LOWERCASE: {
                    params: [
                        {name: "value1", type: "string"},
                        {name: "value2", type: "int"},
                        {name: "value3", type: "int", default: 0}
                    ]
                },

                UCFIRST: {
                    params: [
                        {name: "value1", type: "string"}
                    ]
                },

                LCFIRST: {
                    params: [
                        {name: "value1", type: "string"}
                    ]
                },

                STR_CONTAINS: {
                    params: [
                        {name: "subs", type: "string"},
                        {name: "srtring", type: "string"}
                    ]
                },

                EXPLODE: {
                    params: [
                        {name: "delimeter", type: "string"},
                        {name: "srtring", type: "string"},
                        {name: "limit", type: "bool", default: false},
                        {name: "trim", type: "bool", default: false}
                    ]
                },

                STR_TRIM: {
                    params: [
                        {name: "text", type: "string"},
                        {name: "mask", type: "string"}
                    ]
                },

                STR_SUBTR: {
                    params: [
                        {name: "text", type: "string"},
                        {name: "start", type: "int", default: 0},
                        {name: "len", type: "int", len: NaN}
                    ]
                },

                STR_REPLACE: {
                    params: [
                        {name: "search", type: ["string", "array"]},
                        {name: "replace", type: ["string", "array"]},
                        {name: "subject", type: "string"},
                        // {name: "subject", type: "string", optional: true},
                        {name: "count", type: "int"},
                    ]
                },

                ARRAY_GET_SUM: {
                    params: [
                        {name: "taula", type: "array"},
                        {name: "camp", type: "string"},
                        {name: "filter_field", type: "string"},
                        {name: "filter_value", type: "string"} // alerta, a PHP és "type", per determinar
                    ]
                },

                GET_PERCENT: {
                    params: [
                        {name: "suma", type: "int", default: 0},
                        {name: "valor", type: "int", default: 0},
                        {name: "redondeo", type: "int", default: 2}
                    ]
                },

                COUNTINARRAY: {
                    params: [
                        {name: "array", type: "array"},
                        {name: "fields", type: "array"},
                        {name: "values", type: "array"}
                    ]
                },
            }
        },

        // template serà el template a inserir quan s'afegeixi aquesta instrucció
        keyword: {
            // %i es reemplaça pel nom de l'instrucció
            open: "<WIOCCL:%i %s>",
            close: "</WIOCCL:%i>",
            defs: {
                // TEMP és un tipus especial utilitzat internament per les estructures temporals
                TEMP: {
                    attrs: [],
                    open: '',
                    close: '',
                    hidden: true
                },
                // VOID és un tipus especial utilitzat internament per les estructures temporals, no permet afegir siblings
                // i es reemplaçat pel contingut en afegir-lo al document
                VOID: {
                    attrs: [],
                    open: '',
                    close: '',
                    hidden: true
                },
                // WRAPPER és un tipus especial utilitzat internament per les estructures temporals
                WRAPPER: {
                    attrs: [],
                    open: '',
                    close: '',
                    hidden: true
                },
                IF: {
                    attrs: [
                        {name: 'condition', type: '*'}
                    ]
                },
                FOREACH: {
                    attrs: [
                        {name: 'var', type: 'string'},
                        {name: 'array', type: 'array'},
                        {name: 'counter', type: 'string', optional: true},
                        {name: 'counterFromZero', type: 'bool', optional: true},
                        {name: 'filter', type: 'string', optional: true},
                    ],
                },
                FOR: {
                    attrs: [
                        {name: 'from', type: 'int'},
                        {name: 'to', type: 'int'},
                        {name: 'step', type: 'int'},
                        {name: 'counter', type: 'string'},
                        {name: 'counterFromZero', type: 'bool'},
                    ],
                },
                SUBSET: {
                    attrs: [
                        {name: 'subsetvar', type: 'string'},
                        {name: 'array', type: 'array'},
                        {name: 'arrayitem', type: 'string'},
                        {name: 'filter', type: 'string'},
                        {name: 'field', type: 'string'},
                    ],
                },
                SET: {
                    attrs: [
                        {name: 'var', type: 'string'},
                        {name: 'type', type: 'string'},
                        {name: 'value', type: '*'},
                        {name: 'map', type: 'array', optional: true},
                    ],
                },
                CONDSET: {
                    attrs: [
                        {name: 'condition', type: 'string'},
                        {name: 'var', type: 'string'},
                        {name: 'type', type: 'string', optional: true},
                        {name: 'map', type: 'array'},
                        {name: 'value', type: 'string'},
                    ],
                },
                RESET: {
                    attrs: [],
                },
                CHOOSE: {
                    attrs: [
                        {name: 'id', type: 'string'},
                        {name: 'lExpression', type: 'string', optional: true},
                        {name: 'rExpression', type: 'string', optional: true},
                    ],
                },
                CASE: {
                    attrs: [
                        {name: 'relation', type: 'string', optional: true},
                        {name: 'forchoose', type: 'string'},
                        {name: 'lExpression', type: 'string', optional: true},
                        {name: 'RExpression', type: 'string', optional: true},
                    ],
                },
                DEFAULTCASE: {
                    attrs: [
                        {name: 'forchoose', type: 'string'},
                    ],
                },
                REPARSE: {
                    attrs: [],
                },
                // ALERTA[Xavi] Aquesta instrucció existeix? no està definida la classe wiocclreparseset
                // REPARSESET: {
                //     attrs: [
                //         {name: 'TODO', type: '*'}
                //     ],
                // },
                READONLY_OPEN: {
                    open: ':###',
                    close: '',
                    attrs: []
                },
                READONLY_CLOSE: {
                    open: '###:',
                    close: '',
                    attrs: []
                }
            }
        }

    };

    return declare([Evented], {

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

        /** indica que la estructura ha canviat */
        dirtyStructure: false,

        /**
         *
         * Opcions de configuració:
         * @param {object} config.structure -   objecte literal amb la estructura wioccl (enviada des del servidor). Si
         *                                      no es passa es crea una estructura temporal automàticament.
         * @param {bool} [config.clone=true] -  indica si s'ha d'enllaçar la estructura passada com argument.
         *                                      (els canvis s'aplicaràn sobre aquesta).
         */
        constructor: function (config, dispatcher) {
            this.dispatcher = dispatcher;
        },

        setStructure: function (structure, root) {
            throw error('This method must be implemented by subclasses');
        },

        getRaw: function () {
            return this.structure;
        },

        setNode: function (node) {
            this.structure[node.id] = node;
        },

        // Actualment l'arrel sempre és el 0, fem servir el mètode per si cal canviar-lo en algun moment
        // no confondre amb la propietat root, que indica l'element seleccionat a partir del qual s'ha
        // generat un arbre
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
            return Object.keys(wiocclDefinition.function.defs).sort();
        },

        updateFunctionName(node, value) {
            let open = wiocclDefinition.function.open + value + wiocclDefinition.function.close;
            this.structure[node.id].open = open;
        },

        updateKeywordName(node, value) {
            let trailingOpenNewLine = node.open.endsWith("\n");
            let trailingCloseNewLine = node.close.endsWith("\n");

            let instruction = value;

            let definition = this.getKeywordDefinition(instruction)
            let opening = '';
            let closing = '';

            if (definition.open) {
                opening = definition.open;
            } else {
                opening = wiocclDefinition.keyword.open.replace('%i', instruction);
            }

            if (definition.close) {
                closing = definition.close;
            } else {
                closing = wiocclDefinition.keyword.close.replace('%i', instruction);
            }

            if (trailingOpenNewLine) {
                opening += "\n";
            }

            if (trailingCloseNewLine) {
                closing += "\n";
            }

            this.structure[node.id].open = opening;
            this.structure[node.id].type = instruction.toLowerCase();
            this.structure[node.id].close = closing;
        },

        getKeywordTemplate: function (callback) {
            let context = this;

            let options = [];
            for (let keyword of this.getKeywordNames()) {
                options.push(keyword);
            }

            let data = {
                name: 'keywords',
                label: 'Paraula clau',
                options: options
            }

            let auxId = this.dispatcher.getGlobalState().getCurrentId();
            let dialog = this.dispatcher.getDialogManager().getDialog('dropdown', auxId, {
                title: 'Inserir wioccl',
                message: "Selecciona una paraula clau wioccl per inserir.", // TODO: localitzar
                data: data,
                ok: {
                    text: 'Inserir' // localitzar
                },
                cancel: {
                    text: 'Cancel·lar' // localitzar
                },
                callback: function(name) {
                    let definition = context.getKeywordDefinition(name);
                    let opening = '';
                    let closing = '';

                    if (definition.open) {
                        opening = definition.open;
                    } else {
                        opening = wiocclDefinition.keyword.open.replace('%i', name).replace('%s', '');
                    }

                    if (definition.close) {
                        closing = definition.close;
                    } else {
                        closing = wiocclDefinition.keyword.close.replace('%i', name);
                    }

                    callback(opening + closing);
                }
            });

            dialog.show();
        },

        getFunctionTemplate: function (callback) {
            let options = [];
            for (let func of this.getFunctionNames()) {
                options.push(func);
            }

            let data = {
                name: 'functions',
                label: 'Funció',
                options: options
            }

            let auxId = this.dispatcher.getGlobalState().getCurrentId();
            let dialog = this.dispatcher.getDialogManager().getDialog('dropdown', auxId, {
                title: 'Inserir funció',
                message: "Selecciona una funció wioccl per inserir.", // TODO: localitzar
                data: data,
                ok: {
                    text: 'Inserir' // localitzar
                },
                cancel: {
                    text: 'Cancel·lar' // localitzar
                },
                callback: function(name) {
                    callback(wiocclDefinition.function.open + name + wiocclDefinition.function.close.replace('%s', ''));
                }
            });

            dialog.show();
        },

        getFieldTemplate: function (callback, fields) {
            let data = {
                name: 'field',
                label: 'Camp o variable',
                options: fields
            }

            let auxId = this.dispatcher.getGlobalState().getCurrentId();
            let dialog = this.dispatcher.getDialogManager().getDialog('combobox', auxId, {
                title: 'Inserir camp o variable',
                message: "Entra o selecciona el nom del camp o variable.", // TODO: localitzar
                data: data,
                ok: {
                    text: 'Inserir' // localitzar
                },
                cancel: {
                    text: 'Cancel·lar' // localitzar
                },
                callback: function(field) {
                    if (!field) {
                        callback('');
                    } else {
                        callback(`{##${field}##}`);
                    }
                }
            });

            dialog.show();
        },

        getContentTemplate: function () {
            return prompt("Introdueix el nom del field", "contingut");
        },

        getKeywordDefinition: function (name) {
            if (wiocclDefinition.keyword.defs[name]) {
                return wiocclDefinition.keyword.defs[name]
            } else {
                console.error("Error: la instrucció " + name + " no es troba definida");
            }
        },

        getKeywordNames: function () {
            let names = [];

            for (let key in wiocclDefinition.keyword.defs) {
                let def = wiocclDefinition.keyword.defs[key];

                if (def.hidden) {
                    continue;
                }
                names.push(key);
            }

            return names;
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

                case 'content':
                    console.warn("TODO: content no definit");
                    break;

                case 'field':
                    console.warn("TODO: field no definit");
                    break;

                default:
                    // Instruccions
                    instruction = node.type.toUpperCase();
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

            // així es crida en iniciar el diàleg principal
            node = JSON.parse(JSON.stringify(this.getNodeById(refId)));
            node.name = node.name? node.name : (node.type ? node.type : node.open);

            tree.push(node);
            tree[0].children = this._getChildrenNodes(tree[0].children, tree[0].id);

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
                    continue;
                }

                let node = JSON.parse(JSON.stringify(this.structure[id]));

                if (!node) {
                    console.error("Node not found:", id);
                }

                node.name = node.name? node.name : (node.type ? node.type : node.open);
                node.parent = parent;

                if (node.children.length > 0) {
                    node.children = this._getChildrenNodes(node.children, node.id);
                }

                nodes.push(node);
            }

            return nodes;
        },

        getCode: function (node) {
            let code = "";

            // Cal fer la conversió de &escapedgt; per \>

            // ALERTA: hi ha algun cas en el que falla i el node no té attrs
            // cal localitzar aquest cas
            if (!node || node.attrs === undefined) {
                console.error("getCode", node);
            }

            node.attrs = this._unsanitize(node.attrs);
            // node.attrs = node.attrs.replaceAll('&escapedgt;', '\\>');
            // node.attrs = node.attrs.replaceAll('&mark;', '\\>');
            // node.attrs = node.attrs.replaceAll('&markn;', "\n>");

            code += node.open.replace('%s', node.attrs);

            for (let i = 0; i < node.children.length; i++) {

                // Si com a fill hi ha un node és una copia, sempre cal recuperar-lo de la estructura
                let id = typeof node.children[i] === 'object' ? node.children[i].id : node.children[i];
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

            return code;
        },

        // En lloc de generar el codi pels childs es reemplaça pel inner passat com argument
        getCodeWithInner: function (node, inner) {
            let code = "";

            // Cal fer la conversió de &escapedgt; per \>
            node.attrs = this._unsanitize(node.attrs);
            // node.attrs = node.attrs.replaceAll('&escapedgt;', '\\>');
            // node.attrs = node.attrs.replaceAll('&mark;', '\\>');
            // node.attrs = node.attrs.replaceAll('&markn;', "\n>");

            code += node.open.replace('%s', node.attrs);
            code += inner;

            if (node.close !== null) {
                code += node.close;
            }

            return code;
        },

        _hasChild: function (parent, child) {
            if (typeof parent !== 'object') {
                parent = this.structure[parent];
            }

            let childId;
            if (typeof child === 'object') {
                childId = child.id;
            } else {
                childId = child;
            }

            for (let childInParent of parent.children) {
                let childInParentId = typeof childInParent === 'object' ? childInParent.id : childInParent;
                if (childInParentId === childId) {
                    console.log(`${childId} found on parent`, parent, childInParent)
                    return true;
                }
            }

            console.error("Child not found in parent", parent, child);
            return false;
        },

        // retorna el contingut d'un node, és a dir, el codi corresponent als nodes fills
        getInner: function (node) {
            let code = '';

            for (let i = 0; i < node.children.length; i++) {
                let child = typeof node.children[i] === 'object' ? node.children[i] : this.structure[node.children[i]];
                code += this.getCode(child);
            }

            return code;
        },


        rebuildPosMap: function (item) {
            let outChunkMap = new Map();

            // Referència per determinar quin item ha de persistir en el filtre
            let auxId = item.id

            // creem un nou item que els contingui i aquest és el que reconstruim
            let wrapper = {
                open: '',
                close: '',
                attrs: '',
            }

            let auxParent;

            // Si el item seleccionat és el wrapper no cal cercar el parent, aquest és el node que conté tot
            if (item.type === "wrapper" || item.type === "temp") {
                auxParent = item;
                // si el seleccionat és el wrapper s'han de conservar tots els childs
                auxId = null;
            } else {
                auxParent = this.getNodeById(item.parent);
            }

            // creem una copia dels children
            wrapper.children = JSON.parse(JSON.stringify(auxParent.children));

            // Comprovem si els nodes es troben al backup i si no és així els intercalem on correspong
            for (let i=wrapper.children.length-1; i>=0; i--) {

                let child = wrapper.children[i];
                let id = typeof child === "string" ? child : child.id;

                if (auxId === null || id === auxId || !this.structure.backupIndex[id]) {
                    continue;
                }
                wrapper.children.splice(i, 1);
            }

            // Pasem els childs a string si hi ha. ALERTA! Això está duplicat en altes punts
            for (let i=0; i<auxParent.children.length; i++){
                if (typeof auxParent.children[i] !== "string") {
                    auxParent.children[i] = auxParent.children[i].id;
                }
            }

            if (!this.editorNodes) {
                this.editorNodes = [item];
            }

            let rebuild = this._createPosMap(wrapper, 0, outChunkMap);
            this.posMap = outChunkMap;
        },

        _sanitize: function(text) {
            text = text.replaceAll(/\n>/gsm, '&markn;');
            // text = text.replaceAll(/\\[\n]>/gsm, '&markn;');
            text = text.replaceAll(/\\>/gsm, '&mark;');

            // let attrs = node.attrs;
            // attrs = attrs.replaceAll('\\>', '&escapedgt;');
            // attrs = attrs.replaceAll('\\>', '&mark;');
            // attrs = attrs.replaceAll("\n>", '&markn;');
            // return attrs;
            return text;
        },

        _unsanitize: function (text) {
            text = text.replaceAll('&escapedgt;', '\\>');
            text = text.replaceAll('&mark;', '\\>');
            text = text.replaceAll('&markn;', "\n>");

            return text;
        },

        // El posMap és un mapa que indica en quina posició comença una línia wioccl: map<int pos, int ref>
        _createPosMap: function (node, pos, outPosMap) {
            // Cal fer la conversió de &escapedgt; per \>
            let attrs = this._unsanitize(node.attrs);
            // let attrs = node.attrs;
            // attrs = attrs.replaceAll('&escapedgt;', '\\>');
            // attrs = attrs.replaceAll('&mark;', '\\>');
            // attrs = attrs.replaceAll('&markn;', "\n>");

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

            if (node.close !== undefined && node.close.length > 0) {
                // si hi ha un close en clicar a sobre d'aquest també es seleccionarà l'item corresponent
                outPosMap.set(cursorPos, node);
                code += node.close;
            }

            outPosMap.length = cursorPos;

            return code;
        },

        // TODO: Canviar el nom per eliminar _, no és privada
        _getNodeForPos: function (pos) {

            // Cerquem el node corresponent
            let candidate;
            let found;
            // let first;
            let last;

            // Recorrem el mapa (que ha d'estar ordenat) fins que trobem una posició
            // superior al punt que hem clicat. S'agafarà l'anterior
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

        // Retorna la posició com a index
        getNearestPos: function (pos) {
            if (this.posMap.size === 0) {
                return 0;
            }

            // Cerquem el node corresponent
            let candidate;
            let found;
            let last;

            // Recorrem el mapa (que ha d'estar ordenat) fins que trobem una posició superior al punt que hem clicat
            // S'agafarà l'anterior

            let startPos = 0;
            // Propietat afegida per nosaltres al Map
            let endPos = this.posMap.length;

            for (let [start, node] of this.posMap) {
                last = node;

                if (start > pos && candidate) {
                    endPos = start;
                    break;
                } else {
                    // s'estableix a la següent iteració
                    startPos = start;
                    candidate = node;
                }
            }

            if (!found) {
                candidate = last;
            }

            // En el cas de que només hi hagi una instrucció no existeix el startIndex/lastIndex, l'hem de generar
            if (candidate.startIndex === undefined) {
                candidate.startIndex = 0;
                candidate.lastIndex = this.getCode(candidate).length;
            }

            // Calculem el punt central entre el principi i el final per determinar si la posició
            // està més a prop del principi o del final
            let diff = Math.floor((endPos - startPos) / 2);
            let posMid = startPos + diff;

            if (pos < posMid) {
                return startPos;
            } else {
                return endPos;
            }
        },

        _purge: function (node) {
            for (let i = 0; i < node.children.length; i++) {
                let id = typeof node.children[i] === 'object' ? node.children[i].id : node.children[i];
                this._purge(this.structure[id]);
            }
            delete (this.structure[node.id]);
        },

        _restore: function (node) {
            // Restaurem una copia del node
            let clonedNode = JSON.parse(JSON.stringify(node));

            this.structure[node.id] = clonedNode;
            for (let i = 0; i < node.children.length; i++) {
                let child = node.children[i];
                this._restore(child);
            }
        },

        restore: function () {
            if (this.structure.backupNode) {
                // El purge s'ha de cridar només un cop, perquè és recursiu,
                // sobre l'element que conté els childs actualment
                this._purge(this.structure[this.structure.backupNode.id]);
                this._restore(this.structure.backupNode);
                this.dirtyStructure = false;
            }
        },

        _backup: function (node, index) {
            let id = typeof node === 'object' ? node.id : node;
            let backup = JSON.parse(JSON.stringify(this.structure[id]));

            // afegim el node al mapa
            index[id] = backup;

            for (let i = 0; i < backup.children.length; i++) {
                // Canviem els ids per la copia de l'objecte
                let id = typeof backup.children[i] === 'object' ? backup.children[i].id : backup.children[i];
                backup.children[i] = this._backup(this.structure[id], index);
            }
            return backup;
        },

        backup: function (node) {
            this.structure.backupIndex = {};
            this.structure.backupIndex[node.id] = JSON.parse(JSON.stringify(node));
            this.structure.backupNode = this._backup(node, this.structure.backupIndex);
        },

        parse: function (text, node, ignoreSanitize) {
            // Abans de fer el parse fem un restore per aplicar els canvis sobre els originals
            // de manera que es descarten els children generats anteriorment

            // Conseverm l'estat dirty (el restore l'elimina)
            let dirty = this.dirtyStructure;
            this.restore();
            this.dirtyStructure = dirty;

            let outTokens = this._tokenize(text, ignoreSanitize);
            this._createTree(node, outTokens, this.structure);

            return node;
        },

        // TODO: Refactoritzar i canviar el nom, això no crea un arbre, actualitza
        // l'estructura a partir del node root i els tokens passats que són un vector
        // d'elements que cal estructurar en forma d'arbre segons si es troben
        // dintre d'instruccions wioccl
        _createTree(root, outTokens) {
            // Només hi ha un tipus open/close, que son els que poden tenir fills:
            //      OPEN: comencen per "<WIOCCL:"
            //      CLOSE: comencen per "</WIOCCL:"



            let stack = [];
            let parent = root && root.parent ? this.getNodeById(root.parent) : false;

            // Si els children del parent o el root són objectes es guarda la informació antiga,
            // cal canviar-los per ids
            if (parent) {
                for (let i=0; i<parent.children.length; i++){
                    if (typeof parent.children[i] !== "string") {
                        parent.children[i] = parent.children[i].id;
                    }
                }
            }

            for (let i=0; i<root.children.length; i++){
                if (typeof root.children[i] !== "string") {
                    root.children[i] = root.children[i].id;
                }
            }

            if (root.type === 'wrapper') {
                stack.push(root);
                this._removeChildren(root.id);
                root.children = [];
            } else if (parent) {
                stack.push(parent);
            } else {
                this._removeChildren(root.id);
                // ALERTA! removeChildren elimina els fills de la estructura però del node de la estructura
                // el root que tenim fins aquí no és fiable, pot ser una copia o una referència, així
                // que buidel l'array
                root.children = [];
            }

            let nextKey = this.structure.next + "";
            let first = true;

            // Si l'últim token és un salt de linia ho afegim al token anterior
            if (outTokens.length > 1 && outTokens[outTokens.length - 1].value === "\n") {
                outTokens[outTokens.length - 2].value += "\n";
                outTokens.pop();
            }

            let errorDetected = false;

            // Guardem la llista de nodes parsejats
            this.editorNodes = [];

            let puntInsercio = 0;

            for (let i in outTokens) {
                let currentId;
                if (root.type === 'void' && stack.length === 0) {
                    // només pot haver 1 node, no s'accepten siblings, es sustitueix el root per aquest
                    // Alerta, com es reemplaça el root, el element deixa de ser 'void' i es comporta com
                    // un node normal

                    currentId = root.id;
                    outTokens[i].id = currentId;
                    outTokens[i].parent = root.parent;
                    outTokens[i].solo = true; // això ens permet identificar que aquest node ha d'anar sol (deshabilita els botons d'insert)
                    root = outTokens[i];
                } if ((root.type === 'temp' && stack.length === 0)  // TODO: Determinar si el temp serà length 0 o 1
                    || (root.type === 'wrapper' && stack.length === 1)) {

                    currentId = nextKey;
                    outTokens[i].id = currentId;
                    root.children.push(outTokens[i].id);
                    outTokens[i].parent = root.id;
                } else if (i === '0') {
                    currentId = root.id;
                    outTokens[i].id = currentId;
                    outTokens[i].parent = root.parent;
                    // Reemplaçem el root
                    root = outTokens[i];
                } else {
                    currentId = nextKey;
                    outTokens[i].id = currentId;
                }

                if (stack.length > 0 && stack[stack.length - 1].children.includes(root.id)) {
                    puntInsercio =  stack[stack.length - 1].children.indexOf(root.id) +1;
                } else if (stack.length>0) {
                    stack[stack.length - 1].children.length;
                }

                outTokens[i].children = [];

                if (outTokens[i].value.startsWith('</WIOCCL:')) {
                    outTokens[i].type = "wioccl";
                    let top = stack.pop();

                    // Com que sempre hi ha un node root que no es pot tancar (temp,
                    // wrapper, etc.) no cal control·lar si hi ha parent
                    outTokens[i].parent = stack.id;

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
                    outTokens[i].parent = stack[stack.length-1].id;

                    let lastChildren = stack[stack.length - 1].children;

                    // els childs poden ser objectes o strings
                    // si no es troba entre els children l'afegim al final
                    let filter = (element) => {
                        let id =  typeof element === 'string' ? element : element.id;
                        return id === currentId;
                    };

                    if (!lastChildren.some(filter)) {
                        // Cal fer un splice amb al punt d'inserció i actualitzar-lo
                        stack[stack.length - 1].children.splice(puntInsercio, 0, currentId);
                        puntInsercio++;
                    }
                } else if (root !== null) {
                    // cas 1: s'ha seleccionat el wrapper (root és el wrapper)
                    //      * hem de fer push d'aquest element als childrens del wrapper
                    //      !!! si el parent del node és el wrapper s'ha d'afegir aquest a l'stack <-- fet a sobre
                    // cas 2: s'ha seleccionat un fill directe del wrapper

                    // Si no hi ha cap element a l'estack es que es troba al mateix nivell que l'element root

                    // ALERTA[Xavi]! amb la implementació del sistema de wrappers el root serà el del wrapper,
                    // aquest cas ja no es pot donar

                    if (root.type === 'temp' || root.type === 'wrapper') {
                        // S'ha assignat abans, codi per assegurar que és així
                        if (outTokens[i].parent !== root.id) {
                            console.error("check");
                            alert("Comprovar perquè no s'ha assignat el parent");
                        }
                    } else {
                        console.error("alerta! reemplaçat el parent pel parent del root");
                        console.log("root:", root);
                        console.log("outTokens:", outTokens);
                        console.log(i);
                        console.log(this.structure);
                        outTokens[i].parent = root.parent;
                        alert("Error");
                    }

                    // console.log("Es canvia el root pel del pare");
                } else {
                    outTokens[i].parent = -1;
                }


                // No cal gestionar el type content perquè s'assigna al tokenizer
                if (outTokens[i].value.startsWith('<WIOCCL:')) {
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
                this.structure[currentId] = outTokens[i];

                if (first && (root.type !== 'temp' && root.type !== 'wrapper')) {
                    first = false;
                } else {
                    nextKey = (Number(nextKey) + 1) + "";
                }

                this.editorNodes.push(outTokens[i]);
            }

            // Si es produeix cap error ho descartem
            if (errorDetected) {
                // TODO: mostrar un missatge d'error concret si és rellevant, actualment no s'han de produir
                console.error("Error desconegut a _createTree");
            }

            this.structure.next = Number(nextKey);

            // Actualitzem el root
            this.structure[root.id] = root;
        },

        _tokenize(text, ignoreSanitize) {
            // Hi ha algun cas en que cal ignorar el sanitize, per exemple als subdialegs
            // perquè els atributs poden incloure condicionals que passaran al content

            //  Dividim en en els 4 tipus:
            //      Open wioccl
            //      Close wioccl
            //      Function <-- cal fer parse dels atributs?
            //      Field
            //      Contingut <-- tot el que hi hagi entre el final d'un token i el principi del següent és contingut
            let pattern = /<WIOCCL:.*?>|<\/WIOCCL:.*?>|{##.*?##}|{#_.*?_#}/gsm;


            // PROBLEMA: no podem capturar > sense capturar \>, fem una conversió de \> abans de
            // fer el parse i ho restaurem després.
            // Hi han dos casos, amb salt de línia i sense, per poder restaurar-los fem servir
            // dues marques diferents: &markn; i &mark;
            if (!ignoreSanitize) {
                text = this._sanitize(text)
            }

            // text = text.replaceAll(/\\[\n]>/gsm, '&markn;');
            // text = text.replaceAll(/\\>/gsm, '&mark;');

            // ALERTA: això pot suposar un canvi en el recompte de caràcteres, perquè les posicions no corresponen
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

            // Si aquesta llista es vàlida cal extreure d'aquí el content (diferencia de
            // lastindex i index del següent token.
            // Cal recorrer l'array des del final, ja que cal afegir (si escau) el token
            // de content a la posició de l'index
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
                    // és consecutiu, no hi ha content entre aquest element i el següent
                } else {
                    let token = {};
                    token.type = 'content';
                    token.value = text.substring(tokens[i].lastIndex + 1, currentPos + 1);
                    token.attrs = '';
                    token.open = token.value;
                    token.close = '';
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
                console.error("Node no trobat", id, node, this.structure);
            }

            if (!node.children) {
                console.error("no hi ha children?", node.children);
            }

            for (let i = node.children.length - 1; i >= 0; --i) {
                let childId = typeof node.children[i] === 'object' ? node.children[i].id : node.children[i];
                ids.push(childId);
                ids = ids.concat(this._removeChildren(childId));
                delete (this.structure[childId]);
            }

            node.children = [];

            return ids;
        },

        _removeNode: function (id) {
            let node = this.structure[id];

            if (!node.parent) {
                // Això es correcte quan s'intenta eliminar un node temporal com els wrappers
                console.error("no hi ha parent?", node.children);
                return;
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

        // les claus són a l'estructura i només es manipulan en aquesta classe
        getNextKey: function () {
            return this.structure.next + '';
        },

        // ALERTA! no utilitzar per afegir nodes als diàlegs, els dialegs utilitzan el sistema de parser
        // i s'insereixen a la posició correcta dels childs. Aquesta versio només s'ha de fer servir
        // per crear nodes per incrustar directament a l'editor dojo.
        createNode: function(type, parent, key) {
            if (!key) {
                key = Number(this.structure.next);
                this.structure.next = (Number(this.structure.next) + 1) + "";
            }

            let node = {
                "type": type,
                "value": "",
                "attrs": "",
                "open": "",
                "close": "",
                "id": key + "",
                "parent" : parent ? parent + "" : undefined,
                "children": [],
            };

            return node;
        },

        // ALERTA! si el node ja existeix es sobreescriu, es controla que
        // l'id no sigui posterior al nextkey pels nodes inserits directament
        // desde l'editor dojo no cal respectar l'ordre perquè depenen de la posició
        // de l'span al document.
        addNode(node, afterId) {
            if (Number(node)>this.structure.next) {
                alert("No es pot afegir el node, l'identificador es major que la próxima clau");
                return;
            }

            // L'afegim com a child del parent si no és null
            if (node.parent !== undefined) {

                if (!this.structure[node.parent]) {
                    console.error("El parent indicat (" + node.parent + ") no es troba a l'estructura, no es pot afegir el node");
                    return;
                }

                // PROBLEMA: no és suficient amb inserir el node en qualsevol lloc, s'ha de determinar entre
                // quins childrens va
                // - si no es posa res, es col·loca al principi (opcional afterId)
                // - ALERTA! Només poden afegir-se com afills directes del root

                // hem de comprovar que no es trobi ja afegit (per haver sobreescrit a l'anterior)

                // 1: eliminem el child si ja es troba a la llista
                for (let i=0; i<this.structure[node.parent].children; i++) {
                    let childId = typeof child === 'object' ? child.id : child;

                    if (childId === node.id) {
                        this.structure[node.parent].children.splice(i, 1);
                        break;
                    }
                }

                // 2: cerquem el punt d'inserció
                let found = false;

                if (!afterId) {
                    this.structure[node.parent].children.unshift(node.id);
                } else {
                    for (let i=0; i<this.structure[node.parent].children; i++) {
                        let child = this.structure[node.parent].children[i];
                        let childId = typeof child === 'object' ? child.id : child;

                        if (childId === afterId) {
                            found = true;
                            this.structure[node.parent].children.splice(i, 0, node.id);
                            break;
                        }
                    }
                    if (!found) {
                        alert("No es pot afegir el node, el punt d'inserció no és fill del parent");
                        console.error("Error: el node no s'ha afegit com a fill. no el punt d'inserció no es fill del parent:", afterId, this.structure[node.parent]);
                        return;
                    }
                }
            }

            this.structure[node.id] = node;

            // L'afegim com a pare de tots els seus childs
            for (let i=0; i<node.children.length; i++) {

                let childId = typeof node.children[i] === 'object'? node.children[i].id : node.children[i];
                this.structure[childId].parent = node.id;
            }
        },

        canInsert: function(pos, node) {
            if (node.id === "0" || node.parent === "0" || node.solo) {
                return false;
            }

            return true;
        },

        areNodesSimilar: function (currentNode, backupNode) {
            let similar = currentNode.attrs === backupNode.attrs && currentNode.type === backupNode.type
                && currentNode.open === backupNode.open && currentNode.close === backupNode.close
                && currentNode.children.length === backupNode.children.length;

            // Si no són similars no cal comprovar els fills
            if (!similar) {
                return false;
            }

            for (let i = 0; i < currentNode.children.length; i++) {
                let currentNodeChild = typeof currentNode.children[i] === 'string' ?
                    this.getNodeById(currentNode.children[i]) : currentNode.children[i];
                let backupNodeChildId = typeof backupNode.children[i] === 'string' ?
                    backupNode.children[i] : backupNode.children[i].id;

                let childSimilars = this.areNodesSimilar(currentNodeChild, this.structure.backupIndex[backupNodeChildId]);
                if (!childSimilars) {
                    return false;
                }
            }

            return true;
        }
    });
});
