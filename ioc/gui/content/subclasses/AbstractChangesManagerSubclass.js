/**
 *
 * Aquest métode es fa servir juntament amb extend(), els mètodes seràn reemplaçats, es a dir no continua
 * la cadena de crides.
 *
 * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
 *
 * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
 * en el futur.
 *
 * Aquesta classe s'espera que es mescli amb un DocumentContentTool per afegir-li les funcions de edició de documents
 * amb un ACE-Editor.
 *
 * @class AbstractChangesManagerSubclass
 * @extends ContentTool
 * @author Xavier García <xaviergaro.dev@gmail.com>
 * @private
 * @abstract
 */

define([
        "dojo/_base/declare",
    ], function (declare) {

        return declare(null, {

                /** @type ChangesManager @protected */
                changesManager: null,

                /** @protected */
                registerToChangesManager: function () {
                    //console.log("AbstractChangesManagerSubclass#registerToChangesManager");
                    this.changesManager = this.dispatcher.getChangesManager();
                    this.changesManager.setContentTool(this);
                },

                /**
                 * Retorna cert si el contingut actual i el contingut original son iguals o fals si no ho son.
                 *
                 * @returns {boolean} - Retorna true si el contingut ha canviat o false en cas contrari
                 * @abstract
                 */
                isContentChanged: function () {
                    console.error("Sense implementar isContentChanged()");
                },

                isContentChangedRaw: function () {
                    // Per defecte fa el mateix, així només cal implementar-lo en casos especials com els documents
                    return this.isContentChanged();
                },

                /**
                 * Reinicialitza l'estat del contingut establint el valor del contingut original igual al del contingut
                 * actual.
                 *
                 * @abstract
                 */
                resetContentChangeState: function () {
                    console.error("Sense implementar resetContentChangeState()");
                },

                discardChanges: function() {
                    //console.log("AbstractChangesManager@discardChanges");
                    this.changesManager.resetContentChangeState(this.id);
                }


            }
        )
    }
);