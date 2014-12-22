define([], function () {
    // Métodes i propietats privades del patcher

    var originalFunctions = {},

    /**
     * Afegeix una funció al objecte dw_editor si existeix alguna amb aquest nom o al objecte window si no s'ha
     * trobat cap coincidencia amb el nom.
     *
     * Aquesta funció no reemplaça l'anterior, si no que s'afegeix a la original de manera que es criden totes.
     *
     * @param {string} name - nom de la funció
     * @param {function} func - funció per afegir
     * @returns {function|null} - La referéncia a la funció parxejada
     */
    patch = function (name, func) {
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

        return obj[name];
    }

    return function(name, func) {
        return patch(name, func)
    }
});

