/**
 * Aquest mòdul genera un RenderEngine que permet convertir una estructura de dades de tipus revisions en una taula
 * formatada amb els enllaços per carregar qualsevol revisió del document i fer la comparació amb l'actual o altres
 * revisions.
 *
 * Els enllaços generats son per fer crides Ajax via un dels RequestDecoration disponibles del ContentTool, no funcionen
 * com enllaços normals ja que s'ha d'afegir el urlBase.
 *
 * @module revisionEngineFactory
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define([], function () {

    return function (data) {
        var html = '',
            first = true,
            linkRev, linkDiff;

        html += '<table>';


        for (var i in data) {

            linkRev = '?id=' + data[i]['id'] + "&rev=" + i;
            linkDiff = '?id=' + data[i]['id'] + "&rev=" + i + "&difftype=sidebyside";

            html += '<tr>';


            if (first) {
                html += '<td colspan="2"><a href="' + linkRev + '">'
                first = false;
                html += 'Revisió actual'
                html += '</a></td>';

            } else {
                html += '<td><a href="' + linkRev + '">'
                html += data[i]['date'];
                html += '</a></td>';
                html += '<td><a href="' + linkDiff + '" data-call="diff">';
                html += '<img width="15" height="11" alt="Mostra diferències amb la versió actual"';
                html += 'title="Mostra diferències amb la versió actual" src="/iocjslib/ioc/gui/img/diff.png" />';
                html += '</a></td>';
            }

            html += '<td>' + data[i]['sum'] + '</td>';
            html += '</tr>';
        }

        html += '</table>';

        return html;
    }
});


