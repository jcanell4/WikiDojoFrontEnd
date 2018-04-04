define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/DiffContentProcessor",
    "ioc/gui/content/contentToolFactory",
    'ioc/functions/jsProjectDiff'
], function (declare, DiffContentProcessor, contentToolFactory, jsProjectDiff) {
    /**
     * Aquesta classe s'encarrega de processar els continguts per documents de tipus Html, generar els ContentTool
     * apropiat i afegir-lo al contenidor adequat.
     *
     * @class ProjectDiffContentProcessor
     * @extends DiffContentProcessor
     * @culpable Rafael Claver
     */
    return declare([DiffContentProcessor], {
        
        type: "project_diff",

        /**
         * Processa el valor rebut com argument com a contingut Html per mostrar un document en mode Html
         *
         * @param {Content} value - Valor per processar
         * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest document.
         * @override
         */
        process: function (value, dispatcher) {
            return this.inherited(arguments);
        },

        /**
         * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
         * el valor de la acció a "view".
         *
         * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest process
         * @param {Content} value - Valor per processar
         * @override
         */
        updateState: function (dispatcher, value) {
            this.inherited(arguments);
            dispatcher.getGlobalState().getContent(value.id)["action"] = this.type;
            dispatcher.getGlobalState().getContent(value.id)["projectType"] = value.extra.projectType;
            dispatcher.getGlobalState().getContent(value.id)["rev1"] = value.date;
            dispatcher.getGlobalState().getContent(value.id)["rev2"] = value.date_rev1;
        },

        /**
         * Genera un ContentTool decorat adecuadament per funcionar com document de només lectura.
         *
         * @param {Content} content - Contingut a partir del qual es generarà el ContentTool
         * @param {Dispatcher} dispatcher - Dispatcher al que estarà lligat el ContentTool
         * @returns {ContentTool} ContentTool decorat com a tipus document.
         * @protected
         * @override
         */
        createContentTool: function (content, dispatcher) {
            var diff, rev;
            var rev1, rev2, label1, label2;
            rev1 = JSON.stringify(content.content);
            rev2 = JSON.stringify(content.rev1);
            label1 = (content.revTrev) ? "Revisió" : "Projecte original";
            label1 += " (" + this._convertUnixDate(content.date, true) + ")";
            label2 = "Revisió (" + this._convertUnixDate(content.date_rev1, true) + ")";
            
            diff = jsProjectDiff.getDiff(rev1, rev2, label1, label2);
            rev = this._convertUnixDate(content.date) + " - " + this._convertUnixDate(content.date_rev1);
            
            var args = {
                    ns:          content.ns,
                    id:          content.id,
                    title:       content.title + " - Diferència",
                    type:        this.type,
                    projectType: content.extra.projectType,
                    content:     diff,
                    rev:         rev,
                    closable:    true,
                    dispatcher:  dispatcher
                };

            return contentToolFactory.generate(contentToolFactory.generation.DOCUMENT, args);
        },

        _convertUnixDate: function (fecha, hora) {
            var p = 13 - fecha.toString().length; //He detectado fechas con menos dígitos de lo normal
            if (p > 0) {
                var mul = 1;
                for (var i=0; i<p; i++) {
                    mul *= 10;
                }
                fecha *= mul;
            }
            var d = new Date(fecha);
            var ret = d.getDate() + "." + (d.getMonth()+1) + "." + d.getFullYear();
            if (hora) 
                ret += " - " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
            return ret;
        }
        
    });
    
});
