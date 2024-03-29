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

            this._selectWiocclNode(wiocclNode)

            this.structure.rebuildPosMap(wiocclNode);
            let $updateButton = jQuery(this.updateButtonNode);
            let $saveButton = jQuery(this.saveButtonNode);
            let $cancelButton = jQuery(this.cancelButtonNode);

            let context = this;

            $cancelButton.on('click', function () {
                context.destroyRecursive();
            });

            $updateButton.on('click', function () {
                // Alerta, el context d'execució en afegir el callback al objecte de
                // configuració (pel principal és DojoWioccl)
                context.updateCallback(context.editor);
                context.structure.dirtyStructure = false;
            });

            // Als subdialegs no s'ha de mostrar el botó d'eliminar nodes
            let $deleteButton = jQuery(this.deleteBtnNode);

            if (!context.enabledDelete) {
                $deleteButton.prop('disabled', 'true');
            } else {
                $deleteButton.prop('disabled', '');
            }

            $saveButton.on('click', function () {
                // Alerta, el context d'execució en afegir el callback al objecte
                // de configuració
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
                let pos = context.editor.getPositionAsIndex();
                let node = context.structure._getNodeForPos(pos);
                let editor = context.editor;

                if (node.children.length === 0) {
                    // Les fulles donen error amb el mètode normal
                    // (el node no es troba a la estructura), però podem
                    // establir l'editor buit i en fer el parse s'elimina
                    editor.setValue('');
                } else {
                    context.structure._removeNode(node.id);
                    let currentWiocclNode = context.structure.getNodeById(context.editor.wioccl.id);
                    context._updateDetail(currentWiocclNode, false);
                    context.structure.dirtyStructure = true;
                }

                context.structure.updating = true;
                context.structure.parse(editor.getValue(), editor.wioccl);
                context.structure.updating = false;

                context.updateInsertButtons();
            });


            if (this.readonly) {
                jQuery(this.titleBar).css('background-color', 'pink');
            }
        },

        updateInsertButtons: function () {
            let pos = this._getInsertPosition()
            let currentWiocclNode = this._getWiocclForCurrentPos();
            if (currentWiocclNode.id !== this.selectedWiocclNode.id) {
                this._selectWiocclNode(currentWiocclNode);
            }

            let canInsert = this.structure.canInsert(pos, currentWiocclNode) && !this.readonly;

            // console.log("és readonly?", this.readonly);
            if (canInsert && !this.selectedWiocclNode.solo) {
                this.unlockEditor();
            } else {
                this.lockEditor();
            }

            // Els botons pel void sí que han d'estar activats per inserir l'element
            if (this.selectedWiocclNode.type === 'void') {
                canInsert = true;
            }

            jQuery(this.insertWiocclBtnNode).prop('disabled', !canInsert);
            jQuery(this.insertFieldBtnNode).prop('disabled', !canInsert);
            jQuery(this.insertFunctionBtnNode).prop('disabled', !canInsert);
            jQuery(this.deleteBtnNode).prop('disabled', !canInsert);

            //jQuery(this.updateButtonNode).prop('disabled', this.readonly);
            //jQuery(this.saveButtonNode).prop('disabled', this.readonly);
            jQuery(this.updateButtonNode).css('display', this.readonly ? 'none' : 'inherited');
            jQuery(this.saveButtonNode).css('display', this.readonly ? 'none': 'inherited');
            jQuery(this.attrHeaderContainer).prop('disabled', this.readonly);

            // Si el tipus és void o solo no pot inserir-se content,
            // el content s'ha d'inserir editant el "inner content"
            if (this.selectedWiocclNode.type === 'void' || this.selectedWiocclNode.solo) {
                canInsert = false;
            }

            jQuery(this.insertContentBtnNode).prop('disabled', !canInsert);
        },

        _insertCode: function (code) {
            let wasVoid = this.selectedWiocclNode.type === 'void';

            this.dirty = true;
            let pos = this._getInsertPosition();
            this.editor.insertIntoPos(pos, code, true);

            // ALERTA! Aquest codi es semblant al del botó update
            let structure = this.structure;
            structure.updating = true;

            let editor = this.editor;
            let wiocclNode = structure.parse(editor.getValue(), editor.wioccl);
            structure.updating = false;

            if (wasVoid) {
                this.setData(structure.getNodeById(structure.root), wiocclNode);
            }

            this.updateInsertButtons();
            this.structure.dirtyStructure = true;
        },

        _getInsertPosition() {
            let currentPosition = this.editor.getPosition();
            let pos = this.editor.getPositionAsIndex();
            let node = this.structure._getNodeForPos(pos);

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
                data: tree,
                getChildren: function (object) {
                    return object.children || [];
                }
            });

            let model = new ObjectStoreModel({
                store: store,
                query: {id: refId},
                mayHaveChildren: function (item) {
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
                        let backupWrapper = structure.structure.backupIndex[wrapper.id];

                        // Pas 3: recorrer tots els childrens al wrapper i al backupWrapper:
                        let areSimilar = wrapper ? structure.areNodesSimilar(wrapper, backupWrapper) : false;

                        // Restaurem automàticament sense avisar
                        if (areSimilar) {
                            structure.restore();
                        }

                        isDirty = !areSimilar;

                    }

                    if (isDirty || hasChanges) {
                        let descartar = confirm("S'han detectat canvis, vols descartar-los?");

                        if (!descartar) {
                            return false;
                        }

                        structure.restore();
                        context._fieldChanges = false;
                    }

                    // Alerta! aquest és l'item seleccionat, no correspón amb el restaurat i sobreescriu el backup
                    // ALERTA[Xavi] no es pot fer servir el item directament, tot i que el backup crea una copia,
                    // cal recuperar l'element de la estructura.

                    let wiocclNode = structure.getNodeById(item.id);

                    structure.rebuildPosMap(wiocclNode);
                    context.editor.setPosition({col: 0, column: 0});
                    context._updateDetail(wiocclNode);
                    context._selectWiocclNode(wiocclNode);
                    context._updateNodeForPosition();
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
            let attrs = wiocclNode.attrs.replace('&mark;', '\\>');

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

                if (wiocclNode.type !== 'function') {
                    // això és pot produir si s'esborren les dobles cometes d'un camp per exemple
                    console.error("S'ha produit un error, no és possible parsejar els camps actuals");
                }

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

                for (let i = 0; i < functionDefinition.params.length; i++) {
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

                    if (isString) {
                        value = `''${value}''`;
                    }

                    fields[paramDef.name] = value;
                }
            }

            return fields;
        },

        _extractAttrs: function (wiocclNode, type) {
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

        _updateFields: function (wiocclNode, ignoreDetail) {

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
            if (this.updating) {
                return;
            }

            if (!ignoreFields) {
                this._updateFields(wiocclNode);
            }

            let auxContent = this.structure.getCode(wiocclNode);

            if (this.editor.getValue() !== auxContent) {
                this.editor.setValue(auxContent);
                this.dirty = true;
                this.editor.resetOriginalContentState();
            }

            this.editor.wioccl = wiocclNode;

            if (wiocclNode.id === 0) {
                this.lockEditor();
                jQuery(this.detailContainerNode).css('opacity', '0.5');
            } else {
                this.unlockEditor();
                jQuery(this.detailContainerNode).css('opacity', '1');
            }
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

            this.editor.setHeightForced($detailContainer.height() - $headerContainer.height() - offset);
        },

        _generateHtmlForFields: function (fields, wiocclNode) {
            switch (wiocclNode.type) {
                case 'function':
                    return this._generateHtmlForParams(fields, wiocclNode);

                case 'field':
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

            for (let [field, param] of paramMap) {
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
                // aquest botó no fa res, però en clicar-lo es perd el focus així que s'actualitza
                html += '<button>actualitzar</button>';
                html += '</div>';
            }

            return html;
        },

        _generateHtmlForAttrs: function (fields, wiocclNode) {
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
                html += `<label>${name} <span>(${types})${optional}</span></label>`;
                html += '<input type="text" name="' + name + '" value="' + value + '"/>';
                html += '<button data-button-edit>wioccl</button>';
                // aquest botó no fa res, però en clicar-lo es perd el focus així que s'actualitza
                html += '<button>actualitzar</button>';
                html += '</div>';
            }

            return html;
        },

        _generateHtmlForGenerics: function (fields, wiocclNode) {
            let html = '';
            for (let field in fields) {



                // Es necessari eliminar el escape de les dobles cometes
                // TODO: ALERTA! Caldrà tornar-lo a afegir abans d'enviar-lo
                let valor = fields[field].replaceAll('\"', '&quot;');

                html += '<div class="wioccl-field" data-attr-field="' + field + '">';
                html += `<label>${field}</label>`;

                if (field === 'content') {
                    html += '<textarea name="' + field + '">' + valor + '</textarea>';
                } else {
                    html += '<input type="text" name="' + field + '" value="' + valor + '"/>';
                }

                html += '<button data-button-edit>wioccl</button>';
                // aquest botó no fa res, però en clicar-lo es perd el focus així que s'actualitza
                html += '<button>actualitzar</button>';
                html += '</div>';
            }

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

                // Hem de fer un unsanitize perquè els &mark; que es trobaven com atribut ara
                // es poden trobar al content
                value = structure._unsanitize(value);

                structure.parse(value, rootWiocclNode, true);
                let refId = rootWiocclNode.id;

                let tree = structure.getTreeFromNode(refId, true);

                let depth = context.depth ? context.depth * 3 : 0;

                let wiocclDialog = new DojoWioccDialog({
                    title: 'Edició wioccl (subdiàleg)',
                    // No es pot desplaçar perquè es calcula automàticament la posició i ajusta el top, left, etc.
                    // així que canviem la mida segons la profunditat;
                    style: 'height:100%; width:100%; top:0; left:0; position:absolute; max-width: ' + (77 - depth) + '%; max-height: ' + (77 - depth) + '%;',
                    depth: context.depth ? context.depth + 1 : 1,

                    onHide: function (e) {
                        this.destroyRecursive();
                        context.backup = null;
                    },
                    id: 'wioccl-dialog_inner' + counter,
                    firstResize: true,
                    dispatcher: context.dispatcher,
                    args: {
                        id: 'wioccl-dialog_inner' + counter,
                        value: structure.getCode(tree[0])
                    },
                    wioccl: rootWiocclNode,
                    structure: structure,
                    tree: tree,
                    refId: refId,
                    saveCallback: function () {
                        // this és correcte, fa referència al nou dialog que s'instància
                        let node = this.structure.getNodeById(this.editor.wioccl.id)
                        // this.structure.parse(this.editor.getValue(), this.editor.wioccl);
                        // S'ha d'ignorar el sanitize
                        this.structure.parse(this.editor.getValue(), node, true);
                        let text = this.structure.getCode(this.structure.getNodeById(refId));


                        $input.val(text);
                        $input.trigger('change');

                        wiocclDialog.destroyRecursive();
                    },
                    updateCallback: function (editor) {
                        // this és correcte, fa referència al nou dialog que s'instància
                        this.structure.restore();

                        // actulitzem el node de l'editor amb el restaurat
                        editor.wioccl = this.structure.getNodeById(editor.wioccl.id);
                        this.setData(this.structure.getNodeById(refId), rootWiocclNode);
                    },

                    enabledDelete: false,
                    readonly: context.readonly
                });

                counter++;
                wiocclDialog.startup();
                wiocclDialog.show();
                wiocclDialog._updateFields(rootWiocclNode);
                wiocclDialog._updateDetail(rootWiocclNode);
            });

            $fields.find('input, textarea').on('change', function (e) {
                context._fieldChanges = true;

                context._pendingChanges_Field2Detail = true
                context._updatePendingChanges_Field2Detail();
            });

            $attrContainer.append($fields);
            this._updateEditorHeight();
        },

        setData: function (rootWiocclNode, selectedWiocclNode, ignoreRebranch) {

            if (!ignoreRebranch) {

                let tree = [];

                rootWiocclNode.name = rootWiocclNode.name? rootWiocclNode.name : (rootWiocclNode.type ? rootWiocclNode.type : rootWiocclNode.open);
                rootWiocclNode.children = this.structure._getChildrenNodes(rootWiocclNode.children, rootWiocclNode.id);
                tree.push(rootWiocclNode);
                this.updateTree(tree, rootWiocclNode, selectedWiocclNode);
            }

            // ALERTA! és diferent fer això que agafar el selected, ja que el selected
            // era l'element original que hara pot trobar-se dividit en múltiples tokens
            this._updateDetail(this.structure.getNodeById(selectedWiocclNode.id));
        },

        destroy: function () {
            this.inherited(arguments);

            if (this.timerId_Detail2Field) {
                clearTimeout(this.timerId_Detail2Field);
            }
        },

        _updatePendingChanges_Field2Detail: function () {
            if (!this._pendingChanges_Field2Detail) {
                return;
            }

            let $attrContainer = jQuery(this.attrContainerNode);

            let extractedFields = this._extractFieldsFromWiocclNode(this.selectedWiocclNode);


            $attrContainer.find('[data-attr-field] input, [data-attr-field] textarea').each(function () {
                let $fieldContainer = jQuery(this).closest('[data-attr-field]');
                let attrField = $fieldContainer.attr('data-attr-field');
                let attrValue = $fieldContainer.find('input, textarea').val();
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
        },

        _updatePendingChanges_Detail2Field: function () {
            if (!this._pendingChanges_Detail2Field) {
                return;
            }

            this.timerId_Detail2Field = false;
            this._pendingChanges_Detail2Field = false;

            // Ens assegurem que no estem actualitzant
            this.updating = true;

            let value = this.editor.getValue();

            if (value.length === 0) {
                // TODO: buidar els atributs? aquest cas es dòna?
                console.warn('TODO: eliminar atributs, el valor és buit');
                return;
            }

            let wiocclNode = this.structure.parse(value, this.editor.wioccl);

            this.setData(this.structure.getNodeById(this.structure.root), wiocclNode, true);

            let candidateWiocclNode = this.structure.getNodeById(this.editor.wioccl.id);
            this.structure.rebuildPosMap(candidateWiocclNode);
            let updatedWioccl = this._getWiocclForCurrentPos();
            this._selectWiocclNode(updatedWioccl);
            this._updateFields(updatedWioccl);
            this.updating = false;
        },

        _selectWiocclNode(wiocclNode) {
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

            if (!def.hidden) {
                html += '<div class="wioccl-field">';
                html += '<label>Type:</label>';
                html += '<select name="' + instruction + '">';

                let keywordNames = this.structure.getKeywordNames();
                for (let name of keywordNames) {
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
                context.structure.updateKeywordName(wiocclNode, value);
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
            let instruction = this.structure.getInstructionName(wiocclNode);
            let def = this.structure.getFunctionDefinition(instruction);

            let html = '';

            if (!def.hidden) {
                html += '<div class="wioccl-field">';
                html += '<label>' + wiocclNode.type + ':</label>';
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
                context.structure.updateFunctionName(wiocclNode, value);
                context._updateLegend(wiocclNode)
                context._updateFields(wiocclNode);

                let extractedFields = context._extractFieldsFromWiocclNode(context.selectedWiocclNode);
                let rebuildAttrs = context._rebuildAttrs(extractedFields, context.selectedWiocclNode);
                // Re assignem els nous atributs
                wiocclNode.attrs = rebuildAttrs;

                context._updateDetail(wiocclNode, true)
            });
        },

        // TODO: Valorar si això és més adient aquí o al WiocclStructureBase
        _rebuildAttrs: function (fields, wiocclNode) {
            let type = wiocclNode.type;
            let rebuild = '';

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

            for (let [name, param] of paramMap) {
                // Si és opcinal i el camp és buit, no afegim res
                if (param.optional && (!fields[name] || fields[name].length === 0)) {
                    continue;
                }

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

                    for (let i = 0; i < types.length; i++) {
                        if (types[i] === 'string' || types[i] === 'date') {
                            value = "''" + value + "''";
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
            // es separa per espais.

            // ALERTA! La reconstrucció s'ha de fer a partir dels atributs definits, no dels camps!!

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
                TOOLBAR_ID: 'full-editor',
                ignorePatching: true,
                plugins: [],
            });

            // Per defecte s'assigna el primer node
            editor.wioccl = this.wioccl;
            this.editor = editor;
            let context = this;

            editor.on('change', function (e) {
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
                    return;
                }

                let pos = editor.getPositionAsIndex(!context.dirty);
                let candidateWiocclNode = context.structure._getNodeForPos(pos);

                // Si es dirty es que s'acava de canviar el valor, cal eliminar la selecció
                if (context.dirty) {
                    context.editor.clearSelection();
                    context.dirty = false;
                }

                if (context.selectedWiocclNode === candidateWiocclNode && pos === context.prevPos) {
                    return;
                }

                context._selectWiocclNode(candidateWiocclNode);
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
            this._updateFields(candidateWiocclNode);

            // S'ha de reconstruir el map aquí, per no modificar el selected mentre
            // s'edita el camp
            this.structure.rebuildPosMap(this.structure.getNodeById(this.editor.wioccl.id));
            let wiocclNode = this.structure._getNodeForPos(this.lastPos);
            this._selectWiocclNode(wiocclNode);
            this.updateInsertButtons();
        },

        _getWiocclForCurrentPos: function () {
            let pos;

            if (this.editor.hasFocus()) {
                pos = this.editor.getPositionAsIndex(true);
                this.lastPos = pos;
                this.lastCursor = this.editor.getPosition();;

            } else {
                pos = this.lastPos;
            }

            this.wasFocused = this.editor.hasFocus();
            return this.structure._getNodeForPos(pos);
        },

        // ALERTA! es crida desde DojoWioccl
        updateTree: function (tree, root, selected) {
            this.treeWidget.destroyRecursive();

            this.createTree(tree, root.id);

            let node = selected;
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
