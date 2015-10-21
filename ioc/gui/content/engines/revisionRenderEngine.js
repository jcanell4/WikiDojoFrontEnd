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
define(function () {

    /**
     * Extreu el id del document de les dades de revisions passades com argument.
     *
     * @param {Revisions} data - dades de les que extreure el id
     * @returns {string} - id del document al que pertanyen les revisions
     */
    var _getIdFromData = function (data) {
            return data[Object.keys(data)[0]]['id'];
        },

        _generateHtmlForSummary = function (revision) {
            var html = '';

            html += '<td class="ellipsed" title="';
            html += _extractSummaryFromRevision(revision);
            html += '">' + revision['sum'] + '</td>';

            return html;
        },

        _generateHtmlForCheckRevision = function (revisionId) {
            var html = '';
            html += '<td>';
            html += '<input class="check" type="checkbox" name="rev2[]" value="' + revisionId + '" ';
            html += ' title="Marca 2 revisions i clica al botò de la part superior per comparar-les"/>';
            html += '</td>';

            return html;
        },

        _extractSummaryFromRevision = function (revision) {
            return revision['sum'] ? 'Resum: ' + revision['sum'] : 'No hi ha cap resum per la revisió del ' + revision['date'];
        },

        _generateHtmlForDiff = function (revision) {
            var html = '',
                linkDiff = '?id=' + revision['id'] + "&rev=" + revision['rev'] + "&difftype=sidebyside";

            html += '<td><a href="' + linkDiff + '" data-call="diff">';
            html += '<img width="15" height="11" alt="Mostra diferències amb la versió actual"';
            html += 'title="Mostra diferències entre la revisió del ' + revision['date'];
            html += ' i la versió actual" src="/iocjslib/ioc/gui/img/diff.png" />';
            html += '</a></td>';

            return html;
        },

        _generateFormId = function (id) {
            return 'revisions_selector_' + id.replace(':', '_');
        };


    return function (data) {
        data = JSON.parse(JSON.stringify(data)); // Com que data es un objecte hem de fer una copia per no modificar l'original


        var id = data.docId,
            html = '',
        //first = true,
            linkRev,
            linkTime,
            sortable = [],
            linkCurrent;


        html += '<form id="' + _generateFormId(id) + '" action="" method="post">';
        html += '<input name="id" value="' + id + '" type="hidden">';
        html += '<table class="meta-revisions">';
        html += '<tr><th colspan="4" style="text-align: center"><input type="submit" name="submit" value="comparar revisions"/></th></tr>'; // TODO[Xavi]no funciona, surt fora de la taula, perquè?


        // Comprovem si existeix el actual i si es així l'eliminem de la llista de revisions
        if (data[data.current]) {
            delete data[data.current];
        }

        delete(data.current);

        linkCurrent = '?id=' + data.docId;

        delete(data.docId);


        // extreiem cada objecte i l'afegim a un array per poder ordenar-los
        for (var j in data) {
            data[j]['rev'] = j;
            sortable.push(data[j]);
        }



        // Ordenem el array
        sortable.sort(function (a, b) {
            return a['rev'] > b['rev'] ? -1 : 1;
        });


        // Afegim el actual
        html += "<td></td>";
        html += '<td colspan="3" class="current-revision"><a href="' + linkCurrent + '" title="' + 'Obrir la revisió actual">';
        html += 'Versió actual';
        html += '</a></td>';


        for (var i = 0; i < sortable.length; i++) {
            linkRev = '?id=' + sortable[i]['id'] + "&rev=" + sortable[i]['rev'];
            linkTime = sortable[i]['date'].substring(0, 10);

            html += '<tr>';

            html += _generateHtmlForCheckRevision(sortable[i]['rev']);
            html += '<td><a href="' + linkRev + '" title="' + 'Obrir la revisió del ' + sortable[i]['date'] + '">';
            html += linkTime;
            html += '</a></td>';
            html += _generateHtmlForDiff(sortable[i]);
            //}

            html += _generateHtmlForSummary(sortable[i]);

            html += '</tr>';
        }

        html += '</table>';
        html += '</form>';

        return html;
    }
});