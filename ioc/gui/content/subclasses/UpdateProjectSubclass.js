define([
    "dojo/_base/declare"
], function (declare) {
    /**
     * Aquesta classe no s'ha de instanciar directament, s'ha de fer a través del contentToolFactory.
     * S'ha deixat com un fitxer independent per facilitar la seva edició
     * i no es garanteix que sigui accesible en el futur.
     *
     * @class UpdateProjectSubclass
     * @see contentToolFactory.generate()
     */
    return declare([], {

        /**
         * @override DocumentSubclass
         * @param {object} content : parámetros, datos y estructura del formulario
         */
        updateDocument: function (content) {
            this.setData(content.content);
            this.render();
            this.addDocument();
        }

    });
    
});
