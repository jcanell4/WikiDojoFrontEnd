define([
    'dojo/_base/declare',
    'ioc/wiki30/Draft',
    'ioc/wiki30/manager/EventObserver',
], function (declare, Draft, EventObserver) {

    var DraftManagerException = function (message) {
        this.message = message;
        this.name = "DraftManagerException";

        console.error(this.name, this.message);
    };

    // Pollyfill
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function (searchString, position) {
            position = position || 0;
            return this.indexOf(searchString, position) === position;
        };
    }


    return declare([EventObserver], {

        constructor: function (args) {
            this.dispatcher = args.dispatcher;
            this.drafts = {};
        },

        getDraft: function (docId, docNs, contentTool) {
            // console.log('DraftManager#getDraft', docId, docNs);
            var contentCache;

            if (!docNs) {
                throw new DraftManagerException('No s\'ha passat cap identificador del document: ', docNs);
            }

            if (!this.drafts[docNs] && contentTool) {
                this._generateDraftInMemory(contentTool);

            } else if (!this.drafts[docNs]) {

                contentCache = this.dispatcher.getContentCache(docId);


                if (contentCache) {
                    this._generateDraftInMemory(contentCache.getMainContentTool());

                } else {
                    throw new DraftManagerException('No existeix cap ContentTool pel document: ' + docNs);
                }
            }

            // console.log("Retornant draft: ", this.drafts[docNs], this.drafts);

            return this.drafts[docNs];
        },

        getLastLocalDraftTime: function (docId, docNs, chunkId) {
            // console.log("DraftManager#getLastLocalDraftTime", docId, docNs, chunkId);
            var draft = this.getDraft(docId, docNs),
                drafts = draft.recoverLocalDraft(),
                time = {};

            // console.log("Drafts?", drafts);

            // S'ha de retornar tant el del local com el del full si existeixen

            if (drafts.structured && drafts.structured.content && drafts.structured.content[chunkId] !== undefined) {
                time['structured'] = drafts.structured.date;
            } else {
                // console.log("No existeix el chunk, no afegim la data");
            }

            if (drafts.full) {
                time['full'] = drafts.full.date;
            }


            return time;
        },

        generateLastLocalDraftTimesParam: function (docId, docNs, chunkId) {
            //console.log("DraftManager#generateLastLocalDraftTimesParam", docId, chunkId);

            var localDraftTimes = this.getLastLocalDraftTime(docId, docNs, chunkId),
                param = '';

            if (localDraftTimes !== null) {
                for (var type in localDraftTimes) {
                    param += '&' + type + '_last_local_draft_time=' + localDraftTimes[type];
                }

            }

            return param;
        },

        _generateDraftInMemory: function (contentTool) {
            // console.log("DraftManager#_generateDraft", contentTool);
            var draft = new Draft({dispatcher: this.dispatcher, contentTool: contentTool});
            this.registerMeToEventFromObservable(draft, this.eventName.DESTROY, this._removeDraftInMemory.bind(this));
            this.drafts[contentTool.ns] = draft;

            // console.log("Generat draft:", draft, " Pel ns:", contentTool.ns);
        },

        _removeDraftInMemory: function (data) {
            // console.log("DraftManager#_removeDraft", data);
            delete(this.drafts[data.ns]);
        },

        // ALERTA[Xavi] destroy es un booleà que indica si s'ha de destruir el draft desprès d'esborrar-lo del local storage
        clearDraft: function (id, ns, destroy) {

            // console.log("DraftManager#clearDraft", id, ns);

            var draft;

            if (!this.drafts[ns]) {
                draft = this.getDraft(id, ns);
            } else {
                draft = this.drafts[ns];
            }


            // ALERTA[Xavi] En principi sempre s'ha de trobar el draft, això no ha de ser necesari:
            // if (!draft) {
            //     return;
            // }


            draft.clearDraft();

            if (draft && destroy) {
                draft.destroy();
            }

        },

        clearDraftChunks: function (id, ns, chunks) {
            //console.log("DraftManager#clearDraftChunks", id, ns, chunks);
            var draft;

            if (!this.drafts[ns]) {
                // console.log("No existeix el this.drafts[" + ns + "]", this.drafts);
                draft = this.getDraft(id, ns);

                // console.log("s'ha obtingut alguna cosa?", draft);
            } else {
                // console.log("Existeix el draft", this.drafts[ns]);
                draft = this.drafts[ns];
            }

            draft.clearDraftChunks(chunks);
        },

        /**
         * Elimina totes les estructures de draft buits i els drafts generats utilitzats el id en lloc del ns com a
         * identificador.
         *
         * ALERTA: Aquesta funció treballa directament sobre el localStorage i no sobre els drafts.
         */
        compactDrafts: function () {
            for (var key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    if (key.startsWith('user_')) {
                        this._compactDraft(key);
                    }
                }
            }
        },

        _compactDraft: function (userKey) {
            var userData = localStorage.getItem(userKey);
            var user = JSON.parse(userData);

            if (!user.pages) {
                return;
            }

            for (var ns in user.pages) {
                if (ns.indexOf('_') !== -1) {
                    delete (user.pages[ns]);
                } else {
                    var page = user.pages[ns];

                    if (Object.keys(page.drafts).length === 0) {
                        delete (user.pages[ns]);
                    }
                }
            }

            if (Object.keys(user.pages).length === 0) {
                localStorage.removeItem(userKey);

            } else {
                localStorage.setItem(userKey, JSON.stringify(user));
            }
        },

        /**
         * Drafts és un objecte amb l'estructura:
         *  {
         *      'full': {
         *          content: "contingut",
         *          date: "data en milisegons"
         *      },
         *      'structured': {
         *          content: [
         *              "capçalera" : "contingut"
         *          ],
         *          date: "data en milisegons"
         *      }
         * }
         * @param ns
         * @param remoteDrafts
         */
        updateLocalDrafts: function (ns, remoteDrafts) {
            console.log("DraftManager#updateLocalDrafts", ns, remoteDrafts);

            var page = this._doGetPage(ns);

            var localDrafts = page ? page.drafts : {};


            // TODO[Xavi] Canviar per ---> for (var type in remoteDrafts) { /* CODI */}

            console.log("Carregats drafts locals?", localDrafts);


            if (remoteDrafts['full'] && remoteDrafts['full'].date > (localDrafts['full'] ? localDrafts['full'].date : -1)) {
                console.log("------ UPDATING FULL -------");
                // console.log("Fent Update el draft local FULL");

                var draft = {
                    content: remoteDrafts['full']['content'],
                    id: ns,
                    type: 'full'
                };

                this._doSaveLocal(draft, remoteDrafts['full'].date, ns);


            } else {
                if (!remoteDrafts['full']) {
                    console.log("No havia draft full remot, no cal actualitzar")
                } else {
                    console.log("El draft local full es més recent que el draft remot full per mm:", localDrafts['full'].date - remoteDrafts['full'].date)
                }

            }


            if (remoteDrafts['structured'] && remoteDrafts['structured'].date > (localDrafts['structured'] ? localDrafts['structured'].date : -1)) {
                console.log("------ UPDATING LOCAL -------");
                //console.log("Fent update el draft local PARCIAL", remoteDrafts['structured']);

                var draft = {
                    content: remoteDrafts['structured']['content'],
                    id: ns,
                    type: 'structured'
                };

                this._doSaveLocal(draft, remoteDrafts['structured'].date, ns);

            } else {

                if (!remoteDrafts['structured']) {
                    console.log("No havia draft parcial remot, no cal actualitzar")
                } else {
                    console.log("El draft local parcial es més recent que el draft remot parcial per mm:", localDrafts['structured'].date - remoteDrafts['structured'].date)
                }

            }


            // console.log("new drafts:", remoteDrafts, "local times:", time);


            // if (drafts['full']) {
            //     this._updateFullLocalDraft();
            // }
            //
            // if (drafts['structured']) {
            //     this._updateStructuredLocalDraft();
            // }


        },
        //
        // _updateFullLocalDraft: function() {
        //
        // },


        _doSaveLocal: function (draft, date, ns) {
            // console.log("Draft#_doSaveLocalStorage", draft);
            this.lastRefresh = Date.now();

            // Alerta[Xavi] Compte! això permet que qualsevol persona miri el contingut del localStorage i pugui veure els esborranys deixat per altres usuaris
            var page = this._doGetPage(ns);
            // date = Date.now();


            // Si existeix la actualitzarem, i si no, la creem
            if (!page) {
                page = {
                    ns: ns,
                    drafts: {}
                }
            }


            if (!page.drafts[draft.type]) {
                page.drafts[draft.type] = {};
            }

            switch (draft.type) {
                case 'structured':
                    page = this._formatLocalStructuredPage(page, draft, date);
                    break;

                case 'full':
                    page = this._formatLocalFullPage(page, draft, date);
            }

            this._doSetPage(page, ns);

        },

        // ALERTA[Xavi] Aquest codi es pracicament idéntic al de Draft.js

        _doGetPage: function (ns) {
            //console.log('Draft#_doGetPage');
            var pages = this._doGetPages();

            // return pages && pages[this.contentTool.ns] ? pages[this.contentTool.ns] : null;
            return pages && pages[ns] ? pages[ns] : null;
        },

        // TODO[Xavi] aquí podem afegir la compresió de dades
        _doSetPage: function (page, ns) {

            console.log('Draft#_doSetPage', page, ns);
            var userId = 'user_' + this.dispatcher.getGlobalState().userId,
                user = this._doGetUser(userId);


            if (userId === 'user_undefined') {
                return;
            }

            user.pages[ns] = page;

            localStorage.setItem(userId, JSON.stringify(user));


        },

        _doGetPages: function () {
            //console.log('Draft#_doGetPages');
            var user = this._doGetUser();

            return user['pages'] ? user['pages'] : {};
        },

        _doGetUser: function () {
            //console.log('Draft#_doGetUser');
            var userId = 'user_' + this.dispatcher.getGlobalState().userId,
                user = JSON.parse(localStorage.getItem(userId));

            if (user && user.pages) {
                return user;
            } else {
                return {
                    pages: {}
                }
            }
        },

        // _doSetPages: function (pages) {
        //     //console.log('Draft#_doSetPages', pages);
        //     var userId = 'user_' + this.dispatcher.getGlobalState().userId;
        //
        //     this._compactPages(pages);
        //
        //     if (Object.keys(pages).length === 0) {
        //         localStorage.removeItem(userId);
        //     } else {
        //         localStorage.setItem(userId, JSON.stringify({pages: pages}));
        //     }
        // },


        // _compactPages: function (pages) {
        //     // console.log("Compactant pàgines:", pages);
        //
        //     for (var ns in pages) {
        //         if (Object.keys(pages[ns].drafts).length === 0) {
        //             // console.log("Esborrant pàgina", ns);
        //             delete (pages[ns]);
        //         }
        //     }
        // },

        _formatLocalStructuredPage: function (page, draft, date) {
            console.log("DraftManager#_formatLocalStructuredPage", page,draft, date);
            // Reestructurem la informació
            // No cal afegir el tipus, perquè ja es troba a la estructura
            // S'han de recorre tots els elements de content (del draft) i copiar el contingut a content (de page.drafts) i afegir la data del element seleccionat, la

            page.drafts[draft.type].date = date; // data global del draft

            for (var chunk in draft.content) {
                // console.log("Processant chunk...", chunk);

                if (!page.drafts[draft.type].content) { // ALERTA: això ja hauria d'estar fet previament
                    page.drafts[draft.type].content = {};
                }

                page.drafts[draft.type].content[chunk] = draft.content[chunk]
            }

            // console.log("Afegit a la pàgina:", {
            //     content: draft.content[chunk],
            //     date: date
            // });

            // 2- Afegim el nou document, si ja existeix s'ha de sobrescriure amb la nova versió
            return page;
        },

        _formatLocalFullPage: function (page, draft, date) {
            // console.log("DraftManager#_formatLocalFullPage", page,draft, date);
            // console.log(page, draft, date);
            draft.date = date;

            page.drafts[draft.type] = draft; //sobrescriu el valor anterior si existeix

            // 2- Afegim el nou document, si ja existeix s'ha de sobrescriure amb la nova versió
            return page;
        },

    });

});
