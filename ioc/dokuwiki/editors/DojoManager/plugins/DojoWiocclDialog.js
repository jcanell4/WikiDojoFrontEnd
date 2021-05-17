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
            this._rebuildChunkMap(this.source.getStructure()[this.refId]);
            let $updateButton = jQuery(this.updateButtonNode);
            let $saveButton = jQuery(this.saveButtonNode);;

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

        _rebuildChunkMap: function (item){
            // console.log(item);
            // console.log(this.source.getStructure());

            let outChunkMap = new Map();
            let rebuild = this._createChunkMap(item, this.source.getStructure(),0, outChunkMap);
            // console.log(rebuild, outChunkMap);

            // console.log("Chunk Map Set");
            this.chunkMap = outChunkMap;
        },

        // el chunk map és un mapa que indica en quina posició comença una línia wioccl: map<int pos, int ref>
        _createChunkMap: function(item, structure, pos, outChunkMap) {

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

            let cursorPos = pos+wioccl.length;

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

            if (item.close !== null && item.close.length>0) {
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

        _updateDetail: function (item) {

            this.setFields(this._extractFields(item.attrs, item.type));

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

                html += '<div class="wioccl-field">';
                html += '<label>' + field + ':</label>';
                html += '<input type="text" name="' + field + '" value="' + valor + '" disabled="true"/>';
                html += '</div>';
            }

            return html;
        },

        setFields: function (fields, type) {
            let $attrContainer = jQuery(this.attrContainerNode);
            $attrContainer.empty();
            $attrContainer.append(this._generateHtmlForFields(fields, type));
            this._updateEditorHeight();
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

            editor.on('changeCursor', function(e) {


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
                    if (start>pos && candidate) {
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

                let auxFields = context._extractFields(candidate.attrs, candidate.type);

                // console.log(auxFields);
                // return;
                context.setFields(auxFields);



            });

            this._updateEditorHeight();
        },

        updateTree: function(tree, root, selected, structure) {
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
