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
            this.createTree();

            // this._updateHeight();
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
            // alert('stop');
        },

        createTree: function () {
            let store = new Memory({
                data: this.tree,
                getChildren: function (object) {
                    return object.children || [];
                }
            });

            this.store = store;

            let model = new ObjectStoreModel({
                store: store,
                query: {id: this.refId},
                mayHaveChildren: function (item) {
                    // return "children" in item;
                    return item.children.length > 0;
                }
            });

            this.model = model;

            let source = this.source;


            let widgetTree = new Tree({
                id: Date.now(),
                model: model,
                onOpenClick: true,
                onLoad: function () {
                    // dom.byId('image').src = '../resources/images/root.jpg';
                },
                onClick: function (item) {
                    // context._updateDetail(item);
                    // TODO: el update s'ha de portar a aquesta classe
                    source._updateDetail(item);
                }
            });

            this.treeWidget = widgetTree;

            widgetTree.placeAt(this.treeContainerNode);
            widgetTree.startup();
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
            // this.source = source;
            // args.id = (args.id + Date.now() + Math.random()).replace('.', '-'); // id única
            // console.log(this.args);
            let suffixId = (this.args.id + Date.now() + Math.random()).replace('.', '-'); // id única

            let args = this.args;
            args.id = suffixId;

            // ALERTA! per alguna raó si s'afegeix el contentToolFactory com a dependència no funciona (exactament el mateix codi al DataContentProcessor sí que ho fa), la alternativa és utilitzar la factoria del content tool actual:
            // ALERTA! el id
            let id = this.source.editor.dispatcher.getGlobalState().getCurrentId();
            let contentToolFactory = this.source.editor.dispatcher.getContentCache(id).getMainContentTool().contentToolFactory;

            let editorWidget = contentToolFactory.generate(contentToolFactory.generation.BASE, args);
            // let toolbarId = 'FormToolbar_' + (this.args.id);

            let $textarea = jQuery(this.textareaNode);

            let $container = jQuery(this.editorContainerNode);
            // let $container = jQuery('<div id="container_' + this.args.id + '">');
            // this.$node.before($container);


            let $toolbar = jQuery(this.toolbarNode);
            // let $toolbar = jQuery('<div id="toolbar_' + this.args.id + '"></div>');

            // $textarea.css('height', '200px');

            $textarea.attr('id', 'textarea_' + suffixId);
            $container.attr('id', 'container_' + suffixId);
            $toolbar.attr('id', 'toolbar_' + suffixId);


            // $textarea.attr('id', 'textarea_' + args.id);

            // $container.append($toolbar);
            // $container.append($textarea);
            $container.append(editorWidget);

            // $node.append($container);


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


            // this.widgetInitialized = true;

            // Per defecte s'assigna el primer node
            editor.wioccl = this.wioccl;

            this.editor = editor;

            this._updateEditorHeight();
            // cal retornar-lo??
            return editor;

        },

        // constructor: function () {
        //     this.initFunctions = [];
        //     this.sections = [];
        //     this.nextDialogs = {};
        //     this.nextCallbacks = {};
        //
        //     declare.safeMixin(this, arguments);
        //
        //     this.style = "width: " + this.width + "px";
        //
        //     this.eventManager = this.dispatcher.getEventManager();
        // },
        //
        // startup: function () {
        //     this.inherited(arguments);
        //
        //     this._addMessage();
        //     this._addSections();
        //     this._addButtons();
        //     this._addListerners();
        //     this._initNextDialogs();
        //     this._initNextCallbacks();
        //     this._initFunctions();
        //     this._initTimer();
        // },
        //
        // _initTimer: function () {
        //     if (!this.timeout) {
        //         return;
        //     }
        //
        //     var timerId = setTimeout(function () {
        //         this.dispatchEvent(this.eventName.TIMEOUT, {id: this.id});
        //     }.bind(this), this.timeout); // El context del timer serà el propi dialog
        //
        //     this.registerObserverToEvent(this, this.eventName.DESTROY, function () {
        //         clearInterval(timerId);
        //     });
        // },
        //
        // _initFunctions: function () {
        //     for (var i = 0; i < this.initFunctions.length; i++) {
        //         this.initFunctions[i].bind(this)(); // es passa el contexte del dialog a cada funció que es crida
        //     }
        //
        //     // Afegim les suscripcions adicionals
        //     this.registerObserverToEvent(this, this.eventName.TIMEOUT, this.remove.bind(this));
        // },
        //
        // _initNextDialogs: function () {
        //     for (var event in this.nextDialogs) {
        //         this.registerObserverToEvent(this, event, this._createDialogShowCallback(this.nextDialogs[event]).bind(this));
        //     }
        // },
        //
        // _createDialogShowCallback: function (dialog) {
        //     return function () {
        //         dialog.show();
        //     };
        // },
        //
        // _initNextCallbacks: function () {
        //     // llença tota la seqüencia de funcions d'inicialització afegides
        //     for (var event in this.nextCallbacks) {
        //         // Es tracta d'un array
        //         for (var i = 0; i < this.nextCallbacks[event].length; i++) {
        //             this.registerObserverToEvent(this, event, this.nextCallbacks[event][i].bind(this));
        //         }
        //     }
        // },
        //
        // _addMessage: function () {
        //     this.contentNode.innerHTML = this.message;
        // },
        //
        // _addSections: function () {
        //     if (this.single === true) {
        //         this._addSectionSingleColumn();
        //     } else {
        //         this._addSectionsTwoColumns();
        //     }
        //
        //     if (this.sections.length>0) {
        //         jQuery(this.sectionsNode.lastChild).animate({scrollTop: (0)}); // En cas de que es mostri una barra de desplaçament sempre es mostrarà el principi de la secció
        //     };
        // },
        //
        // _addSectionSingleColumn: function() {
        //     for (var i = 0; i < this.sections.length; i++) {
        //         var divSection = domConstruct.create("div", {class:""});
        //
        //         this.sectionsNode.appendChild(divSection);
        //
        //         this._addSectionToNode(this.sections[i], divSection);
        //         // if (this.sections[i].widget) {
        //         //     this.sections[i].widget.placeAt(divSection);
        //         // } else if (this.sections[i] instanceof jQuery) {
        //         //     jQuery(divSection).append(this.sections[i]);
        //         // } else {
        //         //     divSection.appendChild(this.sections[i]);
        //         // }
        //     }
        // },
        //
        //
        // _addSectionsTwoColumns: function() {
        //     for (var i = 0; i < this.sections.length; i++) {
        //         var divSection = domConstruct.create("div", {class:"sectionNode"});
        //         var divContent = domConstruct.create("div", {class:"content"});
        //         divSection.appendChild(divContent);
        //         this.sectionsNode.appendChild(divSection);
        //
        //         this._addSectionToNode(this.sections[i], divContent);
        //         // if (this.sections[i].widget) {
        //         //     this.sections[i].widget.placeAt(divContent);
        //         // } else if (this.sections[i] instanceof jQuery) {
        //         //     jQuery(divContent).append(this.sections[i]);
        //         // } else {
        //         //     divContent.appendChild(this.sections[i]);
        //         // }
        //     }
        // },
        //
        //
        // _addSectionToNode : function (section, node){
        //     if (section.widget) {
        //         section.widget.placeAt(node);
        //     } else if (section instanceof jQuery) {
        //         jQuery(node).append(section);
        //     } else {
        //         node.appendChild(section);
        //     }
        // },
        //
        // _addButtons: function () {
        //     if (!this.buttons) {
        //         return;
        //     }
        //     this._createButtons();
        // },
        //
        // _createButtons: function () {
        //     var buttonId, classButton, btn;
        //     for (var i = 0; i < this.buttons.length; i++) {
        //
        //         buttonId = this._getButtonId(this.buttons[i].id);
        //         if(this.buttons[i].classButton){
        //             classButton = this.buttons[i].classButton;
        //         }else{
        //             classButton = Button;
        //         }
        //         if(!this.buttons[i].props){
        //             this.buttons[i].props = {
        //                 label:this.buttons[i].description
        //             };
        //         }else if(this.buttons[i].description){
        //             this.buttons[i].props.label = this.buttons[i].description;
        //         }
        //         this.buttons[i].props.id = buttonId;
        //         btn = new classButton(this.buttons[i].props);
        //         btn.placeAt(this.buttonsNode);
        //         this.buttons[i].widget = btn;
        //     }
        //
        // },
        //
        // _getButtonId: function (id) {
        //     return 'dialogButton_' + this.id + '_' + id;
        // },
        //
        // _addListerners: function () {
        //     var $button;
        //
        //     if (!this.buttons) {
        //         return;
        //     }
        //     var buttonId;
        //
        //     var context = this;
        //
        //     for (var i = 0; i < this.buttons.length; i++) {
        //         buttonId = this._getButtonId(this.buttons[i].id);
        //         //$button = jQuery('#' + buttonId);
        //
        //         if (Array.isArray(this.buttons[i].callback)) {
        //             this.buttons[i].widget._callbackDlg = [];
        //             this.buttons[i].widget._removeDlg = this.remove.bind(this);
        //             for (var j = 0; j < this.buttons[i].callback.length; j++) {
        //
        //                 this.buttons[i].widget._callbackDlg.push(this.buttons[i].callback[j]);
        //             }
        //
        //
        //             this.buttons[i].widget.onClick = function(){
        //                 for (var j = 0; j < this._callbackDlg.length; j++) {
        //                     this._callbackDlg[j].call(context);
        //                 }
        //                 this._removeDlg();
        //                 //$button.on('click', this.buttons[i].callback[j].bind(this));
        //             };
        //         } else if(this.buttons[i].callback){
        //             this.buttons[i].widget._callbackDlg = this.buttons[i].callback.bind(this);
        //             this.buttons[i].widget._removeDlg = this.remove.bind(this);
        //             this.buttons[i].widget.onClick = function(){
        //                 this._callbackDlg();
        //                 this._removeDlg();
        //                 //$button.on('click', this.buttons[i].callback.bind(this));
        //             };
        //         } else {
        //             var oc = this.buttons[i].widget.onClick.bind(this.buttons[i].widget);
        //             this.buttons[i].widget._removeDlg = this.remove.bind(this);
        //             this.buttons[i].widget.onClick = function(){
        //                 if(oc){
        //                     oc();
        //                 }
        //                 this._removeDlg();
        //             };
        //         }
        //         //$button.on('click', function () {
        //         //  this.remove(); // Al fer click en un boto sempre es tanca el dialeg
        //         //}.bind(this));
        //     }
        // },
        //
        // remove: function () {
        //     // console.log("CustomDialog#remove", this.id);
        //     if (!this.destroying) {
        //         this.destroying = true;
        //         // console.log("CustomDialog#remove (confirmed)", this.id);
        //         this.destroyRecursive();
        //         this.dispatchEvent(this.eventName.DESTROY, {id: this.id, refId: this.refId});
        //     }
        // },
        //
        // onHide: function () {
        //     // console.log("CustomDialog#onHide");
        //     this.inherited(arguments);
        //     this.dispatchEvent(this.eventName.CANCEL, {id: this.id, refId: this.refId});
        //     this.remove();
        // },
        //
        // // Correspn al docId o algun altre tipus d'identificador únic amb el que volem agrupar dialegs
        // setRefId: function (refId) {
        //     this.refId = refId;
        // }
    });
});
