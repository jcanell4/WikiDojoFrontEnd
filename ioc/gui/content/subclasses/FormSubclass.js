define([
    'dojo/_base/declare',
    'ioc/gui/content/subclasses/ChangesManagerCentralSubclass',
    'ioc/dokuwiki/editors/AceManager/AceEditorPartialFacade',

], function (declare, ChangesManagerCentralSubclass, AceFacade) {


    return declare([ChangesManagerCentralSubclass],
        /**
         * Aquesta classe no s'ha de instanciar directament, s'ha de fer a travÃ©s del contentToolFactory.
         *
         * S'ha deixat com un fitxer independent per facilitar la seva ediciÃ³
         * i no es garanteix que sigui accesible en el futur.
         *
         * Aquesta classe s'espera que es mescli amb un DocumentContentTool per afegir-li les funcions de ediciÃ³ de documents
         * amb un ACE-Editor.
         *
         * @class FormSubclass
         * @extends DocumentSubclass, AbstractChangesManagerCentral
         * @author Xavier GarcÃ­a <xaviergaro.dev@gmail.com>
         * @private
         * @see contentToolFactory.generate()
         */
        {

            /**
             * El contingut original inicial s'ha de passar a travÃ¨s del constructor dins dels arguments com la
             * propietat originalContent.
             *
             * @param args
             */
            constructor: function (args) {
                this._setOriginalContent(args.originalContent);
                this.hasChanges = false;
                console.log("args?", args)
                this.contentToolFactory = args.contentToolFactory;
            },

            /**
             * Retorna cert si el contingut actual i el contingut original sÃ³n diferents o fals si sÃ³n iguals.
             *
             * @returns {boolean} - Retorna true si el contingut ha canviat o false en cas contrari
             */
            isContentChanged: function () {

                var checked = {},
                    item,
                    currentContent = this.getCurrentContent(),
                    originalContent = this._getOriginalContent(),
                    changed = false;


                // S'han de comprovar que tots els items de currentContent siguin iguals
                for (item in currentContent) {
                    if (currentContent[item] !== originalContent[item]) {
                        //console.log(currentContent[item] + "!==" +  originalContent[item]);
                        changed = true;
                        break;
                    } else {
                        checked[item] = true;
                    }
                }

                if (!changed) {
                    // Si tots son iguals, es comprova que tots els que restin de OriginalContent
                    for (item in originalContent) {
                        if (!checked[item] && originalContent[item] !== currentContent[item]) {
                            //console.log("checked", checked);
                            //console.log("current", currentContent);
                            //console.log("original", originalContent);
                            //console.log(currentContent[item] + "!==" +  originalContent[item]);
                            changed = true;
                            break;
                        }
                    }
                }


                if (changed) {
                    this.onDocumentChanged();
                    this.hasChanges = true;
                } else {
                    console.log(" **El contingut no ha canviat**");
                }

                return changed;
            },

            /**
             * Reinicialitza l'estat del document establint el valor del contingut original igual al del contingut
             * actual.
             */
            resetContentChangeState: function () {
                this.hasChanges = false;
                this._setOriginalContent(this.getCurrentContent());
                this.onDocumentChangesReset();
            },

            /**
             * Es registra als esdeveniments i activa la detecció de canvis, copiar, enganxar i pijar tecles dins
             * del node on es troba quest ContentTool.
             *
             * Realitza l'enregistrament al ChangesManager.
             *
             * @override
             */
            postAttach: function () {
                //console.log("EditorSubclass#postAttach");
                //this.registerObserverToEvent(this, this.eventName.REFRESH_EDITION, this._refreshEdition.bind(this)); // Alerta[Xavi] Necessari per redimensionar correctament l'editor quan es recarrega amb més d'una pestanya

                this.registerToChangesManager();

                jQuery(this.domNode).on('input paste cut keyup', this._checkChanges.bind(this)); // Alerta[Xavi] Comprovar si el domNode es suficient per detectar els canvis del formulari


                this.setFireEventHandler(this.eventName.SAVE_FORM, this._doSave.bind(this));
                this.setFireEventHandler(this.eventName.CANCEL, this._doCancelDocument.bind(this));


                // Proves[Xavi] Afegeix un listener al botó per llençar un editor
                var $editorButtons = jQuery('[data-form-editor-button]');


                var context = this;


                $editorButtons.on('click', function (e) {
                    e.preventDefault();
                    var $button = jQuery(this);
                    var fieldId = $button.attr('data-form-editor-button');
                    var $field = jQuery('#' + fieldId);
                    var dialogManager = context.dispatcher.getDialogManager();

                    // Aquestas dades es passan al constructor del widget
                    // {
                    //     sourceId: fieldId,
                    //     sourceContent:$field.val()
                    // };


                    var args = {
                        id: "auxWidget" + fieldId,
                        title: content.title,
                        //content: '<textarea id="auxTextArea' + fieldId + '"></textarea>',
                        dispatcher: this.dispatcher,
                    };

                    console.log("contenttoolfactory:", this.contentToolFactory);
                    var editorWidget = context.contentToolFactory.generate(context.contentToolFactory.generation.BASE, args);

                    // var $textarea = jQuery('textarea_' + config.id);


                    // console.log("config:", config);


                    console.log("Widget?", editorWidget);

                    // var searchUserWidget = new SearchUsersPane({
                    //     ns: this.ns,
                    //     urlBase: this.searchDataUrl,
                    //     buttonLabel: this.buttonLabel,
                    //     colNameLabel: 'Nom', // TODO[Xavi] Localitzar
                    //     colUsernameLabel: 'Nom d\'usuari'// TODO[Xavi] Localitzar
                    // });


                    var $container = jQuery('<div>');
                    var $toolbar = jQuery('<div id="toolbar_' + args.id + '"></div>');
                    var $textarea = jQuery('<textarea id="textarea_' + args.id + '" style="width:100%;height:200px" name="wikitext"></textarea>');

                    $textarea.css('display', 'none');
                    $container.append($toolbar);
                    $container.append($textarea);



                    var dialogParams = {
                        title: "Editar camp: " + fieldId, //TODO[Xavi] Localitzar
                        message: '',
                        sections: [
                            // Secció 1: widget de cerca que inclou la taula pel resultat.
                            // searchUserWidget.domNode
                            $container,
                            {widget: editorWidget}


                        ],
                        buttons: [
                            {
                                id: 'accept',
                                description: 'Desar', // TODO[Xavi] Localitzar
                                buttonType: 'default',
                                callback: function () {
                                    console.log("TODO: Desar els canvis al camp: ", $field);
                                    //$field.val("TODO: Contingut de l'editor");
                                    $field.val(editor.getValue());
                                    // var items = searchUserWidget.getSelected();
                                    // for (var item in items) {
                                    //     this._itemSelected(items[item]);
                                    // }

                                }.bind(this)
                            },
                            {
                                id: 'cancel',
                                description: 'Cancel·lar', // TODO[Xavi] Localitzar
                                buttonType: 'default',
                                callback: function () {
                                    // No cal fer res, el comportament per defecte de tots els botons es tancar-lo


                                }.bind(this)
                            }
                        ]
                    };

                    var dialog = dialogManager.getDialog(dialogManager.type.DEFAULT, context.ns, dialogParams);

                    dialog.show();

                    var editor = new AceFacade({
                        id: args.id,
                        auxId: args.id,
                        // xmltags: JSINFO.plugin_aceeditor.xmltags,
                        containerId: 'editor_widget_container_' + args.id, // editorWidget.id
                        textareaId: 'textarea_' + args.id,
                        theme: JSINFO.plugin_aceeditor.colortheme,
                        // readOnly: $textarea.attr('readonly'),// TODO[Xavi] cercar altre manera més adient <-- només canvia això respecte al BasicEditorSubclass#createAceEditor
                        wraplimit: JSINFO.plugin_aceeditor.wraplimit,
                        // wrapMode: $textarea.attr('wrap') !== 'off',
                        // mdpage: JSINFO.plugin_aceeditor.mdpage,
                        dispatcher: context.dispatcher,
                        content: $field.val(),
                        originalContent: $field.val(),
                    });

                });



                this.inherited(arguments);

            },

            _doSave: function (event) {
                //console.log("FormSubclass#_doSave", this.id, event);

                var dataToSend = this.getQuerySave(),
                    containerId = this.id;

                if (event.extraDataToSend) {
                    if (typeof event.extraDataToSend === "string") {
                        lang.mixin(dataToSend, ioQuery.queryToObject(event.extraDataToSend));
                    } else {
                        lang.mixin(dataToSend, event.extraDataToSend);
                    }
                }


                return {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                };

            },

            // Alerta[Xavi] el event pot contenir informaciÃ³ que cal afegir al dataToSend, com per exemple el keep_draft i el discardChanges
            _doCancelDocument: function (event) {
                //console.log("FormSubclass#_doCancelDocument", this.id, event);

                var containerId = this.id,
                    dataToSend = this.getQueryCancel(this.id); // el parÃ metre no es fa servir

                if (event.extraDataToSend) {
                    if (typeof event.extraDataToSend === "string") {
                        dataToSend += "&" + event.extraDataToSend;
                    } else {
                        dataToSend += "&" + ioQuery.objectToQuery(event.extraDataToSend);
                    }
                }
//                this.eventManager.dispatchEvent(this.eventName.CANCEL, {
//                    id: this.id,
//                    dataToSend: dataToSend,
//                    standbyId: containerId
//                })
                return {
                    id: this.id,
                    dataToSend: dataToSend,
                    standbyId: containerId
                };

            },

            getQuerySave: function () {
                var $form = jQuery('#form_' + this.id);
                var values = {"id": this.ns, "projectType": this.projectType};

                jQuery.each($form.serializeArray(), function (i, field) {
                    values[field.name] = field.value;
                });
                return values;
            },

            // Alerta[Xavi] Aquesta versiÃ³ del getQuerySave filtra l'enviament, perÃ² no funciona amb la implementaciÃ³ actual del setMeta() del MetaDataService
            //getQuerySave: function () {
            //    var $form = jQuery('#form_' + this.id),
            //        values = {},
            //        originalContent = this._getOriginalContent();
            //
            //    //console.log("en el getQuery", originalContent);
            //    jQuery.each($form.serializeArray(), function (i, field) {
            //        //console.log("field:", field);
            //
            //        if (field.value != originalContent[field.name]) {
            //
            //            // Si el valor actual es buit i abans tambÃ© ho era no s'ha d'afegir
            //            if (!field.value && !originalContent[field.name]) {
            //                //console.log ("buit en tots dos casos");
            //            } else {
            //                values[field.name] = field.value;
            //
            //            }
            //        }
            //    });
            //
            //
            //    return values;
            //},

            getQueryCancel: function () {
                return 'do=cancel&id=' + this.ns;
            },


            _getDataFromEvent: function (event) {
                if (event.dataToSend) {
                    return event.dataToSend;
                } else {
                    return event;
                }
            },


            /**
             * Comunica al ChangesManager que pot haver canvis.
             *
             * @private
             */
            _checkChanges: function () {
                //console.log('EditorSubclass#_checkChanges');
                // Si el document estÃ  bloquejat mai hi hauran canvis


                //if (!this.locked) { // Els forms no es bloquejan
                this.changesManager.updateContentChangeState(this.id);
                //}
            },

            /**
             * Retorna el que estÃ  establert com a contingut original per fer comprovacions sobre canvis.
             *
             * @returns {string} - Contingut original
             * @private
             */
            _getOriginalContent: function () {
                //console.log("FormSubclass#_getOriginalContent", this.originalContent);
                return this.originalContent;
            },

            /**
             * Estableix el contingut passat com parÃ metre com a contingut original.
             *
             * @param {string} content - Contingut a establir com original
             * @private
             */
            _setOriginalContent: function (content) {
                this.originalContent = content;
            },


            isLastCheckedContentChanged: function () {
                var content = this.getCurrentContent(),
                    result = this._getLastCheckedContent() != content;

                if (result) {
                    this._setLastCheckedContent(content);
                }

                return result;
            },

            _getLastCheckedContent: function () {
                return this.lastCheckedContent;
            },

            _setLastCheckedContent: function (content) {
                this.lastCheckedContent = content;
            },

            getCurrentContent: function () {
                // Obtenir tots els valors dels camps? generar diccionary id:valor
                // FÃ cil pels inputs (Ãºnic cas contemplat)
                // TODO[Xavi] Afegir comprovaciÃ³ per check/radios i selects

                var currentContent = {};

                jQuery('form[id="form_' + this.id + '"] input').each(function () {
                    if (this.type !== "hidden" & this.type !== "button" && this.type !== "submit" && this.value) { // Alerta[Xavi] Els tipus hidden, submit i button no formen part del les dades
                        currentContent[this.id] = this.value;
                    }
                });

                return currentContent;
            },

            getProjectType: function () {
                return this.projectType;
            }
        });
});
