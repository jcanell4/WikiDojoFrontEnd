/**
 * Aquest motor de render espera que el format de les dades sigui string i retorna el mateix contingut
 * o un missatge d'error si no era un string.
 *
 * @module standardEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([], function () {
    return function (data) {
        //console.log("StandardRenderEngine", data);

        var render;

        if (typeof data === 'string' ) {
            render = data;
        } else if (typeof data.content === 'string') {
            render = data.content;
        } else {
            render = 'Tipus de dada no reconegut.'
        }

        return render;
    }
});
