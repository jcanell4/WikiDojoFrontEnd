define([
    'dojo/_base/declare',
    'ioc/wiki30/Draft',
    'ioc/wiki30/manager/EventObserver',
], function (declare, Draft, EventObserver) {

    var DraftManagerException = function (message) {
        this.message = message;
        this.name = "DraftManagerException";
    };

    return declare([EventObserver], {

        constructor: function (args) {
            this.dispatcher = args.dispatcher;
            this.drafts = {};
        },

        getDraft: function (docId, contentTool) {
            //console.log('DraftManager#getDraft', docId);
            var contentCache;

            if (!docId) {
                throw new DraftManagerException('No s\'ha passat cap identificador del document: ', docId);
            }

            if (!this.drafts[docId] && contentTool) {
                //console.log("Creant nou draft a partir del contenttool");
                this._generateDraft(contentTool);

            } else if (!this.drafts[docId]) {

                contentCache = this.dispatcher.getContentCache(docId);


                if (contentCache) {
                    //console.log("Creant nou draft a partir del contentCache");

                    this._generateDraft(contentCache.getMainContentTool());

                } else {
                    throw new DraftManagerException('No existeix cap ContentTool pel document: ' + docId);
                }
            }

            return this.drafts[docId];
        },

        getLastLocalDraftTime: function (docId, chunkId) {
            //console.log("DraftManager#getLastLocalDraftTime", docId, chunkId);
            var draft = this.getDraft(docId),
                drafts = draft.recoverLocalDraft(),
                time = {};

            // S'ha de retornar tant el del local com el del full si existeixen
            for (var type in drafts) {
                if (type === "structured" && drafts.structured.content[chunkId] === undefined) { //Alerta[Xavi] Solució temporal fins que s'afegeixin les dates a cada chunk
                    //console.log("No existeix el chunk, no afegim la data");
                } else {
                    time[type] = drafts[type].date;
                }
            }

            return time;
        },

        generateLastLocalDraftTimesParam: function (docId, chunkId) {
            var localDraftTimes = this.getLastLocalDraftTime(docId, chunkId),
                param = '';

            if (localDraftTimes !== null) {
                for (var type in localDraftTimes) {
                    param += '&' + type + '_last_local_draft_time=' + localDraftTimes[type];
                }

            }

            //console.log("DraftManager#generateLastLocalDraftTimes", param);

            return param;
        },

        _generateDraft: function (contentTool) {
            var draft = new Draft({dispatcher: this.dispatcher, contentTool: contentTool});
            this.registerToEvent(draft, this.eventName.DESTROY, this._removeDraft.bind(this));
            this.drafts[contentTool.id] = draft;
        },

        _removeDraft: function (data) {
            //console.log("DraftManager#_removeDraft", data);
            delete(this.drafts[data.id]);
        },

    });

});