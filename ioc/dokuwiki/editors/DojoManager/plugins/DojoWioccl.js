define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractParseableDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string",
    // "dijit/form/ToggleButton",
    "dijit/form/Button",
    "dojo/dom-construct",
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoWiocclDialog',
    "dijit/registry",
    "dojo/dom",
    'dijit/Tooltip',
    'dojo/on',
    'dijit/place',
    'dojo/mouse',
    'ioc/dokuwiki/editors/DojoManager/plugins/WiocclStructureClone',
    'ioc/dokuwiki/editors/DojoManager/plugins/WiocclStructureWrapper',
    'ioc/dokuwiki/editors/DojoManager/plugins/DojoEditorUtils',


], function (declare, AbstractParseableDojoPlugin, lang, _Plugin, string, Button, domConstruct,
             Dialog, registry, dom, Tooltip, on, place, mouse, WiocclStructureClone, WiocclStructureWrapper,
             DojoEditorUtils) {

    let REFRESH_TIMEOUT = 10000; // refresc automàtic de l'editor per evitar que es tanqui, temps en ms
    let counter = 0;

    // // ALERTA! Aquestes classes no carregan correctament a la capçalera, cal fer un segon require
    let ajax = null;
    require(["ioc/dokuwiki/editors/Components/AjaxComponent"], function (AjaxComponent) {
        ajax = new AjaxComponent(); //ajax.send(urlBase, dataToSend, type)
        ajax.urlBase = 'lib/exe/ioc_ajax.php?call=wioccl&format=html';
        ajax.method = 'post';
    });

    // No funciona si es carrega directament, hem de fer la inicialització quan cal utilitzar-lo

    let WiocclButton = declare(AbstractParseableDojoPlugin, {

        // S'assigna quan es crea el diàleg
        wiocclDialog: null,

        init: function (args) {
            this.inherited(arguments);

            this.htmlTemplate = args.htmlTemplate;

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


            // ALERTA! this.editor fa referència a l'editor dojo
            // Aquesta és l'estructura que s'utilitza quan es fa mouseover un element
            if (this.editor.extra && this.editor.extra.wioccl_structure) {
                console.log("Estructura json:", this.editor.extra.wioccl_structure);

                this.structure = new WiocclStructureClone(
                    {
                        structure: this.editor.extra.wioccl_structure.structure
                    }, this.editor.dispatcher);
                this.addButton(config);

                this.editor.on('changeCursor', this.updateCursorState.bind(this));
                this.editor.on('import', this.updateHandlers.bind(this));

            } else {
                // aquest document no te estructura wioccl, ha de ser un document normal
                // així que no afegim els botons ni controlem la posició del cursor
            }

            // console.log(this.editor.extra.wioccl_structure.structure);
        },

        addButton: function (config) {
            this.button = new Button(config);
        },

        updateHandlers: function () {
            // console.log("updating handlers", jQuery(this.editor.iframe).contents().find('[data-wioccl-ref]'));
            this._addHandlers(jQuery(this.editor.iframe).contents().find('[data-wioccl-ref]'), this);
        },

        process: function () {

            let node = this.structure.createNode('void', '0');
            node.name = "buit";
            let html = this.htmlTemplate.replace('%s', node.id);

            // Com es tracta d'un node que penja del root no cal indicar el afterId, la posició dependrà del span
            let afterId = 0;

            this.structure.addNode(node, afterId);

            let $node = DojoEditorUtils.insertHtmlInline(html, this.editor);

            this._addHandlers($node, this);

            this.editor.forceChange();

            // simulem un click per obrir-lo automàticament
            $node.trigger('click');
        },

        getNodeById: function (refId) {
            return this.structure.getNodeById(refId)
        },

        _addHandlers: function ($domNode, context) {

            $domNode.off('click');

            // ALERTA! aquests botons realment no tenen handler, es dispara perquè es troben dins del TR que és
            // el node que sí que es troba al $domNode.
            let wiocclRows = jQuery(context.editor.iframe).contents().find('tr[data-wioccl-ref]');
            wiocclRows.each(function() {
                let $this = jQuery(this);
                let $icon = jQuery('<span data-wioccl-state="open"></span>');
                $this.append($icon);
                $icon.attr('data-wioccl-ref', $this.attr('data-wioccl-ref'));
                $icon.attr('data-wioccl-xtype', 'ignore');
            });

            // ALERTA[Xavi] ho posem com una variable i no com una propietat perquè necessitem
            // accés al context (aquesta classe) i al this (el node on es dispara l'event) i
            // una referència per poder fer un off per no reafegir-lo

            let _enableHighlight = function (ref, isParent) {

                let $relatedNodes = jQuery(context.editor.iframe).contents().find('[data-wioccl-ref="' + ref + '"]');
                $relatedNodes.addClass('ref-highlight');

                if (!isParent) {
                    $relatedNodes.addClass('child');
                }

                let wiocclNode = context.getNodeById(ref);

                for (let child of wiocclNode.children) {
                    if (typeof child === 'object') {
                        console.log(child, this.structure);
                    }
                    _enableHighlight(child, false);
                }
            }

            let _disableHighlight = function (ref) {
                let $relatedNodes = jQuery(context.editor.iframe).contents().find('[data-wioccl-ref="' + ref + '"]');
                $relatedNodes.removeClass('ref-highlight');
                $relatedNodes.removeClass('child');

                let wiocclNode = context.getNodeById(ref);

                if (!wiocclNode) {
                    return;
                }

                for (let child of wiocclNode.children) {
                    if (typeof child === 'object') {
                        console.log(child, this.structure);
                    }
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

            $domNode.off('mouseover', _showTooltip);

            $domNode.on('mouseover', _showTooltip);

            let _hideTooltip = function (e) {
                let $this = jQuery(this);
                let refId = $this.attr('data-wioccl-ref');

                if ($this.attr('data-tooltip')) {
                    $this.removeAttr('title');
                    $this.removeAttr('data-tooltip');
                }

                _disableHighlight(refId);
            };

            $domNode.on('mouseout', _hideTooltip);
            $domNode.on('mouseout', _hideTooltip);

            $domNode.on('click', function (e) {
                let $item = jQuery(this);

                e.preventDefault();
                e.stopPropagation();

                let refId = $item.attr('data-wioccl-ref');
                let wiocclNode = context.getNodeById(refId);

                if (wiocclNode.isClone) {
                    alert("Aquest element es una copia, es mostrarà l'element pare");

                    while (wiocclNode.isClone) {
                        wiocclNode = context.getNodeById(wiocclNode.parent);
                        refId = wiocclNode.id;
                    }
                }

                context.structure.root = refId;

                let structure = new WiocclStructureWrapper(context.structure, context.editor.dispatcher);
                let tree = structure.getTreeFromNode(refId, true);

                let oldDialog = registry.byId('wioccl-dialog' + counter);

                if (oldDialog) {
                    oldDialog.destroyRecursive();
                    counter++;
                }


                // check readonly
                let $node = context.editor.getCurrentNode();

                // if ($node.attr('contenteditable') === "false" || $node.attr('data-wioccl-ref')) {
                let readonly =  $node.attr('contenteditable') === "false";
                // console.log("És wioccl en readonly?", readonly);


                let wiocclDialog = new Dialog({
                    title: 'Edició wioccl' + (readonly? ' (només lectura)' : ''),
                    fields: context.editor.extra.wioccl_structure.fields,
                    style: 'height:100%; width:100%; top:0; left:0; position:absolute; max-width: 80%; max-height: 80%;',
                    onHide: function (e) { // Es dispara quan es tanca el diàleg
                        clearTimeout(refreshTimerId);
                        this.destroyRecursive();
                    },
                    id: 'wioccl-dialog' + counter,
                    firstResize: true,
                    dispatcher: context.editor.dispatcher,
                    args: {
                        id: 'wioccl-dialog' + counter,
                        value: structure.getCode(tree[0])
                    },
                    wioccl: structure.getNodeById(wiocclNode.id),
                    structure: structure,
                    tree: tree,
                    refId: refId,
                    saveCallback: context._save,
                    updateCallback: context._update,
                    enabledDelete: true,

                    // ALERTA[Xavi], aquesta propietat no és utilitzada pel dialeg, la injectem per poder-la utilitzar
                    // al saveCallback
                    originalStructure: context.structure,
                    $document: jQuery(context.editor.iframe).contents(),
                    pluginEditor: context.editor,
                    readonly: readonly
                });

                // només cal refrescar mentre estigui obert el dialog principal
                // TODO: canviar per un sistema que detecti canvis al dialeg i afegeixi un throttle per no enviar
                // en cada canvi
                let refreshTimerId = setInterval(function() {
                        context.editor.refresh();
                    },
                    REFRESH_TIMEOUT
                );

                context.wiocclDialog = wiocclDialog;

                wiocclDialog.startup();
                wiocclDialog.show();
                wiocclDialog._updateFields(tree[0]);
                wiocclDialog._updateDetail(tree[0]);
            });
        },

        _update: function (editor) {
            // Referència a la estructura del diàleg
            let structure = this.structure;
            structure.updating = true;

            // Restaurem la estructura abans de fer el parse
            structure.restore();

            let wiocclNode;

            let content = editor.getValue();
            if (content) {
                wiocclNode = structure.parse(editor.getValue(), editor.wioccl);
            } else {
                this.structure._removeChildren(editor.wioccl.id);
                if (editor.wioccl.type !== 'wrapper') {
                    let currentNode = structure.getNodeById(editor.wioccl.id);
                    wiocclNode = structure.getNodeById(currentNode.parent);
                    this.structure._removeNode(currentNode.id);
                } else {
                    wiocclNode = structure.getNodeById(structure.root);
                }
            }

            this.setData(structure.getNodeById(structure.root), wiocclNode);

            this.editor.resetOriginalContentState();
            this.dirtyStructure = false;
            structure.updating = false;
        },

        // Enviar el text: s'envia el text reconstruit a partir dels nodes i el rootRef, només cal fer la traducció
        // i reemplaçar les nodes.
        // Si aquest no és el root, cal cercar el parent que té com a parent el node 0
        _save: function (editor) {
            let context = this;

            // 0 actualitzar el contingut actual
            let structure = this.structure;
            let wiocclNode = structure.parse(editor.getValue(), editor.wioccl);

            // No refem les branques
            this.setData(structure.getNodeById(structure.root), wiocclNode, true);

            // 1 reconstruir el wioccl del node pare (que serà el wrapper i serà descartat), això és
            // el que s'ha d'enviar al servidor
            let rootRef = structure.root;

            // Cal tenir en compte que el rootRef podria ser el node arrel i en aquest cas no cal cerca més
            while (structure.getNodeById(rootRef).id > 0 && structure.getNodeById(rootRef).parent > 0) {
                rootRef = structure.getNodeById(rootRef).parent;
            }

            // cal desar el parent per restaurar-lo, el que retorna del servidor no te cap parent assignat
            let originalWiocclParent = structure.getNodeById(rootRef).parent;
            let originalRefId = rootRef;

            let text = structure.getCode(structure.getNodeById(rootRef));


            // 2 enviar al servidor juntament amb el id del projecte per poder carregar el datasource, cal enviar també
            //      la propera referència, que serà la posició per inserir els nodes nous
            let globalState = this.dispatcher.getGlobalState();

            let dataToSend = {
                content: text,
                rootRef: rootRef,
                nextRef: structure.getNextKey(),
                projectOwner: globalState.getContent(globalState.currentTabId).projectOwner,
                projectSourceType: globalState.getContent(globalState.currentTabId).projectSourceType,
                sectok: this.editor.dispatcher.getSectok()
            };

            // console.log("Data to send:", dataToSend);

            // 3 al servidor fer el parser wioccl, traduir a html i retornar-lo per inserir-lo
            // al document editat (cal indicar el punt d'inserció).
            // Fem servir ajax perquè això no ha de passar pel processor

            ajax.setStandbyId(jQuery('body').get(0));

            this.hide();

            ajax.send(dataToSend).then(function (data) {
                // fem que l'editor dispari un event, això ho fa servir el DojoReadonlyToggle

                // retorn:
                // [0] objecte amb el resultat del command <-- diria que aquest és l'únic necessari
                //      value.content <-- contingut
                //      value.extra.wioccl_structure <-- estructura
                // [1] jsinfo
                // [n...] extraContentState

                // 4 eliminar tots els nodes que penjaven originalment de this.root
                //      alerta! no es segur que els nodes del backupstructure siguin els mateixos
                //      que retorna el servidor, així que fem servir els valors retornats.

                // aquesta es la estructura original.
                let target = context.originalStructure.getRaw();

                let removedIds = structure._removeChildren(rootRef);

                for (let id of removedIds) {
                    let $node = context.$document.find('[data-wioccl-ref="' + id + '"]');
                    $node.remove();
                }

                // Cal eliminar també les referències al node arrel (poden ser múltiple en el cas del foreach)
                // Cal inserir una marca pel node root
                let $rootNodes = context.$document.find('[data-wioccl-ref="' + rootRef + '"]');

                // 5 inserir el html que ha arribat del servidor. Afegim les noves i eliminem el cursor
                let $nouRoot = jQuery(data[0].value.content);

                jQuery($rootNodes.get(0)).before($nouRoot);

                // Elimem les referencies
                $rootNodes.remove();

                // Actualitzem la estructura
                let source = data[0].value.extra.wioccl_structure.structure;

                // fusió del original i l'anterior
                Object.assign(target, source);

                // Restaurem el parent
                target[originalRefId].parent = originalWiocclParent;

                // ALERTA! aquesta es la estructura associada al plugin, no al diàleg
                context.originalStructure.setStructure(target, context.originalStructure.root);

                // Actualitzem la estructura de l'editor perque és la que utilitza el BasicEditorSubclass quan desa
                context.pluginEditor.extra.wioccl_structure.structure = target;
                context.pluginEditor.emit('import');
                context.pluginEditor.forceChange();

                // ALERTA! Això és un arreglo per fer netejaa dels nodes de contingut orfes (siblings inicial i final
                // d'un parse de wioccl parcial
                let $textNodes = context.$document.find('[data-text-node]');

                $textNodes.each(function() {
                   // PAS 1: afegim els nodes com a nodes de text
                    let $this = jQuery(this);
                    let text = $this.text();
                    var textNode = document.createTextNode(text);
                    $this.before(textNode);
                });
                // PAS 2: eliminar els spans
                $textNodes.remove();

                context.$document.find('[data-wioccl-ref="' + originalRefId + '"]')[0].scrollIntoView();

            });
        },

        parse: function () {
            let $content = jQuery(this.editor.iframe).contents();
            let $nodes = $content.find('[data-wioccl-ref]');

            this._addHandlers($nodes, this)
            $content.find('[data-wioccl-ref="0"]').css('display', 'none');



        },

        updateCursorState: function (e) {
            let $node = this.editor.getCurrentNode();

            if ($node.attr('contenteditable') === "false" || $node.attr('data-wioccl-ref')) {
                this.button.setDisabled(true);
            } else {
                this.button.setDisabled(false);
            }
        },
    });

    _Plugin.registry["insert_wioccl"] = function () {
        return new WiocclButton({command: "insert_wioccl"});
    };

    return WiocclButton;
});