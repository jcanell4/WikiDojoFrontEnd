define([
    "dojo/_base/declare",
], function (declare) {

    return declare(null,
        {
            editionState : false,

            constructor: function(args) {
                this.init(args);
            },


            init: function (args) {
                throw new Error ("El mètode abstract s'ha d'implementar a la subclasse");
            },

            getHtmlRender: function() {
                throw new Error ("El mètode abstract s'ha d'implementar a la subclasse");
            },

            setEditionState: function (state) { // Alerta[Xavi] es un booleà o un enum?
                this.editionState = state;
            }
        });

});
