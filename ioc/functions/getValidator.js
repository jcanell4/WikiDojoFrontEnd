define([
    'ioc/wiki30/dispatcherSingleton',
], function (getSingleton) {

//    console.log("Loaded getValidator");

    var dispatcher = getSingleton(),
        validator = {};



    var normalizeData = function (data) {
        if (typeof data === "string" && data.length>0) {
            data = JSON.parse('{"' + decodeURI(data.replace(/&/g, "\",\"").replace(/=/g, "\":\"")) + '"}');
        }

        return data;
    };

    var validatorPageNotRequired = function (data, ignoreRevision) {
//        console.log("getValidator#validatorPageNotRequired", data);

        data = normalizeData(data);

        if (!data.id) { // ALERTA[Xavi] aquest ID es correspón amb el NS
            console.error("ALERTA! no s'ha trobat el ns del document", data);
        }


        if (ignoreRevision) {
            return !dispatcher.getGlobalState().isPageRequired(data.id);

        } else {
            var isRev = data.rev ? true : false;
            return isRev || !dispatcher.getGlobalState().isPageRequired(data.id);
        }


    };


    var validatorCanRevert = function (data) {
        console.log("getValidator#validatorCanRevert", data);
        data = normalizeData(data);

        if (data.do === 'save_rev') {
            return validatorPageNotRequired(data, true);
        } else {
            return true;
        }
    };


    return function (type, message) {

        switch (type) {
            case 'PageNotRequired':
                validator = {
                    callback: validatorPageNotRequired,
                    message: message || LANG.template['ioc-template'].page_already_required
                };
                break;

            case 'CanRevert':
                validator = {
                    callback: validatorCanRevert,
                    message: message || LANG.template['ioc-template'].cant_revert
                };

                break;

            default:
                console.error("No existeix el tipus de validador " + type);
        }


        return validator
    }
});


