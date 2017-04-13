/**
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([
        "dojo/dom",
    ], function (dom) {

        var URL_BASE = 'ioc/widgets/',// URL per defecte
            RETRY_TIMER = 100


        createAMDWidget = function (data, id) {

            // Carregar el token amb un require
            // La classe vindrà definida per la propietat 'class' i les dades per la propietat 'data'
            var url;

            if (data.urlBase) {
                url = data.urlBase + data.class + '/' + data.class;
            } else {
                url = URL_BASE + data.class + '/' + data.class;
            }

            console.log("URL Demanada per carregar mòdul AMD:", url);

            require([url], function (Widget) {
                console.log("Carrega del modul completa");
                appendAMDWidget(Widget, data, id);
            });
        },


            appendAMDWidget = function (Widget, data, nodeId) {
                var parentNode;

                if (typeof nodeId !== "object") {
                    console.log("nodeid no és un objecte");
                    parentNode = document.getElementById(nodeId);
                } else {
                    console.log("nodeid és un objecte");
                    parentNode = nodeId;
                }

                console.log("Parent Node: ", parentNode, nodeId);

                if (!parentNode) {
                    console.log("Posat en espera " + RETRY_TIMER + " ms");
                    setTimeout(appendAMDWidget, RETRY_TIMER, Widget, data, nodeId);
                } else {
                    data.id = nodeId;
                    var widget = new Widget(data.data).placeAt(parentNode);
                    console.log("Widget afegit al dom", parentNode, widget);
                }
            },

            addWidgetToNode = function (data, nodeId) {
                createAMDWidget(data, nodeId);
            };


        return  {
            addWidgetToNode: addWidgetToNode

        };

    }
);