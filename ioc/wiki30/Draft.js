define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/wiki30/Timer'
], function (declare, EventObserver, Timer) {

    var DraftException = function (message) {
        this.message = message;
        this.name = "DraftException";
    };

    return declare([EventObserver], {

        AUTOSAVE_LOCAL: 5 * 1000, // Temps en ms mínim per fer un refresc
        AUTOSAVE_REMOTE: 15 * 1000, // Quan es fa un autosave si ha passat aquesta quantitat de ms es fa remot en lloc de local
        MAX_LOCAL_STORAGE_USED: 2048, // En KBs, 2048KBs son 2 MBs

        constructor: function (args) {
            this.dispatcher = args.dispatcher;
            this.contentTool = args.contentTool;
            this.id = args.contentTool.id;
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
            //console.log("Draft#_registerToEvents");

            this.eventManager = this.dispatcher.getEventManager();
            this.registerToEvent(this.contentTool, this.eventName.DOCUMENT_REFRESHED, this._doRefresh.bind(this));
            this.registerToEvent(this.contentTool, this.eventName.CANCEL, this.destroy.bind(this));
            this.registerToEvent(this.contentTool, this.eventName.DESTROY, this.destroy.bind(this));
            this.registerToEvent(this.eventManager, this.eventName.SAVE_PARTIAL, this._clearLocalStructured.bind(this));
            this.registerToEvent(this.eventManager, this.eventName.SAVE, this._clearLocalAll.bind(this));

        },

        _doSave: function () {
            //console.log('Draft#_doSave');

            var now = Date.now(),
                elapsedTime = now - this.lastRemoteRefresh;


            var spaceUsed = this._checkLocalStorageSpace();

            // ALERTA[Xavi] Aqui comprovem si la mida ocupada es superior a 2MB ABANS de desar les dades, no tenim en
            // compte la mida de les dades que seran desades
            if (elapsedTime >= this.AUTOSAVE_REMOTE || spaceUsed > this.MAX_LOCAL_STORAGE_USED) {
                this._doSaveRemoteServer();
            } else {

                this._doSaveLocal();
            }


        },

        _doSaveLocal: function () {
            //console.log("Draft#_doSaveLocalStorage");
            this.lastRefresh = Date.now();

            // Alerta[Xavi] Compte! això permet que qualsevol persona miri el contingut del localStorage i pugui veure els esborranys deixat per altres usuaris
            var docNs = this.contentTool.ns, // guardat al page
                draft = this.contentTool._generateDraft(),
                page = this._doGetPage(),
                date = Date.now();


            // Si existeix la actualitzarem, i si no, la creem
            if (!page) {
                page = {
                    ns: docNs,
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

            this._doSetPage(page);

        },

        _formatLocalStructuredPage: function (page, draft, date) {
            // Reestructurem la informació
            // No cal afegir el tipus, perquè ja es troba a la estructura
            // S'han de recorre tots els elements de content (del draft) i copiar el contingut a content (de page.drafts) i afegir la data del element seleccionat, la

            for (var chunk in draft.content) {
                page.drafts[draft.type][chunk] = {
                    content: draft.content[chunk],
                    date: date
                }
            }

            // 2- Afegim el nou document, si ja existeix s'ha de sobrescriure amb la nova versió
            return page;
        },

        _formatLocalFullPage: function (page, draft, date) {
            draft.date = date;

            page.drafts[draft.type] = draft; //sobrescriu el valor anterior si existeix

            // 2- Afegim el nou document, si ja existeix s'ha de sobrescriure amb la nova versió
            return page;
        },

        _doSaveRemoteServer: function () {
            //console.log("Draft#_doSaveRemoteServer");
            this.lastRemoteRefresh = Date.now();
            this.lastRefresh = this.lastRemoteRefresh;

            var dataToSend = this._getQueryDraft();

            this.eventManager.dispatchEvent(this.eventName.SAVE_DRAFT, {
                id: this.id,
                dataToSend: dataToSend
            });

            // S'elimina només el tipus corresponent al document
            // TODO[Xavi] això es podria lligar al sistema d'events: this.eventName.SAVE_DRAFT
            this._removeLocalDraft(this.contentTool.DRAFT_TYPE);
        },

        _clearLocalStructured: function (data) {
            var pages = this._doGetPages(),
                chunkId = data.dataToSend.section_id;

            if (pages[this.contentTool.id] && pages[this.contentTool.id].drafts) {
                delete(pages[this.contentTool.id].drafts['structured'][chunkId]);
            } else {
                //console.log("No existeix cap esborrany que eliminar");
            }

            this._doSetPages(pages);

        },

        _clearLocalAll: function (data) {
            var pages = this._doGetPages();

            if (pages[this.contentTool.id] && pages[this.contentTool.id].drafts) {
                delete(pages[this.contentTool.id].drafts['full']);
                delete(pages[this.contentTool.id].drafts['structured']);
            } else {
                //console.log("No existeix cap esborrany que eliminar");
            }

            this._doSetPages(pages);

        },

        // Només elimina el draft del tipus indicat
        _removeLocalDraft: function (type) {
            switch (type) {
                case 'structured':
                    this._removeLocalStructuredDraft();
                    break;

                case 'full':
                    this._removeLocalFullDraft();
                    break;

                default:
                    throw new DraftException("No s'ha indicat un tipus de draft vàlid: ", type);
            }

        },

        _removeLocalStructuredDraft: function () {
            // En aquest cas només s'han d'esborrar el draft dels chunks actius al desar
            var pages = this._doGetPages(),
                draft = this._getLastGeneratedDraft();

            if (pages[this.contentTool.id] && pages[this.contentTool.id].drafts) {
                for (var chunk in draft.content) {
                    delete(pages[this.contentTool.id].drafts['structured'][chunk]);
                }
            }

            this._doSetPages(pages);
        },

        _removeLocalFullDraft: function () {
            var pages = this._doGetPages();

            if (pages[this.contentTool.id] && pages[this.contentTool.id].drafts) {
                delete(pages[this.contentTool.id].drafts['full']);
                this._doSetPages(pages);
            }
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

        _doSetPages: function (pages) {
            //console.log('Draft#_doSetPages', pages);
            var userId = 'user_' + this.dispatcher.getGlobalState().userId;
            localStorage.setItem(userId, JSON.stringify({pages: pages}));
        },

        // TODO[Xavi] aquí podem afegir la descompresió de dades
        _doGetPage: function () {
            //console.log('Draft#_doGetPage');
            var pages = this._doGetPages();

            return pages && pages[this.contentTool.id] ? pages[this.contentTool.id] : null;
        },

        // TODO[Xavi] aquí podem afegir la compresió de dades
        _doSetPage: function (page) {
            //console.log('Draft#_doSetPage');
            var userId = 'user_' + this.dispatcher.getGlobalState().userId,
                user = this._doGetUser(userId);

            user.pages[this.contentTool.id] = page;

            localStorage.setItem(userId, JSON.stringify(user));


        },


        _getQueryDraft: function () {
            //console.log('Draft#_getQueryDraft');
            this._setLastGeneratedDraft(this.contentTool._generateDraft());

            var dataToSend = {
                id: this.contentTool.ns,
                do: 'save_draft',
                draft: JSON.stringify(this._getLastGeneratedDraft())
            };

            return dataToSend;
        },

        _setLastGeneratedDraft: function (draft) {
            this.lastGeneratedDraft = draft;
        },

        _getLastGeneratedDraft: function () {
            return this.lastGeneratedDraft;
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
            //alert("Destruint draft:" + this.id);
            this._cancelTimers();
            this.unregisterFromEvent(this.eventNameCompound.DOCUMENT_REFRESHED + this.contentTool.id);
            this.unregisterFromEvent(this.eventNameCompound.CANCEL + this.contentTool.id);


            this.dispatchEvent(this.eventName.DESTROY, {id: this.id});
        },

        recoverLocalDraft: function () {
            //console.log("Draft#recoverLocalDraft", this._doGetPage());

            var page = this._doGetPage();
            if (page && page.drafts) {
                return page.drafts
            } else {
                return {}
            }
        },

        _checkLocalStorageSpace: function () {
            var spaceUsed = 0;

            for (var i = 0; i < localStorage.length; i++) {
                spaceUsed += (localStorage[localStorage.key(i)].length * 2) / 1024; // KB
            }

            console.log("LocalStorage usage: ", spaceUsed.toFixed(2) + " KB");

            return spaceUsed;
        }

    });

});