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
        //JSINFO.id=params.ns;

        /*var $tree = jQuery('#media__tree');
        $tree.dw_tree({toggle_selector: 'img',
            toggle_display: function ($clicky, opening) {
                $clicky.attr('src',
                        DOKU_BASE + 'lib/images/' +
                        (opening ? 'minus' : 'plus') + '.gif');
            }});

        //Es desconnecten els esdeveniments que havia connectats en aquest domNode.id
        /*dojo.forEach(connects[domNode.id], function (handle) {
         dojo.disconnect(handle);
         });*/
        var requestMedia = new Request();
        requestMedia.urlBase = "lib/plugins/ajaxcommand/ajax.php?call=media";
//        requestMedia.updateSectok = function (sk) {
//            this.sectok = sk;
//        };


        /*eventHandlers.push(on(domNode, 'img:click', function (e) {
            if (domClass.contains(this.parentNode, "open")) {
                event.stop(e);
                var unHandler;
                while (unHandler = eventHandlers.pop()) {
                    unHandler.remove();
                }
                //setCurrentElement(this);
                var nodea = dwPageUi.getElementWhithNodeId(this.parentNode, "A");
                //var nodea = this;
                var elid = "";
                //var mihref = dispatcher.getGlobalState().getCurrentElementId().href;
                var mihref = nodea.href;
                var andperSplit = mihref.split("&");
                for (var i = 0; i < andperSplit.length; i++) {
                    var igualSplit = andperSplit[i].split("=");
                    if (igualSplit[0] === "ns") {
                        elid = igualSplit[1];
                    }
                }
                var list = dojo.query('input[type=radio][name=fileoptions]:checked')[0].value;
                var sort = dojo.query('input[type=radio][name=filesort]:checked')[0].value;
                query = 'id=' + elid + '&ns=' + elid + '&do=media&list='+list+'&sort='+sort;
                requestMedia.sendRequest(query);
            }

        })
                );


        eventHandlers.push(on(domNode, 'a:click', function (e) {
            event.stop(e);
            var unHandler;
            while (unHandler = eventHandlers.pop()) {
                unHandler.remove();
            }
            //setCurrentElement(this);
            //var nodea = dwPageUi.getElementWhithNodeId(this, "A");
            var nodea = this;
            var elid = "";
            //var mihref = dispatcher.getGlobalState().getCurrentElementId().href;
            var mihref = nodea.href;
            var andperSplit = mihref.split("&");
            for (var i = 0; i < andperSplit.length; i++) {
                var igualSplit = andperSplit[i].split("=");
                if (igualSplit[0] === "ns") {
                    elid = igualSplit[1];
                }
            }
            var list = dojo.query('input[type=radio][name=fileoptions]:checked')[0].value;
            var sort = dojo.query('input[type=radio][name=filesort]:checked')[0].value;
            query = 'id=' + elid + '&ns=' + elid + '&do=media&list='+list+'&sort='+sort;
            requestMedia.sendRequest(query);

        })
                );*/

        eventHandlers.push(on(domNode, '[name="fileoptions"]:change', function (checked) {
            if (checked) {
                if (this.id === "thumbs") {
                    dojoQuery(".rows").addClass("thumbs");
                    dojoQuery(".rows").removeClass("rows");
                }
                if (this.id === "rows") {
                    dojoQuery(".thumbs").addClass("rows");
                    dojoQuery(".thumbs").removeClass("thumbs");
                }
            }
        })
                );

        eventHandlers.push(on(domNode, '[name="filesort"]:change', function (checked) {
            var unHandler;
            while (unHandler = eventHandlers.pop()) {
                unHandler.remove();
            }
            if (checked) {
                var elid = dispatcher.getGlobalState().pages["media"]["ns"];
                var list = dojoQuery('input[type=radio][name=fileoptions]:checked')[0].value;
                var sort = dojoQuery('input[type=radio][name=filesort]:checked')[0].value;
                var query = 'id=' + elid + '&ns=' + elid + '&do=media&list='+list+'&sort='+sort+"&preserveMetaData=true";
                requestMedia.sendRequest(query);
            }
        })
                );

        //File upload del Media Manager
        eventHandlers.push(on(domNode, '#dw__upload:submit', function (e) {
            var unHandler;
            while (unHandler = eventHandlers.pop()) {
                unHandler.remove();
            }
            event.stop(e);
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


        })
                );

        //Search del Media Manager
        eventHandlers.push(on(domNode, '#mediaSearchs:click', function (e) {
            var unHandler;
            while (unHandler = eventHandlers.pop()) {
                unHandler.remove();
            }
            event.stop(e);

            
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


        })
                );
        
                //Search del Media Manager --> Desfer el filtre
        eventHandlers.push(on(domNode, '#mediaSearchr:click', function (e) {
            var unHandler;
            while (unHandler = eventHandlers.pop()) {
                unHandler.remove();
            }
            event.stop(e);
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


        })
                );
        //Search del Media Manager --> Focus a l'input text implica selecció de tot el text
        eventHandlers.push(on(domNode, '#mediaSearchq:focusin', function (e) {
            this.select();

        })
                );


    };
    return res;
});



