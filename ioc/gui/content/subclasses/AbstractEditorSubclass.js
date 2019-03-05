define([
    "dojo/_base/declare",
], function (declare) {

    return declare([],
        {
            /**
             * Retorna l'editor seleccionat actualmente.
             */
            getCurrentEditor: function() {

                console.error("AbstractIocEditor#getCurrentEditor aquest mètode s'ha d'implementar a la subclasse");

            }

        });
});
