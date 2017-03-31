define([
    "dojo/_base/lang"
], function (lang) {
    var ret = {
        eventName:{
            DESTROY: 'destroy',
            UNLOCK_DOCUMENT: 'unlock_document',
            LOCK_DOCUMENT: 'lock_document',
            DOCUMENT_CHANGED: 'document_changed',
            DOCUMENT_SELECTED: 'document_selected',
            DOCUMENT_UNSELECTED: 'document_unselected',
            DOCUMENT_REFRESHED: 'document_refreshed',
            DATA_REPLACED: 'data_replaced',
            CANCEL_DOCUMENT: 'cancel_document',
            CANCEL_PARTIAL: 'cancel_partial',
            EDIT_PARTIAL: 'edit_partial',
            SAVE_PARTIAL: 'save_partial',
            SAVE_PARTIAL_ALL: 'save_partial_all',
            CANCEL: 'cancel',
            EDIT: 'edit',
            REFRESH_EDITION: 'refresh',
            SAVE: 'save',
            SAVE_DRAFT: 'save_draft',
            REMOVE_DRAFT: 'remove_draft',
            CONTENT_SELECTED: 'content_selected',
            CONTENT_UNSELECTED: 'content_unselected',
            DOCUMENT_CHANGES_RESET: 'document_changes_reset',
            NOTIFY: 'notify',
            TIMEOUT: 'timeout',
            SAVE_FORM: 'save_form',
            MEDIA_DETAIL: 'media_detail',
            FREE_DOCUMENT: 'free_document'
        },
        
        getEventNameList:function(){
                return this.eventName;
        }
        
    };
    return ret;
});

