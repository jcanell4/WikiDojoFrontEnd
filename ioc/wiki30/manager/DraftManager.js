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

    return declare([EventObserver], {

        constructor: function (args) {
            this.dispatcher = args.dispatcher;
            this.drafts = {};
        },

        getDraft: function (docId, docNs, contentTool) {
            console.error('DraftManager#getDraft', docId, docNs);
            var contentCache;

            if (!docNs) {
                throw new DraftManagerException('No s\'ha passat cap identificador del document: ', docNs);
            }

            if (!this.drafts[docNs] && contentTool) {
                console.log("Creant nou draft a partir del contenttool");
                this._generateDraft(contentTool);

            } else if (!this.drafts[docNs]) {

                contentCache = this.dispatcher.getContentCache(docId);


                if (contentCache) {
                    console.log("Creant nou draft a partir del contentCache");

                    this._generateDraft(contentCache.getMainContentTool());

                } else {
                    throw new DraftManagerException('No existeix cap ContentTool pel document: ' + docNs);
                }
            }

            console.log("Retornant draft: ", this.drafts[docNs], this.drafts);

            return this.drafts[docNs];
        },

        getLastLocalDraftTime: function (docId, docNs, chunkId) {
            console.error("DraftManager#getLastLocalDraftTime", docId, docNs, chunkId);
            var draft = this.getDraft(docId, docNs),
                drafts = draft.recoverLocalDraft(),
                time = {};

            // S'ha de retornar tant el del local com el del full si existeixen
            for (var type in drafts) {

                if (type === "structured" && drafts.structured[chunkId] === undefined) {
                    //console.log("No existeix el chunk, no afegim la data");
                } else if (type === "full") {
                    time[type] = drafts[type].date;
                } else {
                    time[type] = drafts[type][chunkId].date;
                }
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

        _generateDraft: function (contentTool) {
            console.log("DraftManager#_generateDraft", contentTool);
            var draft = new Draft({dispatcher: this.dispatcher, contentTool: contentTool});
            this.registerMeToEventFromObservable(draft, this.eventName.DESTROY, this._removeDraft.bind(this));
            this.drafts[contentTool.ns] = draft;

            console.log("Generat draft:", draft, " Pel ns:", contentTool.ns);
        },

        _removeDraft: function (data) {
            console.log("DraftManager#_removeDraft", data);
            delete(this.drafts[data.ns]);
        },

        clearDraft: function (id, ns) {
            console.log("DraftManager#clearDraft", id, ns);

            var draft;

            if (!this.drafts[ns]) {
                draft = this.getDraft(id, ns);
            } else {
                draft = this.drafts[ns];
            }

            draft.clearDraft();



            // var userId = 'user_' + this.dispatcher.getGlobalState().userId,
            //     user = JSON.parse(localStorage.getItem(userId)) || {pages: {}},
            //     pages = user.pages;
            //
            // if (pages && pages[id]) {
            //     //console.log("Eliminant esborrany local per l'usuari", user);
            //     pages[id].drafts = {};
            //     //delete(pages[id]);
            //     localStorage.setItem(userId, JSON.stringify({pages: pages}));
            //
            // } else {
            //     //console.log("No hi ha esborranys locals per descartar per aquest usuari i document", user, id);
            // }

            //console.log("DraftManager#clearDraft OK");

        },

        clearDraftChunks: function (id, ns, chunks) {
            console.log("DraftManager#clearDraftChunks", id, ns, chunks);
            var draft;

            if (!this.drafts[ns]) {
                draft = this.getDraft(id, ns);
            } else {
                draft = this.drafts[ns];
            }

            draft.clearDraftChunks(chunks);


            // var userId = 'user_' + this.dispatcher.getGlobalState().userId,
            //     user = JSON.parse(localStorage.getItem(userId)),
            //     pages = user?user.pages:null;
            //
            // if (pages && pages[id]) {
            //     //console.log("Eliminant chunks locals per l'usuari", user, chunks);
            //
            //     pages[id].drafts = this._removeDraftChunk(pages[id].drafts, chunks);
            //     //delete(pages[id]);
            //     localStorage.setItem(userId, JSON.stringify({pages: pages}));
            //
            // }

            //console.log("DraftManager#clearDraft OK");

        },

        // _removeDraftChunk: function (drafts, chunks) {
        //     if (!drafts) {
        //         //console.log("No hi han pàgines, no cal eliminar res", drafts);
        //         return;
        //     }
        //
        //     for (var i = 0; i < chunks.length; i++) {
        //         if (drafts.structured) {
        //             delete(drafts.structured[chunks[i]]);
        //         } else {
        //             //console.log("No hi ha draft per esborrar:", drafts);
        //         }
        //
        //
        //     }
        //
        //     return drafts;
        // },

        hasDraft: function (ns) {
            var draft = this.drafts[ns];

            if (draft && drafts[ns]) {
                return true;
            } else {
                return false;
            }

            // return this.drafts[ns] ? true : false;
        }

    });

});
