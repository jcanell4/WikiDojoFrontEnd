/**
 * Aquest motor de render espera que el format de les dades sigui string i retorna el mateix contingut
 * o un missatge d'error si no era un string.
 *
 * @module standardEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define(["dojo/dom-construct"], function (domConstruct) {
    return function (data) {
        //console.log("StandardRenderEngine", data);

        var render;
        var html;

        if (typeof data === 'string' ) {
            html = data;
        } else if (typeof data.content === 'string') {
            html = data.content;
        } else {
            render = 'Tipus de dada no reconegut.'
        }
        if(html){
            render = domConstruct.toDom("<div>" + html + "</div>");
        }

        return render;
    }
});
