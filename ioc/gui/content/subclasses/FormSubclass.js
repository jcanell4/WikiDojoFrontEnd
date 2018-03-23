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
        },

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
                   console.log(currentContent[item] + "!==" +  originalContent[item]);
                   changed = true;
                   break;
               } else {
                   checked[item] = true;
               }
           }

           if (!changed) {
               console.log(currentContent, originalContent);
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
            var content = this.getCurrentContent(),
                result = this._getLastCheckedContent() !== content;

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

            jQuery('form[id="form_' + this.id + '"] input').each(function () {
                if (this.type !== "button" && this.type !== "submit" && this.value) {
                    currentContent[this.id] = this.value;
                }
            });

            return currentContent;
        }
        
    });
    
});
