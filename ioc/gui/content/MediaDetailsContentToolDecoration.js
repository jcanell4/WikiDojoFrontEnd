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
    "dojo/dom",
    "ioc/gui/content/AbstractChangesManagerDecoration"
], function (declare, lang, on, dom, AbstractChangesManagerDecoration) {

    return declare([AbstractChangesManagerDecoration],

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
            postLoad: function () {
                //Les funcions natives posen els id dels forms fixes, com per exemple "mediamanager__btn_restore"
                //Al servidor s'ha afegit l'id de la imatge
                //No obstant això, pel formulari de restore, encara li hem d'afegir la revisió (rev)
                this.registerToChangesManager();
                var rev = ["","Actual"];
                var myNode =  document.getElementById("panelMedia_"+this.id);                
                var revNodes = myNode.getElementsByClassName('wikilink1');
                for(var i=0; i<revNodes.length; i++) {
                    revNodes[i].target = "_blank";
                    var hrefArrayPrev = revNodes[i].href.split("?");
                    var hrefArrayAfter = hrefArrayPrev[1].split("&");
                    var revArray = hrefArrayAfter[0];
                    var revSplit = revArray.split("=");
                    if(revSplit[0]==="rev"){
                        rev[i] = revSplit[1];
                    }
                }
                //Si s'està comparant la versió actual amb ella mateixa, es suprimeix els botons de la primera versió
                if(rev[0]===""){
                    var formDelete = document.getElementById("mediamanager__btn_delete_"+this.id);
                    formDelete.parentNode.removeChild(formDelete);
                    var formUpdate = document.getElementById("mediamanager__btn_update_"+this.id);
                    formUpdate.parentNode.removeChild(formUpdate);                    
                }
                var i = 0;
                var formRestore = document.getElementById("mediamanager__btn_restore_"+this.id);
                while (formRestore || i>1){
                    formRestore.id = "mediamanager__btn_restore_"+this.id + "_"+ rev[i];
                    formRestore.action = "";
                    //
                    //on(this.domNode,'#'+formRestore.id+':submit',  lang.hitch(this, this._doFormRestore));
                    on(dom.byId(formRestore.id),"submit",  lang.hitch(this, this._doFormRestore));
                    formRestore = document.getElementById("mediamanager__btn_restore_"+this.id);
                    i++;
                }

                //on(this.domNode,'.panelContent:click',  lang.hitch(this, this._doClick));
                
                on(dom.byId("mediamanager__btn_delete_"+this.id),"submit",  lang.hitch(this, this._doFormDelete));
                on(dom.byId("mediamanager__btn_update_"+this.id),"submit",  lang.hitch(this, this._doFormUpload));
                this.inherited(arguments);
            },

            _doFormRestore: function (evt) {
                evt.preventDefault();
                var source = evt.target || evt.srcElement;
                this._createRequest();
                this.requester.urlBase = "lib/exe/ioc_ajax.php?call=mediadetails";
                var query = "img="+this.id+"&do=media&tab_details=history&tab_files=files&image="+this.id+"&ns="+this.ns;
                this.requester.sendForm(source.id, query);
            },
            _doFormDelete: function (evt) {
                evt.preventDefault();
                var source = evt.target || evt.srcElement;
                var confirmar=confirm("Suprimiu aquesta entrada?");
                if (confirmar){ 
                    this._createRequest();
                    this.requester.urlBase = "lib/exe/ioc_ajax.php?call=mediadetails";
                    var query = "img="+this.id+"&do=media&delete="+this.id+"&image="+this.id+"&ns="+this.ns;
                    this.requester.sendForm(source.id, query); 
                }
                                              
            },
            _doFormUpload: function (evt) {
                evt.preventDefault();
                var ns = this.dispatcher.getGlobalState().getContent(this.dispatcher.getGlobalState().currentTabId)["ns"];
                var list = dojo.query('input[type=radio][name=fileoptions]:checked')[0].value;
                var sort = dojo.query('input[type=radio][name=filesort]:checked')[0].value;
                this._createRequest();
                this.requester.urlBase = "lib/exe/ioc_ajax.php?call=media";
                var query = 'id=' + this.id + '&ns=' + ns + '&do=media&list='+list+'&sort='+sort+"&versioupload=true";
                this.requester.sendRequest(query);                
            },
            

            _createRequest: function () {

                require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                    this.requester = new Request();
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

            },


          
        });
});
