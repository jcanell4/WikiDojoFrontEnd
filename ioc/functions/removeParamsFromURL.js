define([
    "dojo/on"
   ,"dojo/_base/event"
   ,"dojo/dom"
   ,"dojo/dom-attr"
], function (on, event, dom, att) {
    // ALERTA[Xavi] En fer la reescriptura de l'URL es produeix un error de dojo relacionat amb el Dijit.Tree (no sempre, segurament relacionat amb el temps de resposta de les crides AJAX)
    var removeParamsFromURL = function () {
        if (window.location.href.indexOf('?') === -1) {
            return;
        }

        var domainPos = window.location.href.indexOf('/', window.location.href.indexOf('//')+2);
        var newURL =  window.location.href.substring(domainPos, window.location.href.lastIndexOf('?'));
        window.history.pushState(null, null, newURL);
    };
    return removeParamsFromURL;
});

