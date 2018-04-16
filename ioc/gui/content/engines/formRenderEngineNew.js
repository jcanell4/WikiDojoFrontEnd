/**
 * Aquest motor de render retornarà una versió o altre del render engine de formularis segons si es passa com a paràmetre
 * cert o fals.
 *
 * @module standardEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */


define([
    "ioc/gui/content/engines/_editFormRenderEngine",
    "ioc/gui/content/engines/_viewFormRenderEngine",
], function (EditFormRenderEngine, ViewFormRenderEngine) {


    return function (editable) {

        var renderEngine;

        if (editable) {
            renderEngine = new EditFormRenderEngine();
        } else {
            renderEngine = new ViewFormRenderEngine();
        }

        return renderEngine.render.bind(renderEngine); // Mètode del render engine seleccionat
    };

});

