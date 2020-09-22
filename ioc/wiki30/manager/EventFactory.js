define([
    "dojo/_base/lang"
], function (lang) {
    var ret = {
        eventName:{
            CANCEL: 'cancel',
            CANCEL_DOCUMENT: 'cancel_document',
            CANCEL_PARTIAL: 'cancel_partial',
            CANCEL_PROJECT: 'cancel_project',
            CONTENT_SELECTED: 'content_selected',
            CONTENT_UNSELECTED: 'content_unselected',
            DATA_REPLACED: 'data_replaced',
            DESTROY: 'destroy',
            DOCUMENT_CHANGED: 'document_changed',
            DOCUMENT_CHANGES_RESET: 'document_changes_reset',
            DOCUMENT_REFRESHED: 'document_refreshed',
            DOCUMENT_SELECTED: 'document_selected',
            DOCUMENT_UNSELECTED: 'document_unselected',
            EDIT: 'edit',
            EDIT_PARTIAL: 'edit_partial',
            EDIT_PROJECT: 'edit_project',
            VIEW_PROJECT: 'view_project',
            FREE_DOCUMENT: 'free_document',
            LOCK_DOCUMENT: 'lock_document',
            MEDIA_DETAIL: 'media_detail',
            NOTIFY: 'notify',
            REFRESH_EDITION: 'refresh',
            REMOVE_DRAFT: 'remove_draft',
            REMOVE_PROJECT_DRAFT: 'remove_project_draft',
            DUPLICATE_PROJECT: 'duplicate_project',
            RENAME_PROJECT: 'rename_project',
            REMOVE_PROJECT: 'remove_project',
            SAVE: 'save',
            SAVE_DRAFT: 'save_draft',
            SAVE_PARTIAL: 'save_partial',
            SAVE_PARTIAL_ALL: 'save_partial_all',
            SAVE_PROJECT: 'save_project',
            SAVE_PROJECT_DRAFT: 'save_project_draft',
            TIMEOUT: 'timeout',
            UNLOCK_DOCUMENT: 'unlock_document'
        },
        
        getEventNameList:function(){
            return this.eventName;
        }
    };
    return ret;
});

