define([], function () {
    // Métodes i propietats privades del patcher

    var originalFunctions = {},
        cachedFunctions = {},


        /**
         * Afegeix una funció al objecte dw_editor si existeix alguna amb aquest nom o al objecte window si no s'ha
         * trobat cap coincidencia amb el nom.
         *
         * Aquesta funció no reemplaça l'anterior, si no que s'afegeix a la original de manera que es criden totes.
         *
         * @param {string} name - nom de la funció
         * @param {function} func - funció per afegir
         * @param {string} id - id corresponent a la pestanya que s'està editant
         * @returns {function|null} - La referéncia a la funció parxejada
         */
        patch = function (name, func, id) {
            if (!id) {
                throw new Error ("No s'ha especificat la id per afegir al cache");
            }

            var obj = (dw_editor && dw_editor[name]) ? dw_editor : window,
                orig_func;
            //orig_func = obj[name];

            if (originalFunctions[name]) {
                orig_func = originalFunctions[name];
                //alert("ja existeix "+name);
            } else {
                //alert("guardem original "+name);
                orig_func = obj[name];
                originalFunctions[name] = orig_func;
            }

            obj[name] = function () {
                var args, aux;

                if (arguments.length > 0) {
                    args = [].slice.call(arguments, 0);
                } else {
                    args = []
                }

                aux = [this, orig_func].concat([].slice.call(args));

                return func.call.apply(func, aux);
            };

            // Afegim la nova funció al cache
            if (id) {
              cacheFunction(id, name);
            }

            return obj[name];
        },

        cacheFunction = function (id, name) {
            var func = (dw_editor && dw_editor[name]) ? dw_editor[name] : window[name];

            if (!cachedFunctions[id]) {
                cachedFunctions[id] = [];
            }
            cachedFunctions[id].push({name: name, func: func});
            console.log("Guardada funció: " + name + " per id: " + id);
        },

        restoreCachedFunctions = function (id) {
            if (!cachedFunctions[id]) {
                console.log("No hi ha funcions en caché");
                return;
            }

            var functions = cachedFunctions[id],
                name, func;

            for (var i = 0, len = functions.length; i < len; i++) {
                name = functions[i]['name'];
                func = functions[i]['func'];

                console.log("Restaurant funció: " + name + " per id: " + id);

                if (dw_editor && dw_editor[name]) {
                    dw_editor[name] = func
                } else {
                    window[name] = func;
                }
            }

        };

    return {
        patch: patch,

        //cacheFunction: cacheFunction,

        restoreCachedFunctions: restoreCachedFunctions
    }
});
