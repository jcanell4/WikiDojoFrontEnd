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

        clearDraft: function (id, ns, destroy) {
            console.log("DraftManager#clearDraft", id, ns);

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
            console.log("DraftManager#clearDraftChunks", id, ns, chunks);
            var draft;

            if (!this.drafts[ns]) {
                // console.log("No existeix el this.drafts[" + ns + "]", this.drafts);
                draft = this.getDraft(id, ns);

                // console.log("s'ha obtingut alguna cosa?", draft);
            } else {
                // console.log("Existeix el draft", this.drafts[ns]);
                draft = this.drafts[ns];
            }

            // ALERTA[Xavi] En principi sempre s'ha de trobar el draft, això no ha de ser necesari:
            // if (!draft) {
            //     return;
            // }

            draft.clearDraftChunks(chunks);
        },

    });

});
