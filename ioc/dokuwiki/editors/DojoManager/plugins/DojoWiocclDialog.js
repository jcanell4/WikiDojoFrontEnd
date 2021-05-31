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
], function (TemplatedMixin, WidgetsInTemplateMixin, declare, Dialog, template, domConstruct, EventObservable,
             EventObserver, Button, toolbarManager, Memory, ObjectStoreModel, Tree) {

    // const UPDATE_TIME = 300; // temps en millisegons
    const UPDATE_TIME = 0; // temps en millisegons

    let AceFacade = null;

    // ALERTA! Aquestes classes no carregan correctament a la capçalera, cal fer un segon require
    require(["ioc/dokuwiki/editors/AceManager/AceEditorFullFacade"], function (AuxClass) {
        AceFacade = AuxClass;
    });

    return declare("ioc.gui.CustomDialog", [Dialog, TemplatedMixin, WidgetsInTemplateMixin, EventObservable, EventObserver], {

        templateString: template,

        lastPos : null,
        lastCursor : null,
        wasFocused: null,

        startup: function () {
            this.inherited(arguments);
            this.createEditor();
            this.createTree(this.tree, this.refId);

            let wioccl = this.source.getStructure()[this.refId];

            this._selectWioccl(wioccl)
            // this.selectedWioccl = wioccl;

            this._rebuildChunkMap(this.source.getStructure()[this.refId]);
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
                    // return "children" in item;
                    return item.children.length > 0;
                }
            });

            this.model = model;

            let context = this;

            this.treeWidget = new Tree({
                id: Date.now(),
                model: model,
                onOpenClick: true,
                onLoad: function () {
                    // dom.byId('image').src = '../resources/images/root.jpg';
                },
                onClick: function (item) {

                    // actualitzem qualsevol canvi pendent abans

                    if (context.editor.isChanged() || context._pendingChanges) {
                        let descartar = confirm("S'han detectat canvis, vols descartar-los?");
                        if (!descartar) {
                            return false;
                        }
                    }

                    context._updatePendingChanges()
                    context._rebuildChunkMap(item);
                    context._updateDetail(item);

                    let wioccl = context.source.getStructure()[item.id];
                    context._selectWioccl(wioccl);
                    // context.selectedWioccl = wioccl;
                    // console.log("Set selected:", context.selectedWioccl)
                }
            });

            this.treeWidget.placeAt(this.treeContainerNode);
            this.treeWidget.startup();
        },

        _rebuildChunkMap: function (item) {
            // console.log("Rebuilding chunkmap for", item);
            let outChunkMap = new Map();
            let rebuild = this._createChunkMap(item, this.source.getStructure(), 0, outChunkMap);
            // console.log(rebuild, outChunkMap);
            this.chunkMap = outChunkMap;
        },

        // el chunk map és un mapa que indica en quina posició comença una línia wioccl: map<int pos, int ref>
        _createChunkMap: function (item, structure, pos, outChunkMap) {

            // Cal fer la conversió de &escapedgt; per \>
            let attrs = item.attrs;
            attrs = attrs.replaceAll('&escapedgt;', '\\>');
            attrs = attrs.replaceAll('&mark;', '\\>');
            attrs = attrs.replaceAll('&markn;', "\n>");

            let wioccl = item.open.replace('%s', attrs);

            outChunkMap.set(pos, item);

            let cursorPos = pos + wioccl.length;

            for (let i = 0; i < item.children.length; i++) {

                let node = typeof item.children[i] === 'object' ? item.children[i] : structure[item.children[i]];

                // al servidor s'afegeix clone al item per indicar que aquest element es clonat i no cal reafegirlo
                // per exemple perquè és genera amb un for o foreach
                if (node.isClone) {
                    continue;
                }

                let childWioccl = this._createChunkMap(node, structure, cursorPos, outChunkMap);
                wioccl += childWioccl;
                cursorPos += childWioccl.length;
            }

            if (item.close !== null && item.close.length > 0) {
                // si hi ha un close en clicar a sobre d'aquest també es seleccionarà l'item
                // console.log("Afegint posició al close per:", item.close, cursorPos);
                outChunkMap.set(cursorPos, item);
                wioccl += item.close;
            }

            return wioccl;

        },

        _extractFields: function (attrs, type) {

            // Cal fer la conversió de &escapedgt; per \>
            attrs = attrs.replace('&escapedgt;', '\\>');

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

        _updateDetail: function (item, ignoreFields) {

            if (!ignoreFields) {
                this.setFields(this._extractFields(item.attrs, item.type));
            }

            let auxItem = this.source.rebuildWioccl(item);

            this.editor.setValue(auxItem);
            this.dirty = true;


            // if (this.lastCursor) {
            //     this.editor.setPosition(this.lastCursor);
            // }
            // this.editor.clearSelection();

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
                // html += '<button data-button-update>Actualitzar</button>';
                // html += '<input type="text" name="' + field + '" value="' + valor + '" disabled="true"/>';
                html += '</div>';
            }

            return html;
        },

        _pendingChanges: null,

        setFields: function (fields, type) {
            // console.error("Setting fields");
            let $attrContainer = jQuery(this.attrContainerNode);

            $attrContainer.empty();

            let $fields = jQuery(this._generateHtmlForFields(fields, type))

            // TODO:


            let context = this;

            // console.log("establint input change");

            $fields.find('input').on('input change', function (e) {

                // console.log("es input o es change?",e.type );

                if (UPDATE_TIME === 0 || e.type === 'change') {
                    context._updatePendingChanges();

                } else if (!context._pendingChanges) {
                    context.timerId = setTimeout(context._updatePendingChanges.bind(context), UPDATE_TIME);
                    context._pendingChanges = true;
                } else {
                    // console.log('pending changes?', context._pendingChanges);
                }
            });

            $attrContainer.append($fields);
            this._updateEditorHeight();
        },

        destroy: function() {
            this.inherited(arguments);

            if (this.timerId) {
                clearTimeout(this.timerId);
            }

        },

        _updatePendingChanges: function() {
            // console.log("updatePendingChanges ##?");

            let $attrContainer = jQuery(this.attrContainerNode);

            let context = this;

            $attrContainer.find('input').each(function() {

                let $fieldContainer = jQuery(this).closest('[data-attr-field]');
                let attrField = $fieldContainer.attr('data-attr-field');
                let attrValue = $fieldContainer.find('input').val();

                let extractedFields = context._extractFields(context.selectedWioccl.attrs,
                    context.selectedWioccl.type);

                // Reemplacem l'atribut
                extractedFields[attrField] = attrValue;


                // reconstruim els atributs com a string
                let rebuildAttrs = context._rebuildAttrs(extractedFields, context.selectedWioccl.type);

                // Re assignem els nous atributs
                context.selectedWioccl.attrs = rebuildAttrs;
            });

            this._updateStructure();
            this._updateDetail(this.editor.wioccl, true);

            context._pendingChanges = false;

            // console.log('## 4');
            clearInterval(this.timerId);
            // console.log('## 5 - OK');
        },

        _selectWioccl(wioccl) {
            // console.log('selecting wioccl:', wioccl);
            this.selectedWioccl = wioccl;
        },

        // Actualitza la estructura a partir dels valors del chunkmap
        _updateStructure: function () {
            let structure = this.source.getStructure();
            for (let [start, wioccl] of this.chunkMap) {
                // console.log("updating structure", start, wioccl);
                structure[Number(wioccl.id)] = wioccl;
            }

            if (this.editor.wioccl !== undefined) {
                this.editor.wioccl = structure[Number(this.editor.wioccl.id)];
            }
        },

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

            // ALERTA! per alguna raó si s'afegeix el contentToolFactory com a dependència no funciona (exactament el
            // mateix codi al DataContentProcessor sí que ho fa), la alternativa és utilitzar la factoria del content
            // tool actual:
            let id = this.source.editor.dispatcher.getGlobalState().getCurrentId();
            let contentToolFactory = this.source.editor.dispatcher.getContentCache(id).getMainContentTool().contentToolFactory;

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
                dispatcher: this.source.editor.dispatcher,
                content: args.value,
                originalContent: args.value,
                // TOOLBAR_ID: toolbarId,
                TOOLBAR_ID: 'full-editor',
                ignorePatching: true,
                plugins: [],
            });

            this.source.dialogEditor = editor;

            // Per defecte s'assigna el primer node
            editor.wioccl = this.wioccl;

            this.editor = editor;

            let context = this;

            // editor.on('changeCursor,focus', function (e) {

            // Cal fer un tractament diferent pel focus, aquest només es dispara quan
            // efectivament s'ha fet click, però es dispara abans de que s'estableixi
            // la posició??
            editor.on('focus', function(e) {

                context.lastPos = context.editor.getPositionAsIndex(false);

                let candidate = context._getWiocclForPos(context.lastPos);
                let auxFields = context._extractFields(candidate.attrs, candidate.type);

                context._selectWioccl(candidate);
                context.setFields(auxFields);


                // *********************** //
                // S'ha de reconstruir el map aquí, per no modificar el selected mentre
                // s'edita el camp
                context._rebuildChunkMap(context.source.getStructure()[editor.wioccl.id]);
                let wioccl = context._getWiocclForPos(context.lastPos);
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
                let candidate = context._getWiocclForPos(pos);


                // Si es dirty es que s'acava de canviar el valor, cal eliminar la selecció
                if (context.dirty) {
                    context.editor.clearSelection();
                    context.dirty = false;
                }

                if (context.selectedWioccl === candidate) {
                    // console.log("El seleccionat és el mateix que el actual? (no fem el extract)", context.selectedWioccl, candidate)
                    return;
                }

                let auxFields = context._extractFields(candidate.attrs, candidate.type);

                context._selectWioccl(candidate);
                // context.selectedWioccl = candidate;
                context.setFields(auxFields);



                // context.editor.clearSelection();
            });

            this._updateEditorHeight();
        },

        _getWiocclForCurrentPos: function() {
            let pos;
            let cursor = {row: 0, column: 0}


            if (this.editor.hasFocus()) {
                pos = this.editor.getPositionAsIndex(true);
                // pos = this.editor.getPositionAsIndex(true);
                cursor = this.editor.getPosition();

                this.lastPos = pos;
                this.lastCursor = cursor;

            } else {
                console.warn("no te focus");
                pos = this.lastPos;
                cursor = this.lastCursor;
                // this.editor.clearSelection();
            }


            // console.log("Pos:", pos);
            // console.log("Cursor:", cursor);

            // if (pos ===-1) {
            //     console.log("Reemplaçat, netejant selecció");
            //     this.editor.clearSelection();
            // }

            this.wasFocused = this.editor.hasFocus();



            console.log("has focus?", this.editor.hasFocus());
            return this._getWiocclForPos(pos);
        },

        _getWiocclForPos: function(pos) {
            // Cerquem el node corresponent
            let candidate;
            let found;
            let first;

            // Recorrem el mapa (que ha d'estar ordenat) fins que trobem una posició superior al punt que hem clicat
            // S'agafarà l'anterior
            for (let [start, wioccl] of this.chunkMap) {
                if (!first) {
                    first = wioccl;
                }

                if (start > pos && candidate) {
                    found = true;
                    break;
                }

                // s'estableix a la següent iteració
                candidate = wioccl;
            }

            if (!found) {
                candidate = first;
            }

            return candidate;
        },

        // es crida desde DojoWioccl
        updateTree: function (tree, root, selected, structure) {
            this.treeWidget.destroyRecursive();

            this.createTree(tree, root.id);

            let node = selected;
            /// corresponent al cas1, es seleccionarà el node original
            let path = [];


            while (node.parent !== null && node.id !== root.id) {
                path.unshift(node.id);
                node = structure[node.parent];
            }

            // Finalment s'afegeix el node root
            path.unshift(root.id);

            this.treeWidget.set('path', path);

        }
    });
});
