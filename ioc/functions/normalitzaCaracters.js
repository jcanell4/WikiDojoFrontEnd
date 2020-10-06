define([], function () {
    
    return function(cadena, preserveSep) {
        cadena = cadena.toLowerCase();
        cadena = cadena.replace(/[áäàâ]/gi,"a");
        cadena = cadena.replace(/[éèëê]/gi,"e");
        cadena = cadena.replace(/[íìïî]/gi,"i");
        cadena = cadena.replace(/[óòöô]/gi,"o");
        cadena = cadena.replace(/[úùüû]/gi,"u");
        cadena = cadena.replace(/ç/gi,"c");
        cadena = cadena.replace(/ñ/gi,"n");
        if (preserveSep){
            cadena = cadena.replace(/[^0-9a-z:_]/gi,"_");
        }else{
            cadena = cadena.replace(/[^0-9a-z_]/gi,"_");
        }
        cadena = cadena.replace(/_+/g,"_");
        cadena = cadena.replace(/:+/g,":");
        cadena = cadena.replace(/^_+|_+$/g,"");
        return cadena;
    };

});

