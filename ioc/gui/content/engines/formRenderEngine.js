/**
 * Aquest motor de render retornarà una versió o altre del render engine de formularis 
 * segons si es passa com a paràmetre cert o fals.
 *
 * @module formRenderEngine
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */

define([
    "ioc/gui/content/engines/_editFormRenderEngine",
    "ioc/gui/content/engines/_viewFormRenderEngine",
    "ioc/gui/content/engines/_partialEditFormRenderEngine",
], function (EditFormRenderEngine, ViewFormRenderEngine, PartialFormRenderEngine) {


    return function (options) {
        var renderEngine;



        switch (options.type) {
            case 'edit':
                renderEngine = new EditFormRenderEngine();
                break;
            case 'view':
                renderEngine = new ViewFormRenderEngine(); // ALERTA[Xavi] Test fins que implementent el respons handler pel partial
                break;

            case 'partial':
                renderEngine = new PartialFormRenderEngine();
                break;

            default:
                renderEngine = new ViewFormRenderEngine();
        }

        // Desem les opcions al renderEngine, això permet recuperar el type als widgets per determinas quina vista s'ha de fer servir
        renderEngine._options = options;

        return renderEngine.render.bind(renderEngine); // Mètode del render engine seleccionat
    };

});

