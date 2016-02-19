define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/Lock',
    'ioc/wiki30/Timer',
], function (declare, EventObserver, Lock, Timer) {

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

            lock: function (id, ns) {
                console.log('LockManager#lock', id, ns);
                if (this.locks[id]) {
                    throw new LockManagerException("Ja existeix un lock pel document amb id: " + id);
                }

                this.locks[id] = new Lock(this.dispatcher, id, ns);
            },


            unlock: function (id) {
                if (!this.locks[id]) {
                    throw new LockManagerException("No existeix cap lock per desbloquejar amb id: " + id);
                }

                this.locks[id].unlock();
                delete(this.locks[id]);
            },

            refresh: function (id, timeout) {
                console.log('LockManager#refresh', id, timeout);

                if (!this.locks[id]) {
                    throw new LockManagerException("No existeix cap lock per refrescar amb id: " + id);
                }

                this.locks[id].refresh(timeout);
            },

            update: function (id, timeout) {
                if (!this.locks[id]) {
                    throw new LockManagerException("No existeix cap lock per actualitzar amb id: " + id);
                }

                if (timeout > 0) {
                    this.locks[id].update(timeout);
                } else {
                    this.unlock(id);
                }
            }

        });
});