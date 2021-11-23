// Aquesta classe és un wrapper per les estructures wioccl enviades des del servidor que incluen
// les funcions per gestionar-les i modificar-les des del plugin per Dojo Editor DojoWioccl i DojoWiocclDialog
define([
    'dojo/_base/declare',
    'dojo/Evented'
], function (declare, Evented) {


    // TODO: Solució temporal, en lloc de rebre la definició de WIOCC des del servidor la establim aquí

    // ALERTA! es contempla l'opció de que els parámetres siguin opcionals, però cal tenir en compte que un parámetre
    // opcional obligaria a escriure els anteriors perque la posició a la llista de paràmetres canviarà
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
                // WRAPPER és un tipus especial utilitzat internament per les estructures temporals <-- TODO:Valorar si es pot utilitzar TEMP
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

        /** @type {string[]} siblings creats temporalment **/
        siblings: null,

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
            // console.error(config);
            // Aquí no fem res perquè cada subclasse ha d'implementar la seva propia lògica

            // console.error("WiocclStructureBase");

            this.dispatcher = dispatcher;

            this.siblings = [];
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
            // actualment no ni ha cap funció oculta, així que no és necessari
            // let names = [];

            // for (let key in wiocclDefinition.function.defs) {
            //     let def = wiocclDefinition.function.defs[key];
            //
            //     console.log(def);
            //     if (def.hidden) {
            //         continue;
            //     }
            //
            //     names.push(key);
            // }
            // return names.sort();

            return Object.keys(wiocclDefinition.function.defs).sort();

        },

        updateFunctionName(node, value) {
            // console.log(wiocclNode);
            let open = wiocclDefinition.function.open + value + wiocclDefinition.function.close;
            this.structure[node.id].open = open;
        },

        updateKeywordName(node, value) {
            // console.log(node, value);
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
                    // console.log("que ha retornat el dialeg en tancar-se?", name);
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
            // let context = this;

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
                // title: 'Inserir funció',
                // message: "Selecciona una funció wioccl per inserir.", // TODO: localitzartitle: 'Inserir funció',
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


            // TODO: les possibles noms dels camps han d'arribar des del servidor
            // per determinar com els obtenim aqui
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
            // console.log(name, wiocclDefinition.keyword.defs);

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
            // return Object.keys(wiocclDefinition.keyword.defs).sort();
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
            // console.log("getCode", node);
            let code = "";

            // Cal fer la conversió de &escapedgt; per \>

            // ALERTA: hi ha algun cas en el que falla i el node no té attrs
            // cal localitzar aquest cas
            if (!node || node.attrs === undefined) {
                console.error("getCode", node);
            }

            node.attrs = node.attrs.replaceAll('&escapedgt;', '\\>');
            node.attrs = node.attrs.replaceAll('&mark;', '\\>');
            node.attrs = node.attrs.replaceAll('&markn;', "\n>");

            code += node.open.replace('%s', node.attrs);

            // console.log("Comprovant childrens:", node.children);
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

                // console.log("getCode:", node, code);
            }

            if (node.close !== null) {
                code += node.close;
            }


            code = this._addSiblingsToCode(node, code);


            // console.log("Code rebuilt:", code);
            return code;
        },

        // En lloc de generar el codi pels childs es reemplaça pel inner passat com argument
        getCodeWithInner: function (node, inner) {
            // console.log("getCodeWithInner", node, inner);
            let code = "";

            // Cal fer la conversió de &escapedgt; per \>
            node.attrs = node.attrs.replaceAll('&escapedgt;', '\\>');
            node.attrs = node.attrs.replaceAll('&mark;', '\\>');
            node.attrs = node.attrs.replaceAll('&markn;', "\n>");

            code += node.open.replace('%s', node.attrs);


            // invertim el canvi que es fa en obtenir l'inner

            code += inner;

            if (node.close !== null) {
                code += node.close;
            }

            this._addSiblingsToCode(node, code);

            // // Comprovem si te siblings (mateix parent), i si es així en quina posició es troben al posmap (abans o després que aquest)
            // console.log("siblings candidats?",this.structure.siblings)
            // let siblings = {};
            // let testCounter =0;
            //
            // for (let siblingId of this.structure.siblings) {
            //     if (this.structure[siblingId].parent == this.node.parent) {
            //         console.log("trobat sigling:", this.structure[siblingId])
            //         siblings[singlinbId] = this.structure[siblingId];
            //         testCounter++;
            //     } else {
            //         console.warn("descartat sibling:", this.structure[siblingId])
            //     }
            // }
            //
            // let after = false;
            //
            // for (let [start, mappedNode] in this.posMap) {
            //
            //     if (mappedNode.id === node.id) {
            //         after = true;
            //         continue;
            //     }
            //
            //     if (siblings[mappedNode.id]) {
            //         // l'eliminem per no repetirlo, la majoria d'etiquetes s'afegeixen 2 vegades, una per l'apertura i una altra pel tancament
            //         delete(siblings[mappedNode.id]);
            //         testCounter--;
            //
            //         let siblingCode = this.getCode(mappedNode.id);
            //         if (after) {
            //             code += siblingCode;
            //         } else {
            //             code = siblingCode + code ;
            //         }
            //     }
            //
            // }
            //
            // console.log("Procesats tots els siblings?", testCounter === 0, testCounter);
            //
            //
            // console.log("Rebuild amb siblings:", code);

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

        // Es consideran només els siblings del node no afegits al parent (perquè s'han afegit a l'editor i encara no s'han desat els canvis)
        _addSiblingsToCode: function (node, code) {
            // Comprovem si te siblings (mateix parent), i si es així en quina posició es troben al posmap (abans o després que aquest)
            // console.log("siblings candidats?", node, this.siblings)
            let siblings = {};
            let testCounter = 0;

            // Si no es control·la aquest es produeix un loop infinit
            if (this.siblings.includes(node.id)) {
                console.log("El node és un sibling, no cal afegir-res");

                return code;
            }

            if (!this.posMap) {
                // console.log("No hi ha posMap. Retornant");
                return code;
            }


            for (let siblingId of this.siblings) {
                // if (this.structure[siblingId].parent === node.parent && !this._hasChild(node.parent, siblingId)) {
                if (this.structure[siblingId].parent === node.parent) {
                    console.log("trobat sibling:", this.structure[siblingId])
                    siblings[siblingId] = this.structure[siblingId];
                    testCounter++;
                } else {
                    console.warn("descartat sibling:", this.structure[siblingId])
                }
            }

            let after = false;

            for (let [start, mappedNode] of this.posMap) {

                if (mappedNode.id === node.id) {
                    // console.log("trobat el node original, saltant");
                    after = true;
                    continue;
                }

                if (siblings[mappedNode.id]) {
                    // l'eliminem per no repetirlo, la majoria d'etiquetes s'afegeixen 2 vegades, una per l'apertura i una altra pel tancament
                    delete (siblings[mappedNode.id]);
                    testCounter--;

                    let siblingCode = this.getCode(mappedNode);
                    if (after) {
                        // console.log("afegit després", siblingCode);
                        code += siblingCode;
                    } else {
                        // console.log("afegit abans", siblingCode);
                        code = siblingCode + code;
                    }
                } else {
                    // console.log("No es troba ", mappedNode.id, " a siblings", siblings);
                }

            }

            // console.log("Procesats tots els siblings?", testCounter === 0, testCounter);
            //

            // console.log("Rebuild amb siblings:", code);

            return code;
        },

        // retorna el contingut d'un node, és a dir, el codi corresponent als nodes fills
        getInner: function (node) {
            // console.warn("getInner", node);
            let code = '';

            for (let i = 0; i < node.children.length; i++) {
                let child = typeof node.children[i] === 'object' ? node.children[i] : this.structure[node.children[i]];
                code += this.getCode(child);
            }

            // console.log("Inner:", code);
            return code;
        },


        rebuildPosMap: function (item) {
            // console.error("Rebuilding chunkmap for", item, this.structure);

            let outChunkMap = new Map();

            // Referència per determinar quin item ha de persistir en el filtre
            let auxId = item.id


            // s'han de tenir en compte els siblings temporals
            // creem un nou item que els contingui i aquest és el que reconstruim
            let wrapper = {
                open: '',
                close: '',
                attrs: '',
                // ALERTA! Cal crear una copia perquè si no es modifiquen els siblings!!
                // children: this.siblings ? JSON.parse(JSON.stringify(this.siblings)) : []
            }

            // wrapper.children.unshift(item);

            // Cerquem els sibligs del node seleccionat. Això s'ha d'establir aqui
            // perquè el _createPosMap es crida recursivament
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

            // L'editor pot estar mostrant 1 node + nous siblings, per aquest motiu recuperavem els "siblings"
            // que són els fills del parent.
            // però això no és correcte, l'editor mostra només els siblings que encara no s'han afegit definitivament
            // és a dir, els siblings que no es troben al backup!
            //
            // cal recorrer aquests children i conservar només:
            // el item
            // els que no es trobin al backup:
            //   - agafem el parent del backup (sempre ha d'existir? COMPROVAR AMB EL ROOT REAL)
            //      * quins childrens ha de contenir si s'ha clicat el wrapper?

            //   - recorrem els childs i comprovem si són similars, si es troba similar es descarta
            //          - Les posicions han de ser les mateixes

            // PROBLEMA: el backupNode conté la estructura de l'arbre, així que per trobar el node corresponent
            // al node editat cal recorrer totes les branques fins trobar-lo

            for (let i=wrapper.children.length-1; i>=0; i--) {

                let child = wrapper.children[i];
                let id = typeof child === "string" ? child : child.id;

                if (auxId === null || id === auxId || !this.structure.backupIndex[id]) {
                    console.log("conservant node pel posMap (per això funciona el root probablement, no elimina cap", child)
                    continue;
                }
                let eliminat = wrapper.children.splice(i, 1);
                console.log("descartant node pel posMap:", auxId, id, this.structure.backupIndex[id], eliminat);

            }

            // console.log("que hi ha al backup", this.structure.backupNode);
            // console.log("que hi ha a l'índex", this.structure.backupIndex);

            // Pasem els childs a string si hi ha. ALERTA! Això está duplicat en altes punts
            for (let i=0; i<auxParent.children.length; i++){
                if (typeof auxParent.children[i] !== "string") {
                    auxParent.children[i] = auxParent.children[i].id;
                }
            }

            let auxRootSibblings = [];

            if (!this.editorNodes) {
                this.editorNodes = [item];
            }

            for (let node of this.editorNodes) {
                // ALERT! no és el mateix que el wrapper.children? el wrapper és un clone del auxParent
                if (auxParent.children.includes(node.id) && wrapper.children.includes(node.id)) {
                    // console.log("Contingut al parent");
                    auxRootSibblings.push(node);
                }
            }

            // console.log("Root Siblings:", auxRootSibblings);

            let rebuild = this._createPosMap(wrapper, 0, outChunkMap);
            this.posMap = outChunkMap;

            this.dirtyStructure = true;
        },

        // el pos map és un mapa que indica en quina posició comença una línia wioccl: map<int pos, int ref>
        _createPosMap: function (node, pos, outPosMap) {

            // console.error("_createPosMap", node, pos);
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

        // retorna la posició com a index
        getNearestPos: function (pos) {

            if (this.posMap.size === 0) {
                return 0;
            }

            // Cerquem el node corresponent
            let candidate;
            let found;
            // let first;
            let last;

            // Recorrem el mapa (que ha d'estar ordenat) fins que trobem una posició superior al punt que hem clicat
            // S'agafarà l'anterior
            // console.log(this.posMap);
            // console.log(this.posMap.length);

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

            // console.warn(startPos, endPos);

            // console.log("Candidate:", candidate, last);

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
                // console.log("START", startPos);
                return startPos;
            } else {
                // console.log("END", endPos);
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
            // console.log("Restoring");
            if (this.structure.backupNode) {
                // El purge s'ha de cridar només un cop, perquè és recursiu, sobre l'element que conté els childs actualment
                this.discardSiblings();
                this._purge(this.structure[this.structure.backupNode.id]);

                this._restore(this.structure.backupNode);


                // ALERTA! No ho esborrem porquè hi ha casos en que cal restaurar (per exemple en fer click a diferents nodes)
                // i no te sentit fer un nou backup
                this.dirtyStructure = false;

            } else {
                console.log("no hi havia backup");
            }
        },

        _backup: function (node, index) {


            let id = typeof node === 'object' ? node.id : node;
            // let backup = JSON.parse(JSON.stringify(this.structure[node.id]));

            // console.log("que hi ha a la posició?", node, this.structure, id, this.structure[id]);
            let backup = JSON.parse(JSON.stringify(this.structure[id]));

            // afegim el node al mapa
            // console.log(index, id);
            index[id] = backup;

            for (let i = 0; i < backup.children.length; i++) {
                // Canviem els ids per la copia de l'objecte
                let id = typeof backup.children[i] === 'object' ? backup.children[i].id : backup.children[i];
                // backup.children[id] = this._backup(this.structure[id]);
                backup.children[i] = this._backup(this.structure[id], index);
            }
            return backup;
        },

        backup: function (node) {
            this.structure.backupIndex = {};
            this.structure.backupIndex[node.id] = JSON.parse(JSON.stringify(node));
            this.structure.backupNode = this._backup(node, this.structure.backupIndex);

        },

        parse: function (text, node) {
            // abans de fer el parse fem un restore per aplicar els canvis sobre els originals
            // de manera que es descarten els children generats anteriorment
            this.restore();

            // console.log("Parse a partir del node:", node);

            let outTokens = this._tokenize(text);
            this._createTree(node, outTokens, this.structure);

            return node;

        },

        // TODO: Refactoritzar i canviar el nom, això no crea un arbre, actualitza l'estructura a partir del node root
        // i els tokens passats que són un vector d'elements que cal estructurar en forma d'arbre segons si es troben
        // dintre d'instruccions wioccl
        _createTree(root, outTokens) {
            // console.log("_createTree",root, outTokens);

            this.discardSiblings();

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
            }

            let nextKey = this.structure.next + "";

            let siblings = 0;

            let first = true;

            /// Aquest serà el valor a retornar si el root es null inicialment
            // let outRoot = null;

            // Si l'últim token és un salt de linia ho afegim al token anterior
            if (outTokens.length > 1 && outTokens[outTokens.length - 1].value === "\n") {
                outTokens[outTokens.length - 2].value += "\n";
                outTokens.pop();
            }


            let errorDetected = false;

            // Si el root és temporal o wrapper eliminem els fills
            // hi ha algun cas en que s'hagi de conservar els fills encara que no sigui temp ni wrapper?
            // TODO: aplicar a tots els casos?
            // if (root.type === 'temp' || root.type === 'wrapper') {
            //     console.log("root", root);
            //     this._removeChildren(root.id);
                // root.children = [];
            // }

            // Guardem la llista de nodes parsejats
            this.editorNodes = [];

            // console.log("Preparat this.editorNodes", this.editorNodes);
            for (let i in outTokens) {
                // console.log(i, outTokens[i]);

                // Cal un tractament especial per l'arrel perquè s'ha de col·locar a la posició del node arrel original
                // Si l'arrel és temporal el primer token és fill de l'arrel

                // if (root.type === 'temp' && stack.length === 0) {
                // TODO: Alerta, això correspon a WiocclStructureTemp, però llavors cal copiar tota la funció canviant
                // només aquest cas

                // ALERTA! Gestionar el void! considerar separar en les classes temp i void!!

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
                    // this.root = tokens[i].id;
                    // Reemplaçem el root
                    root = outTokens[i];

                } else {
                    // console.log(outTokens, stack);

                    currentId = nextKey;
                    outTokens[i].id = currentId;
                }

                outTokens[i].children = [];


                if (outTokens[i].value.startsWith('</WIOCCL:')) {
                    // console.log("Tancant", outTokens[i].value)
                    outTokens[i].type = "wioccl";
                    let top = stack.pop();

                    // Com que sempre hi ha un node root que no es pot tancar (temp, wrapper, etc.) no cal control·lar si hi ha parent

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

                    // console.log("parent anterior:", outTokens[i].parent);
                    // console.log("parent nou:", stack[stack.length-1].id);
                    outTokens[i].parent = stack[stack.length-1].id;

                    let lastChildren = stack[stack.length - 1].children;

                    // els childs poden ser objectes o strings

                    // si no es troba entre els children l'afegim al final
                    let filter = (element) => {
                        let id =  typeof element === 'string' ? element : element.id;
                        return id === currentId;
                    };

                    if (!lastChildren.some(filter)) {
                        // console.log("Afegint child", currentId);
                        stack[stack.length - 1].children.push(currentId);
                    } else {
                        // console.log("Trobat child amb id (no afegim)", currentId);
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

                // Si fem servir push s'afegeixen al final, això no serveix perquè cal inserir els nous nodes a la posició original (emmagatzemada a root.index)
                // si no hi ha root.index no cal reordenar, això passa amb un parse de múltiples tokens temporals

                // console.log(root !== null,  root.index,  outTokens[i].parent, root.parent);


                // TODO: arreglar aixo <-- sembla que no es crida, ja no es fa servir?
                if (root !== null && root.index !== undefined && outTokens[i].parent === root.parent
                    && (Number(i) < outTokens.length - 1 || outTokens[i].value !== "\n")) {
                    console.log("Es fa servir?");
                    alert("Es fa servir?");
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
                        console.log("Afegint sibling", id);
                        this.siblings.push(id);
                    }

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
                root.addedsiblings = false;
            }

            this.structure.next = Number(nextKey);

            // Actualitzem el root
            this.structure[root.id] = root;
        },

        _tokenize(text) {
            // console.log("Text rebut:", text);
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
                console.error("Node no trobat", id, node, this.structure);
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

        discardSiblings: function () {
            // TODO: determinar si això es pot eliminar
            if (this.siblings && this.siblings.length >0) {
                console.warn("Sibblings en us!", this.siblings);
                alert("sibblings");
            }

            for (let i = this.siblings.length - 1; i >= 0; i--) {
                this._removeNode(this.siblings[i]);
            }
            this.siblings = [];
        },

        // les claus són a l'estructura i només es manipulan en aquesta classe
        getNextKey: function () {
            return this.structure.next + '';
        },

        // increaseNextKey: function() {
        //     this.structure.next++;
        // },

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

        // alerta, si el node ja existeix es sobreescriu, es controla que el id no sigui posterior al nextkey
        // pels nodes inserits directament desde l'editor dojo no cal respectar l'ordre perquè depenen de la posició
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
            // console.log("Node?", node);
            if (node.id === "0" || node.parent === "0" || node.solo) {
                //console.warn("No es pot inserir, el node és root, fill directe o solo");
                return false;
            }

            return true;
        },

        areNodesSimilar: function (currentNode, backupNode) {
            // console.log("Comparant", currentNode, backupNode);
            let similar = currentNode.attrs === backupNode.attrs && currentNode.type === backupNode.type
                && currentNode.open === backupNode.open && currentNode.close === backupNode.close
                && currentNode.children.length === backupNode.children.length;

            // Si no són similars no cal comprovar els fills
            if (!similar) {
                // console.log("Detectat no similar", currentNode, backupNode);
                return false;
            }

            for (let i = 0; i < currentNode.children.length; i++) {
                // Alerta, la estructua s'agafa de fora de la funció!
                let currentNodeChild = typeof currentNode.children[i] === 'string' ? this.getNodeById(currentNode.children[i]) : currentNode.children[i];

                let childSimilars = this.areNodesSimilar(currentNodeChild, backupNode.children[i]);
                if (!childSimilars) {
                    return false;
                }
            }

            return true;
        }

    });
});
