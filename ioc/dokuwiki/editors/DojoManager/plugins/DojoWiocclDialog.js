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

    const UPDATE_TIME = 500;

    let AceFacade = null;

    // ALERTA! Aquestes classes no carregan correctament a la capçalera, cal fer un segon require
    require(["ioc/dokuwiki/editors/AceManager/AceEditorFullFacade"], function (AuxClass) {
        AceFacade = AuxClass;
    });

    return declare("ioc.gui.CustomDialog", [Dialog, TemplatedMixin, WidgetsInTemplateMixin, EventObservable, EventObserver], {

        templateString: template,


        startup: function () {
            this.inherited(arguments);
            this.createEditor();
            this.createTree(this.tree, this.refId);

            let wioccl = this.source.getStructure()[this.refId];
            this.selectedWioccl = wioccl;

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
                    context._updatePendingChanges()


                    if (context.editor.isChanged()) {
                        let descartar = confirm("S'han detectat canvis, vols descartar-los?");
                        if (!descartar) {
                            return false;
                        }
                    }



                    context._rebuildChunkMap(item).bind(context);

                    // console.log(item);
                    // console.log(context.source.getStructure());
                    //
                    // let outChunkMap = new Map();
                    // let rebuild = context._createChunkMap(item, context.source.getStructure(),0, outChunkMap);
                    // console.log(rebuild, outChunkMap);
                    //
                    // console.log("Chunk Map Set");
                    // context.chunkMap = outChunkMap;

                    context._updateDetail(item);
                }
            });

            this.treeWidget.placeAt(this.treeContainerNode);
            this.treeWidget.startup();
        },

        _rebuildChunkMap: function (item) {
            // console.log(item);
            // console.log(this.source.getStructure());

            let outChunkMap = new Map();
            let rebuild = this._createChunkMap(item, this.source.getStructure(), 0, outChunkMap);
            // console.log(rebuild, outChunkMap);

            // console.log("Chunk Map Set");
            this.chunkMap = outChunkMap;
        },

        // el chunk map és un mapa que indica en quina posició comença una línia wioccl: map<int pos, int ref>
        _createChunkMap: function (item, structure, pos, outChunkMap) {

            // console.log("Creant chunkmap per item:", item);

            // Cal fer la conversió de &escapedgt; per \>
            let attrs = item.attrs;
            attrs = attrs.replaceAll('&escapedgt;', '\\>');
            attrs = attrs.replaceAll('&mark;', '\\>');
            attrs = attrs.replaceAll('&markn;', "\n>");
            // data.attrs = data.attrs.replaceAll('&escapedgt;', '\\>');
            // data.attrs = data.attrs.replaceAll('&mark;', '\\>');
            // data.attrs = data.attrs.replaceAll('&markn;', "\n>");

            let wioccl = item.open.replace('%s', attrs);

            outChunkMap.set(pos, item);

            let cursorPos = pos + wioccl.length;

            for (let i = 0; i < item.children.length; i++) {

                // let node = typeof item.children[i] === 'object' ? item.children[i] : this.getStructure()[item.children[i]];
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
            // console.log("Fields to extract:", attrs, type);

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

            // TODO: en lloc de reconstruir tots els camps s'hauria de fer camp per camp: si ja hi es actualitzar, si no hi es eliminar.
            //
            //  no buidem els attrs! s'ha de fer un recompte de quins ja existeixen i actualitzar-los
            // i els que no hi siguin esborrar-los
            $attrContainer.empty();

            let $fields = jQuery(this._generateHtmlForFields(fields, type))

            // TODO:


            let context = this;

            // ALERTA: Problema amb aquesta implementació: s'actualitza el camp clicat i es
            // descarta qualsevol altre camp. S'hauria de substituir per un únic botó per actualitzar i
            // fer el update de tots els camps i no només el clicat
            // $fields.find('[data-button-update]').on('click', function () {
            //     console.log('context', context.selectedWioccl)
            //     let $fieldContainer = jQuery(this).closest('[data-attr-field]');
            //     let attrField = $fieldContainer.attr('data-attr-field');
            //     console.log('attr', attrField)
            //     let attrValue = $fieldContainer.find('input').val();
            //     console.log('value', attrValue);
            //
            //     let extractedFields = context._extractFields(context.selectedWioccl.attrs,
            //         context.selectedWioccl.type);
            //     console.log("Extracted fields:", extractedFields);
            //     // Reemplacem l'atribut
            //     extractedFields[attrField] = attrValue;
            //
            //
            //     // reconstruim els atributs com a string
            //     let rebuildAttrs = context._rebuildAttrs(extractedFields, context.selectedWioccl.type);
            //
            //     // Re assignem els nous atributs
            //     context.selectedWioccl.attrs = rebuildAttrs;
            //
            //     // TODO: cal actualitzar l'editor fent una reconstrucció del wioccl i establint-lo
            //     //      TODO: Cal tornar a colocar el cursor a la mateixa posició!
            //
            //
            //     // Cal actualitzar-lo al backup map, que és el que s'utilitza per fer el rebuild
            //     // el editor.wioccl només s'utilitza per recuperar les referències de la estructura
            //     // i el selectedWioccl no és una referència a la estructura
            //
            //     // let structure = context.source.getStructure();
            //     // console.log("structure:", structure);
            //
            //     context._updateStructure();
            //     // structure[Number(context.selectedWioccl.id)] = context.selectedWioccl;
            //
            //     console.log("Update del detall per:", context.editor.wioccl);
            //
            //     context._updateDetail(context.editor.wioccl);
            //
            // });



            // TODO: optimització, ficar en un timer amb un buffer, disparar els updates periodicament,
            //  cada mig segon per exemple

            // *********************
            // TEST: fer el mateix (similar! $this és el input per treure el val, es pot canviar)
            // que el botó però amb el input/change
            $fields.find('input').on('input change', function () {
                // console.log('context', context.selectedWioccl)
                // let $fieldContainer = jQuery(this).closest('[data-attr-field]');
                // let attrField = $fieldContainer.attr('data-attr-field');
                // // console.log('attr', attrField)
                // let attrValue = $fieldContainer.find('input').val();
                // // console.log('value', attrValue);
                //
                // let extractedFields = context._extractFields(context.selectedWioccl.attrs,
                //     context.selectedWioccl.type);
                // // console.log("Extracted fields:", extractedFields);
                // // Reemplacem l'atribut
                // extractedFields[attrField] = attrValue;
                //
                //
                // // reconstruim els atributs com a string
                // let rebuildAttrs = context._rebuildAttrs(extractedFields, context.selectedWioccl.type);
                //
                // // Re assignem els nous atributs
                // context.selectedWioccl.attrs = rebuildAttrs;
                //
                // // TODO: cal actualitzar l'editor fent una reconstrucció del wioccl i establint-lo
                // //      TODO: Cal tornar a colocar el cursor a la mateixa posició!
                //
                //
                // // Cal actualitzar-lo al backup map, que és el que s'utilitza per fer el rebuild
                // // el editor.wioccl només s'utilitza per recuperar les referències de la estructura
                // // i el selectedWioccl no és una referència a la estructura
                //
                // // let structure = context.source.getStructure();
                // // console.log("structure:", structure);
                //
                // context._updateStructure();
                // // structure[Number(context.selectedWioccl.id)] = context.selectedWioccl;
                //
                // console.log("Update del detall per:", context.editor.wioccl);
                //
                // context._updateDetail(context.editor.wioccl, true);

                if (UPDATE_TIME === 0) {
                    context._updatePendingChanges();

                } else if (!context._pendingChanges) {
                    context.timerId = setTimeout(context._updatePendingChanges.bind(context), UPDATE_TIME);
                    context._pendingChanges = true;
                }
            });

            // *********************


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
            let $attrContainer = jQuery(this.attrContainerNode);

            let context = this;

            $attrContainer.find('input').each(function() {
                let $fieldContainer = jQuery(this).closest('[data-attr-field]');
                let attrField = $fieldContainer.attr('data-attr-field');
                // console.log('attr', attrField)
                let attrValue = $fieldContainer.find('input').val();
                // console.log('value', attrValue);

                let extractedFields = context._extractFields(context.selectedWioccl.attrs,
                    context.selectedWioccl.type);
                // console.log("Extracted fields:", extractedFields);
                // Reemplacem l'atribut
                extractedFields[attrField] = attrValue;


                // reconstruim els atributs com a string
                let rebuildAttrs = context._rebuildAttrs(extractedFields, context.selectedWioccl.type);

                // Re assignem els nous atributs
                context.selectedWioccl.attrs = rebuildAttrs;


            });

            // Cal actualitzar-lo al backup map, que és el que s'utilitza per fer el rebuild
            // el editor.wioccl només s'utilitza per recuperar les referències de la estructura
            // i el selectedWioccl no és una referència a la estructura

            // let structure = context.source.getStructure();
            // console.log("structure:", structure);
            // console.log("this?", this);

            this._updateStructure();
            // structure[Number(context.selectedWioccl.id)] = context.selectedWioccl;

            // console.log("Update del detall per:", context.editor.wioccl);

            this._updateDetail(this.editor.wioccl, true);


            // console.log('update');
            context._pendingChanges = false;

            // ens assegurem d'eliminar el timer
            clearInterval(this.timerId);
        },


        // Actualitza la estructura a partir dels valors del chunkmap
        _updateStructure: function () {
            let structure = this.source.getStructure();
            for (let [start, wioccl] of this.chunkMap) {
                structure[Number(wioccl.id)] = wioccl;
            }

            if (this.editor.wioccl !== undefined) {
                this.editor.wioccl = structure[Number(this.editor.wioccl.id)];
            }
        },

        _rebuildAttrs: function (fields, type) {
            // console.log("fields:", fields);
            // console.log("type:", type);

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

            // editor.on('change', function(e) {
            //    console.log("change", e);
            // });

            let context = this;

            editor.on('changeCursor', function (e) {

                if (!editor.isFocused()) {
                    return;
                }

                // console.log(e);


                // Alerta! això pot ralentitzar amb documents molt llargs perquè itera sobre tot el document
                // console.log(editor.editor.session.doc.positionToIndex(editor.editor.getEditor().getSelection().getCursor()));

                // Només actualitzarem si no hi ha selecció
                let pos = editor.getPositionAsIndex(true);


                if (pos === -1) {
                    return;
                }

                // console.log(editor.getPositionAsIndex());
                // console.log(context.chunkMap);

                // Cerquem el node corresponent
                let candidate;
                let found;
                let first;

                // Recorrem el mapa (que ha d'estar ordenat) fins que trobem una posició superior al punt que hem clicat
                // S'agafarà l'anterior
                for (let [start, wioccl] of context.chunkMap) {
                    if (!first) {
                        first = wioccl;
                    }

                    // console.log("Comprovant pos > start: candidate", pos, start);
                    if (start > pos && candidate) {
                        console.log("Click al node:", candidate.id, candidate);
                        found = true;

                        // context.setFields(context._extractFields(candidate.attrs, candidate.type));

                        // context._updateDetail(wioccl)
                        break;
                    }

                    // s'estableix a la següent iteració
                    candidate = wioccl;
                }

                if (!found) {
                    candidate = first;
                }


                if (context.selectedWioccl === candidate) {
                    return;
                }

                let auxFields = context._extractFields(candidate.attrs, candidate.type);

                // console.log(auxFields);
                // return;




                context.selectedWioccl = candidate;
                context.setFields(auxFields);


            });

            this._updateEditorHeight();
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
