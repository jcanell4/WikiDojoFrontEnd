define([
    'dojo/_base/declare',
    'ioc/wiki30/manager/EventObserver',
    'ioc/gui/CustomDialog'
], function (declare, EventObserver, CustomDialog) {

    var DialogManagerException = function (message) {
        this.message = message;
        this.name = "DialogManagerException"
    };

    return declare([EventObserver],
        {

            // docId: el docId ens permetrà agrupar tots els dialogs d'un mateix document, la id del dialog estarà composta pel docId i ¿?¿?
            // type: el tipus de dialog pot ser Custom o Diff en aquests moments, si no es passen els argumetns necessaris es llença excepció






        });
});