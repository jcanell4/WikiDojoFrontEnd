define([], function () {
    
    var lib = {
        
        colorL: "leftcolor",
        colorR: "rightcolor",
        divMain: "<div class='diffmain'>",
        divRow: "<div class='diffrow'>",
        divCol: "<div class='diffcolumn ",
        spnCol: "<span class='",
        fiSpn: "</span>",
        fiDiv: "</div>",
        fiCH: "'>",
        clCH: " itemProjectChanged'>",
        
        compara: function (arrL, arrR, titleL, titleR) {
            var key, itemL, itemR, taula,
                inHl = this.divCol + this.colorL + "'>" + titleL + this.fiDiv,
                inHr = this.divCol + this.colorR + "'>" + titleR + this.fiDiv;

            taula = this.divMain + this.divRow + inHl + inHr + this.fiDiv;
            for (key in arrL) {
                itemL = this.parseStringToArrayOrObject(arrL[key]);
                itemR = this.parseStringToArrayOrObject(arrR[key]);
                if (Array.isArray(itemL)) {
                    taula += this.construyeDesdeArray(key, itemL, itemR, 1);
                }else if (typeof itemL === 'object') {
                    taula += this.construyeDesdeObjeto(key, itemL, itemR, 1);
                }else {
                    taula += this.construye(key, itemL, itemR, 1);
                }
            }
            taula += this.fiDiv;
            return taula;
        },
        
        construyeDesdeArray: function(k, arrL, arrR, level) {
            var key, itemL, itemR;
            var max = (arrL.length > arrR.length) ? arrL.length : arrR.length;

            var taula = this.construye(k, "", "", level);
            
            for (var key = 0; key < max; key++) {
                itemL = this.parseStringToArrayOrObject(arrL[key]);
                itemR = this.parseStringToArrayOrObject(arrR[key]);
                if (Array.isArray(itemL)) {
                    taula += this.construyeDesdeArray(k, itemL, itemR, level+1);
                }else if (typeof itemL === 'object') {
                    taula += this.construyeDesdeObjeto(key, itemL, itemR, level+1);
                }else {
                    taula += this.construye(key, itemL, itemR, level);
                }
            }
            
            return taula;
        },
        
        construyeDesdeObjeto: function(k, arrL, arrR, level) {
            var key, itemL, itemR;
            var taula = this.construye("fila "+(k+1), "", "", level);
            
            for (key in arrL) {
                itemL = this.parseStringToArrayOrObject(arrL[key]);
                itemR = this.parseStringToArrayOrObject(arrR[key]);
                if (Array.isArray(itemL)) {
                    taula += this.construyeDesdeArray(key, itemL, itemR, level+1);
                }else if (typeof itemL === 'object') {
                    taula += this.construyeDesdeObjeto(key, itemL, itemR, level+1);
                }else {
                    taula += this.construye(key, itemL, itemR, level);
                }
                //eliminamos el elemeto procesado de cada uno de los objetos
                delete arrL[key];
                if (itemR !== undefined && itemR !== "") delete arrR[key];
            }
            
            for (key in arrR) {
                itemL = this.parseStringToArrayOrObject(arrL[key]);
                itemR = this.parseStringToArrayOrObject(arrR[key]);
                if (Array.isArray(itemR)) {
                    taula += this.construyeDesdeArray(key, itemL, itemR, level+1);
                }else if (typeof itemR === 'object') {
                    taula += this.construyeDesdeObjeto(key, itemL, itemR, level+1);
                }else {
                    taula += this.construye(key, itemL, itemR, level);
                }
            }
            
            return taula;
        },
        
        construye: function(key, itemL, itemR, level) {
            var taula = "";
            var keycolor = "diffkeycolor";
            var ch = (itemL !== itemR) ? this.clCH : this.fiCH;

            var dvCl = this.divCol + this.colorL + ch,  //div column left
                dvCr = this.divCol + this.colorR + ch,  //div column right
                spClk = this.spnCol + "difflevel"+level + " diffkey " + keycolor + " " + this.colorL + ch, //span column left key
                spClv = this.spnCol + this.colorL + ch,                                   //span column left value
                spCrk = this.spnCol + "difflevel"+level + " diffkey " + keycolor + " " + this.colorR + ch, //span column right key
                spCrv = this.spnCol + this.colorR + ch;                                   //span column right value
            
            taula += this.divRow;
            taula += dvCl;
            taula += spClk + key + ": " + this.fiSpn;
            taula += spClv + itemL + this.fiSpn;
            taula += this.fiDiv;
            taula += dvCr;
            taula += spCrk + key + ": " + this.fiSpn;
            taula += spCrv + itemR + this.fiSpn;
            taula += this.fiDiv;
            taula += this.fiDiv;
            return taula;
        },
        
        parseStringToArrayOrObject: function(elem) {
            try {
                ret = (elem) ? JSON.parse(elem) : "";
            }catch(err) {
                ret = (elem===undefined) ? "" : elem;
            }
            return ret;
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