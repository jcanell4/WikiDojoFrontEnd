define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/Timer'
], function (declare, EventObserver, Timer) {

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
            //this.type;
            this._init();
        },

        _init: function () {
            console.log("Draft#_init");
            this._registerToEvents();
            this._initTimers();
        },

        save: function () {
            console.log("Draft#save");
            this._doSave();
        },

        _registerToEvents: function () {
            // TODO[Xavi] no cal registrar-se al event manager, hauria de ser suficient registrar-se al contentTool al event concret
            console.log("Draft#_registerToEvents");


            this.eventManager = this.dispatcher.getEventManager();
            this.eventManager.registerToEvent(this.eventManager, this.eventNameCompound.DOCUMENT_REFRESHED + this.contentTool.id, this._doRefresh.bind(this));
            this.eventManager.registerToEvent(this.eventManager, this.eventNameCompound.CANCEL + this.contentTool.id, this.destroy.bind(this));

        },

        _doSave: function () {
            console.log('Draft#_doSave');

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
            var docNs = this.contentTool.ns, // guardat al page
                draft = this.contentTool.generateDraft(),
                page = this._doGetPage();

            // Si existeix la actualitzem, si no, la creem
            if (!page) {
                page = {
                    ns: docNs,
                    drafts: {}
                }
            }

            draft.date = Date.now();

            page.drafts[draft.type] = draft; //sobrescriu el valor anterior si existeix

            // 2- Afegim el nou document, si ja existeix s'ha de sobrescriure amb la nova versió
            this._doSetPage(page);

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

            // S'elimina només el tipus corresponent al document
            this._removeLocalDraft(this.contentTool.DRAFT_TYPE);
        },

        // Elimina tots els drafts TODO[Xavi] cridar automàticament després de desar el document
        _clearLocalDrafts: function () {
            console.log('Draft#_removeLocalDraft');
            var pages = this._doGetPages();

            if (pages[this.contentTool.id] && pages[this.contentTool.id].drafts) {
                delete(pages[this.contentTool.id].drafts);
                this._doSetPages(pages);
            }

        },

        // Només elimina el draft del tipus indicat
        _removeLocalDraft: function (type) {
            console.log('Draft#_removeLocalDraft');
            var pages = this._doGetPages();

            if (pages[this.contentTool.id] && pages[this.contentTool.id].drafts) {
                delete(pages[this.contentTool.id].drafts[type]);
                this._doSetPages(pages);
            }

        },


        _doGetPages: function () {
            console.log('Draft#_doGetPages');
            var user = this._doGetUser();

            return user['pages'] ? user['pages'] : {};
        },

        _doGetUser: function () {
            console.log('Draft#_doGetUser');
            var userId = 'user_' + this.dispatcher.getGlobalState().userId,
                user = JSON.parse(localStorage.getItem(userId));

            console.log("UserId", userId);
            console.log("User: ", user)


            if (user && user.pages) {
                console.log("Trobat user i conté:", user);
                return user;
            } else {
                console.log("No trobat user, es crea un objecte nou:");
                return {
                    pages: {}
                }
            }
        },

        _doSetPages: function (pages) {
            console.log('Draft#_doSetPages', pages);
            var userId = 'user_' + this.dispatcher.getGlobalState().userId;
            localStorage.setItem(userId, JSON.stringify({pages: pages}));
        },

        // TODO[Xavi] aquí podem afegir la descompresió de dades
        _doGetPage: function () {
            console.log('Draft#_doGetPage');
            var pages = this._doGetPages();

            return pages && pages[this.contentTool.id] ? pages[this.contentTool.id] : null;
        },

        // TODO[Xavi] aquí podem afegir la compresió de dades
        _doSetPage: function (page) {
            console.log('Draft#_doSetPage');
            var userId = 'user_' + this.dispatcher.getGlobalState().userId,
                user = this._doGetUser(userId);

            user.pages[this.contentTool.id] = page;

            localStorage.setItem(userId, JSON.stringify(user));
        },


        _getQueryDraft: function () {
            console.log('Draft#_getQueryDraft');
            var dataToSend = {
                id: this.contentTool.ns,
                do: 'save_draft',
                draft: JSON.stringify(this.contentTool.generateDraft())
            };

            return dataToSend;
        },

        _doRefresh: function () {
            console.log('Draft#_doRefresh');
            var now = Date.now(),
                elapsedTime = now - this.lastRefresh;

            if (elapsedTime >= this.AUTOSAVE_LOCAL) {
                this._doSave();
            } else {
                this._setPendingRefresh(this.AUTOSAVE_LOCAL - elapsedTime + 1);
            }
        },

        _setPendingRefresh: function (timeout) {
            console.log('Draft#_setPendingRefresh', timeout);

            if (this.timers.refresh.expired) {
                this.timers.refresh.start(timeout);
            }
        },

        _initTimers: function () {
            console.log('Draft#_initTimers');
            this.timers = {
                refresh: new Timer({onExpire: this._doRefresh.bind(this)})
            };
            this.timers.refresh.expired = true;
        },

        _cancelTimers: function () {
            console.log('Draft#_cancelTimers', this.timers);
            for (var timer in this.timers) {
                this.timers[timer].cancel();
            }
        },

        destroy: function () {
            this.onDestroy();

        },

        onDestroy: function () {
            console.log("Draft#onDestroy");
            this._cancelTimers();
            this.eventManager.unregisterFromEvent(this.eventNameCompound.DOCUMENT_REFRESHED + this.contentTool.id);
            this.eventManager.unregisterFromEvent(this.eventNameCompound.CANCEL + this.contentTool.id);
            this.dispatchEvent(this.eventName.DESTROY, {id: this.id});
        },

        recoverLocalDraft: function () {
            console.log("Draft#recoverLocalDraft", this._doGetPage());

            var page = this._doGetPage();
            if (page && page.drafts) {
                return page.drafts
            } else {
                return {}
            }

        },

        //getLastLocalDraftTime: function () {
        //    console.log("Draft#getLastLocalDraftTime");
        //    var drafts = this.recoverLocalDraft(),
        //        time = {};
        //
        //
        //    console.log("Drafts: ", drafts);
        //
        //    // s'ha de retornar tant el del local com el del full si existeixen
        //    for (var type in drafts) {
        //        time[type] = drafts[type].date;
        //    }
        //
        //    console.log("Generat: ", time);
        //
        //
        //    return time;
        //
        //}

    });

});