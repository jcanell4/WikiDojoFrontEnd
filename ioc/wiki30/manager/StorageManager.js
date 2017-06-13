define([], function () {

        var DEFAULT = 'session',

            _listeners = {},

            _storage = {
                local: localStorage,
                session: sessionStorage
            };

        var _setItem = function (key, value, type) {
                if (!type) {
                    type = DEFAULT;
                }

                _storage[type].setItem(key, value);
            },

            _getItem = function (key, type) {

                if (!type) {
                    type = DEFAULT;
                }

                // console.log("_getItem:", key, _storage[type].getItem(key));
                return _storage[type].getItem(key);
            },

            _getObject = function (key, type) {
                return JSON.parse(_getItem(key, type));
            },

            _findItem = function (key) {
                var item;

                for (var type in _storage) {
                    item = _storage[type].getItem(key);

                    if (item) {
                        return item;
                    }
                }

                return null;
            },

            _findObject = function (key) {
                return JSON.parse(_findItem(key));

            },

            _setObject = function (key, value, type) {
                _setItem(key, JSON.stringify(value), type);
            },


            _removeItem = function (key, type) {
                // console.log("StorageManager#_removeItem:", key, type);
                if (!type) {
                    type = DEFAULT;
                }

                return _storage[type].removeItem(key);
            },

            _clear = function (type) {
                if (type) {
                    _storage[type].clear();
                } else {
                    for (type in _storage) {
                        _storage[type].clear();
                    }
                }
            },

            _length = function (type) {
                var length;

                if (type) {
                    length = _calculateFreeSpace(type);
                } else {
                    length = {};
                    for (type in _storage) {
                        length[type] = _calculateFreeSpace(type);
                    }
                }

                return length;
            },

            _calculateFreeSpace = function (type) {
                var spaceUsed = 0,
                    storage = _storage[type];

                for (var i = 0; i < storage.length; i++) {
                    spaceUsed += (storage[storage.key(i)].length * 2) / 1024; // KB
                }

                console.log(type + " Storage usat: ", spaceUsed.toFixed(2) + " KB");


                return spaceUsed;
            },

            _addEventListener = function (event, key, callback) {

                // console.log("Afegit escoltador", event, key);

                if (event !== 'change') {
                    console.error("StorageManager només dispara la detecció de l'event 'change'");
                    return -1;
                } else {
                    if (!_listeners[key]) {
                        _listeners[key] = [];
                    }

                    _listeners[key].push(callback);
                }
            },


            _dispatchEvent = function (name, event) {
                if (!_listeners[event.key]) {
                    // No hi ha cap listener, no cal fer res
                    return;
                }

                for (var i = 0; i < _listeners[event.key].length; i++) {
                    _listeners[event.key][i]({
                        key: event.key,
                        oldValue: event.oldValue,
                        newValue: event.newValue
                    });
                }

            };

        window.addEventListener('storage', function (e) {
            _dispatchEvent('change', e);
        });


        return {
            type: {
                LOCAL: 'local',
                SESSION: 'session'
            },

            setItem: _setItem,
            setObject: _setObject,
            getItem: _getItem,
            getObject: _getObject,
            findItem: _findItem,
            findObject: _findObject,
            removeItem: _removeItem,
            clear: _clear,
            length: _length,
            on: _addEventListener

        };

    }
);
