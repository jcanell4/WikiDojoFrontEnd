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

    // ALERTA! Aquestes classes no carregan correctament a la capçalera, cal fer un segon require
    require(["ioc/dokuwiki/editors/AceManager/AceEditorFullFacade"], function (AuxClass) {
        AceFacade = AuxClass;
    });

    var DojoWioccDialog = declare("ioc.gui.CustomDialog", [Dialog, TemplatedMixin, WidgetsInTemplateMixin, EventObservable, EventObserver], {

        templateString: template,

        lastPos: null,
        lastCursor: null,
        wasFocused: null,

        startup: function () {
            // console.log("Quina es la estructura que s'ha assignat al diàleg?", this.structure);
            this.inherited(arguments);
            this.createEditor();
            this.createTree(this.tree, this.refId, this.structure);

            let wioccl = this.structure.getNodeById(this.refId);
            // let wioccl = this.structure[this.refId];

            // let wioccl = this.source.getStructure()[this.refId];

            this._selectWioccl(wioccl)
            // this.selectedWioccl = wioccl;

            // this._rebuildChunkMap(this.source.getStructure()[this.refId]);
            this.structure._rebuildChunkMap(wioccl);
            // this._rebuildChunkMap(wioccl);
            let $updateButton = jQuery(this.updateButtonNode);
            let $saveButton = jQuery(this.saveButtonNode);

            let context = this;

            $updateButton.on('click', function () {
                // Alerta, el context d'execució en afegir el callback al objecte de configuració
                context.updateCallback(context.editor);
            });

            $saveButton.on('click', function () {
                // Alerta, el context d'execució en afegir el callback al objecte de configuració
                context.saveCallback(context.editor);
            });

            // ens assegurem que es false al començar, pot ser que hagi canviat
            // durant la inicialització
            this.dirty = false;
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


            // console.log(tree, refId, structure, model);

            this.treeWidget = new Tree({
                id: Date.now(),
                model: model,
                onOpenClick: true,
                onLoad: function () {
                    // dom.byId('image').src = '../resources/images/root.jpg';
                },
                onClick: function (item) {
                    // console.log("item clicat:", item);

                    // actualitzem qualsevol canvi pendent abans
                    context._updatePendingChanges_Field2Detail()

                    if (context.editor.isChanged() || context._pendingChanges_Field2Detail || context._fieldChanges) {
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

                    let wioccl = structure.getNodeById(item.id);
                    structure.backup(wioccl);

                    structure._rebuildChunkMap(wioccl);
                    context._updateDetail(wioccl);
                    context._selectWioccl(wioccl);
                }
            });

            this.treeWidget.placeAt(this.treeContainerNode);
            this.treeWidget.startup();
        },

        // TODO: Valorar si això és més adient aquí o al WiocclStructureBase
        _extractFieldsFromCandidate: function (candidate) {
            // console.error('_extractFieldsFromCandidate', candidate);
            if (candidate.attrs.length === 0) {
                candidate.type = candidate.type ? candidate.type : "content";
                candidate.attrs = candidate.open;
            }

            return this._extractFields(candidate.attrs, candidate.type);
        },

        // TODO: Valorar si això és més adient aquí o al WiocclStructureBase
        _extractFields: function (attrs, type) {
            // console.log('_extractFields', type, attrs);

            // Cal fer la conversió de &escapedgt; per \>
            attrs = attrs.replace('&escapedgt;', '\\>');

            let fields = {};

            switch (type) {

                case 'content':
                    fields['content'] = attrs;
                    break;

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


        _updateDetail: function (item, ignoreFields) {


            if (this.updating) {
                return;
            }

            if (!ignoreFields) {

                // this.setFields(this._extractFields(item.attrs, item.type));
                this.setFields(this._extractFieldsFromCandidate(item));
            }


            let auxContent = this.structure.rebuildWioccl(item);
            // let auxContent = this.source.rebuildWioccl(item, this.structure);
            this.editor.setValue(auxContent);
            this.dirty = true;

            this.editor.resetOriginalContentState();

            this.editor.wioccl = item;

            if (item.id === 0) {
                this.editor.lockEditor();
                jQuery(this.detailContainerNode).css('opacity', '0.5');
            } else {
                this.editor.unlockEditor();
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
            let $attrContainer = jQuery(this.attrContainerNode);
            let $detailContainer = jQuery(this.detailContainerNode);
            let offset = 70;

            this.editor.setHeightForced($detailContainer.height() - $attrContainer.height() - offset);
        },

        _generateHtmlForFields: function (fields) {

            let html = '';

            for (let field in fields) {

                // Es necessari eliminar el escape de les dobles cometes
                // TODO: ALERTA! Caldrà tornar-lo a afegir abans d'enviar-lo
                let valor = fields[field].replaceAll('\"', '&quot;');

                html += '<div class="wioccl-field" data-attr-field="' + field + '">';
                html += '<label>' + field + ':</label>';
                html += '<input type="text" name="' + field + '" value="' + valor + '"/>';
                html += '<button data-button-edit>wioccl</button>';
                html += '</div>';
            }

            return html;
        },

        _pendingChanges: null,

        setFields: function (fields, type) {
            // console.error("Setting fields", fields, type);
            let $attrContainer = jQuery(this.attrContainerNode);

            $attrContainer.empty();

            let $fields = jQuery(this._generateHtmlForFields(fields, type))

            let context = this;

            $fields.find('[data-button-edit]').on('click', function (e) {

                let $input = jQuery(this).siblings('input');
                let value = $input.val();

                let structure = new WiocclStructureTemp();
                let root = structure.getRoot();

                structure.parseWioccl(value, root);

                let refId = root.id;

                let tree = structure.getTreeFromNode(refId, true);

                let wiocclDialog = new DojoWioccDialog({
                    title: 'Edició wioccl',
                    // style: 'width:auto',
                    style: 'height:100%; width:100%; top:0; left:0; position:absolute; max-width: 80%; max-height: 80%;',
                    // style: 'height:100%; width:100%; top:0; left:0; position:absolute; max-width: 100%; max-height: 100%;',
                    onHide: function (e) { //Voliem detectar el event onClose i hem hagut de utilitzar onHide
                        this.destroyRecursive();
                        context.backup = null;
                    },
                    id: 'wioccl-dialog_inner' + counter,
                    draggable: false,
                    firstResize: true,
                    dispatcher: context.dispatcher,
                    args: {
                        id: 'wioccl-dialog_inner' + counter,
                        // value: context.source.rebuildWioccl(tree[0], outStructure)
                        value: structure.rebuildWioccl(tree[0])
                    },
                    wioccl: root,
                    // structure: outStructure,
                    structure: structure,
                    tree: tree,
                    refId: refId,
                    saveCallback: function () {

                        // this és correcte, fa referència al nou dialog que s'instància
                        this.structure.parseWioccl(this.editor.getValue(), this.editor.wioccl);
                        // this.source.parseWiocclNew(this.editor.getValue(), this.editor.wioccl, outStructure, this);
                        let text = this.structure.rebuildWioccl(this.structure.getNodeById(refId));



                        $input.val(text);
                        $input.trigger('input');

                        wiocclDialog.destroyRecursive();
                    },
                    // saveCallback : context._save.bind(context),
                    updateCallback: function (editor) {
                        // this.source.parseWioccl(editor.getValue(), editor.wioccl, this.getStructure());

                        // copiat del dojowiccl#_update(editor)


                        // console.log("*****update subdialog inici");

                        // this és correcte, fa referència al nou dialog que s'instància
                        this.structure.updating = true;


                        this.structure.discardSiblings();


                        // if (outStructure.siblings && outStructure.siblings.length > 0) {
                        //     console.log("siblings:", outStructure.siblings);
                        //     for (let i = outStructure.siblings.length - 1; i >= 0; i--) {
                        //         console.log("existeix l'element a la estructura?", outStructure.siblings[i], outStructure[outStructure.siblings[i]], outStructure);
                        //         let siblingId = outStructure[outStructure.siblings[i]].id;
                        //         console.log("Eliminant sibling:", siblingId);
                        //         this.source._removeNode(siblingId, outStructure);
                        //     }
                        // }
                        // //this.parseWioccl(editor.getValue(), editor.wioccl, structure, this.wiocclDialog);
                        // outStructure.siblings = [];
                        this.structure.updating = false;


                        // console.log("*****update subdialog fi");


                        this.structure.parseWioccl(editor.getValue(), editor.wioccl);
                        // this.source.parseWiocclNew(editor.getValue(), editor.wioccl, outStructure, wiocclDialog);

                        // console.log(refId, outStructure, outRoot);
                        // Ho cridem manualment amb el node corresponent al refId
                        this._setData(this.structure.getNodeById(refId), root);


                        // console.log("estructura del update?", this.structure);

                    // }.bind(context)
                    }
                    // updateCallback: context._update.bind(context)


                });

                counter++;

                wiocclDialog.startup();

                wiocclDialog.show();


                // console.log(outRoot);
                // wiocclDialog.setFields(wiocclDialog._extractFields(outRoot.attrs, outRoot.type));
                wiocclDialog.setFields(wiocclDialog._extractFieldsFromCandidate(root));
                wiocclDialog._updateDetail(root);
            });


            $fields.find('input').on('input change', function (e) {
                context._fieldChanges = true;

                // console.log("es input o es change?",e.type );
                if (UPDATE_TIME === 0 || e.type === 'change') {
                    context._updatePendingChanges_Field2Detail();

                } else if (!context._pendingChanges_Field2Detail) {
                    context.timerId_Field2Detail = setTimeout(context._updatePendingChanges_Field2Detail.bind(context), UPDATE_TIME);
                    context._pendingChanges_Field2Detail = true;
                } else {
                    // console.log('pending changes?', context._pendingChanges_Field2Detail);
                }
            });

            $attrContainer.append($fields);
            this._updateEditorHeight();
        },

        _setData: function (root, selected, ignoreRebranch) {
            // console.log(root, selected);

            if (!ignoreRebranch) {

                let tree = [];


                // let structure = this.getStructure();

                if (selected.addedsiblings) {
                    console.error("root.parent ", root.parent, "old root", root, "expected root", this.structure.getNodeById(root.parent));
                    // root = this.structure[root.parent];
                    root = this.structure.getNodeById(root.parent);

                    console.error("Modificant el root, canviat ", this.structure.root, "per:", root.id);
                    this.structure.root = root.id;
                    // this.root = root.id;

                    console.log("*** nous sibblings");
                }

                // això cal canviar-ho si no és un rebranch?
                root.name = root.type ? root.type : root.open;
                // root.children = this._getChildrenNodes(root.children, root.id, this.getStructure());

                // console.log("Root.childrens vs getWiocclChildrenNodes per aquest id:", root.children,
                this.structure._getChildrenNodes(root.children, root.id);


                // root.children = this._getChildrenNodes(root.children, root.id, this.structure);
                root.children = this.structure._getChildrenNodes(root.children, root.id);

                tree.push(root);

                // console.log("El tree conté el root?", tree, root)
                //
                // alert("check root");

                // console.log(tree, root, selected);
                this.updateTree(tree, root, selected);
                // this.wiocclDialog.updateTree(tree, root, selected, structure);
            }


            // ALERTA! és diferent fer això que agafar el selected, ja que el selected era l'element original que hara
            // pot trobar-se dividit en múltiples tokens
            this._updateDetail(this.structure.getNodeById(selected.id));
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
            // console.log("updatePendingChanges_Field2Detail");

            let $attrContainer = jQuery(this.attrContainerNode);

            let context = this;

            let extractedFields = context._extractFieldsFromCandidate(this.selectedWioccl);

            $attrContainer.find('input').each(function () {

                let $fieldContainer = jQuery(this).closest('[data-attr-field]');
                let attrField = $fieldContainer.attr('data-attr-field');
                let attrValue = $fieldContainer.find('input').val();


                // let extractedFields = context._extractFields(context.selectedWioccl.attrs,
                //     context.selectedWioccl.type);

                // Reemplacem l'atribut
                extractedFields[attrField] = attrValue;
            });

            // reconstruim els atributs com a string
            let rebuildAttrs = context._rebuildAttrs(extractedFields, context.selectedWioccl.type);
            // Re assignem els nous atributs
            this.selectedWioccl.attrs = rebuildAttrs;


            if (this.selectedWioccl.type === 'content') {
                this.selectedWioccl.open = extractedFields['content'];
            }

            // Refresquem el wioccl associat a l'editor amb el valor actual
            this.editor.wioccl = this.structure.getNodeById(this.editor.wioccl.id);


            // this._updateDetail(this.editor.wioccl, true);
            this._updateDetail(this.editor.wioccl, true);

            context._pendingChanges_Field2Detail = false;

            clearInterval(this.timerId_Field2Detail);
        },

        _updatePendingChanges_Detail2Field: function () {

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

            let wioccl = this.structure.parseWioccl(value, this.editor.wioccl);

            this._setData(this.structure.getNodeById(this.structure.root), wioccl, true);


            let candidate = this.structure.getNodeById(this.editor.wioccl.id);
            // this._rebuildChunkMap(this.source.getStructure()[this.selectedWioccl.id]);
            this.structure._rebuildChunkMap(candidate);

            let updatedWioccl = this._getWiocclForCurrentPos();
            this._selectWioccl(updatedWioccl);
            let extractedFields = this._extractFieldsFromCandidate(updatedWioccl);
            this.setFields(extractedFields);


            this.updating = false;

        },


        _selectWioccl(wioccl) {
            // console.error('selecting wioccl:', wioccl);
            this.selectedWioccl = wioccl;
        },

        // Actualitza la estructura a partir dels valors del chunkmap
        _updateStructure: function () {
            // let structure = this.source.getStructure();
            let structure = this.structure;
            for (let [start, wioccl] of this.chunkMap) {
                console.log("updating structure", start, wioccl);
                structure.setNode(wioccl);
                // structure[Number(wioccl.id)] = wioccl;
            }

            if (this.editor.wioccl !== undefined) {
                // this.editor.wioccl = structure[Number(this.editor.wioccl.id)];
                this.editor.wioccl = structure.getById(this.editor.wioccl.id);
            }
        },

        // TODO: Valorar si això és més adient aquí o al WiocclStructureBase
        _rebuildAttrs: function (fields, type) {

            let rebuild = '';
            let first = true;

            switch (type) {

                case 'field':
                    rebuild = fields['field'];
                    break;

                case 'function':


                    for (let name in fields) {
                        if (first) {
                            first = false;
                        } else {
                            rebuild += ',';
                        }

                        rebuild += fields[name];
                    }

                    break;

                default:

                    for (let name in fields) {
                        if (first) {
                            first = false;
                        } else {
                            rebuild += " ";
                        }
                        rebuild += name + '=\"' + fields[name] + '\"';
                    }
            }

            // console.log("fields rebuild:", rebuild);
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

                if (context.updating || !context.editor.hasFocus()) {
                    return;
                }

                if (UPDATE_TIME === 0) {
                    context._updatePendingChanges_Detail2Field();

                } else if (!context._pendingChanges_Detail2Field) {
                    context.timerId_Detail2Field = setTimeout(context._updatePendingChanges_Detail2Field.bind(context), UPDATE_TIME);
                    context._pendingChanges_Detail2Field = true;
                } else {
                    // console.log('pending changes?', context._pendingChanges_Detail2Field);
                }

            });


            // Cal fer un tractament diferent pel focus, aquest només es dispara quan
            // efectivament s'ha fet click, però es dispara abans de que s'estableixi
            // la posició??
            editor.on('focus', function (e) {

                context.lastPos = context.editor.getPositionAsIndex(false);

                let candidate = context.structure._getWiocclForPos(context.lastPos);

                // console.error("Focus! canviant el selected per", candidate);

                let auxFields = context._extractFieldsFromCandidate(candidate);

                context._selectWioccl(candidate);
                context.setFields(auxFields);


                // *********************** //
                // S'ha de reconstruir el map aquí, per no modificar el selected mentre
                // s'edita el camp
                context.structure._rebuildChunkMap(context.structure.getNodeById(editor.wioccl.id));
                // context._rebuildChunkMap(context.source.getStructure()[editor.wioccl.id]);
                let wioccl = context.structure._getWiocclForPos(context.lastPos);
                context._selectWioccl(wioccl);
            });

            editor.on('changeCursor', function (e) {

                // Problema, això fa que s'ignori la carrega i quan es fa a clic
                // però si no es fica es dispara quan es modifica el valor directament amb set value
                if (!editor.hasFocus()) {
                    // console.log("no te focus", e);
                    return;
                }

                let pos = editor.getPositionAsIndex(!context.dirty);


                let candidate = context.structure._getWiocclForPos(pos);

                // console.log(pos, candidate);

                // Si es dirty es que s'acava de canviar el valor, cal eliminar la selecció
                if (context.dirty) {
                    context.editor.clearSelection();
                    context.dirty = false;
                }

                if (context.selectedWioccl === candidate) {
                    // console.log("El seleccionat és el mateix que el actual? (no fem el extract)", context.selectedWioccl, candidate)
                    return;
                }

                let auxFields = context._extractFieldsFromCandidate(candidate);

                context._selectWioccl(candidate);
                // context.selectedWioccl = candidate;
                context.setFields(auxFields);


                // context.editor.clearSelection();
            });

            this._updateEditorHeight();
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
            // return this._getWiocclForPos(pos);
            return this.structure._getWiocclForPos(pos);
        },



        // es crida desde DojoWioccl
        updateTree: function (tree, root, selected) {
            // console.log("updateTree", tree, root, selected);
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

        }
    });

    return DojoWioccDialog;
});
