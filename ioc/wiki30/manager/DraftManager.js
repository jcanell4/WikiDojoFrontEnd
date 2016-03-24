define([
    'dojo/_base/declare',
    'ioc/wiki30/Draft'
], function (declare, Draft) {

    var DraftManagerException = function (message) {
        this.message = message;
        this.name = "DraftManagerException";
        console.error(this);
    };

    return declare(null, {

        constructor: function (args) {
            this.dispatcher = args.dispatcher;
            this.drafts = {};
        },

        getDraft: function (docId, contentTool) {
            console.log('DraftManager#getDraft', docId);
            var contentCache;

            if (!docId) {
                throw new DraftManagerException('No s\'ha passat cap identificador del document: ', docId);
            }

            if (!this.drafts[docId] && contentTool) {
                this.drafts[docId] = new Draft({dispatcher: this.dispatcher, contentTool: contentTool});
            } else if (!this.drafts[docId]) {

                contentCache = this.dispatcher.getContentCache(docId);


                if (contentCache) {
                    var draft = new Draft({dispatcher: this.dispatcher ,contentTool: contentCache.getMainContentTool()});
                    this.drafts[docId] = draft;
                } else {
                    throw new DraftManagerException('No existeix cap ContentTool pel document: ' + docId);
                }
            }

            return this.drafts[docId];
        },

        getLastLocalDraftTime: function (docId) {
            console.log("DraftManager#getLastLocalDraftTime", docId);
            var draft = this.getDraft(docId),
                drafts = draft.recoverLocalDraft(),
                time = {};

            // S'ha de retornar tant el del local com el del full si existeixen
            for (var type in drafts) {
                time[type] = drafts[type].date;
            }

            return time;
        },

        generateLastLocalDraftTimesParam: function(docId) {
            var localDraftTimes = this.getLastLocalDraftTime(docId),
                param = '';
            
            if (localDraftTimes !== null) {
                for (var type in localDraftTimes) {
                    param +='&' + type + '_last_local_draft_time='+localDraftTimes[type];
                }

            }

            console.log("DraftManager#generateLastLocalDraftTimes", param);

            return param;
        }

    });

});