define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/Lock'
], function (declare, EventObserver, Lock) {

    var LockManagerException = function (message) {
        this.message = message;
        this.name = "LockManagerException"
    };

    return declare([EventObserver],
        {
            dispatcher: null,
            locks: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this.locks = {};
            },

            // TODO[Xavi] afegir el tipus per poder discriminar, per exemple els diff només fan servir el timeout i no han de mostrar cap avis, només tancar-se el dialog
            lock: function (id, ns) {
                console.log('LockManager#lock', id, ns);
                if (this.locks[id]) {
                    throw new LockManagerException("Ja existeix un lock pel document amb id: " + id);
                }

                this.locks[id] = new Lock(this.dispatcher, id, ns);
                this.registerToEvent(this.locks[id], "destroyed", this._removeLock.bind(this));
            },


            unlock: function (id) {
                console.log('LockManager#unlock', id);

                if (this.locks[id]) {
                    this.locks[id].unlock();
                    this._removeLock(id);
                }
            },

            refresh: function (id, timeout) {
                //console.log('LockManager#refresh', id, timeout);

                if (!this.locks[id]) {
                    throw new LockManagerException("No existeix cap lock per refrescar amb id: " + id);
                }

                this.locks[id].refresh(timeout);
            },

            update: function (id, timeout) {
                //console.log("LockManager#update", id, timeout);

                if (timeout > 0) {
                    if (!this.locks[id]) {
                        throw new LockManagerException("No existeix cap lock per actualitzar amb id: " + id);
                    }

                    this.locks[id].update(timeout);
                } else {
                    this._removeLock(id);
                }
            },

            _removeLock: function (id) {
                //console.log("LockManager#_removeLock", id);
                delete(this.locks[id]);

            }

        });
});