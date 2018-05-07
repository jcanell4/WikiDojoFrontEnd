define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/AbstractIocComponent'
], function (declare, AbstractIocComponent) {


    return declare(AbstractIocComponent, {

        constructor: function (SourceObject) {
            this.SourceObject = SourceObject;
        },

        /**
         * Dispara un event del tipus indicat afegint les dades passades com argument.
         */
        fire: function(event) {
            this.SourceObject.emit(event.type, event.data);
        },

    });

});