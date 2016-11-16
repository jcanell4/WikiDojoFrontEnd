define([
    "dojo/on"
            , "dojo/dom"
            , "dojo/_base/event"
            , "ioc/wiki30/Request"
            , "ioc/wiki30/dispatcherSingleton"
            , "dojo/query"
], function (on, dom, event, Request, getDispatcher, dojoQuery) {

    var dispatcher = getDispatcher();
    var eventHandlers = new Array();
    var dispatcher = getDispatcher();


    var res = function (id, params) {
        var domNode = dom.byId(id);
        var requestMedia = new Request();
        requestMedia.urlBase = "lib/plugins/ajaxcommand/ajax.php?call=media";
        if(eventHandlers[0]){
            eventHandlers[0].remove();
        }
        eventHandlers[0] = on(domNode, '[name="fileoptions"]:change', function (e) {
            if (this.id === "thumbs") {
                dojoQuery(".rows").addClass("thumbs");
                dojoQuery(".rows").removeClass("rows");
            }
            if (this.id === "rows") {
                dojoQuery(".thumbs").addClass("rows");
                dojoQuery(".thumbs").removeClass("thumbs");
            }
        });
        if(eventHandlers[1]){
            eventHandlers[1].remove();
        }
        eventHandlers[1] = on(domNode, '[name="filesort"]:change', function (e) {
            var elid = dispatcher.getGlobalState().pages["media"]["ns"];
            var list = dojoQuery('input[type=radio][name=fileoptions]:checked')[0].value;
            var sort = dojoQuery('input[type=radio][name=filesort]:checked')[0].value;
            var query = 'id=' + elid + '&ns=' + elid + '&do=media&list='+list+'&sort='+sort+"&preserveMetaData=true";
            requestMedia.sendRequest(query);
        });

        //File upload del Media Manager
        if(eventHandlers[2]){
            eventHandlers[2].remove();
        }
        eventHandlers[2] = on(domNode, '#dw__upload:submit', function (e) {
            var elid = dispatcher.getGlobalState().pages["media"]["ns"];
            var x = document.getElementById("upload__file");
            var file = x.files[0];
            if (file != null) {
                var ow = "";
                if (document.getElementById("dw__ow").getAttribute("checked")) {
                    ow = "&ow=checked";
                }
                var mediaid = "";
                if (document.getElementById("upload__name").getAttribute("value")) {
                    mediaid = document.getElementById("upload__name").getAttribute("value");
                    if (mediaid != "") {
                        mediaid = "&mediaid=" + mediaid;
                    }
                }
                var list = dojoQuery('input[type=radio][name=fileoptions]:checked')[0].value;
                var sort = dojoQuery('input[type=radio][name=filesort]:checked')[0].value;
                //Al formulari hi ha un camp input amb l'ns, el canvio també per tal de que el post el faci bé
                var myNs = dojoQuery('input[name=ns]')[0];              
                myNs.value = elid;
                var query = 'id=' + elid + '&ns=' + elid + '&do=media&list='+list+'&sort='+sort+
                        '&qqfile=' + file.name + '&tab_details=view' + '&tab_files=files' + '&isupload=upload'
                        + ow + mediaid+"&preserveMetaData=true";
                requestMedia.sendForm("dw__upload", query);
            } else {
                alert("S'ha de seleccionar un fitxer");
            }
            event.stop(e);
        });

        //Search del Media Manager
        if(eventHandlers[3]){
            eventHandlers[3].remove();
        }
        eventHandlers[3] = on(domNode, '#mediaSearchs:click', function (e) {
            var elid = dispatcher.getGlobalState().pages["media"]["ns"];
            var q = document.getElementById("mediaSearchq").value;
            
            //Mostrant el botó de desfer filtre (style display)
            if(q!==""){
                var searchR = document.getElementById("mediaSearchr");
                searchR.style.display = "inline";
            }
            
            var elid = dispatcher.getGlobalState().pages["media"]["ns"];
            var list = dojoQuery('input[type=radio][name=fileoptions]:checked')[0].value;
            var sort = dojoQuery('input[type=radio][name=filesort]:checked')[0].value;
            var query = 'id=' + elid + '&ns=' + elid + '&do=media&list='+list+'&sort='+sort;
            query = query + '&tab_files=search&mediado=searchlist&q='+q+"&preserveMetaData=true";
            requestMedia.sendRequest(query);
            event.stop(e);
        });
        
                //Search del Media Manager --> Desfer el filtre
        if(eventHandlers[4]){
            eventHandlers[4].remove();
        }
        eventHandlers[4] = on(domNode, '#mediaSearchr:click', function (e) {
            //Ocultant el botó de desfer filtre (style display) i inicialitzant l'input
            var searchR = document.getElementById("mediaSearchr");
            searchR.style.display = "none";
            var qi = document.getElementById("mediaSearchq");
            qi.value = "";
            var elid = dispatcher.getGlobalState().pages["media"]["ns"];
            var q = "";

            var elid = dispatcher.getGlobalState().pages["media"]["ns"];
            var list = dojoQuery('input[type=radio][name=fileoptions]:checked')[0].value;
            var sort = dojoQuery('input[type=radio][name=filesort]:checked')[0].value;
            var query = 'id=' + elid + '&ns=' + elid + '&do=media&list='+list+'&sort='+sort;
            query = query + '&tab_files=search&mediado=searchlist&q='+q+"&preserveMetaData=true";
            requestMedia.sendRequest(query);
            event.stop(e);
        });
        //Search del Media Manager --> Focus a l'input text implica selecció de tot el text
        if(eventHandlers[5]){
            eventHandlers[5].remove();
        }
        eventHandlers[5] = on(domNode, '#mediaSearchq:focusin', function (e) {
            this.select();
        });
    };
    return res;
});



