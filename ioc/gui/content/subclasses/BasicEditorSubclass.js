define([
    "dojo/_base/declare",
    "dojo/on",
    'ioc/dokuwiki/editors/AceManager/AceEditorFullFacade',
    'ioc/dokuwiki/editors/DojoManager/DojoEditorFacade',
    'dojo/dom-geometry',
    'dojo/dom',
    "dojo/io-query",
    "dojo/_base/lang",
    'ioc/gui/content/subclasses/AbstractEditorSubclass',
], function (declare, on, AceFacade, DojoEditorFacade, geometry, dom, ioQuery, lang, AbstractEditorSubclass) {

    return declare([AbstractEditorSubclass],

        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
         *
         * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
         * en el futur.
         *
         * Aquesta classe s'espera que es mescli amb un DocumentContentTool per afegir-li les funcions de edició de documents
         * amb un ACE-Editor.
         *
         * @class EditorSubclass
         * @extends DocumentSubclass, AbstractChangesManagerCentral
         * @author Xavier García <xaviergaro.dev@gmail.com>
         * @private
         * @see contentToolFactory.generate()
         */
        {

            // TOOLBAR_ID: 'full_editor',
            // VERTICAL_MARGIN: 25,
            // MIN_HEIGHT: 200, // TODO [Xavi]: Penden de decidir on ha d'anar això definitivament. si aquí o al AceFacade
            
            editorCreated:false,

            constructor: function () {
                this.forceClose = false;

            },
            
            setReadOnly: function (value) {
                this.set("readonly", value);
            },

            getReadOnly: function () {
                return this.get("readonly");
            },


            /**
             * Es registra als esdeveniments i activa la detecció de canvis, copiar, enganxar i pijar tecles dins
             * del node on es troba quest ContentTool.
             *
             * Realitza l'enregistrament al ChangesManager.
             *
             * @override
             */
            postAttach: function () {
                this.inherited(arguments);

                this.registerObserverToEvent(this, this.eventName.DOCUMENT_SELECTED, this.fillEditorContainer.bind(this)); // Alerta[Xavi] Necessari per redimensionar correctament l'editor quan es recarrega amb més d'una pestanya
                this.registerObserverToEvent(this, this.eventName.DATA_REPLACED, this.fillEditorContainer.bind(this)); // Alerta[Xavi] Necessari per redimensionar correctament l'editor quan es recarrega amb més d'una pestanya
                this.registerObserverToEvent(this, this.eventName.CONTENT_SELECTED, this.fillEditorContainer.bind(this)); // Alerta[Xavi] Necessari per redimensionar correctament l'editor quan es recarrega amb més d'una pestanya

                this.setFireEventHandler(this.eventName.SAVE, this._doSave.bind(this));
                this.setFireEventHandler(this.eventName.CANCEL, this._doCancelDocument.bind(this));

                this.fillEditorContainer();
            },


            _doSave: function (event) {
                // console.log("BasicEditorSubclass#_doSave", this.id, event);



                var dataToSend = this.getQuerySave(this.id),
                    containerId = this.id;

                // ALERTA[Xavi] No es pot fer servir el this.mixData perquè pertany al ChangesManagerCentralSubclass
                // if (event.dataToSend) {
                //     dataToSend = this.mixData(dataToSend, event.dataToSend, 'object');
                // }
                //
                // if (event.extraDataToSend) {
                //     // dataToSend = lang.mixin(dataToSend, event.extraDataToSend);
                //     dataToSend = this.mixData(dataToSend, event.extraDataToSend, 'object');
                // }


                if(event.extraDataToSend){
                    if(typeof event.extraDataToSend==="string"){
                        lang.mixin(dataToSend, ioQuery.queryToObject(event.extraDataToSend));
                    }else{
                        lang.mixin(dataToSend, event.extraDataToSend);
                    }

                }


                if(event.dataToSend){
                    if(typeof event.dataToSend==="string"){
                        lang.mixin(dataToSend, ioQuery.queryToObject(event.dataToSend));
                    }else{
                        lang.mixin(dataToSend, event.dataToSend);
                    }

                }



//                this.eventManager.dispatchEvent(this.eventName.SAVE, {
//                    id: this.id,
//                    dataToSend: dataToSend,
//                    standbyId: containerId
//                })


                return {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                };

            },

            // Alerta[Xavi] el event pot contenir informació que cal afegir al dataToSend, com per exemple el keep_draft i el discardChanges
            _doCancelDocument: function (event) {
                var containerId = this.id,
                    dataToSend = this.getQueryCancel(this.id); // el paràmetre no es fa servir



                if(event.extraDataToSend){
                    if(typeof event.extraDataToSend==="string"){
                        dataToSend += "&" + event.extraDataToSend;
                    }else{
                        dataToSend += "&" + ioQuery.objectToQuery(event.extraDataToSend);
                    }
                }

//                console.log("DATA Enviada amb l'event: ", event);
//                console.log("DATA Enviada al servidor: ", dataToSend);
                
                return {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                };

            },

            getQuerySave: function () {

                var $form = jQuery('#form_' + this.id),
                    values = {},
                    text;

                jQuery.each($form.serializeArray(), function (i, field) {
                    values[field.name] = field.value;
                });

                text = this.getCurrentContent();

//                values.wikitext = jQuery.trim(text);
                values.wikitext = text;

                values.contentFormat = this.getEditor().getContentFormat();

                var contentCache = this.dispatcher.getGlobalState().getContent(this.id);

                if (contentCache.projectOwner) {
                    values.projectOwner = contentCache.projectOwner;
                    values.projectSourceType = contentCache.projectSourceType;
                }

                return values;
            },

            getQueryCancel: function () {
                var query = 'do=cancel&id=' + this.ns;

                if (this.rev) {
                    query += '&rev=' + this.rev;
                }


                var contentCache = this.dispatcher.getGlobalState().getContent(this.id);

                if (contentCache.projectOwner) {
                    query +="&projectOwner=" + contentCache.projectOwner;
                    query +="&projectSourceType=" + contentCache.projectSourceType;
                }

                return query;
            },

            /**
             * Retorna el text contingut al editor per la id passada com argument o la del id del document actual si
             * no s'especifica.
             *
             * @returns {string|null} - Text contingut al editor
             * o null si no existeix
             */
            getCurrentContent: function () {
                var content = this.getEditor().getValue();
                //console.log('EditorSubclass#getCurrentContent', content);
                return content;
            },


            /**
             * Al ser seleccionat aquest ContentTool estableix l'editor com a sel·leccionat.
             *
             * La primera vegada que es selecciona el content tool encara no es troba carregat al ContentCache per això
             * s'ha de fer la comprovació.
             *
             * @override
             */
            onSelect: function () {
                var contentCache = this.dispatcher.getContentCache(this.id);

                if (contentCache && contentCache.getEditor()) {
                    this.dispatcher.getContentCache(this.id).getEditor().select();
                }

                this.inherited(arguments);
            },

            /**
             * Al ser des-seleccionat aquest ContentTool es des-selecciona l'editor.
             *
             * Ens assegurem que existeix l'editor abans de des-seleccionar-lo per evitar errors.
             *
             * @override
             */
            onUnselect: function () {
                var contentCache = this.dispatcher.getContentCache(this.id);

                if (contentCache && contentCache.getEditor()) {
                    this.dispatcher.getContentCache(this.id).getEditor().unselect();
                }

                this.inherited(arguments);
            },


            /**
             * Al post render s'afegeix la funcionalitat de reconstruir els prefix i suffix necessaris per la wiki al
             * fer click en el botó de desar i s'afegeix la toolbar a cada editor.
             *
             * @override
             */
            postRender: function () {

                this.inherited(arguments);
                
                if(!this.editorCreated){
                    if (!this.getReadOnly()) {
                        this.requirePage();
                    }

                    this.addEditors();
                    // this.addToolbars();

                    on(window, 'resize', function () {
                        this.fillEditorContainer();
                    }.bind(this));

                    this.fillEditorContainer();
                    this.editorCreated=true;
                }
            },

            // Afegeix un editorAce per cada editor actiu
            addEditors: function (editor) {
                // console.log("BasicEditorSubclass#addEditors", this.editorType);
                // this.editor = this.createEditor({id : this.id}, this.editorType); // ALERTA[Xavi] Establert el tipus d'editor via codi per fer proves (DOJO)

                this.editor = this.createEditor({id:this.id, content: this.content.content || this.originalContent, originalContent: this.originalContent}, this.editorType); // ALERTA[Xavi] Establert el tipus d'editor via codi per fer proves (ACE)
                //console.log("Content Format:", this.editor.getContentFormat());
            },

            createEditor: function(config, type) {

                switch (type) {
                    case "Dojo":
                        return this.createDojoEditor(config);

                    case "ACE": // fall-through intencionat

                    default:
                        return this.createAceEditor(config);
                }
            },

            createDojoEditor: function(config) {
                return new DojoEditorFacade(
                    {
                        containerId:'editor_' + config.id,
                        textareaId:'textarea_' + config.id,
                        dispatcher: this.dispatcher,
                        content: config.content,
                        originalContent: config.originalContent,
                        readOnly: this.getReadOnly(),
                    }
                );
            },

            createAceEditor: function (config) {

                var $textarea = jQuery('#textarea_' + config.id); // TODO[Xavi] Només cal per determinar el wrap, si es passa des del servidor no caldria

                return new AceFacade({
                    xmltags: JSINFO.plugin_aceeditor.xmltags,
                    containerId: 'editor_' + config.id,
                    textareaId: 'textarea_' + config.id,
                    theme: JSINFO.plugin_aceeditor.colortheme,
                    readOnly: this.getReadOnly(),
                    wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                    wrapMode: $textarea.attr('wrap') !== 'off',
                    mdpage: JSINFO.plugin_aceeditor.mdpage,
                    auxId: config.id,
                    dispatcher: this.dispatcher,
                    content: config.content,
                    originalContent: config.originalContent,
                });
            },

            requirePage: function() {
                this.required = this.dispatcher.getGlobalState().requirePage(this);
                var readOnly = !this.required;
                this.setReadOnly(readOnly);
            },

            requirePageAgain: function () {

                this.requirePage();

                if (!this.getReadOnly()) {
                    this.addToolbars();
                    this.editor.unlockEditor();
                } else {
                }

            },

            freePage: function() {
                this.required = false;
                this.dispatcher.getGlobalState().freePage(this.id, this.ns);
                this.fireEvent(this.eventName.FREE_DOCUMENT, {id:this.id})
            },



            getEditor: function () {
                return this.editor;
            },

            fillEditorContainer: function () {
                this.editor.fillEditorContainer();
            },

            /**
             * Aquest mètode es cridat automàticament quan es realitza un canvi de mida del ContentTool.
             *
             * @param {*} args - el objecte amb els arguments pot tenir diferents hash amb informació sobre el canvi
             * sent els estandard changeSize i resultSize.
             * @see resize()
             */
            onResize: function (args) {
                var $form = jQuery('#form_' + this.id);
                if($form.length>0 && args.changeSize){
                    $form.height(args.changeSize.h);
                }
            },

            onClose: function() {
                // console.log("BasicEditorSubclass#onclose");
                var ret = this.inherited(arguments);

                if(ret===undefined){
                    ret = true;
                }



                if (ret && !this.forceClose) {


                    var eventManager = this.dispatcher.getEventManager();
                    eventManager.fireEvent(eventManager.eventName.CANCEL, {
                        id: this.id,
                        name: eventManager.eventName.CANCEL,
                        dataToSend: {
                            no_response: true,
                            keep_draft: false,
                            close: true
                        }
                    }, this.id);

                    ret = false; // Si es dispara l'event no es tanca la pestanya
                }
                return ret;
            },

            getCurrentEditor: function() {

                return this.editor;
            }
        });
});
