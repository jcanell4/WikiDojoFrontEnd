define([
    'dojo/_base/declare',
    'ioc/gui/content/subclasses/ChangesManagerCentralSubclass',
    'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade'
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
            this.externalContent = {};
        },

        compareItems: function (itemA, itemB) {
            if (typeof(itemA) === "number") {
                itemA = itemA.toString();
            }
            if (!itemA
                || itemA === {}
                || (itemA.length !== undefined && itemA.length ===0)
                || itemA === '{}'
                || itemA === '[]'
            ) {
                itemA = null;
            }

            if (typeof(itemB) === "number") {
                itemB = itemB.toString();
            }
            if (!itemB
                || itemB === {}
                || (itemB.length !== undefined && itemB.length ===0)
                || itemB === '{}'
                || itemB === '[]'
            ) {
                itemB = null;
            }

            return itemA === itemB;
        },

        /**
        * Retorna cert si el contingut actual i el contingut original sÃ³n diferents o fals si sÃ³n iguals.
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

               var auxCurrentContent = this.externalContent[item] || currentContent[item];
               var auxOriginalContent = originalContent[item];

               if (!this.compareItems(auxCurrentContent, auxOriginalContent)) {
                   changed = true;
                   break;
               } else {
                   checked[item] = true;
               }
           }

           if (!changed) {
               // Si tots son iguals, es comprova que tots els que restin de OriginalContent
               for (item in originalContent) {
                   auxCurrentContent = this.externalContent[item] || currentContent[item];

                   if (!checked[item] && !this.compareItems(originalContent[item],auxCurrentContent)) {
                       changed = true;
                       break;
                   }
               }
           }

           if (changed) {
               this.onDocumentChanged();
               this.hasChanges = true;
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
            jQuery(this.domNode).on('paste cut keyup', this._checkChanges.bind(this)); // Alerta[Xavi] Comprovar si el domNode es suficient per detectar els canvis del formulari
            this.inherited(arguments);
        },

        /**
         * Retorna el que està establert com a contingut original per fer comprovacions sobre canvis.
         * @returns {string} - Contingut original
         * @private
         */
        _getOriginalContent: function () {
            return this.originalContent;
        },

        /**
         * Estableix el contingut passat com paràmetre com a contingut original.
         * @param {string} content - Contingut a establir com original
         * @private
         */
        _setOriginalContent: function (content) {
            this.originalContent = content;
        },

        isLastCheckedContentChanged: function () {
            var content = this.getCurrentContent();
            var result = this.compareContents(content, this._getLastCheckedContent());

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
            // Genera diccionari id:valor
            var currentContent = {};
            var $form = jQuery('form[id="form_' + this.id + '"]');
            var $input = $form.find('input[type="text"], input[type="hidden"], input[type="string"], input[type="number"], input[type="date"], select, textarea');

            var context = this;
            var valor;

            $input.each(function () {
                if (this.name) {
                    if (context.externalContent[this.name]) {
                        currentContent[this.name] = context.externalContent[name];
                    } else {
                        valor = (this.value) ? this.value : "";
                        currentContent[this.name] = valor;
                    }

                }
            });

            return currentContent;
        },

        compareContents: function(contentA, contentB) {
            if (Object.keys(contentA).length !== Object.keys(contentB).length) {
                //console.log("Nombre d'items en contentA y contentB diferent:", Object.keys(contentA).length , Object.keys(contentB).length );
                return true;
            }

            for (var key in contentA ) {
                if (!key in contentB) {
                    //console.log("No existeix la clau al contentB", key);
                    return true;
                }
                if (contentA[key] !== contentB[key]) {
                    //console.log("El contingut es diferent",contentA[key],contentB[key] );
                    return true;
                }
            }

            return false;
        },

        // Si es passa com a content un valor null o de mida 0 s'elimina la clau del externalContent
        setExternalContent : function (name, content) {
            if (content === undefined
                || content === null
                || (content.length!==undefined && content.length === 0)
            ) {
                delete(this.externalContent[name]);
            } else {
                this.externalContent[name] = content;
            }

            this.forceCheckChanges();
        },

        forceCheckChanges: function() {
            this._checkChanges();
        }

    });
    
});
