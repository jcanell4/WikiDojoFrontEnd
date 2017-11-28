/**
 * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
 *
 * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
 * en el futur.
 *
 * Aquesta classe s'espera que es mescli amb un DocumentContentTool per afegir-li les funcions de edició de documents
 * amb un ACE-Editor.
 *
 * @class EditorContentToolDecoration, ContentToolCentralDecorator
 * @extends DocumentContentTool
 * @author Xavier García <xaviergaro.dev@gmail.com>
 * @private
 * @see contentToolFactory.decorate()
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/dom-attr",
    "dojo/dom"
], function (declare, lang, on, domAttr,dom) {

    return declare(null,

        /**
         * Aquesta classe es una decoració i requereix que es faci un mixin amb un ContentTool per poder funcionar.
         *
         * Aquesta decoració modifica el ContentTool per fer la comprovació de canvis abans de tancar-se i canviar
         * el color de la pestanya a vermell si es produeixen canvis.
         *
         * Aquesta decoració s'ha d'aplicar a un DocumentContentTool o que afegeixi un métode removeState() per poder
         * realitzar la comprovació de canvis abans de tancar-se.
         *
         * @class EditorContentTool
         * @extends DocumentContentTool, AbstractChangesManagerDecoration
         * @private
         */
        {
            controlsChecked: 0,
            /**
             * El contingut original inicial s'ha de passar a travès del constructor dins dels arguments com la
             * propietat originalContent.
             *
             * @param args
             */
            constructor: function (args) {
                //this._setOriginalContent(args.originalContent);
            },

            /**
             * Retorna cert si el contingut actual i el contingut original son iguals o fals si no ho son.
             *
             * @returns {boolean} - Retorna true si el contingut ha canviat o false en cas contrari
             */
            isContentChanged: function () {
                result = false;
                /*var content = this._getCurrentContent(),
                    result = !(this._getOriginalContent() == content);

                if (result) {
                    this.onDocumentChanged();

                }*/

                return result;
            },

            /**
             * Reinicialitza l'estat del document establint el valor del contingut original igual al del contingut
             * actual.
             */
            resetContentChangeState: function () {
                /*this._setOriginalContent(this._getCurrentContent());
                this.onDocumentChangesReset();*/
            },

            /**
             * Es registra als esdeveniments i activa la detecció de canvis, copiar, enganxar i pijar tecles dins
             * del node on es troba quest ContentTool.
             *
             * Realitza l'enregistrament al ChangesManager.
             *
             * @override
             */
            //postLoad: function () {
            postAttach: function () {
                //TODO[Xavi] Aquesta crida s'ha de fer aquí perque si no el ContentTool que es registra es l'abstracta
                //this.registerToChangesManager();

                /*on(this.domNode, 'keyup', '#dw__upload:submit',  lang.hitch(this, this._checkChanges));
                on(this.domNode, 'paste', lang.hitch(this, this._checkChanges));
                on(this.domNode, 'cut', lang.hitch(this, this._checkChanges));
                on(this.domNode, 'focusout', lang.hitch(this, this._checkChanges));*/
                on(dom.byId("page__revisions_"+this.docId),"submit",  lang.hitch(this, this._doForm));
                on(this.domNode,'input[type="checkbox"]:change',  lang.hitch(this, this._doCheckCount));
                on(this.domNode,'.wikilink1:click',  lang.hitch(this, this._doClickLink));
                on(this.domNode,'.diff_link:click',  lang.hitch(this, this._doClickUll));
                //
                var midom = dom.byId("dw__upload_"+this.docId);
                if(midom != null){
                    on(midom,"submit",  lang.hitch(this, this._doFormUpLoad));
                }

                this.inherited(arguments);
            },
            
            _doCheckCount: function (evt) {
                if (evt.target.checked && this.controlsChecked < 2) {

                    this.controlsChecked++;

                } else if (!evt.target.checked) {

                    this.controlsChecked--;

                } else {

                    evt.target.checked = false;
                    alert("Només es poden comparar les diferencies entre 2 versions alhora");
                }
            },
            _doFormUpLoad: function (evt) {
                evt.preventDefault();
                var source = evt.target || evt.srcElement;
                this._createRequest();
                this.requester.urlBase = "ajax.php?call=mediadetails";
                var x = document.getElementById("upload__file_"+this.docId);
                var file = x.files[0];
                if (file != null) {
                    var ow = "";
                    if (document.getElementById("dw__ow_"+this.docId).getAttribute("checked")) {
                        ow = "&ow=checked";
                    }
                    var mediaid = "";
                    if (document.getElementById("upload__name_"+this.docId).getAttribute("value")) {
                        mediaid = document.getElementById("upload__name_"+this.docId).getAttribute("value");
                        if (mediaid != "") {
                            mediaid = "&mediaid=" + mediaid;
                        }
                    }
                    var list = dojo.query('input[type=radio][name=fileoptions]:checked')[0].value;
                    var sort = dojo.query('input[type=radio][name=filesort]:checked')[0].value;
                    //Al formulari hi ha un camp input amb l'ns, el canvio també per tal de que el post el faci bé
                    //var myNs = dojo.query('input[name=ns]')[0];              
                    //myNs.value = this.docId;
                    var query = "img="+this.docId+"&do=media&tab_details=view&tab_files=files&image="+this.docId
                        +'&qqfile=' + file.name+ow+mediaid+"&id="+this.docId+"&isupload=upload"
                        +"&ns="+this.ns;
                    this.requester.sendForm("dw__upload_"+this.docId, query);
                } else {
                    alert("S'ha de seleccionar un fitxer");
                }

            },
            /*
             * 
             * @param {type} evt
             * @returns {undefined}
             */
            _doForm: function (evt) {
                evt.preventDefault();
                var source = evt.target || evt.srcElement;
                this._createRequest();
                this.requester.urlBase = "ajax.php?call=mediadetails";
                var query = "img="+this.docId+"&do=media&tab_details=history&tab_files=files&image="+this.docId+"&ns="+this.ns;
                this.requester.sendForm(source.id, query);
            },
            
            /**
             * Prova de clic a contingut
             *
             * @private
             */
            _doClickLink: function (evt) {
                evt.preventDefault();
                alert("Es pot seleccionar una versió a comparar amb el check o les ulleres.");
            },
            
            _doClickUll: function (evt) {
                evt.preventDefault();
                var source = evt.target || evt.srcElement;
                if(source.tagName.toUpperCase() != "A"){
                    source = source.parentNode;
                }
                var arr = source.href.split("&");
                //var arr = domAttr.get(this, "href").split("?");
                var arr2 = arr[2].split("=");
                var rev = arr2[1];
                this._createRequest();
                this.requester.urlBase = "ajax.php?call=mediadetails";
                var query = "img="+this.docId+"&rev="+rev+"&mediado=diff&do=media&tab_details=history&tab_files=files&image="+this.docId+"&ns="+this.ns;
                this.requester.sendRequest(query);
            },

            _createRequest: function () {

                require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                    this.requester = new Request();

//                    this.requester.updateSectok = function (sectok) {
//                        this.sectok = sectok;
//                    };
//
//                    this.requester.sectok = this.requester.dispatcher.getSectok();
//                    this.requester.dispatcher.toUpdateSectok.push(this.requester);
                }));
            },

            /**
             * Comunica al ChangesManager que pot haver canvis.
             *
             * @private
             */
            _checkChanges: function () {
                this.changesManager.updateContentChangeState(this.id);
            },

            

            /**
             * Retorna el text contingut al editor per la id passada com argument o la del id del document actual si
             * no s'especifica.
             *
             * TODO[Xavi] Això es propi només del EditorContentTool, no es global
             *
             * @param {string?} id - id del document del que volem recuperar el contingut
             * @returns {string|null} - Text contingut al editor
             * o null si no existeix
             * @private
             */
            _getCurrentContent: function () {
                /*var contentCache = this.dispatcher.getContentCache(this.id),
                    content;

                try {
                    if (contentCache.isAceEditorOn()) {
                        content = contentCache.getEditor().iocAceEditor.getText();

                    } else {
                        content = contentCache.getEditor().$textArea.context.value;
                    }

                    content = '\n' + content + '\n';

                } catch (error) {
                    console.error("Error detectat: ", error);
                }

                return content;*/
            },


            /**
             * Al ser seleccionat aquest ContentTool estableix l'editor com a sel·leccionat.
             *
             * La primera vegada que es selecciona el content tool encara no es troba carregat al ContentCache per això
             * s'ha de fer la comprovació.
             *
             * @override
             */
            /*onSelect: function () {
                var contentCache = this.dispatcher.getContentCache(this.id);

                if (contentCache && contentCache.getEditor()) {
                    this.dispatcher.getContentCache(this.id).getEditor().select();
                }

                this.inherited(arguments);
            },*/

            /**
             * Al ser des-seleccionat aquest ContentTool es des-selecciona l'editor.
             *
             * Ens assegurem que existeix l'editor abans de des-seleccionar-lo per evitar errors.
             *
             * @override
             */
            /*onUnselect: function () {
                var contentCache = this.dispatcher.getContentCache(this.id);

                if (contentCache && contentCache.getEditor()) {
                    this.dispatcher.getContentCache(this.id).getEditor().unselect();
                }

                this.inherited(arguments);
            }*/
        });
});