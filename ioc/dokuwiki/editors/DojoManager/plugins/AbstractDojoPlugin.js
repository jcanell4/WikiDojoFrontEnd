define([
    "dojo/_base/declare",
    "dijit/_editor/_Plugin",
], function (declare, _Plugin) {

    // ALERTA: Aquests serian els componentes semi-comuns als plugins, com es pot apreciar ni tan sols a a aquest
    // nivell son necesaris totes les funciones i propietats en tots els casos:
    //      - Plugins que no necesitan parse, sobren: needsParse i parse
    //      - Plugins que no inclouen botó, sobra: crida a _initButton i _initButton


    var AbstractDojoPlugin = declare(null, [_Plugin], {

        needsParse: false,

        setEditor: function (/*dijit/Editor*/ editor) {
            this.editor = editor;
            this._initButton();
        },

        _initButton: function () {
            throw new Error('Method not implemented')
        },

        parse: function () {
            throw new Error('Method not implemented')
        }


    });

    // ALERTA: això es imprescindible per tots els plugins, s'han d'autoregistrar
    // Register this plugin.
    // _Plugin.registry["abstract"] = function () {
    //     return new AbstractDojoPlugin({command: "abstract"});
    // };

    return AbstractDojoPlugin;


});

