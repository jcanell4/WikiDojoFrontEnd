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

    // Aquest són els elements que es crean com a contenidors d'items wioccl i que s'han d'eliminar
    // per poder reconstruir el document correctament al servidor
    let tagList = ['p', 'th', 'td', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

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

            editorCreated: false,

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

            // TODO[Xavi] refactoritzar, aquesta és una funció utilitzada només pel editor HTML
            // per reconstruir el html adaptat, caldria afegir un _PreSave i algun sistema per
            // lligar plugins dels editors amb aquest _PreSave del ContentEditor
            _FixHtmlDocumentToSend: function (dataToSend) {
                let removedRefs = new Set();
                let structure = this.editor.editor.extra.wioccl_structure.structure;

                console.log("Structure to save:", this.editor.editor.extra.wioccl_structure);

                dataToSend.wioccl_structure = JSON.stringify(this.editor.editor.extra.wioccl_structure);
                // console.log("Estructura:", dataToSend.wioccl_structure);
                // console.log("Estructura:", structure);

                let value = dataToSend.wikitext;

                console.log("Data to send? hi ha el rootRef?", dataToSend);



                // Cal eliminar les referencies wioccl, excepte els marcadors d'apertura,
                // ja que en aquest s'incrustarà el codi wioccl de la estructura
                // let $value = jQuery(value).contents();

                // ALERTA! si hi ha un <div> dintre d'un element inline, com per exemple un <a> o <span>
                // es tanca el paràgraf, la etiqueta i s'obre el <div>
                // aquest cas es dona amb els no-render, que cal eliminar-los perquè contenen els botons
                // no contingut per parsejar.

                value = value.replace(/<div class="no-render.*?<\/div>/mg, '');

                // Cal embolcallar tot dintre d'un sol node per obtenir després el html
                let $root = jQuery('<div>');
                let $value = $root.html(value);

                $value.find('.no-render').remove();

                $value.find('[data-wioccl-ref]').each(function() {
                    let $node = jQuery(this);
                    let refId = $node.attr('data-wioccl-ref');

                    // console.log("comprovant node:", $node);

                    // Cal eliminar només els nodes open que tinguinun parentId > 0, perquè aquests node s'afegiran
                    // automàticament amb la reconstrucció del wioccl
                    // console.log(refId, structure[Number(refId)]);
                    if ($node.attr('data-wioccl-state') === 'open' && structure[Number(refId)].parent === '0') {

                        // console.log("Comprovant node d'apertura per saltar:", refId, structure[Number(refId)]);
                        // comprovació!
                        if (structure[Number(refId)].id !== refId) {
                            console.error(structure[Number(refId)].id, refId);
                            alert("Error amb la referència a dels identificadors, el index de l'array no es correspon amb el refId")
                        }
                        return;
                    }



                    // Si el parent és un paràgraf i ha quedat buit l'eliminem
                    let $parent = $node.parent();

                    // els tr amb refId de manera diferent perquè cal ficar el span amb el ref al foreach que el genera
                    if ($node.prop('tagName').toLowerCase() === 'tr' && !removedRefs.has(refId)) {
                        // console.log("inserint un span amb el refid", refId);
                        let html = `<span data-wioccl-ref="${refId}" data-wioccl-state="open"></span>`;
                        jQuery(html).insertBefore($node);
                    }

                    $node.remove();

                    let debugText = $node.text();

                    removedRefs.add(refId);

                    // console.log("Parent tag & length:", $parent.prop("tagName").toLowerCase(), $parent.text().length, $parent);

                    let parentTag = $parent.length === 1 ? $parent.prop("tagName").toLowerCase() : '';


                    // Paràgrafs: en el document de prova crec que no passa, però podria passar.
                    // Cel·les: Aquest cas es dona quan una columna és opcional i es mostra només si s'acompleix
                    // un IF no cal comprovar l'alineació perquè això ho assignarà el

                    // ALERTA! Si només contenia wioccl ignorem els salts de línia, aquest es tornaràn
                    // a afegir als seus wioccl respectius

                    if (tagList.includes(parentTag)
                        && $parent.children().length === 0
                        && $parent.text().trim().length === 0) {
                        // console.warn(`Eliminat ${parentTag} buit, child text:${debugText}`);
                        $parent.remove();
                    }

                });




                // Correcció de paràgrafs que només contenen un \n:
                //  Si el node que hi ha a continuació NO és un node de text amb '\n' cal afegir un node de text amb '\n'
                //  En qualsevol cas cal eliminar el paràgraf


                $value.find('p').each(function() {
                    var $node = jQuery(this);

                    // Si el node que hi ha acontinuació és \n no fem el canvi perquè es duplicaria
                    if ($node.text()==="\n") {

                        if ($node[0].nextSibling && $node[0].nextSibling.textContent !== "\n") {
                            let textNode = document.createTextNode("\n");
                            $node.parent()[0].insertBefore(textNode, this);
                        }
                        $node.remove();

                    }
                });

                $value.find(':not(table br) br').remove();
                // console.log("Només resten els brs que son dins de taules:", $value.find('br'));
                // console.log($value.html());
                dataToSend.wikitext = $value.html();


                // console.log("Data to send:", dataToSend);
            },

            _doSave: function (event) {
                // console.log("BasicEditorSubclass#_doSave", this.id, event);

                var dataToSend = this.getQuerySave(this.id),
                    containerId = this.id;


                if (this.editor.editor.extra && this.editor.editor.extra.wioccl_structure) {
                    this._FixHtmlDocumentToSend(dataToSend);
                }

                if (event.extraDataToSend) {
                    if (typeof event.extraDataToSend === "string") {
                        lang.mixin(dataToSend, ioQuery.queryToObject(event.extraDataToSend));
                    } else {
                        lang.mixin(dataToSend, event.extraDataToSend);
                    }

                }

                if (event.dataToSend) {
                    if (typeof event.dataToSend === "string") {
                        lang.mixin(dataToSend, ioQuery.queryToObject(event.dataToSend));
                    } else {
                        lang.mixin(dataToSend, event.dataToSend);
                    }

                }

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


                if (event.extraDataToSend) {
                    if (typeof event.extraDataToSend === "string") {
                        dataToSend += "&" + event.extraDataToSend;
                    } else {
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

                values.wikitext = text;

                values.editorType = this.getEditor().getContentFormat();

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
                    query += "&projectOwner=" + contentCache.projectOwner;
                    query += "&projectSourceType=" + contentCache.projectSourceType;
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

                if (!this.editorCreated) {
                    if (!this.getReadOnly()) {
                        this.requirePage();
                    }

                    this.addEditors();
                    // this.addToolbars();

                    on(window, 'resize', function () {
                        this.fillEditorContainer();
                    }.bind(this));

                    this.fillEditorContainer();
                    this.editorCreated = true;
                }
            },

            // Afegeix un editorAce per cada editor actiu
            addEditors: function (editor) {
                // this.editor = this.createEditor({id : this.id}, this.editorType); // ALERTA[Xavi] Establert el tipus d'editor via codi per fer proves (DOJO)

                this.editor = this.createEditor({
                    id: this.id,
                    content: this.content.content || this.originalContent,
                    originalContent: this.originalContent,
                    extra: this.content.extra
                }, this.editorType);
            },

            createEditor: function (config, type) {

                // console.log("BasicSubclass#createEditor type", type);

                switch (type) {
                    case "DOJO":
                        return this.createDojoEditor(config);

                    case "ACE": // fall-through intencionat

                    default:
                        return this.createAceEditor(config);
                }
            },

            createDojoEditor: function (config) {

                return new DojoEditorFacade(
                    {
                        id: config.id,
                        containerId: 'editor_' + config.id,
                        textareaId: 'textarea_' + config.id,
                        dispatcher: this.dispatcher,
                        content: config.content,
                        originalContent: config.originalContent,
                        readOnly: this.getReadOnly(),
                        extra: config.extra
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
                    extra: config.extra
                });
            },

            requirePage: function () {
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

            freePage: function () {
                this.required = false;
                this.dispatcher.getGlobalState().freePage(this.id, this.ns);
                this.fireEvent(this.eventName.FREE_DOCUMENT, {id: this.id})
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
                if ($form.length > 0 && args.changeSize) {
                    $form.height(args.changeSize.h);
                }
            },

            onClose: function () {
                // console.log("BasicEditorSubclass#onclose");
                var ret = this.inherited(arguments);

                if (ret === undefined) {
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

            getCurrentEditor: function () {

                return this.editor;
            },

            setImportantMessage: function (message) {

                var $message = jQuery(this.domNode).find('.importantMessage');

                if ($message.length === 0) {
                    $message = jQuery("<div class='importantMessage'>" + message + "</div>");
                    jQuery(this.domNode).prepend($message)
                } else {
                    $message.html(message);
                }

                this.fillEditorContainer();


                // alert("TODO. Delegar als editors (facades)");
            }
        });
});
