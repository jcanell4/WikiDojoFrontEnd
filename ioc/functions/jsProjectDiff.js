define([], function () {
    
    var lib = {
        sort: function (arr) {
            return arr.sort();
        },
        
        comparaOld: function (arrL, arrR, titleL, titleR) {
            var item, clase,
                diff = {}, 
                inTBi = "<table><th colspan=2>",
                inTBf = "</th>",
                fiTB = "</table>",
                inTR = "<tr><td",
                fiTR = "</td></tr>",
                inTD = "</td><td",
                changed = " class='itemProjectChanged'>";
        
            diff.L = inTBi + titleL + inTBf;
            diff.R = inTBi + titleR + inTBf;
            
            for (item in arrL) {
                diff.L += inTR;
                diff.R += inTR;
                clase = (arrL[item] !== arrR[item]) ? changed : ">";
                diff.L += clase + item + inTD + clase + arrL[item] + fiTR;
                diff.R += clase + item + inTD + clase + arrR[item] + fiTR;
            }
            diff.L += fiTB;
            diff.R += fiTB;
            return diff;
        },
        
        compara: function (arrL, arrR, titleL, titleR) {
            var item, ch, taula,
                colorL = "leftcolor",
                colorR = "rightcolor",
                inTB = "<table>",
                fiTB = "</table>",
                inTHl = "<th colspan=2 class='"+ colorL + "'>",
                inTHr = "<th colspan=2 class='"+ colorR + "'>",
                fiTH = "</th>",
                inTR = "<tr>",
                inTD = "<td class='",
                fiTR = "</tr>",
                fiTD = "</td>",
                clCH = " itemProjectChanged'>";
                
            taula = inTB + inTHl + titleL + fiTH + inTHr + titleR + fiTH;
            for (item in arrL) {
                ch = (arrL[item] !== arrR[item]) ? clCH : "'>";
                taula += inTR + inTD + colorL + ch + item + fiTD;
                taula += inTD + colorL + ch + arrL[item] + fiTD;
                taula += inTD + colorR + ch + item + fiTD;
                taula += inTD + colorR + ch + arrR[item] + fiTD + fiTR;
            }
            taula += fiTB;
            return taula;
        },
        
        stripLinebreaks: function (str) {
            return str.replace(/^[\n\r]*|[\n\r]*$/g, "");
        }
    };
    
    var getDiff = function(formL, formR, titleL, titleR){
        var diff;
        diff = lib.compara(JSON.parse(formL), JSON.parse(formR), titleL, titleR);
        return "<div>" + diff + "</div>";
    };
    
    return {
        getDiff: getDiff
    };
    
});