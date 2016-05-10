/**
 * Aquest motor de render espera que el format de les dades sigui string i retorna el mateix contingut
 * o un missatge d'error si no era un string.
 *
 * @module standardEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([], function () {
    return function (data) {
        alert("Click al botó AMD 1");
    }
});
