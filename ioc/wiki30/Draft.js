define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/Timer'
], function (declare, EventObserver, Timer) {

    var DraftException = function (message) {
        this.message = message;
        this.name = "DraftException"
    };

    return declare([EventObserver], {

        AUTOSAVE_LOCAL: 5 * 1000, // Temps en ms mínim per fer un refresc
        AUTOSAVE_REMOTE: 10 * 1000, // Quan es fa un autosave si ha passat aquesta quantitat de ms es fa remot en lloc de local


        constructor: function (dispatcher, contentTool) {
            this.dispatcher = dispatcher;
            this.contentTool = contentTool;
            this.id = contentTool.id;
            this.lastRefresh = Date.now();
            this.lastRemoteRefresh = Date.now();
            this.timers = {};
            this._init();
        },

        _init: function () {
            //console.log("Draft#_init");
            this._registerToEvents();
            this._initTimers();
        },

        save: function () {
            //console.log("Draft#save");
            this._doSave();
        },

        _registerToEvents: function () {
            // TODO[Xavi] no cal registrar-se al event manager, hauria de ser suficient registrar-se al contentTool al event concret
            //console.log("Draft#_registerToEvents");
            this.eventManager = this.dispatcher.getEventManager();
            this.eventManager.registerToEvent(this.eventManager, this.eventNameCompound.DOCUMENT_REFRESHED + this.contentTool.id, this._doRefresh.bind(this));
            this.eventManager.registerToEvent(this.eventManager, this.eventNameCompound.CANCEL + this.contentTool.id, this.destroy.bind(this));
        },

        _doSave: function () {
            //console.log('Draft#_doSave');

            var now = Date.now(),
                elapsedTime = now - this.lastRemoteRefresh;

            if (elapsedTime >= this.AUTOSAVE_REMOTE) {

                this._doSaveRemoteServer();
            } else {

                this._doSaveLocal();
            }


        },

        _doSaveLocal: function () {
            console.log("Draft#_doSaveLocalStorage");
            this.lastRefresh = Date.now();

            // Alerta[Xavi] Compte! això permet que qualsevol persona miri el contingut del localStorage i pugui veure els esborranys deixat per altres usuaris
            var userId = this.dispatcher.getGlobalState().userId,
                docId = this.contentTool.id, // Id que identifica el document
                docNs = this.contentTool.ns, // guardat al page
                draft = this.contentTool.generateDraft(),
                data = Date.now(),

            // 1 - Recuperem les pagines
                pages = this._doGetItem('pages'),
                page;


            // 1.1 - Recuperem la pàgina actual si existeig
            if (pages) {
                pages = JSON.parse(pages);
            } else {
                pages = {}
            }

            page = pages[docId];

            // Si existeix la actualitzem, si no, la creem

            if (page) {
                page.data = data;


            } else {
                page = {
                    ns: docNs,
                    drafts: {},
                    data: data,
                }
            }

            page.drafts[userId] = draft; //sobrescriu el valor anterior si existeix

            // 2- Afegim el nou document, si ja existeix s'ha de sobrescriure amb la nova versió
            pages[docId] = page;


            // 3- El desem
            this._doSetItem('pages', pages);


        },


        _doSaveRemoteServer: function () {
            console.log("Draft#_doSaveRemoteServer");
            this.lastRemoteRefresh = Date.now();
            this.lastRefresh = this.lastRemoteRefresh;

            var dataToSend = this._getQueryDraft();

            this.eventManager.dispatchEvent(this.eventName.SAVE_DRAFT, {
                id: this.id,
                dataToSend: dataToSend
            });

            this._removeLocalDraft();
        },

        _removeLocalDraft: function () {
            var pages = this._doGetItem('pages');


            if (pages) {
                pages = JSON.parse(pages);
            } else {
                return;
            }

            delete(pages[this.contentTool.id]);


            this._doSetItem('pages', pages);
        },

        // TODO[Xavi] aquí podem afegir la descompresió de dades
        _doGetItem: function (key) {
            return localStorage.getItem(key);
        },

        // TODO[Xavi] aquí podem afegir la compresió de dades
        _doSetItem: function (key, value) {
            localStorage.setItem(key, JSON.stringify(value));
        },


        _getQueryDraft: function () {
            //console.log('Draft#_getQueryDraft');
            var dataToSend = {
                id: this.contentTool.ns,
                do: 'save_draft',
                draft: JSON.stringify(this.contentTool.generateDraft())
            };

            return dataToSend;
        },

        _doRefresh: function () {
            //console.log('Draft#_doRefresh');
            var now = Date.now(),
                elapsedTime = now - this.lastRefresh;

            if (elapsedTime >= this.AUTOSAVE_LOCAL) {
                this._doSave();
            } else {
                this._setPendingRefresh(this.AUTOSAVE_LOCAL - elapsedTime + 1);
            }
        },

        _setPendingRefresh: function (timeout) {
            //console.log('Draft#_setPendingRefresh', timeout);

            if (this.timers.refresh.expired) {
                this.timers.refresh.start(timeout);
            }
        },

        _initTimers: function () {
            //console.log('Draft#_initTimers');
            this.timers = {
                refresh: new Timer({onExpire: this._doRefresh.bind(this)})
            };
            this.timers.refresh.expired = true;
        },

        _cancelTimers: function () {
            //console.log('Draft#_cancelTimers', this.timers);
            for (var timer in this.timers) {
                this.timers[timer].cancel();
            }
        },

        destroy: function () {
            this.onDestroy();

        },

        onDestroy: function () {
            //console.log("Draft#onDestroy");
            this._cancelTimers();
            this.eventManager.unregisterFromEvent(this.eventNameCompound.DOCUMENT_REFRESHED + this.contentTool.id);
            this.eventManager.unregisterFromEvent(this.eventNameCompound.CANCEL + this.contentTool.id);
            this.dispatchEvent(this.eventName.DESTROY, {id: this.id});
        },


    });

});