/**
 * Aquest motor permet retorna el contingut d'un element d'un array de continguts.
 *
 * TODO[Xavi] Sempre retornem el mateix, hem de decidir com passar la informació del index que volem
 *
 * @module standardEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([], function () {
    return function (data) {
        return data['sidebyside'];
        //return data['inline'];

    }
});
