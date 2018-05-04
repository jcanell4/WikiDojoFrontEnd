define([
    'dojo/_base/declare',
    'ioc/gui/content/subclasses/ChangesManagerCentralSubclass',
    'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',
], function (declare, ChangesManagerCentralSubclass, AceFacade) {
    /**
     * Aquesta classe no s'ha de instanciar directament, s'ha de fer a travÃ©s del contentToolFactory.
     * S'ha deixat com un fitxer independent per facilitar la seva edició
     * i no es garanteix que sigui accesible en el futur.
     *
     * @class FormSubclass
     * @extends ChangesManagerCentralSubclass
     * @private
     * @see contentToolFactory.generate()
     */
    return declare([ChangesManagerCentralSubclass], {

        /**
         * El contingut original inicial s'ha de passar a través del constructor 
         * dins dels arguments com a propietat originalContent.
         * @param args
         */
        constructor: function (args) {
            this._setOriginalContent(args.originalContent);
            this.hasChanges = false;
            this.contentToolFactory = args.contentToolFactory;

            this.editableElements = [];

            // TEST!
            // var a = {update: function() {console.log("TEST Update A OK")}};
            // var b = {update: function() {console.log("TEST Update B OK")}};
            // var c = {update: function() {console.log("TEST Update C OK")}};
            // var d = {update: function() {console.log("TEST Update D OK")}};
            // this.registerEditableElement(a);
            // this.registerEditableElement(b);
            // this.registerEditableElement(c);
            // this.registerEditableElement(d);
            // console.log("Elements registrats:", this.editableElements);
            // this.unregisterUpdatableElement(a);
            // console.log("Elements registrats:", this.updatableElements);
            // this.unregisterUpdatableElement(b);
            // console.log("Elements registrats:", this.updatableElements);
            // this.unregisterUpdatableElement(c);
            // console.log("Elements registrats:", this.updatableElements);
            // this.unregisterUpdatableElement(d);
            // console.log("Elements registrats:", this.updatableElements);


        },

        // _registerEditableElement: function(element) {
        //         if (!element.update) {
        //             console.error("L'element no és updatable", element)
        //         } else {
        //             this.editableElements.push(element);
        //         }
        // },
        //
        // _unregisterEditableElement: function(element) {
        //     this.editableElements = _.without(this.editableElements, element); // Alerta! biblioteca Underscore
        //
        // },
        //
        // _enableEditableElements: function() {
        //     for (var i=0; i<this.editableElements.length; i++) {
        //         this.editableElements[i].show();
        //     }
        // },
        //
        // _disableEditableElements: function() {
        //     for (var i=0; i<this.editableElements.length; i++) {
        //         this.editableElements[i].hide();
        //     }
        // },

        // startup: function() {
        //     this.inherited(arguments);
        // },
        //
        // postRender: function() {
        //     this.inherited(arguments);
            // if (this.editable) {
            //     this._enableEditableElements();
            // }
        // },

       /**
        * Retorna cert si el contingut actual i el contingut original sÃ³n diferents o fals si sÃ³n iguals.
        *
        * @returns {boolean} - Retorna true si el contingut ha canviat o false en cas contrari
        */
       isContentChanged: function () {

           var checked = {},
               item,
               currentContent = this.getCurrentContent(),
               originalContent = this._getOriginalContent(),
               changed = false;

           // S'han de comprovar que tots els items de currentContent siguin iguals
           for (item in currentContent) {
               if (currentContent[item] !== originalContent[item]) {
                   // console.log(currentContent[item] + "!==" +  originalContent[item]);
                   changed = true;
                   break;
               } else {
                   checked[item] = true;
               }
           }

           if (!changed) {
               // Si tots son iguals, es comprova que tots els que restin de OriginalContent
               for (item in originalContent) {
                    if (!checked[item] && originalContent[item] !== currentContent[item]) {
                       console.log(currentContent[item] + "!==" +  originalContent[item], item);
                       changed = true;
                       break;
                   }
               }
           }

           if (changed) {
               this.onDocumentChanged();
               this.hasChanges = true;
           } else {
               console.log(" **El contingut no ha canviat**");
           }

           return changed;
       },

      /**
       * Reinicialitza l'estat del document establint el valor del contingut original igual al del contingut
       * actual.
       */
      resetContentChangeState: function () {
            this.hasChanges = false;
            this._setOriginalContent(this.getCurrentContent());
            this.onDocumentChangesReset();
      },

        /**
         * Es registra als esdeveniments i activa la detecció de canvis, copiar, enganxar i pitjar tecles dins
         * del node on es troba quest ContentTool.
         * Realitza l'enregistrament al ChangesManager.
         * @override
         */
        postAttach: function () {
            this.registerToChangesManager();
            jQuery(this.domNode).on('input paste cut keyup', this._checkChanges.bind(this)); // Alerta[Xavi] Comprovar si el domNode es suficient per detectar els canvis del formulari
            this.inherited(arguments);

//            alert("event manager?");
        },

        /**
         * Retorna el que estÃ  establert com a contingut original per fer comprovacions sobre canvis.
         *
         * @returns {string} - Contingut original
         * @private
         */
        _getOriginalContent: function () {
            //console.log("FormSubclass#_getOriginalContent", this.originalContent);
            return this.originalContent;
        },

        /**
         * Estableix el contingut passat com parÃ metre com a contingut original.
         *
         * @param {string} content - Contingut a establir com original
         * @private
         */
        _setOriginalContent: function (content) {
            this.originalContent = content;
        },

        isLastCheckedContentChanged: function () {
            console.log("isLastCheckedContentChanged?");
            var content = this.getCurrentContent(),
                // result = this._getLastCheckedContent() !== content;
                result = this.compareContents(content, this._getLastCheckedContent());

            if (result) {
                this._setLastCheckedContent(content);
            }

            return result;
        },

        _getLastCheckedContent: function () {
            return this.lastCheckedContent;
        },

        _setLastCheckedContent: function (content) {
            this.lastCheckedContent = content;
        },

        getCurrentContent: function () {

            // Obtenir tots els valors dels camps? generar diccionary id:valor
            // Fàcil pels inputs (únic cas contemplat)
            // TODO[Xavi] Afegir comprovació per check/radios i selects
            var currentContent = {};

            jQuery('form[id="form_' + this.id + '"] :input').each(function () {
                if (this.type !== "button" && this.type !== "submit" && this.value) {
                    currentContent[this.id] = this.value; // ALERTA[Xavi] this.id fa referencia al id de l'element, no del formulari
                }
            });

            return currentContent;
        },

        compareContents: function(contentA, contentB) {
            if (Object.keys(contentA).length !== Object.keys(contentB).length) {
                console.log("Nombre d'items en contentA y contentB diferent:", Object.keys(contentA).length , Object.keys(contentB).length );
                return true;
            }

            for (var key in contentA ) {

                if (!key in contentB) {
                    console.log("No existeix la clau al contentB", key);
                    return true;
                }

                if (contentA[key] !== contentB[key]) {
                    console.log("El contingut es diferent",contentA[key],contentB[key] );
                    return true;
                }

            }

            return false;
        }
        
    });
    
});
