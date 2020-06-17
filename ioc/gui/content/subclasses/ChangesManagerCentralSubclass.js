/**
 * Aquest métode es fa servir juntament amb extend(), els mètodes seràn reemplaçats, es a dir no continua
 * la cadena de crides.
 * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
 *
 * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
 * en el futur.
 *
 * Aquesta classe s'espera que es mescli amb un DocumentContentTool que incorpori un AbstractChangesManager
 * per afegir-li les funcionalitats comunes dels documents editables de la pestanya central que son:
 *
 *      - Canviar el color de la pestanya a vermell quan hi han canvis
 *      - Canviar el color de la pestanya a negre quan els canvis es restableixin
 *      - Disparar els esdeveniment document_changed i document_changes_reset quan calgui
 *      - Demanar confirmació abans de tancar si s'han realitzat canvis
 *
 * Les crides a aquests mètodes es faran desde la clase decorada.
 *
 * @class AbstractChangesManagerCentralSubclass
 * @extends AbstractChangesManagerSubclass
 * @author Xavier García <xaviergaro.dev@gmail.com>
 * @private
 * @abstract
 */

define([
    "dojo/_base/declare",
    "ioc/gui/content/subclasses/AbstractChangesManagerSubclass",
    "ioc/wiki30/manager/StorageManager",
    "dojo/_base/unload"
], function (declare, AbstractChangesManagerSubclass, storageManager, unload) {

    return declare([AbstractChangesManagerSubclass], {

        startup: function () {
            this.inherited(arguments);

            var storedChangedPages = storageManager.getObject('changedPages', storageManager.type.LOCAL),
                userId = this.dispatcher.getGlobalState().userId;

            if (userId && storedChangedPages && storedChangedPages.userId !== userId) {
                // Estem loginats i la informació guardada pertany a un altre usuari, la descartem
                this.resetChangedPagesState();
            }

            unload.addOnWindowUnload(function(){
                if (this.hasChanges) {
                    this.hasChanges = false;
                    this.updateChangedPagesState();
                }
            }.bind(this));
        },
        
        postRender: function(){
            this.inherited(arguments);
            this._checkChanges();  
        },
        
        _checkChanges: function () {
            //console.log("ChangesManagerCentralSubclass#_checkChanges");
            if (this.changesManager) {
                this.changesManager.updateContentChangeState(this.id);
            }
        },
        /**
         * Elimina aquest ContentTool del ContainerContentTool en el que es trobi i es destrueix junt amb tots els
         * elements que el composin.
         * @param {string} idToShow - (no obligatori) indica quina pestanya s'ha de mostrar després
         */
        removeContentTool: function (idToShow) {
            this.forceReset();
            this.inherited(arguments);
        },

        /**
         * Accio a realitzar quan hi ha canvis al document.
         * @protected
         */
        onDocumentChanged: function () {
            // console.log("onDocumentChanged");

            this.dispatchEvent(this.eventName.DOCUMENT_CHANGED, {id: this.id}, true); //La línia de dalt equival ara, al true

            if (this.controlButton) {
                this.controlButton.containerNode.style.color = 'red';
            }

            this.updateChangedPagesState();
        },

        onDocumentRefreshed: function () {
            // console.log("onDocumentRefreshed");
            this.dispatchEvent(this.eventName.DOCUMENT_REFRESHED, {id: this.id}, true); //La línia de dalt equival ara, al true
        },

        /**
         * Acció a realitzar quan es reinicialitza el document.
         * @protected
         */
        onDocumentChangesReset: function () {
            this.dispatchEvent(this.eventName.DOCUMENT_CHANGES_RESET, {id: this.id});

            if (this.controlButton) {
                this.controlButton.containerNode.style.color = 'black';
            }

            this.updateChangedPagesState();
        },

        forceReset: function () {
            this.discardChanges = true;
            delete this.changesManager.contentsChanged[this.id];
            this.onDocumentChangesReset();
        },

        /**
         * Acció a realitzar quan es tanca el document. Si detecta canvis demana confirmació i en cas de que no hi hagin
         * o es descartin el canvis retorna cert i es procedeix al tancament del document.
         *
         * @returns {boolean}
         */
        onClose: function () {
            var confirmation = this.inherited(arguments);
            return confirmation;
        },

        _generateDiscardDialog: function () {
            var dialog = this.dispatcher.getDialogManager().getDialog('default', 'save_or_cancel_' + this.id, this.cancelDialogConfig);
            return dialog;
        },

        _mixCachedEvent: function (event, expectedDataToSendType) {
            var mixedEvent;

            if (!this.cachedEvent) {
                return event;
            }

            var cachedDataToSend = this.cachedEvent.dataToSend,
                eventDataToSend = event.dataToSend;

            var mixedDataToSend = this.mixData(cachedDataToSend, eventDataToSend, expectedDataToSendType);

            var cachedExtraDataToSend = this.cachedEvent.extraDataToSend,
                eventExtraDataToSend = event.extraDataToSend;

            var mixedExtraDataToSend = this.mixData(cachedExtraDataToSend, eventExtraDataToSend, expectedDataToSendType);

            mixedEvent = {};
            this.mixin(mixedEvent, this.cachedEvent)
            this.mixin(mixedEvent, event);

            mixedEvent.dataToSend = mixedDataToSend;
            mixedEvent.extraDataToSend = mixedExtraDataToSend;

            this.cachedEvent = null;

            return mixedEvent;
        },

        /**
         * @param {string|object} data: el tipus de dada ha de ser string o object, altres tipus no estan definits
         * @param {string} expectedType: el valor ha de ser 'object' o 'string', altres tipus no estan definits
         * @returns {string|object}
         */
        setToExpectedType: function (data, expectedType) {
            var convertedData;

            if (typeof data === expectedType) {
                return data;
            }

            if (typeof data !== 'string' && typeof data !== 'object') {
                // console.error("El tipus de les dades només pot ser 'object' o 'string' i era: ", typeof data );
                return expectedType === 'string' ? '' : {};
            }

            switch (expectedType) {
                case 'string':
                    if (!data) {
                        convertedData = '';
                    } else {
                        convertedData = jQuery.param(data);
                    }
                    break;

                case 'object':
                    if (!data) {
                        convertedData = '{}';
                    } else {
                        convertedData = this._stringToObject(data);
                    }
                    break;

                default:
                    console.error("El tipus " + expectedType + " no es troba definit");
            }

            return convertedData;
        },


        /**
         * ALERTA[Xavi] Si no s'especifica l'expectedType i el eventData no es troba definit:
         *      - Sí el cachedData tampoc existeix es retornarà un objecte buit.
         *      - Sí el cachedData existeix el tipus serà el del cachedData.
         */
        mixData: function (eventData, cachedData, expectedType) {
            // console.log("StructuredDocumentSubclass#_mixCachedDataToSend", eventData, cachedData);

            var mixedDataToSend;

            if (expectedType) {
                eventData = this.setToExpectedType(eventData, expectedType);
                cachedData = this.setToExpectedType(cachedData, expectedType);
            }


            if (!eventData && !cachedData) {
                mixedDataToSend = {};

            } else if (!eventData && cachedData) {
                mixedDataToSend = cachedData;

            } else if (eventData && !cachedData) {
                mixedDataToSend = eventData;

            } else if (typeof eventData === 'string' && typeof cachedData === 'string') {

                mixedDataToSend = this._mixStringsData(eventData, cachedData);

            } else if (typeof eventData === 'object' && typeof cachedData === 'object') {
                mixedDataToSend = {};
                this.mixin(mixedDataToSend, cachedData);
                this.mixin(mixedDataToSend, eventData);

            } else if (typeof eventData === 'object' && typeof cachedData === 'string') {
                mixedDataToSend = {};
                this.mixin(mixedDataToSend, this._stringToObject(cachedData));
                this.mixin(mixedDataToSend, eventData);

            } else if (typeof eventData === 'string' && typeof cachedData === 'object') {
                mixedDataToSend = this._mixStringsData(eventData, cachedData);

            } else {
                console.error("Els tipus d'eventDataToSend i cachedDataToSend no són compatibles", typeof eventData, typeof cachedData);
                console.error(eventData, cachedData);
            }

            return mixedDataToSend;
        },

        // ALERTA[Xavi] Duplicat a StructuredDocumentSubclass
        _mixStringsData: function (eventData, cachedData) {
            var objEventData = this._stringToObject(eventData),
                objCachedData = this._stringToObject(cachedData),
                mixedData = {};

            // lang.mixin(mixedData, objCachedData);
            // lang.mixin(mixedData, objEventData);
            this.mixin(mixedData, objCachedData);
            this.mixin(mixedData, objEventData);

            return jQuery.param(mixedData);
        },

        // ALERTA[Xavi] Duplicat a StructuredDocumentSubclass
        _stringToObject: function (text) {
            if (typeof text !== 'string') {
                return text;
            } else if (!text) {
                return {};
            } else {

                return JSON.parse('{"' + text.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
                    function (key, value) {
                        return key === "" ? value : decodeURIComponent(value)
                    });
            }
        },

        /**
         * Afegeix les propietats de l'objecte de la dreta a l'objecte de la esquerra, ignorant les propietats de
         * l'objecte esquerra a les que no s'ha assignat cap valor (undefined)
         * @param target
         * @param source
         */
        mixin: function (target, source) {
            if (!source) {
                return;
            }

            for (var key in source) {
                if (source[key] === undefined) {
                    continue;
                }
                target[key] = source[key];
            }
        },

        /**
         * @param {string|object} data
         * @param {string} property
         * @returns {*}
         */
        getPropertyValueFromData: function (data, property) {
            var value;
            if (typeof data === 'string') {
                data = this._stringToObject(data);
            }
            if (typeof data !== 'object') {
                return null;
            }

            value = data[property];

            if (value === 'true' || value === true) {
                value = true;
            } else if (value === 'false' || value === false) {
                value = false;
            } else if (!isNaN(value)) {
                value = Number(value)
            }

            return value;
        },

        resetChangedPagesState: function () {
            //ALERTA[Xavi] Compte, això s'ha d'invocar quan no hi ha cap document en edició a cap pestanya o per eliminar
            // totes les pàgines cambiadas perqué l'usuari no es vàlid (canvi global per totes les pestanyes),
            // però NO quan es tanca la finestra (canvi només per la pestanya activa)
            // console.log("Eliminant tots els canvis");
            storageManager.removeItem('changedPages', storageManager.type.LOCAL);
        },

        updateChangedPagesState: function () {

            var storedChangedPages = storageManager.getObject('changedPages', storageManager.type.LOCAL);

            // El documet és den només lectura: RETURN
            if (this.getReadOnly()) {
                return;
            }

            // El storage no existeix i hi ha canvis: Crear nou storage buit
            if (!storedChangedPages && this.hasChanges) {
                storedChangedPages = {
                    userId: this.dispatcher.getGlobalState().userId,
                    pages: {}
                }
            }

            // El storage no existeix i no hi han canvis: RETURN
            if (!storedChangedPages && !this.hasChanges) {
                return;
            }

            //El storage existeix i hi han canvis: AFEGIR
            if (this.hasChanges) {
                storedChangedPages['pages'][this.id] = true;
            } else {
                // El storage no existeix i no hi han canvis: ELIMINAR
                delete storedChangedPages['pages'][this.id];
            }

            if (Object.keys(storedChangedPages.pages).length > 0) {
                // console.log("Desant els canvis");
                storageManager.setObject('changedPages',
                    storedChangedPages,
                    storageManager.type.LOCAL);
            } else {
                this.resetChangedPagesState();
            }
        },

        onDestroy: function () {
            if (this.hasChanges) {
                this.hasChanges = false;
                this.updateChangedPagesState();
            }
            this.inherited(arguments);
        }
        
    });
    
});
