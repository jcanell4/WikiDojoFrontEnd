/**
 * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
 *
 * S'ha deixat com un fitxer independent per facilitar la seva edició i no pot comptarse amb que sigui accesible
 * en el futur.
 *
 * Aquesta classe s'espera que es mescli amb un DocumentContentTool per afegir-li les funcions de edició de documents
 * amb un ACE-Editor.
 *
 * @class AbstractChangesManagerDecoration
 * @extends ContentTool
 * @author Xavier García <xaviergaro.dev@gmail.com>
 * @private
 * @abstract
 * @see contentToolFactory.decorate()
 */
define([
        "dojo/_base/declare"
    ], function (declare) {

        return declare(null, {

                /** @type ChangesManager */
                changesManager: null,

                /** @protected */
                registerToChangesManager: function () {
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

                /**
                 * Reinicialitza l'estat del contingut establint el valor del contingut original igual al del contingut
                 * actual.
                 *
                 * @abstract
                 */
                resetContentChangeState: function () {
                    console.error("Sense implementar resetContentChangeState()");
                }
            }
        )
    }
);