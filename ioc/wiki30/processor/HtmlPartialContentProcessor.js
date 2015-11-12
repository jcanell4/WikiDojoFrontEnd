define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory",
    "ioc/gui/content/subclasses/StructuredDocumentSubclass",
    'dojo/_base/event'
], function (declare, ContentProcessor, contentToolFactory, StructuredDocumentSubclass, event) {

    return declare([ContentProcessor],
        /**
         * Aquesta classe s'encarrega de processar els continguts per documents de tipus Html, generar els ContentTool
         * apropiat i afegir-lo al contenidor adequat.
         *
         * @class HtmlContentProcessor
         * @extends ContentProcessor
         * @author Josep Cañellas <jcanell4@ioc.cat>, Xavier García <xaviergaro.dev@gmail.com>
         */
        {
            type: "html_partial",

            /**
             * Processa el valor rebut com argument com a contingut Html per mostrar un document en mode Html
             *
             * @param {Content} value - Valor per processar
             * @param {Dispatcher} dispatcher - Dispatcher al que està lligat aquest document.
             * @override
             */
            process: function (value, dispatcher) {
                //console.log('HtmlPartialContentProcessor#process', value);
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
                dispatcher.getGlobalState().getContent(value.id)["action"] = "view";
                dispatcher.getGlobalState().getContent(value.id)["rev"] = value.rev;
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
                var args;
                args = {
                    ns: content.ns,
                    id: content.id,
                    title: content.title,
                    //content: content.structure,
                    content: content,
                    closable: true,
                    dispatcher: dispatcher,
                    rev: content.rev,
                    type: this.type,


                    postRender: function () {

                        this.inherited(arguments);

                        for (var i = 0; i < content.chunks.length; i++) {
                            var aux_id = content.id + "_" + content.chunks[i].header_id;
                            //console.log("Afegint la toolbar... a", aux_id);
                            initToolbar('toolbar_' + aux_id, 'textarea_' + aux_id, window['toolbar']);
                        }


                        // Afegim el handler pel submit
                        var that = this;

                        jQuery('input[data-call-type="save_partial"]').on('click', function () {


                            var $form = jQuery(this).closest('form');

                            var values = {};
                            jQuery.each($form.serializeArray(), function (i, field) {
                                values[field.name] = field.value;
                            });

                            var header_id = values['section_id'];
                            var pre = '';

                            // IMPORTANT! S'ha de fer servir el this.data perquè el this.content no es actualitzat
                            var chunks = that.data.chunks;

                            console.log("Reconstruint amb chunks: ", chunks);

                            var editingIndex = -1;

                            // TODO: Només fins al actual Fins al actual,
                            for (var i = 0; i < chunks.length; i++) {

                                if (chunks[i].header_id === header_id) {
                                    editingIndex = i;
                                    pre += chunks[i].text.pre;
                                    break;
                                }

                                if (chunks[i].text) {
                                    pre += chunks[i].text.pre;
                                    pre += chunks[i].text.editing;
                                }
                            }

                            var suf = '';

                            for (i = editingIndex + 1; i < chunks.length; i++) {
                                if (chunks[i].text) {
                                    suf += chunks[i].text.pre;
                                    suf += chunks[i].text.editing;
                                }
                            }
                            suf += that.data.suf || '';

                            // Actualitzem el formulari
                            jQuery('#' + $form.attr('id') + ' input[name="prefix"]').val(pre);
                            jQuery('#' + $form.attr('id') + ' input[name="suffix"]').val(suf);

                        })
                    },

                    preRender: function () {
                        // Compte! es al data i no al content perquè en aquest punt el content encara no s'ha actualitzat
                        for (var i = 0; i < this.data.chunks.length; i++) {
                            var aux_id = this.id + "_" + this.data.chunks[i].header_id,
                                text = jQuery("#textarea_" + aux_id).val();

                            //if (text && this.content.chunks[i].text && text.length>0) {
                            if (text && text.length > 0 && this.data.chunks[i].text) {
                                this.data.chunks[i].text.editing = text;
                            }
                        }
                    }
                };


                var contentTool = contentToolFactory.generate(contentToolFactory.generation.STRUCTURED_DOCUMENT, args),

                    argsRequestForm = {
                        urlBase: "lib/plugins/ajaxcommand/ajax.php?call=edit_partial&do=edit_partial",
                        form: '.btn_secedit',
                        volatile: true,
                        continue: false
                    },

                    argsRequestForm2 = {
                        //urlBase: "lib/plugins/ajaxcommand/ajax.php?call=save_partial",
                        form: '.form_save',
                        volatile: true,
                        continue: false
                    };


                return contentTool.decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm)
                    .decorate(contentToolFactory.decoration.REQUEST_FORM, argsRequestForm2);

            }
        });
});
