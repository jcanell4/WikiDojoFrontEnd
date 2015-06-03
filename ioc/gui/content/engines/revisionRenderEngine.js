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

        _generateHtmlForDiff = function (revisionId, revision) {
            var html = '',
                linkDiff = '?id=' + revision['id'] + "&rev=" + revisionId + "&difftype=sidebyside";

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
        var id = _getIdFromData(data),
            html = '',
            first = true,
            linkRev, linkTime;

        html += '<form id="' + _generateFormId(id) + '" action="" method="post">';
        html += '<input name="id" value="' + id + '" type="hidden">';
        html += '<table class="meta-revisions">';
        html += '<tr><th colspan="4" style="text-align: center"><input type="submit" name="submit" value="comparar revisions"/></th></tr>'; // TODO[Xavi]no funciona, surt fora de la taula, perquè?

        for (var i in data) {
            linkRev = '?id=' + data[i]['id'] + "&rev=" + i;
            linkTime = data[i]['date'].substring(0, 10);

            html += '<tr>';

            if (first) {
                html += "<td></td>";
                html += '<td colspan="2" class="current-revision"><a href="' + linkRev + '" title="' + 'Obrir la revisió actual">';
                first = false;
                html += 'Versió actual';
                html += '</a></td>';

            } else {
                html += _generateHtmlForCheckRevision(i);
                html += '<td><a href="' + linkRev + '" title="' + 'Obrir la revisió del ' + data[i]['date'] + '">';
                html += linkTime;
                html += '</a></td>';
                html += _generateHtmlForDiff(i, data[i]);
            }

            html += _generateHtmlForSummary(data[i]);

            html += '</tr>';
        }


        html += '</table>';
        html += '</form>';

        return html;
    }
});