/**
 * Aquest mòdul genera un RenderEngine que permet convertir una estructura de dades de tipus revisions en una taula
 * formatada amb els enllaços per carregar qualsevol revisió del document i fer la comparació amb l'actual o altres
 * revisions.
 *
 * Els enllaços generats son per fer crides Ajax via un dels RequestDecoration disponibles del ContentTool, no funcionen
 * com enllaços normals ja que s'ha d'afegir el urlBase.
 *
 * @module revisionRenderEngine
 * @author Xavier García <xaviergaro.dev@gmail.com>
 */
define(function () {

    var _generateHtmlForSummary = function (revision) {
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

        _generateHtmlForDiff = function (revision, call_diff) {
            var html = '',
                linkDiff = "?id=" + revision['id'] + "&rev=" + revision['rev'] + "&difftype=sidebyside";

            //html += '<td><a href="' + linkDiff + '" data-call="diff">';
            html += '<td><a href="' + linkDiff + '" data-call="' + call_diff + '">';
            html += '<img width="15" height="11" alt="Mostra diferències amb la versió actual"';
            html += 'title="Mostra diferències entre la revisió del ' + revision['date'];
            html += ' i la versió actual" src="/iocjslib/ioc/gui/img/diff.png" />';
            html += '</a></td>';

            return html;
        };

        _generateNextButton = function (id, ns, offset) {
            var link= '?id=' + ns + '&targetId=' + id+"&offset=" + offset;
            var html = '<a href="' + link + '" data-call="revision">&gt;&gt;</a>';

            return html;
        };

        _generatePreviousButton = function (id, ns, offset) {
            var link= '?id=' + ns + '&targetId=' + id +"&offset=" + offset;
            var html = '<a href="' + link + '" data-call="revision">&lt;&lt;</a>';

            return html;
        };

        _generatePaginationRow = function (lessButton, moreButton, page) {
            var html = '<tr><td style="text-align: center;" colspan="3">';
            html += lessButton ? lessButton : '<<';
            html += ' ';
            html += page;
            html += ' ';
            html += moreButton? moreButton : '>>';
            html += '</td></tr>';

            return html;
        };

    return function (data, contentTool) {
        data = JSON.parse(JSON.stringify(data)); // Com que data es un objecte hem de fer una copia per no modificar l'original

        var id = contentTool.docId,
            ns = data.docId,
            html = '',
            linkRev,
            linkTime,
            sortable = [],
            linkCurrent,
            call_view,
            call_diff = "diff";

        html += '<form id="revisions_selector_' + id + '" action="'+ data.urlBase+'" method="post">';
        html += '<input name="id" value="' + ns + '" type="hidden">';
        html += '<table class="meta-revisions">';
        html += '<tr><th colspan="5" style="text-align: center"><input type="submit" name="submit" value="comparar revisions"/></th></tr>'; // TODO[Xavi]no funciona, surt fora de la taula, perquè?

        // Comprovem si existeix l'actual i si es així l'eliminem de la llista de revisions
        if (data[data.current]) {
            delete data[data.current];
        }
        delete(data.current);

        linkCurrent = '?id=' + ns;

        if (data.position && data.position > -1) {
            var lessButton = _generatePreviousButton(id, ns, Math.max(-1, data.position - data.amount));
        }

        if (data.show_more_button) {
            var moreButton = _generateNextButton(id, ns, Math.max(0, data.position) + data.amount);
        }
        var page = Math.floor(Math.max(data.position, 0) / data.amount) + 1;

        call_view = data.call_view;
        if (data.call_diff) {
            call_diff = data.call_diff;
        }

        delete(data.position);
        delete(data.amount);
        delete(data.show_more_button);
        delete(data.docId);
        delete(data.urlBase);
        delete(data.call_view);
        delete(data.call_diff);

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
        html += '<tr><td></td>';
        html += '<td colspan="4" class="current-revision"><a href="' + linkCurrent + '" title="' + 'Obrir la revisió actual">';
        html += 'Versió actual';
        html += '</a></td></tr>';

        if (page > 1) 
            html+=_generatePaginationRow(lessButton, moreButton, page);

        for (var i = 0; i < sortable.length; i++) {
            linkRev = '?id=' + sortable[i]['id'] + "&rev=" + sortable[i]['rev'];
            linkTime = sortable[i]['date'].substring(0, 10);

            html += '<tr>';
            html += _generateHtmlForCheckRevision(sortable[i]['rev']);
            if (call_view) {
                html += '<td><a href="' + linkRev + '" data-call="' + call_view + '" title="' + 'Obrir la revisió del ' + sortable[i]['date'] + '">';
            }else {
                html += '<td><a href="' + linkRev + '" title="' + 'Obrir la revisió del ' + sortable[i]['date'] + '">';
            }
            html += linkTime;
            html += '</a></td>';
            html += '<td>' + sortable[i]['user'] + '</td>';
            html += _generateHtmlForDiff(sortable[i], call_diff);
            html += _generateHtmlForSummary(sortable[i]);
            html += '</tr>';
        }

        if (page > 1) 
            html+=_generatePaginationRow(lessButton, moreButton, page);

        html += '</table>';
        html += '</form>';

        contentTool.set("title", "Revisions(" + sortable.length + ")");

        return html;
    };
    
});