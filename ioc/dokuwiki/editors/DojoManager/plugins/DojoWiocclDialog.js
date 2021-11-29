define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/declare',
    'dijit/Dialog',
    'dojo/text!./templates/WiocclDialog.html',
    'dojo/dom-construct',
    'ioc/wiki30/manager/EventObservable',
    'ioc/wiki30/manager/EventObserver',
    'dijit/form/Button',
    'ioc/dokuwiki/editors/AceManager/toolbarManager',
    "dojo/store/Memory",
    "dijit/tree/ObjectStoreModel",
    "dijit/Tree",
    'ioc/dokuwiki/editors/DojoManager/plugins/WiocclStructureTemp',
], function (TemplatedMixin, WidgetsInTemplateMixin, declare, Dialog, template, domConstruct, EventObservable,
             EventObserver, Button, toolbarManager, Memory, ObjectStoreModel, Tree, WiocclStructureTemp) {

    const UPDATE_TIME = 300; // temps en millisegons

    let AceFacade = null;

    let counter = 0;

    // Aquest és el comportament normal, no és pot editar directament, només mitjançant els botons.
    // Es pot posar com a false per testejar, o podem parametritzar-lo segons el tipus d'usuari (només avanaçats).
    const ALWAYS_LOCKED = true;


    // TODO: Extreure a algun lloc més adient
    function setCursorPosition(element, pos) {
        if (element.setSelectionRange) {
            element.setSelectionRange(pos, pos);
        } else if (element.createTextRange) {
            let range = element.createTextRange();
            range.collapse(true);
            if (pos < 0) {
                pos = $(element).val().length + pos;
            }
            range.moveEnd('character', pos);
            range.moveStart('character', pos);
            range.select();
        }
    }

    // ALERTA! Aquestes classes no carregan correctament a la capçalera, cal fer un segon require
    require(["ioc/dokuwiki/editors/AceManager/AceEditorFullFacade"], function (AuxClass) {
        AceFacade = AuxClass;
    });

    var DojoWioccDialog = declare("ioc.gui.CustomDialog", [Dialog, TemplatedMixin, WidgetsInTemplateMixin, EventObservable, EventObserver], {

        templateString: template,

        lastPos: null,
        lastCursor: null,
        wasFocused: null,

        lockEditor: function () {
            this.editor.lockEditor();
        },

        unlockEditor: function () {
            if (!ALWAYS_LOCKED) {
                this.editor.unlockEditor();
            }
        },

        startup: function () {
            this.inherited(arguments);
            this.createEditor();

            if (ALWAYS_LOCKED) {
                this.lockEditor();
            }

            this.createTree(this.tree, this.refId, this.structure);

            let wiocclNode = this.structure.getNodeById(this.refId);

            // let wioccl = this.structure[this.refId];

            // let wioccl = this.source.getStructure()[this.refId];

            this._selectWiocclNode(wiocclNode)
            // this.selectedWioccl = wioccl;

            this.structure.rebuildPosMap(wiocclNode);
            let $deleteButton = jQuery(this.deleteButtonNode);
            let $updateButton = jQuery(this.updateButtonNode);
            let $saveButton = jQuery(this.saveButtonNode);

            let context = this;

            $updateButton.on('click', function () {
                // Alerta, el context d'execució en afegir el callback al objecte de configuració (pel principal és DojoWioccl)
                context.updateCallback(context.editor);
                context.structure.dirtyStructure = true;
            });

            $deleteButton.on('click', function () {
                // Alerta, el context d'execució en afegir el callback al objecte de configuració (pel principal és DojoWioccl)

                // TODO: demanar confirmació

                context.editor.setValue('');
                $updateButton.trigger('click');
                let newNode = context.structure.getNodeById(context.editor.wioccl.id);
                context._updateFields(newNode);
                // context._updateLegend(newNode);
                context._selectWiocclNode(newNode);
                context.structure.dirtyStructure = true;
            });

            // Als subdialegs no s'ha de mostrar el botó d'eliminar nodes
            if (!context.enabledDelete) {
                $deleteButton.attr('disabled', 'true');
                $deleteButton.css('opacity', '0.5');
            }

            $saveButton.on('click', function () {
                // Alerta, el context d'execució en afegir el callback al objecte de configuració
                context.saveCallback(context.editor);
            });

            // ens assegurem que es false al començar, pot ser que hagi canviat
            // durant la inicialització
            this.dirty = false;


            // Iniciem els botons per inserir elements wioccl a l'editor
            jQuery(this.insertWiocclBtnNode).on('click', function () {
                let callback = function (code) {
                    context._insertCode(code);
                };
                context.structure.getKeywordTemplate(callback);

            });

            jQuery(this.insertFieldBtnNode).on('click', function () {
                // let code = context.structure.getFieldTemplate();
                // context._insertCode(code);

                let callback = function (code) {
                    context._insertCode(code);
                };
                context.structure.getFieldTemplate(callback, context.fields);
            });

            jQuery(this.insertFunctionBtnNode).on('click', function () {
                let callback = function (code) {
                    context._insertCode(code);
                };
                context.structure.getFunctionTemplate(callback);
            });

            jQuery(this.insertContentBtnNode).on('click', function () {
                let code = context.structure.getContentTemplate();
                context._insertCode(code);
            });

            jQuery(this.deleteBtnNode).on('click', function () {
                // let code = context.structure.getContentTemplate();
                let pos = context.editor.getPositionAsIndex();
                let node = context.structure._getNodeForPos(pos);

                context.structure._removeNode(node.id);
                let currentWiocclNode = context.structure.getNodeById(context.editor.wioccl.id);
                context._updateDetail(currentWiocclNode, false);
                // context._selectWiocclNode(currentWiocclNode);


                // TEST: això està copiat del insert code
                // context.structure.restore();

                context.structure.dirtyStructure = true;

                let editor = context.editor;
                context.structure.updating = true;
                let wiocclNode = context.structure.parse(editor.getValue(), editor.wioccl);
                context.structure.updating = false;

                context.updateInsertButtons();


                console.log("Es dirty la estructura?", context.structure.dirtyStructure);

                // console.log("node a l'editor", context.editor.wioccl);
                // console.log("s'ha d'eliminar el node a la posició:", pos, node, context.structure.posMap);
            });

        },

        updateInsertButtons: function () {
            let pos = this._getInsertPosition()
            // let currentWiocclNode = this.structure.getNodeById(this.selectedWiocclNode.id);
            let currentWiocclNode = this._getWiocclForCurrentPos();
            if (currentWiocclNode.id !== this.selectedWiocclNode.id) {
                this._selectWiocclNode(currentWiocclNode);
            }

            let canInsert = this.structure.canInsert(pos, currentWiocclNode);

            // El void sempre es bloqueja per obligar a inserir utilitzant els botons

            if (canInsert && !this.selectedWiocclNode.solo) {
                this.unlockEditor();
            } else {
                this.lockEditor();
            }

            // console.log("Can insert?", canInsert, pos, this.selectedWiocclNode);

            // Els botons pel void sí que han d'estar activats per inserir l'element
            if (this.selectedWiocclNode.type === 'void') {
                canInsert = true;
            }

            jQuery(this.insertWiocclBtnNode).prop('disabled', !canInsert);
            jQuery(this.insertFieldBtnNode).prop('disabled', !canInsert);
            jQuery(this.insertFunctionBtnNode).prop('disabled', !canInsert);

            // Si el tipus és void o solo no pot inserirse content, el content s'ha d'inserir editant el "inner content"
            if (this.selectedWiocclNode.type === 'void' || this.selectedWiocclNode.solo) {
                canInsert = false;
            }

            jQuery(this.insertContentBtnNode).prop('disabled', !canInsert);
        },

        _insertCode: function (code) {

            // this._moveCursorToInsertPosition();

            let wasVoid = this.selectedWiocclNode.type === 'void';
            let id = this.selectedWiocclNode.id;

            // console.log("node a l'editor?", this.selectedWiocclNode);


            this.dirty = true;
            let pos = this._getInsertPosition();
            this.editor.insertIntoPos(pos, code, true);


            // Si es tracta d'un void fem un update per refrescar l'arbre;

            // ALERTA! Aquest codi es prácticament igual que el del botó update

            let structure = this.structure;
            structure.updating = true;
            structure.discardSiblings();

            // Restaurem la estructura abans de fer el parse
            // TODO: provar a eliminar-lo, ara sempre es fa un restore abans del parse
            structure.restore();

            let editor = this.editor;
            let wiocclNode = structure.parse(editor.getValue(), editor.wioccl);
            structure.updating = false;

            if (wasVoid) {

                this.setData(structure.getNodeById(structure.root), wiocclNode);
            }

            this.updateInsertButtons();

            this.structure.dirtyStructure = true;

            // Forcem un update, això dispararà la detecció de siblings
            //this._updateDetail(wiocclNode, true);


        },

        _getInsertPosition() {

            let currentPosition = this.editor.getPosition();
            let pos = this.editor.getPositionAsIndex();
            let node = this.structure._getNodeForPos(pos);

            // console.log("Node por position?", node, pos);
            // alert("check node at position")

            if (node.type === 'content') {
                return currentPosition;
            }

            let nearestPos = this.structure.getNearestPos(pos);

            let cursorPosition = this.editor.getIndexAsPosition(nearestPos);


            return cursorPosition;

        },

        show: function () {
            this.inherited(arguments);

            this._updateEditorHeight();
            this._updateTreeHeight();
        },

        _updateTreeHeight: function () {
            let $paneContainer = jQuery(this.paneContainerNode);
            let $treeContainer = jQuery(this.treeContainerNode);
            let $detailContainer = jQuery(this.detailContainerNode);

            let height = $paneContainer.height() - 30;

            $treeContainer.css('height', height);
            let treeWidth = $treeContainer.width();
            let paneWidth = $paneContainer.width();

            $detailContainer.css('height', height);
            $detailContainer.css('width', paneWidth - treeWidth - 90);
        },

        createTree: function (tree, refId) {

            let store = new Memory({
                // data: this.tree,
                data: tree,
                getChildren: function (object) {
                    return object.children || [];
                }
            });

            let model = new ObjectStoreModel({
                store: store,
                query: {id: refId},
                mayHaveChildren: function (item) {
                    // console.log("mayHaveChildren", item);
                    // return "children" in item;
                    return item.children.length > 0;
                }
            });

            this.model = model;

            let context = this;

            let structure = this.structure;

            // Fem un backup inicial quan es crea l'arbre
            structure.backup(structure.getRoot());

            this.treeWidget = new Tree({
                id: Date.now(),
                model: model,
                fields: this.fields,
                onOpenClick: true,
                onLoad: function () {
                    // dom.byId('image').src = '../resources/images/root.jpg';
                },
                onClick: function (item) {
                    // console.log("item clicat:", item, structure);

                    // actualitzem qualsevol canvi pendent abans
                    context._updatePendingChanges_Field2Detail()


                    let hasChanges = context.editor.isChanged();
                    let isDirty = structure.dirtyStructure || context._pendingChanges_Field2Detail
                        || context._fieldChanges;

                    // console.log("Es dirty?", isDirty);
                    // console.log("structure.dirtyStructure", structure.dirtyStructure);
                    // console.log("** context.editor.isChanged() **", context.editor.isChanged());
                    // console.log("context._pendingChanges_Field2Detail", context._pendingChanges_Field2Detail);
                    // console.log("context._fieldChanges", context._fieldChanges);

                    ///////////////// COMPROVACIO DE BRANQUES SIMILARS //////////////////
                    if (isDirty && !hasChanges) {
                        // Comprovem si realment el contingut del backup és diferent al que hi ha
                        // esperem que només canviin els identificadors, la resta ha de ser idèntica

                        // PAS 1: agafar el wrapper
                        let getWrapper = function (node) {
                            if (!node) {
                                return false;
                            }
                            if (node.type === "wrapper" || node.type === "temp") {
                                return node;
                            } else if (node.parent) {
                                return getWrapper(structure.getNodeById(node.parent));
                            }

                            return null;
                        }

                        // Si no s'ha trobat és que hi han hagut canvis i ha canviat el posmap
                        let wrapper = getWrapper(item);


                        // PAS 2: trobar el node corresponent dins del backup node
                        // let getNode = function (node, id) {
                        //     if (node.id === id) {
                        //         return node;
                        //     }
                        //
                        //     for (let child of node.children) {
                        //         let found = getNode(child, id);
                        //         if (found) {
                        //             return found;
                        //         }
                        //     }
                        //
                        //     return false;
                        // };

                        // let backupWrapper = getNode(structure.structure.backupNode, wrapper.id);
                        let backupWrapper = structure.structure.backupIndex[wrapper.id];

                        // Pas 3: recorrer tots els childrens al wrapper i al backupWrapper:
                        // TODO: moure això al WiocclStructureBase

                        // ALERTA! el currentNode sempre ha de ser el mapejat a la estructura i s'han de restaurar
                        // completament els childs (excepte el primer)
                        // let areNodesSimilar = function (currentNode, backupNode) {
                        //     // console.log("Comparant", currentNode, backupNode);
                        //     let similar = currentNode.attrs === backupNode.attrs && currentNode.type === backupNode.type
                        //         && currentNode.open === backupNode.open && currentNode.close === backupNode.close
                        //         && currentNode.children.length === backupNode.children.length;
                        //
                        //     // Si no són similars no cal comprovar els fills
                        //     if (!similar) {
                        //         // console.log("Detectat no similar", currentNode, backupNode);
                        //         return false;
                        //     }
                        //
                        //     for (let i = 0; i < currentNode.children.length; i++) {
                        //         // Alerta, la estructua s'agafa de fora de la funció!
                        //         let currentNodeChild = typeof currentNode.children[i] === 'string' ? structure.getNodeById(currentNode.children[i]) : currentNode.children[i];
                        //
                        //         let childSimilars = areNodesSimilar(currentNodeChild, backupNode.children[i]);
                        //         if (!childSimilars) {
                        //             return false;
                        //         }
                        //     }
                        //
                        //     return true;
                        // }

                        // console.log("wrapper, backupwrapper", wrapper, backupWrapper);
                        // console.log("structure, structure.index", structure, structure.structure.index);
                        // alert("stop check if they are similar");

                        // ALERTA! La comprovació del contingut de l'editor no es té en compte a l'hora de comprovar els nodes

                        let areSimilar = wrapper ? structure.areNodesSimilar(wrapper, backupWrapper) : false;


                        // console.log(structure);
                        // console.log(context.structure);
                        // són el mateix??
                        // console.log("és el mateix?", structure, context.structure);
                        // alert("El node 93 està actualitzat?");
                        // TODO: eliminar, validació de que la funció interna i la extreta funcionen igual
                        // let validation = structure.areNodesSimilar(wrapper, backupWrapper) === areNodesSimilar(wrapper, backupWrapper);
                        // if (!validation) {
                        //     console.error("Validation fail, les funcions no retornent el mateix:");
                        // } else {
                        //     console.log("validates");
                        // }


                        // console.log("Són similars?", areSimilar, wrapper, backupWrapper);

                        // Restaurem automàticament sense avisar
                        if (areSimilar) {
                            structure.restore();
                        }

                        isDirty = !areSimilar;

                    } else {
                        // console.log("No dirty (tots són fals");
                        // console.log("dirtyStructure", structure.dirtyStructure);
                        // console.log("isChanged", context.editor.isChanged());
                        // console.log("pendingChanges_Field2Detail", context._pendingChanges_Field2Detail);
                        // console.log("fieldChanges", context._fieldChanges);

                    }


                    if (isDirty || hasChanges) {
                        // if (structure.dirtyStructure || context.editor.isChanged() || context._pendingChanges_Field2Detail || context._fieldChanges) {
                        let descartar = confirm("S'han detectat canvis, vols descartar-los?");

                        if (!descartar) {
                            return false;
                        }

                        structure.restore();

                        context._fieldChanges = false;

                    } else {
                        // console.log("No hi ha canvis");
                    }

                    // Alerta! aquest és l'item seleccionat, no correspón amb el restaurat i sobreescriu el backup
                    // ALERTA[Xavi] no es pot fer servir el item directament, tot i que el backup crea una copia,
                    // cal recuperar l'element de la estructura.

                    let wiocclNode = structure.getNodeById(item.id);

                    // No fem backup perquè sempre apliquem els canvis
                    // structure.backup(wiocclNode);

                    structure.rebuildPosMap(wiocclNode);

                    context.editor.setPosition({col: 0, column: 0});



                    context._updateDetail(wiocclNode);
                    // TODO: cal el select? o és suficient amb l'uptade de la posició 0?
                    context._selectWiocclNode(wiocclNode);
                    context._updateNodeForPosition();
                    // reseteem el cursor

                }
            });

            this.treeWidget.placeAt(this.treeContainerNode);
            this.treeWidget.startup();
        },

        // TODO: Valorar si això és més adient aquí o al WiocclStructureBase
        _extractFieldsFromWiocclNode: function (wiocclNode) {
            // console.log('_extractFieldsFromWiocclNode type', wiocclNode.type);
            if (wiocclNode.attrs.length === 0) {
                wiocclNode.type = wiocclNode.type ? wiocclNode.type : "content";
            }

            let fields;


            switch (wiocclNode.type) {
                case 'function':
                    fields = this._extractParams(wiocclNode);
                    break;

                case 'content':
                    fields = this._extractContent(wiocclNode);
                    break;

                case 'field':
                    fields = this._extractField(wiocclNode);
                    break;

                default:
                    fields = this._extractAttrs(wiocclNode);
                    break;
            }

            return fields;

        },

        // TODO: Valorar si això és més adient aquí o al WiocclStructureBase
        _extractContent: function (wiocclNode, type) {
            return {
                'content': wiocclNode.open
            };
        },

        _extractField: function (wiocclNode) {
            let attrs = wiocclNode.attrs.replace('&escapedgt;', '\\>');

            return {
                'field': attrs
            };
        },

        _extractParams: function (wiocclNode) {
            // console.log('_extractParams', wiocclNode);

            // Cal fer la conversió de &escapedgt; per \>
            let attrs = wiocclNode.attrs.replace('&escapedgt;', '\\>');

            let fields = {};

            let paramsPattern = /(\[.*?\])|(".*?")|(''.*?'')|-?\d+|,(),/g;
            let tokens = attrs.match(paramsPattern);

            if (tokens === null) {
                // això és pot produir si s'esborren les dobles cometes d'un camp per exemple
                console.error("S'ha produit un error, no és possible parsejar els camps actuals");
                return {};
            }

            let instruction = this.structure.getInstructionName(wiocclNode);
            let functionDefinition = this.structure.getFunctionDefinition(instruction);

            // ALERTA! s'han de gestionar les ,, ja que són camps buits.
            for (let i = 0; i < tokens.length; i++) {
                if (tokens[i] === ',,') {
                    tokens[i] = '';
                }
            }

            if (functionDefinition) {

                // El for inclou tots els params, independentment del nombre de tokens, però el nombre de tokens
                // afecta al paràmetre al que s'assigna cada valor

                // for (let i = 0; i < tokens.length; i++) {
                for (let i = 0; i < functionDefinition.params.length; i++) {
                    // console.log("Default:", functionDefinition.params[i].default, functionDefinition.params[i])

                    let paramDef = functionDefinition.params[i];
                    let value = '';

                    if (i <= tokens.length - 1 && tokens[i].length > 0) {
                        value = tokens[i].trim();
                    } else {
                        value = paramDef.default !== undefined ? paramDef.default : '';
                    }

                    value += ''; // ens asegurem que es tracta d'un string

                    let isString = (value.startsWith("''") || value.startsWith('"'))
                        && (paramDef.type === 'string'
                            || (Array.isArray(paramDef.type) && paramDef.type.includes('string')));

                    // TODO: eliminar les cometes i dobles cometes al principi i al final
                    value = value.replace(/^("|'')/gm, '')
                    value = value.replace(/("|'')$/gm, '')

                    // let isField = value.startsWith("{##") || value.startsWith('##}');

                    if (isString) {
                        value = `''${value}''`;
                    }

                    fields[paramDef.name] = value;

                    // fields['param' + i] = tokens[i].trim();
                }

                // console.warn(fields);
            }

            return fields;
        },

        _extractAttrs: function (wiocclNode, type) {
            // console.log('_extractFields', type, wiocclNode.attrs);

            // Cal fer la conversió de &escapedgt; per \>
            let attrs = wiocclNode.attrs.replace('&escapedgt;', '\\>');

            let fields = {};

            const pattern = / *((.*?)="(.*?)")/g;

            const array = [...attrs.matchAll(pattern)];

            for (let i = 0; i < array.length; i++) {
                fields[array[i][2].trim()] = array[i][3].trim();
            }

            return fields;
        },

        // todo: determinar si es necessari el ignore detal
        _updateFields: function (wiocclNode, ignoreDetail) {

            // type: wioccl o content.
            // todo: fer un tractament diferent per cada tipus, actualment es modifica el wiocclNode per tractar
            // els params i el content com atributs

            switch (wiocclNode.type) {

                // case 'function':
                //     let params = this._extractFieldsFromWiocclNode(wiocclNode);
                //     this._setParams(params)
                //
                // case 'wioccl':
                default:
                    let fields = this._extractFieldsFromWiocclNode(wiocclNode);
                    this._setAttrs(fields, wiocclNode);
                    break;


            }

        },

        _updateDetail: function (wiocclNode, ignoreFields) {
            // console.log("_updateDetail", wiocclNode, this.updating, ignoreFields)

            if (this.updating) {
                // console.log("Returning");
                return;
            }

            if (!ignoreFields) {

                // this.setFields(this._extractFields(item.attrs, item.type));
                // this.setFields(this._extractFieldsFromWiocclNode(wiocclNode));
                this._updateFields(wiocclNode);
            }


            let auxContent = this.structure.getCode(wiocclNode);
            // console.log("Nou content:", auxContent);

            // let auxContent = this.source.getCode(item, this.structure);

            if (this.editor.getValue() !== auxContent) {
                // ALERTA! Això es va afegir per intentar restaurar el focus als inputs, però no funciona
                // let focusedElement = jQuery(document.activeElement);
                // let cursorPosition = focusedElement.get(0).selectionStart;
                this.editor.setValue(auxContent);
                this.dirty = true;
                // focusedElement.focus();
                // setCursorPosition(focusedElement.get(0), cursorPosition);

                this.editor.resetOriginalContentState();
            }

            this.editor.wioccl = wiocclNode;

            // console.log("check, s'ha actualitzat el node a la estructura?",
            //     this.structure.getNodeById(wiocclNode.id), wiocclNode);
            // console.log("Que hi ha a la estructura?", this.structure);

            if (wiocclNode.id === 0) {
                this.lockEditor();
                jQuery(this.detailContainerNode).css('opacity', '0.5');
            } else {
                this.unlockEditor();
                jQuery(this.detailContainerNode).css('opacity', '1');
            }

            // ALERTA[Xavi]! l'editor sempre ha d'estar bloquejat, s'ha de manipular mitjançant els camps


        },

        // ALERTA! aquesta funció es crida automáticament quan canvia la mida de la finestra del navegador o es fa scroll
        // Com que hem fet que els elements del dialog s'ajustin via jQuery quan es crida al resize es
        // fa malbé la composició.
        //
        // Per alguna raó desconeguda si es sobreescriu aquesta funció i s'intenta cridar al this.inherited()
        // no funciona, i si es sobreescriu a la inicialització no es crida la primera vegada i no es
        // genera correctament, per aquest motiu es fa la reescriptura en aquest punt, on ja tenim la mida final
        resize: function (args) {
        },


        _updateEditorHeight: function () {
            let $headerContainer = jQuery(this.attrHeaderContainer);
            let $detailContainer = jQuery(this.detailContainerNode);
            let offset = 70;


            // console.log("Updating editor height", $detailContainer.height(), attrContainerHeight, offset);
            this.editor.setHeightForced($detailContainer.height() - $headerContainer.height() - offset);
        },

        _generateHtmlForFields: function (fields, wiocclNode) {
            switch (wiocclNode.type) {
                case 'function':
                    return this._generateHtmlForParams(fields, wiocclNode);

                case 'field':
                // TODO: els camps han de fer servir un combobox, però aquest
                // sistema no està preparat per treballar amb widgets, només amb html
                case 'content':
                    return this._generateHtmlForGenerics(fields, wiocclNode);

                default:
                    return this._generateHtmlForAttrs(fields, wiocclNode);

            }
        },

        _generateHtmlForParams: function (fields, wiocclNode) {
            let html = '';

            let paramMap = new Map();

            let instruction = this.structure.getInstructionName(wiocclNode);
            let functionDefinition = this.structure.getFunctionDefinition(instruction);


            for (let i = 0; i < functionDefinition.params.length; i++) {
                paramMap.set(functionDefinition.params[i].name, functionDefinition.params[i]);
            }

            // for (let field in fields) {
            for (let [field, param] of paramMap) {
                // console.log("Processing ", field, param);

                // let types = paramMap.get(field).type;
                let types = param.type;

                if (Array.isArray(types)) {
                    types = types.join('|');
                }

                // Es necessari eliminar el escape de les dobles cometes
                // TODO: ALERTA! Caldrà tornar-lo a afegir abans d'enviar-lo

                let value;

                if (fields[field]) {
                    value = fields[field].replaceAll('\"', '&quot;');
                } else if (param.default) {
                    value = param.default;
                } else {
                    value = '';
                }


                let isStringField = value.startsWith('"{##') || value.startsWith("''{##");

                value = value.replace(/^("+|'{2,})+/g, '');
                value = value.replace(/("+|'{2,})+$/g, '');

                // reafegim normalitzat si escau
                if (isStringField) {
                    value = `''${value}''`;
                }

                let optional = '';
                if (param.optional) {
                    optional = '[opcional]';
                }

                html += '<div class="wioccl-field" data-attr-field="' + field + '">';
                html += `<label>${field} <span>(${types})${optional}</span></label>`;
                html += '<input type="text" name="' + field + '" value="' + value + '"/>';
                html += '<button data-button-edit>wioccl</button>';
                html += '</div>';
            }

            return html;
        },

        _generateHtmlForAttrs: function (fields, wiocclNode) {
            // console.log("_generateHtmlForAttrs", fields, wiocclNode);
            let html = '';

            let attrsMap = new Map();

            let instruction = this.structure.getInstructionName(wiocclNode);
            let keywordDefinition = this.structure.getKeywordDefinition(instruction);


            for (let i = 0; i < keywordDefinition.attrs.length; i++) {
                attrsMap.set(keywordDefinition.attrs[i].name, keywordDefinition.attrs[i]);
            }

            for (let [name, attr] of attrsMap) {

                let types = attr.type;

                if (Array.isArray(types)) {
                    types = types.join('|');
                }

                let value;

                if (fields[name]) {
                    value = fields[name].replaceAll('\"', '&quot;');
                } else {
                    // TODO: Gestionar si és opcional o no
                    value = '';
                }

                let optional = '';
                if (attr.optional) {
                    optional = '[opcional]';
                }
                html += '<div class="wioccl-field" data-attr-field="' + name + '">';
                // html += `<label>${field} <span>(${types})</span></label>`;
                html += `<label>${name} <span>(${types})${optional}</span></label>`;
                html += '<input type="text" name="' + name + '" value="' + value + '"/>';
                html += '<button data-button-edit>wioccl</button>';
                html += '</div>';
            }


            // ALERTA[Xavi] Prova reconstrucció dels siblings indirecte
            // Això fa que s'afegeixin els siblings correctament
            this.structure.getInner(wiocclNode)


            // Afegim un botó adicional per editar el contingut
            // TODO: això no és un field, és el valor rebuild dels children

            // let value = this.structure.getInner(wiocclNode);

            // ALERTA! el codi intern contè < i >, s'han de reemplaçar
            // value = value.replaceAll('<', '&lt;').replaceAll('>', '&gt;');

            // console.log("inner amb htmlentities:", value);

            // Amb la implementació actual això no te sentit, es pot editar utilitzant el botó wioccl o inserir
            // nous elements mitjançant els altres botons
            // html += '<div class="wioccl-textarea" data-inner-field="inner">';
            // html += `<label>Contingut intern<span>(prem el botó per editar)</span></label>`;
            // html += '<textarea type="text" name="inner" disabled title="Per editar el contingut prem el botó">' + value + '</textarea>';
            // html += '<button data-button-edit>editar</button>';
            // html += '</div>';

            return html;
        },

        _generateHtmlForGenerics: function (fields, wiocclNode) {
            let html = '';
            for (let field in fields) {
                // console.log("[test]", field);

                // Es necessari eliminar el escape de les dobles cometes
                // TODO: ALERTA! Caldrà tornar-lo a afegir abans d'enviar-lo
                let valor = fields[field].replaceAll('\"', '&quot;');

                html += '<div class="wioccl-field" data-attr-field="' + field + '">';
                html += `<label>${field}</label>`;
                html += '<input type="text" name="' + field + '" value="' + valor + '"/>';
                html += '<button data-button-edit>wioccl</button>';
                html += '</div>';
            }

            // ALERTA[Xavi] Prova reconstrucció dels siblings indirecte
            // Això fa que s'afegeixin els siblings correctament
            this.structure.getInner(wiocclNode)

            return html;
        },

        _pendingChanges: null,


        _setAttrs: function (fields, wiocclNode) {
            let $attrContainer = jQuery(this.attrContainerNode);

            $attrContainer.empty();

            let $fields = jQuery(this._generateHtmlForFields(fields, wiocclNode))

            let context = this;

            $fields.find('[data-button-edit]').on('click', function (e) {

                let $input = jQuery(this).siblings('input, textarea');
                let value = $input.val();

                let structure = new WiocclStructureTemp({}, context.dispatcher);
                let rootWiocclNode = structure.getRoot();

                structure.parse(value, rootWiocclNode);
                let refId = rootWiocclNode.id;

                let tree = structure.getTreeFromNode(refId, true);

                let depth = context.depth ? context.depth * 3 : 0;

                let wiocclDialog = new DojoWioccDialog({
                    title: 'Edició wioccl (subdiàleg)',
                    // style: 'height:100%; width:100%; top:0; left:0; position:absolute; max-width: 80%; max-height: 80%;',
                    // No es pot desplaçar perquè es calcula automàticament la posició i ajusta el top, left, etc.
                    // així que canviem la mida segons la profunditat;
                    style: 'height:100%; width:100%; top:0; left:0; position:absolute; max-width: ' + (77 - depth) + '%; max-height: ' + (77 - depth) + '%;',
                    depth: context.depth ? context.depth + 1 : 1,

                    onHide: function (e) { //Voliem detectar el event onClose i hem hagut de utilitzar onHide
                        this.destroyRecursive();
                        context.backup = null;
                    },
                    id: 'wioccl-dialog_inner' + counter,
                    firstResize: true,
                    dispatcher: context.dispatcher,
                    args: {
                        id: 'wioccl-dialog_inner' + counter,
                        // value: context.source.getCode(tree[0], outStructure)
                        value: structure.getCode(tree[0])
                    },
                    wioccl: rootWiocclNode,
                    // structure: outStructure,
                    structure: structure,
                    tree: tree,
                    refId: refId,
                    saveCallback: function () {
                        // console.log("Subdialeg saveCallback");

                        // this és correcte, fa referència al nou dialog que s'instància
                        this.structure.parse(this.editor.getValue(), this.editor.wioccl);
                        // this.source.parseWiocclNew(this.editor.getValue(), this.editor.wioccl, outStructure, this);
                        let text = this.structure.getCode(this.structure.getNodeById(refId));


                        $input.val(text);
                        $input.trigger('change');

                        wiocclDialog.destroyRecursive();
                    },
                    // saveCallback : context._save.bind(context),
                    updateCallback: function (editor) {
                        // console.log("Subdialeg updateCallback");
                        // this.source.parse(editor.getValue(), editor.wioccl, this.getStructure());
                        // this és correcte, fa referència al nou dialog que s'instància
                        this.structure.updating = true;


                        this.structure.discardSiblings();

                        this.structure.updating = false;

                        this.structure.restore();

                        // actulitzem el node de l'editor amb el restaurat
                        editor.wioccl = this.structure.getNodeById(editor.wioccl.id);

                        this.setData(this.structure.getNodeById(refId), rootWiocclNode);
                    },
                    enabledDelete: false

                });

                counter++;

                wiocclDialog.startup();

                wiocclDialog.show();


                // console.log(outRoot);
                // wiocclDialog._setFields(wiocclDialog._extractFieldsFromWiocclNode(rootWiocclNode));
                wiocclDialog._updateFields(rootWiocclNode);
                wiocclDialog._updateDetail(rootWiocclNode);
            });


            $fields.find('input, textarea').on('change', function (e) {
                // $fields.find('input, textarea').on('input change', function (e) {
                context._fieldChanges = true;

                // ALERTA! Descartada l'actualització mitjançant el timer (i l'input),
                // ara només respon al change, perquè amb el input es perd
                // el focus real quan s'actualitza el detall però no es dispara l'esdeveniment blur per
                // detectar-lo i no es pot fer un refocus (ho ignora)

                // console.log("es input o es change?",e.type );
                // if (UPDATE_TIME === 0 || (e.type === 'change' && !this.updatingFields)) {

                context._pendingChanges_Field2Detail = true
                context._updatePendingChanges_Field2Detail();

                // ALERTA! Descartada l'actualització mitjançant el timer,
                // ara només respon al change, perquè amb el input es perd
                // el focus real quan s'actualitza el detall però no es dispara l'esdeveniment blur per
                // detectar-lo i no es pot fer un refocus (ho ignora)
                // } else {
                //     // } else if (!context._pendingChanges_Field2Detail) {
                //     // Refresquem el timer per evitar la perdua de focus
                //     console.log("reset timeout");
                //     clearTimeout(context.timerId_Field2Detail);
                //     context.timerId_Field2Detail = setTimeout(context._updatePendingChanges_Field2Detail.bind(context), UPDATE_TIME);
                //     context._pendingChanges_Field2Detail = true;
                // }

            });

            $attrContainer.append($fields);
            this._updateEditorHeight();
        },

        setData: function (rootWiocclNode, selectedWiocclNode, ignoreRebranch) {
            // console.error('setData', rootWiocclNode, selectedWiocclNode);

            if (!ignoreRebranch) {

                let tree = [];

                // TODO: Eliminar, això ja no fa falta
                if (selectedWiocclNode.addedsiblings) {
                    console.log("Hi ha siblings, canviem el rootnode");
                    // console.error("root.parent ", rootWiocclNode.parent, "old root", rootWiocclNode, "expected root", this.structure.getNodeById(rootWiocclNode.parent));
                    // root = this.structure[root.parent];
                    rootWiocclNode = this.structure.getNodeById(rootWiocclNode.parent);

                    // console.error("Modificant el root, canviat ", this.structure.root, "per:", rootWiocclNode.id);
                    this.structure.root = rootWiocclNode.id;
                    // this.root = root.id;

                    // console.log("*** nous sibblings");
                }

                // això cal canviar-ho si no és un rebranch?
                rootWiocclNode.name = rootWiocclNode.type ? rootWiocclNode.type : rootWiocclNode.open;

                rootWiocclNode.children = this.structure._getChildrenNodes(rootWiocclNode.children, rootWiocclNode.id);

                tree.push(rootWiocclNode);
                // console.log("node afegit al tree:", rootWiocclNode);

                // console.log(tree, rootWiocclNode, selectedWiocclNode);
                this.updateTree(tree, rootWiocclNode, selectedWiocclNode);
            }


            // ALERTA! és diferent fer això que agafar el selected, ja que el selected era l'element original que hara
            // pot trobar-se dividit en múltiples tokens
            this._updateDetail(this.structure.getNodeById(selectedWiocclNode.id));

            // this.wiocclDialog._updateDetail(structure[selected.id]);
        },

        destroy: function () {
            this.inherited(arguments);

            if (this.timerId_Field2Detail) {
                clearTimeout(this.timerId_Field2Detail);
            }

            if (this.timerId_Detail2Field) {
                clearTimeout(this.timerId_Detail2Field);
            }

        },

        _updatePendingChanges_Field2Detail: function () {

            if (!this._pendingChanges_Field2Detail) {
                return;
            }


            let $attrContainer = jQuery(this.attrContainerNode);


            // let context = this;

            let extractedFields = this._extractFieldsFromWiocclNode(this.selectedWiocclNode);
            // console.log("ExtractedFields:", extractedFields);

            $attrContainer.find('[data-attr-field] input').each(function () {

                let $fieldContainer = jQuery(this).closest('[data-attr-field]');
                let attrField = $fieldContainer.attr('data-attr-field');
                let attrValue = $fieldContainer.find('input').val();


                // Reemplacem l'atribut
                extractedFields[attrField] = attrValue;
            });

            let innerValue;
            $attrContainer.find('[data-inner-field] textarea').each(function () {
                let $innerContainer = jQuery(this).closest('[data-inner-field]');
                innerValue = $innerContainer.find('textarea').val();
                innerValue.replaceAll('&lt;', '<').replaceAll('&gt;', '>');
            });

            // reconstruim els atributs com a string
            let rebuildAttrs = this._rebuildAttrs(extractedFields, this.selectedWiocclNode);
            // Re assignem els nous atributs
            this.selectedWiocclNode.attrs = rebuildAttrs;


            if (this.selectedWiocclNode.type === 'content') {
                this.selectedWiocclNode.open = extractedFields['content'];
            }

            // Refresquem el wioccl associat a l'editor amb el valor actual
            // console.log("wioccl a l'editor:", this.editor.wioccl)
            // console.log("wioccl a l'estructura:", this.structure.getNodeById(this.editor.wioccl.id));
            this.editor.wioccl = this.structure.getNodeById(this.editor.wioccl.id);


            if (innerValue) {
                let code = this.structure.getCodeWithInner(this.selectedWiocclNode, innerValue);
                this.structure.parse(code, this.selectedWiocclNode);


                // restablim els nodes, perquè s'ha modificat a l'estructura
                this.selectedWiocclNode = this.structure.getNodeById(this.selectedWiocclNode.id);
                this.editor.wioccl = this.structure.getNodeById(this.editor.wioccl.id);
            }

            // Cal actualitzar el node a la estructura
            this.structure.setNode(this.selectedWiocclNode);

            this._updateDetail(this.editor.wioccl, true);

            this._pendingChanges_Field2Detail = false;

            clearInterval(this.timerId_Field2Detail);

        },

        _updatePendingChanges_Detail2Field: function () {
            // console.log("_updatePendingChanges_Detail2Field");
            // console.warn("desactivat Detail2Field");
            // return;

            if (!this._pendingChanges_Detail2Field) {
                return;
            }

            this.timerId_Detail2Field = false;
            this._pendingChanges_Detail2Field = false;

            // Ens assegurem que no estem actualitzant
            this.updating = true;


            let value = this.editor.getValue();

            if (value.length === 0) {
                // TODO: buidar els atributs
                console.warn('TODO: eliminar atributs, el valor és buit');
                return;
            }

            let wiocclNode = this.structure.parse(value, this.editor.wioccl);

            this.setData(this.structure.getNodeById(this.structure.root), wiocclNode, true);


            // ALERTA! si s'ha afegit un sibbling anterior this.editor.wioccl ja no conté suficient informació!!


            let candidateWiocclNode = this.structure.getNodeById(this.editor.wioccl.id);
            this.structure.rebuildPosMap(candidateWiocclNode);

            let updatedWioccl = this._getWiocclForCurrentPos();
            this._selectWiocclNode(updatedWioccl);

            this._updateFields(updatedWioccl);

            this.updating = false;


        },


        _selectWiocclNode(wiocclNode) {
            // console.warn('selecting wioccl:', wiocclNode);

            this._updateLegend(wiocclNode);
            this._updateInstructionHtml(wiocclNode);
            this.selectedWiocclNode = wiocclNode;
        },

        _updateLegend: function (wiocclNode) {
            let text;

            switch (wiocclNode.type) {
                case "content":
                    text = "content";
                    break;
                case "field":
                    text = "field";
                    break;
                default:
                    text = wiocclNode.open + wiocclNode.close;
                    text = text.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
                        return '&#' + i.charCodeAt(0) + ';';
                    });

            }
            jQuery(this.attrLegendNode).html(text);
        },

        _updateInstructionHtml: function (wiocclNode) {
            // console.log("_updateInstructionHtml", wiocclNode);
            // TODO: Afegir al template una secció nova dojo- per afegir el selector:
            //      - funció
            //      - instrucció wioccl


            let instruction = '';

            switch (wiocclNode.type) {
                case 'function':
                    this._updateFunctionHtml(wiocclNode);
                    break;

                case 'field':
                case 'content':
                    // només amaguem el contenidor del selector d'sintruccions
                    let $instruction = jQuery(this.wiocclInstruction);
                    $instruction.html('');
                    break;

                default:
                    // keyword
                    this._updateKeywordHtml(wiocclNode);
            }

        },

        _updateKeywordHtml: function (wiocclNode) {
            let instruction = this.structure.getInstructionName(wiocclNode);

            let html = '';

            let def = this.structure.getKeywordDefinition(instruction);
            // console.log("Definition?", def);

            if (!def.hidden) {
                html += '<div class="wioccl-field">';
                html += '<label>Type:</label>';
                // html += '<input type="text" name="' + instruction + '" value="' + instruction + '"/>';
                html += '<select name="' + instruction + '">';

                let keywordNames = this.structure.getKeywordNames();
                // console.log("Function names:", functionNames);
                for (let name of keywordNames) {
                    let selected = name === instruction ? 'selected' : '';
                    html += `<option value="${name}" ${selected}>${name}</option>`;
                }


                html += '</select>';
                // html += '<button data-button-edit>change</button>';
                html += '</div>';
            }


            let $instruction = jQuery(this.wiocclInstruction);
            $instruction.html(html);

            let context = this;

            $instruction.find('select').on('change input', function () {
                let value = jQuery(this).val();
                // console.log("seleccionat:", value);

                context.structure.updateKeywordName(wiocclNode, value);

                // context.structure.updateFunctionName(wiocclNode, value);

                context._updateLegend(wiocclNode)
                context._updateFields(wiocclNode);

                let extractedFields = context._extractFieldsFromWiocclNode(context.selectedWiocclNode);

                let rebuildAttrs = context._rebuildAttrs(extractedFields, context.selectedWiocclNode);

                // Re assignem els nous atributs
                wiocclNode.attrs = rebuildAttrs;

                context._updateDetail(wiocclNode, true)
            });
        },

        _updateFunctionHtml: function (wiocclNode) {
            // console.log("_updateInstructionHtml", wiocclNode);
            // TODO: Afegir al template una secció nova dojo- per afegir el selector:
            //      - funció
            //      - instrucció wioccl


            let instruction = this.structure.getInstructionName(wiocclNode);
            let def = this.structure.getFunctionDefinition(instruction);


            let html = '';

            if (!def.hidden) {
                html += '<div class="wioccl-field">';
                html += '<label>' + wiocclNode.type + ':</label>';
                // html += '<input type="text" name="' + instruction + '" value="' + instruction + '"/>';
                html += '<select name="' + instruction + '">';

                let functionNames = this.structure.getFunctionNames();
                for (let name of functionNames) {
                    let selected = name === instruction ? 'selected' : '';
                    html += `<option value="${name}" ${selected}>${name}</option>`;
                }

                html += '</select>';
                html += '</div>';
            }


            let $instruction = jQuery(this.wiocclInstruction);
            $instruction.html(html);

            let context = this;

            $instruction.find('select').on('change input', function () {
                let value = jQuery(this).val();
                // console.log("seleccionat:", value);
                context.structure.updateFunctionName(wiocclNode, value);
                context._updateLegend(wiocclNode)
                context._updateFields(wiocclNode);

                let extractedFields = context._extractFieldsFromWiocclNode(context.selectedWiocclNode);
                let rebuildAttrs = context._rebuildAttrs(extractedFields, context.selectedWiocclNode);
                // Re assignem els nous atributs
                wiocclNode.attrs = rebuildAttrs;

                context._updateDetail(wiocclNode, true)
                // fer this.structure.updateFunction(wioccl, instruction);
            });


        },

        // TODO: Valorar si això és més adient aquí o al WiocclStructureBase
        _rebuildAttrs: function (fields, wiocclNode) {

            let type = wiocclNode.type;
            let rebuild = '';

            // console.log('type', wiocclNode.type);

            switch (type) {

                case 'content':
                    rebuild = this._rebuildAttrsContent(fields, wiocclNode);
                    break;

                case 'field':
                    rebuild = this._rebuildAttrsField(fields, wiocclNode);
                    break;

                case 'function':

                    rebuild = this._rebuildAttrsFunction(fields, wiocclNode);

                    break;

                default:
                    // Instrucció
                    rebuild = this._rebuildAttrsKeyword(fields, wiocclNode);

            }

            // console.log("fields rebuilt:", rebuild);
            return rebuild;
        },

        _rebuildAttrsContent: function (fields, wiocclNode) {
            // és content, no cal fer res
            return '';
        },

        _rebuildAttrsField: function (fields, wiocclNode) {
            return fields['field'];
        },

        _rebuildAttrsFunction: function (fields, wiocclNode) {
            let rebuild = '';
            let first = true;
            let instruction = this.structure.getInstructionName(wiocclNode);
            let functionDefinition = this.structure.getFunctionDefinition(instruction);

            let paramMap = new Map();
            for (let i = 0; i < functionDefinition.params.length; i++) {
                paramMap.set(functionDefinition.params[i].name, functionDefinition.params[i]);
            }

            // TODO: fer un rebuild dels paràmetres, afegint les '' segons el type i assignar el valor de fiels[name] si e stroba

            console.log("Rebuilding", fields, paramMap);

            for (let [name, param] of paramMap) {
                // console.log("Processing ", name, param);

                // Si és opcinal i el camp és buit, no afegim res
                if (param.optional && (!fields[name] || fields[name].length === 0)) {
                    continue;
                }

                // for (let name in fields) {
                if (first) {
                    first = false;
                } else {
                    rebuild += ',';
                }

                let value;

                if (fields[name]) {
                    value = fields[name];
                } else if (param.default) {
                    value = param.default;
                } else {
                    value = '';
                }


                // let value = fields[name];

                let types = Array.isArray(paramMap.get(name).type) ? paramMap.get(name).type : [paramMap.get(name).type];

                if (value.startsWith('[') && value.endsWith(']')) {
                    // És un array, comprovem que sigui un tipus vàlid
                    if (!types.includes("array")) {
                        console.error("S'ha detectat un array però el camp no accepta aquest tipus. Tipus acceptats:", types);
                        alert("S'ha detectat un array però el camp " + name + " no accepta aquest tipus. Tipus acceptats:" + types);
                    }

                } else if ((value.startsWith('{##') && value.endsWith('##}'))
                    || (value.startsWith("''{##") && value.endsWith("##}'"))
                    || (value.startsWith('"{##') && value.endsWith('##}"'))
                ) {
                    // És un camp, no podem saber si és un array o un string, en cas de ser un string s'han
                    // d'afegir manualment les dobles cometes

                    // Normalitzem l'ús de les cometes dobles
                    let isString = value.startsWith("''") || value.startsWith("");
                    value = value.replace(/^("+|'{2,})+/g, '');
                    value = value.replace(/("+|'{2,})+$/g, '');

                    if (isString) {
                        value = `''${value}''`;
                    }


                } else {
                    // Comprovem els tipus de camp i si el valor és un string o date i afegim les dobles cometes

                    // Eliminem les "* i les ''* del principi i del final
                    value = value.replace(/^("+|'{2,})+/g, '');
                    value = value.replace(/("+|'{2,})+$/g, '');

                    // console.log("[**]:", name, types, value)
                    for (let i = 0; i < types.length; i++) {

                        if (types[i] === 'string'
                            || types[i] === 'date') {
                            value = "''" + value + "''";
                            // console.log("[**]Afegides cometes:", value);

                            break;
                        }
                    }
                }

                rebuild += value;
            }

            return rebuild;
        },

        _rebuildAttrsKeyword: function (fields, wiocclNode) {
            let rebuild = '';
            let first = true;
            let instruction = this.structure.getInstructionName(wiocclNode);
            let keywordDefinition = this.structure.getKeywordDefinition(instruction);

            let attrsMap = new Map();
            for (let i = 0; i < keywordDefinition.attrs.length; i++) {
                attrsMap.set(keywordDefinition.attrs[i].name, keywordDefinition.attrs[i]);
            }

            // Differencia amb la gestió de funcions: no s'han de fer servir cometes i en lloc de separar per ,
            // es separa per espais


            // TODO: ALERTA! La reconstrucció s'ha de fer (a function també) a partir dels atributs definits
            // no dels camps!!

            for (let [name, attr] of attrsMap) {

                // Si és opcinal i el camp és buit, no afegim res
                if (attr.optional && (!fields[name] || fields[name].length === 0)) {
                    continue;
                }

                if (first) {
                    first = false;
                } else {
                    rebuild += ' ';
                }

                let value;

                if (fields[name]) {
                    value = fields[name];
                } else {
                    value = '';
                }


                let types = Array.isArray(attr.type) ? attr.type : [attr.type];

                if (value.startsWith('[') && value.endsWith(']')) {
                    // És un array, comprovem que sigui un tipus vàlid
                    if (!types.includes("array")) {
                        console.error("S'ha detectat un array però el camp no accepta aquest tipus. Tipus acceptats:", types);
                        alert("S'ha detectat un array però el camp " + name + " no accepta aquest tipus. Tipus acceptats:" + types);
                    }

                }

                // rebuild += value;

                rebuild += name + '=\"' + value + '\"';
            }

            return rebuild;
        },


        createEditor: function () {
            let suffixId = (this.args.id + Date.now() + Math.random()).replace('.', '-'); // id única

            let args = this.args;
            args.id = suffixId;

            let id = this.dispatcher.getGlobalState().getCurrentId();
            let contentToolFactory = this.dispatcher.getContentCache(id).getMainContentTool().contentToolFactory;

            let editorWidget = contentToolFactory.generate(contentToolFactory.generation.BASE, args);

            let $textarea = jQuery(this.textareaNode);

            let $container = jQuery(this.editorContainerNode);

            let $toolbar = jQuery(this.toolbarNode);

            $textarea.attr('id', 'textarea_' + suffixId);
            $container.attr('id', 'container_' + suffixId);
            $toolbar.attr('id', 'toolbar_' + suffixId);

            $container.append(editorWidget);

            toolbarManager.createToolbar('toolbar_' + suffixId, 'simple');

            let editor = new AceFacade({
                id: 'editor_' + suffixId,
                auxId: suffixId,
                containerId: editorWidget.id,
                textareaId: 'textarea_' + suffixId,
                theme: JSINFO.plugin_aceeditor.colortheme,
                wraplimit: JSINFO.plugin_aceeditor.wraplimit, // TODO: determinar el lmit correcte
                wrapMode: true,
                dispatcher: this.dispatcher,
                content: args.value,
                originalContent: args.value,
                // TOOLBAR_ID: toolbarId,
                TOOLBAR_ID: 'full-editor',
                ignorePatching: true,
                plugins: [],
            });

            // ja no és necessari
            // this.source.dialogEditor = editor;

            // Per defecte s'assigna el primer node


            editor.wioccl = this.wioccl;

            this.editor = editor;

            let context = this;


            editor.on('change', function (e) {
                // console.log("Changes detected", e, context.updating);

                context.updateInsertButtons();

                // Si el focus es troba a un element amb data-wioccl-btn és que ha modificat l'editor i per tant
                // cal actualitzar
                // Afegida la comprovació de dirty perque si no no poden inserir-se elements desde un custom dialog
                if (context.updating || (!context.dirty && !context.editor.hasFocus()
                    && jQuery(document.activeElement).attr('data-wioccl-btn') === undefined)) {
                    // no s'actualitza l'editor
                    return;
                }

                if (UPDATE_TIME === 0) {
                    context._updatePendingChanges_Detail2Field();

                } else if (!context._pendingChanges_Detail2Field) {
                    context.timerId_Detail2Field = setTimeout(context._updatePendingChanges_Detail2Field.bind(context), UPDATE_TIME);
                    context._pendingChanges_Detail2Field = true;
                } else {
                    // console.log('no pending changes?', context._pendingChanges_Detail2Field);
                }

            });


            // Cal fer un tractament diferent pel focus, aquest només es dispara quan
            // efectivament s'ha fet click, però es dispara abans de que s'estableixi
            // la posició??
            // ALERTA! si no és fa el bind, la referència a _updateNodeForPosition és l'editor
            editor.on('focus', context._updateNodeForPosition.bind(context));

            editor.on('changeCursor', function (e) {
                // Problema, això fa que s'ignori la carrega i quan es fa a clic
                // però si no es fica es dispara quan es modifica el valor directament amb set value
                if (!editor.hasFocus()) {
                    // console.log("no te focus", e);
                    return;
                }

                let pos = editor.getPositionAsIndex(!context.dirty);

                let candidateWiocclNode = context.structure._getNodeForPos(pos);

                // console.log(pos, candidate);

                // Si es dirty es que s'acava de canviar el valor, cal eliminar la selecció
                if (context.dirty) {
                    context.editor.clearSelection();
                    context.dirty = false;
                }

                if (context.selectedWiocclNode === candidateWiocclNode && pos === context.prevPos) {
                    // console.log("El seleccionat és el mateix que el actual? (no fem el extract)", context.selectedWioccl, candidate)
                    return;
                }

                // let auxFields = context._extractFieldsFromWiocclNode(candidateWiocclNode);

                context._selectWiocclNode(candidateWiocclNode);
                // context._setFields(auxFields);
                context._updateFields(candidateWiocclNode);

                context.updateInsertButtons();
                this.prevPos = pos;

            });

            this._updateEditorHeight();
        },

        _updateNodeForPosition: function (e) {
            this.lastPos = this.editor.getPositionAsIndex(false);
            let candidateWiocclNode = this.structure._getNodeForPos(this.lastPos);

            this._selectWiocclNode(candidateWiocclNode);
            // context._setFields(auxFields);
            this._updateFields(candidateWiocclNode);


            // *********************** //
            // S'ha de reconstruir el map aquí, per no modificar el selected mentre
            // s'edita el camp
            this.structure.rebuildPosMap(this.structure.getNodeById(this.editor.wioccl.id));
            let wiocclNode = this.structure._getNodeForPos(this.lastPos);
            this._selectWiocclNode(wiocclNode);

            this.updateInsertButtons();
        },

        _getWiocclForCurrentPos: function () {
            let pos;
            let cursor = {row: 0, column: 0}


            if (this.editor.hasFocus()) {
                pos = this.editor.getPositionAsIndex(true);
                cursor = this.editor.getPosition();

                this.lastPos = pos;
                this.lastCursor = cursor;

            } else {
                pos = this.lastPos;
                cursor = this.lastCursor;
            }

            this.wasFocused = this.editor.hasFocus();

            // console.log("pos:", pos);
            // return this._getNodeForPos(pos);
            return this.structure._getNodeForPos(pos);
        },


        // es crida desde DojoWioccl
        updateTree: function (tree, root, selected) {
            // console.error("updateTree", tree);
            this.treeWidget.destroyRecursive();

            this.createTree(tree, root.id);

            let node = selected;
            /// corresponent al cas1, es seleccionarà el node original
            let path = [];


            while (node.parent !== null && node.id !== root.id) {
                path.unshift(node.id);
                node = this.structure.getNodeById(node.parent);
            }

            // Finalment s'afegeix el node root
            path.unshift(root.id);

            this.treeWidget.set('path', path);

        },

    });

    return DojoWioccDialog;
});
