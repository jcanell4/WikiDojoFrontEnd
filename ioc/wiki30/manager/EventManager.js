define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver'

], function (declare, EventObserver) {
    return declare([EventObserver], {

        // El manager ha d'escoltar al content tool
        // quan detecta que es despatxar l'esdeveniment el dispara en si mateix per avisar als interessats
        //
        registerEventForBroadcasting: function(observed, eventName, callback) {
            console.log("registered for Broadcasting", observed.id, eventName);

            // ens enregistrem al esdeveniment del observed
            this.registerToEvent(observed, eventName, this._broadcast.bind(this));

            // enregistrem al observed per rebre les notificacions des del manager automàticament
            observed.registerToEvent(this, eventName, callback);

        },

        _broadcast: function(data) {
            //console.log("EventManager#broadcast", data.name, data);
          this.dispatchEvent(data.name, data);
        }
    });
});
