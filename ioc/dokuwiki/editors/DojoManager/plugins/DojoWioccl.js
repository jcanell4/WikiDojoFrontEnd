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
    'dojo/mouse',
    'ioc/dokuwiki/editors/DojoManager/plugins/WiocclStructureClone',


], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, string, Button, domConstruct,
             Dialog, registry, dom, Tooltip, on, place, mouse, WiocclStructureClone) {

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

            // ALERTA! this.editor fa referència a l'editor dojo

            this.structure = new WiocclStructureClone({structure: this.editor.extra.wioccl_structure.structure});

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

        getStructure: function() {
            // // console.log(this.editor.extra.wioccl_structure.structure);
            //
            // // TODO[Xavi] això ha de retornar un Wiocclstructure, determinar si el backupStructure correspón pasar-lo
            // // al constructor o ajustar-lo directament allà. En qualsevol cas aquest pas és indispensable per no
            // // modificar la estructura del document real
            //
            // if (!this.backupStructure) {
            //
            //     this.backupStructure = JSON.parse(JSON.stringify(this.editor.extra.wioccl_structure.structure));
            //
            //     // Ajustem l'arrel
            //     this.backupStructure[0].open = '';
            //     this.backupStructure[0].type = 'root';
            //     this.backupStructure[0].close = '';
            //
            // }
            //
            // return this.backupStructure;

            return this.structure;
        },

        getNodeById: function(refId) {
            return this.structure.getNodeById(refId)
        },


        // _getWiocclChildrenNodes(children, parent, context) {
        // _getWiocclChildrenNodes(children, parent, structure) {
        //     console.error("Deprecated");
        //     alert("stop!");
        //
        //     let nodes = [];
        //
        //     for (let i = 0; i < children.length; i++) {
        //
        //
        //         let id = typeof children[i] === 'object' ? children[i].id : children[i];
        //
        //         if (structure[id].isClone) {
        //             // if (context.getStructure()[id].isClone) {
        //             continue;
        //         }
        //
        //         // console.log("Original:", id, context.getStructure()[id]);
        //         let node = JSON.parse(JSON.stringify(structure[id]));
        //         // let node = JSON.parse(JSON.stringify(context.getStructure()[id]));
        //         // console.log("Clon:", id,node);
        //
        //         if (!node) {
        //             console.error("Node not found:", id);
        //         }
        //         node.name = node.type ? node.type : node.open;
        //
        //         node.parent = parent;
        //         if (node.children.length > 0) {
        //             node.children = this._getWiocclChildrenNodes(node.children, node.id, structure);
        //         }
        //
        //         nodes.push(node);
        //     }
        //
        //     return nodes;
        // },

        // rebuildWioccl: function (data, structure) {
        //     // console.log("Rebuilding wioccl:", data, structure);
        //     let wioccl = "";
        //
        //     // Cal fer la conversió de &escapedgt; per \>
        //     data.attrs = data.attrs.replaceAll('&escapedgt;', '\\>');
        //     data.attrs = data.attrs.replaceAll('&mark;', '\\>');
        //     data.attrs = data.attrs.replaceAll('&markn;', "\n>");
        //
        //     wioccl += data.open.replace('%s', data.attrs);
        //
        //     // console.log("Comprovant childrens:", data.children);
        //     for (let i = 0; i < data.children.length; i++) {
        //
        //         // let node = typeof data.children[i] === 'object' ? data.children[i] : this.getStructure()[data.children[i]];
        //         // Si com a fill hi ha un node és una copia, cal recuperar-lo de la estructura sempre
        //         let id = typeof data.children[i] === 'object' ? data.children[i].id : data.children[i];
        //         // console.log("Quin node s'intenta comprovar?", id);
        //         let node = structure[id];
        //
        //         // al servidor s'afegeix clone al item per indicar que aquest element es clonat i no cal reafegirlo
        //         // per exemple perquè és genera amb un for o foreach
        //         if (node.isClone) {
        //             continue;
        //         }
        //
        //         wioccl += this.rebuildWioccl(node, structure);
        //     }
        //
        //     if (data.close !== null) {
        //         wioccl += data.close;
        //     }
        //
        //     return wioccl;
        // },


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


                let wioccl = context.getNodeById(refId);

                for (let child of wioccl.children) {
                    _enableHighlight(child, false);
                }
            }

            let _disableHighlight = function (refId) {
                let $relatedNodes = jQuery(context.editor.iframe).contents().find('[data-wioccl-ref="' + refId + '"]');
                $relatedNodes.removeClass('ref-highlight');
                $relatedNodes.removeClass('child');

                let wioccl = context.getNodeById(refId);

                if (!wioccl) {
                    return;
                }

                for (let child of wioccl.children) {
                    _disableHighlight(child);
                }
            }

            let _showTooltip = function (e) {

                e.stopPropagation();

                let domNode = this;
                let $this = jQuery(domNode);
                let refId = $this.attr('data-wioccl-ref');

                let wiocclNode = context.getNodeById(refId);

                let str = wiocclNode.open + wiocclNode.close;
                str = str.replace('%s', wiocclNode.attrs);

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

                let wioccl = context.getNodeById(refId);

                if (wioccl.isClone) {
                    alert("Aquest element es una copia, es mostrarà l'element pare");

                    while (wioccl.isClone) {
                        wioccl = context.getNodeById(wioccl.parent);
                        refId = wioccl.id;
                    }
                }

                context.getStructure().root = refId;

                let tree = context.getStructure().getTreeFromNode(refId, true);

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
                    onHide: function (e) { //Voliem detectar el event onClose i hem hagut de utilitzar onHide
                        this.destroyRecursive();
                        // context.backupStructure = null;
                    },
                    id: 'wioccl-dialog' + counter,
                    draggable: false,
                    firstResize: true,
                    dispatcher: context.editor.dispatcher,
                    args: {
                        id: 'wioccl-dialog' + counter,
                        value: structure.rebuildWioccl(tree[0])
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
            // console.log("update", this.wiocclDialog);
            let structure = this.getStructure();
            structure.updating = true;
            if (structure.siblings && structure.siblings.length>0) {
                // console.log("siblings:", structure.siblings);
                for (let i=structure.siblings.length-1; i>=0; i--) {

                    // console.log("existeix l'element a la estructura?", i, structure.siblings[i], structure[structure.siblings[i]], structure.siblings);
                    let siblingId = structure[structure.siblings[i]].id;
                    // console.error("Eliminant sibling:", siblingId);
                    this._removeNode(siblingId, structure);
                }
            }
            structure.siblings = [];

            let wioccl = structure.parseWioccl(editor.getValue(), editor.wioccl);
            this.wiocclDialog._setData(structure.getNodeById(structure.root), wioccl);

            structure.updating = false;
        },

        // Enviar el text
        // en aquest cas s'envia el text reconstruit a partir dels nodes i el rootRef, només cal fer la traducció
        // i reemplaçar les nodes

        // Si aquest no és el root, cal cercar el parent que té com a parent el node 0
        _save(editor) {
            // console.log("Estructura original:", this.editor.extra.wioccl_structure.structure);

            let context = this;
            // 0 actualitzar el contingut actual

            let structure = this.getStructure();

            // this.wiocclDialog._setData(structure[this.root], wioccl, structure, dialog, ignoreRebranch);

            let wioccl = structure.parseWioccl(editor.getValue(), editor.wioccl);
            // No es refan les branques
            this.wiocclDialog._setData(structure.getNodeById(structure.root), wioccl, true);


            // this.parseWioccl(editor.getValue(), editor.wioccl, this.getStructure(), this.wiocclDialog);

            // 1 reconstruir el wioccl del node pare (this._getStructure()[this.root], això és el que s'ha d'enviar al servidor
            // ALERTA! no cal enviar el text, cal enviar la estructura i el node a partir del qual s'ha de regenerar el codi wioccl


            let rootRef = structure.root;

            // console.log("Rootref:", rootRef, structure);
            // Cal tenir en compte que el rootRef podria ser el node arrel i en aquest cas no cal cerca més
            while (structure.getNodeById(rootRef).id > 0 && structure.getNodeById(rootRef).parent > 0) {
                rootRef = structure.getNodeById(rootRef).parent;
                // console.log("Rootref (new):", rootRef);
            }

            // cal desar el parent per restaurar-lo, el que retorna del servidor no te cap parent assignat
            let originalParent = structure.getNodeById(rootRef).parent;
            let originalRef = rootRef;

            let text = structure.rebuildWioccl(structure.getNodeById(rootRef));


            // 2 enviar al servidor juntament amb el id del projecte per poder carregar el datasource, cal enviar també
            //      la propera referència, que serà la posició per inserir els nodes nous

            let globalState = this.editor.dispatcher.getGlobalState();

            // ALERTA! aquesta informació és necessaria perquè s'han d'afegir els spans amb la referència
            // let next = structure['next'];

            let dataToSend = {
                content: text,
                rootRef: rootRef,
                // nextRef: structure['next'],
                nextRef: structure.getNextKey(),
                projectOwner: globalState.getContent(globalState.currentTabId).projectOwner,
                projectSourceType: globalState.getContent(globalState.currentTabId).projectSourceType,
                sectok: this.editor.dispatcher.getSectok()
            };

            // console.log("Data to send:", dataToSend);

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
                // context._removeChildren(rootRef, target, true);
                let ids = structure._removeChildren(rootRef);
                // console.log("ids de nodes per eliminar:", ids);
                for (let id of ids) {
                        // console.log("Buscant node:", id)
                        let $node = jQuery(context.editor.iframe).contents().find('[data-wioccl-ref="' + id + '"]');
                        $node.remove();
                        // console.log("Eliminat:", $node);
                }


                // Cal eliminar també les referències al node arrel (poden ser múltiple en el cas del foreach)
                // Cal inserir una marca pel node root
                let $rootNodes = jQuery(context.editor.iframe).contents().find('[data-wioccl-ref="' + rootRef + '"]');

                // console.log("Eliminant root nodes", rootRef, $rootNodes);


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

                context.getStructure().setStructure(target);

                // Afegim els handlers (ara s'afegeixen com a resposta al emit)
                // context._addHandlers($nouRoot.find("[data-wioccl-ref]").addBack('[data-wioccl-ref]'), context);
                context.editor.emit('import');

                context.editor.forceChange();


                jQuery(context.editor.iframe).contents().find('[data-wioccl-ref="' + originalRef + '"]')[0].scrollIntoView();

            });
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