define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver'

], function (declare, EventObserver) {

    return declare([EventObserver],
        {
            /**
             * Al constructor s'ha de passar com argument un contenido d'accordio o de pestanyes
             * @param args
             */
            constructor: function(container, args) {
                declare.safeMixin(this, container);
            }






        });
});

