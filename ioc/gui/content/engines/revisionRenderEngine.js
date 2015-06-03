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
define(["dojo/date"], function (date) {

    return function (data) {
        var html = '',
            first = true,
            linkRev, linkDiff, linkTime;


        html += '<table class="meta-revisions">';


        html += '<tr><th colspan="4" style="text-align: center"><input type="submit" value="comparar revisions"/></th></tr>'; // TODO[Xavi]no funciona, surt fora de la taula, perquè?


        for (var i in data) {

            linkRev = '?id=' + data[i]['id'] + "&rev=" + i;
            linkDiff = '?id=' + data[i]['id'] + "&rev=" + i + "&difftype=sidebyside";
            linkTime = data[i]['date'].substring(0, 10);


            html += '<tr>';


            if (first) {
                html += "<th></th>";
                html += '<th colspan="2"><a href="' + linkRev + '" title="' + data[i]['date']+'">';
                //html += (data[i]['sum'] ? ' - ' + data[i]['sum'] : '') + '">';
                first = false;
                html += 'Versió actual';
                html += '</a></th>';
                //html += '</a></td>';
                html += '<th class="ellipsed" title="';
                html += data[i]['sum'] ? data[i]['sum'] : 'No hi ha cap resum per la revisió del ' +data[i]['date'];
                html += '">' + data[i]['sum'] + '</th>';

            } else {
                html += '<td><input class="check" type="checkbox" name="option" value="' + i + '" /></td>';
                html += '<td><a href="' + linkRev + '" title="' + 'Obrir la revisió del ' + data[i]['date']+'">';
                html += linkTime;
                html += '</a></td>';
                html += '<td><a href="' + linkDiff + '" data-call="diff">';
                html += '<img width="15" height="11" alt="Mostra diferències amb la versió actual"';
                html += 'title="Mostra diferències entre la revisió del ' +data[i]['date'] + ' i la versió actual" src="/iocjslib/ioc/gui/img/diff.png" />';
                html += '</a></td>';


                html += '<td class="ellipsed" title="';
                html += data[i]['sum'] ? 'Resum: ' + data[i]['sum'] : 'No hi ha cap resum per la revisió del ' +data[i]['date'];
                html += '">' + data[i]['sum'] + '</td>';
            }


            html += '</tr>';
        }

        html += '</table>';


        return html;
    }
});


