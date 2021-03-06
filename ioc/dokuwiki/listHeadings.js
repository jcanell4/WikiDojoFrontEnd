define([], function () {

    var indices = [];

    var addIndex = function (ini, idContent) {
        var head, text;

        // jQuery will give all the HNs in document order
        jQuery('#' + idContent + ' :header').not("div#dw__toc H3").not(".numbered").each(function (i, e) {
            var hIndex = parseInt(this.nodeName.substring(1)) - 1;

            // Afegim una classe per evitar que es torni a numerar
            jQuery(e).addClass('numbered');

            // just found a levelUp event
            if (indices.length - 1 > hIndex) {
                indices = indices.slice(0, hIndex + 1);
            }

            // just found a levelDown event
            if (indices[hIndex] == undefined) {
                indices[hIndex] = (this.tagName == "H1") ? ini : 0;
            }

            // count + 1 at current level
            indices[hIndex]++;

            // display the full position in the hierarchy
            head = '<span';
            text = '';
            for (i = 0; i < indices.length; i++) {
                if (indices[i] == undefined) {
                    head += ' class="missing_header"';
                    text += 'X.';
                } else {
                    text += indices[i] + '.';
                }
            }
            head += '>';
            text += ' </span>';
            jQuery(this).prepend(head + text);
        });
    };

    var listHeadings = function (idContent, ns) {
        var number, ini;

        if(!ns){
            if(NS){
                ns = NS;
            }else if(JSINFO && JSINFO.id){
                ns = JSINFO.id;
            }
        }

        indices = [];
        number = /:a(\d+)$|:a(\d+):/.exec(ns);

        if (number) {
            ini = (number[1] != undefined) ? number[1] - 1 : number[2] - 1;
        } else {
            ini = 0;
        }
        addIndex(ini, idContent);
    };

    return listHeadings;
});
