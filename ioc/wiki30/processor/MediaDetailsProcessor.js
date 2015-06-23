define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/registry",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, lang, registry, ContentProcessor, contentToolFactory) {

    var ret = declare([ContentProcessor],
            /**
             * @class MediaDetailsProcessor
             * @extends ContentProcessor
             */
                    {
                        type: "mediadetails",
                        requester: null,
                        /**
                         * @param {*} value
                         * @param {ioc.wiki30.Dispatcher} dispatcher
                         *
                         * @override
                         */
                        process: function (value, dispatcher) {
                            if (value.mediaDetailsAction == "delete") {
                                this._detailsRemoveProcess(value, dispatcher);
                            } else {
                                //this._detailsProcess(value, dispatcher);
                                this.inherited(arguments);
                            }
                            dw_mediamanager.image_diff();


                        },
                        _detailsRemoveProcess: function (value, dispatcher) {
                            var container = registry.byId(dispatcher.containerNodeId);
                            container.clearContainer(value.id);
                            if (dispatcher.getGlobalState().pages["media"]["ns"]) {
                                this._createRequest();
                                this.requester.urlBase = "lib/plugins/ajaxcommand/ajax.php?call=media";
                                var elid = value.ns;
                                var list = dojo.query('input[type=radio][name=fileoptions]:checked')[0].value;
                                var sort = dojo.query('input[type=radio][name=filesort]:checked')[0].value;
                                var query = 'id=' + elid + '&ns=' + elid + '&do=media&list=' + list + '&sort=' + sort;
                                this.requester.sendRequest(query);
                            }
                        },
                        _createRequest: function () {

                            require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                                this.requester = new Request();

                                this.requester.updateSectok = function (sectok) {
                                    this.sectok = sectok;
                                };

                                this.requester.sectok = this.requester.dispatcher.getSectok();
                                this.requester.dispatcher.toUpdateSectok.push(this.requester);
                            }));
                        },
                        /**
                         * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
                         * el valor de la acció a "mediadetails".
                         *
                         * @param {ioc.wiki30.Dispatcher} dispatcher
                         * @param {{id: string, ns: string, title: string, content: string}} value
                         *
                         * @override
                         */
                        updateState: function (dispatcher, value) {
                            this.inherited(arguments);
                            dispatcher.getGlobalState().pages[value.id]["action"] = "mediadetails";
                            dispatcher.getGlobalState().pages[value.id]["ns"] = value.ns;
                            if(value.mediado){
                                if(value.mediado === "diff"){
                                    dispatcher.getGlobalState().pages[value.id]["mediado"] = value.mediado;
                                }
                            }
                        },
                        createContentTool: function (content, dispatcher) {
                            var args = {
                                id: content.id,
                                title: content.title,
                                content: content.content,
                                closable: true,
                                dispatcher: dispatcher
                            };
                            var argsMediaDetailsDecor = {
                                id: content.id,
                                urlBase:  urlBase1,
                                
                                form: "form_"+content.id
                            };
                            var urlBase = "lib/plugins/ajaxcommand/ajax.php?call=mediadetails";
                            var urlBase1 = urlBase+"&img="+content.id+"&mediado=save&do=media&tab_details=view&tab_files=files&image="+content.id+"&ns="+content.ns;
                            var argsMediaDetailsForm = {
                                urlBase:  urlBase1,
                                
                                form: "form_"+content.id
                            };

                            return contentToolFactory.generate(contentToolFactory.generation.DOCUMENT, args)
                                    .decorate(contentToolFactory.decoration.MEDIADETAILS, argsMediaDetailsDecor)
                                    .decorate(contentToolFactory.decoration.REQUEST_FORM, argsMediaDetailsForm);
                        }
                    });
            return ret;
        });

