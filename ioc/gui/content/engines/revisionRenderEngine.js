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
            html += ' title="Marca 2 revisions i clica al botó de la part superior per comparar-les"/>';
            html += '</td>';

            return html;
        },

        _extractSummaryFromRevision = function (revision) {
            return revision['sum'] ? 'Resum: ' + revision['sum'] : 'No hi ha cap resum per la revisió del ' + revision['date'];
        },

        _generateHtmlForDiff = function (revision, call_diff) {
            var html = '',
                linkDiff = "?id=" + revision['id'] + "&rev=" + revision['rev'] + "&difftype=sidebyside";

            html += '<td><a href="' + linkDiff + '" data-call="' + call_diff + '">';
            html += '<img width="15" height="11" alt="Mostra diferències amb la versió actual"';
            html += ' title="Mostra diferències entre la revisió del ' + revision['date'];
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
            html += lessButton ? lessButton : '  ';
            html += ' ';
            html += page;
            html += ' ';
            html += moreButton? moreButton : '  ';
            html += '</td></tr>';

            return html;
        };

    return function (data, contentTool) {
        data = JSON.parse(JSON.stringify(data)); // Com que data es un objecte hem de fer una copia per no modificar l'original

        var id = contentTool.docId,
            ns = data.docId,
            amount=data.totalamount,
            html = '',
            linkRev,
            linkTime,
            sortable = [],
            linkCurrent,
            call_view = '',
            call_diff = "diff",
            revision_actual = [];

        html += '<form id="revisions_selector_' + id + '" action="'+ data.urlBase+'" method="post">';
        html += '<input name="id" value="' + ns + '" type="hidden">';
        html += '<table class="meta-revisions">';
        html += '<tr><th colspan="5" style="text-align: center"><input type="submit" name="submit" value="comparar revisions"/></th></tr>';

        // Comprovem si existeix l'actual i si es així l'eliminem de la llista de revisions
        if (data[data.current]) {
            delete data[data.current];
        }
        delete(data.current);

        linkCurrent = '?id=' + ns;

        if (data.position && data.position > 0) {
            var lessButton = _generatePreviousButton(id, ns, Math.max(0, data.position - data.maxamount));
        }

        if (data.show_more_button) {
            var moreButton = _generateNextButton(id, ns, Math.max(0, data.position) + data.maxamount);
        }
        var page = "(" + (Math.max(data.position, 0)+1) + "-" + (data.position+data.amount) + ")";

        if (data.call_view)
            call_view = ' data-call="' + data.call_view + '"';
        if (data.call_diff)
            call_diff = data.call_diff;
        if (data.summary)
            revision_actual.sum = data.summary;

        delete(data.position);
        delete(data.amount);
        delete(data.maxamount);
        delete(data.totalamount);
        delete(data.show_more_button);
        delete(data.docId);
        delete(data.urlBase);
        delete(data.call_view);
        delete(data.call_diff);
        delete(data.summary);

        // afegim l'element rev, amb valor data, a cada array per poder ordenar-los
        for (var j in data) {
            data[j]['rev'] = j;
            sortable.push(data[j]);
        }

        // Ordenem l'array
        sortable.sort(function (a, b) {
            return a['rev'] > b['rev'] ? -1 : 1;
        });

        // Afegim l'actual
        html += '<tr><td></td>';
        html += '<td colspan="3" class="current-revision">';
        html += '<a href="' + linkCurrent + '"' + call_view + ' title="Obrir la revisió actual">Versió actual</a>';
        html += '</td>';
        html += _generateHtmlForSummary(revision_actual);
        html += '</tr>';

        if (lessButton || moreButton) 
            html+=_generatePaginationRow(lessButton, moreButton, page);

        for (var i = 0; i < sortable.length; i++) {
            linkRev = '?id=' + sortable[i]['id'] + "&rev=" + sortable[i]['rev'];
            linkTime = sortable[i]['date'].substring(0, 10);

            html += '<tr>';
            html += _generateHtmlForCheckRevision(sortable[i]['rev']);
            html += '<td><a href="' + linkRev + '"' + call_view + ' title="Obrir la revisió del ' + sortable[i]['date'] + '">';
            html += linkTime;
            html += '</a></td>';
            html += '<td>' + sortable[i]['user'] + '</td>';
            html += _generateHtmlForDiff(sortable[i], call_diff);
            html += _generateHtmlForSummary(sortable[i]);
            html += '</tr>';
        }

        if (lessButton || moreButton) 
            html+=_generatePaginationRow(lessButton, moreButton, page);

        html += '</table>';
        html += '</form>';

        contentTool.set("title", "Revisions(" + amount + ")");

        return html;
    };
    
});