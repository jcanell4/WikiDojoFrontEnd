define([
    "dojo/on"
            , "dojo/dom"
            , "dojo/_base/event"
            , "dojo/dom-form"
            , "dijit/registry"
            , "ioc/dokuwiki/listHeadings"
            , "ioc/dokuwiki/runRender"
            , "ioc/dokuwiki/runQuiz"
            , "ioc/wiki30/Request"
            , "ioc/dokuwiki/dwPageUi"
            , "dojo/dom-class"
            , "ioc/wiki30/dispatcherSingleton"
            , "dojo/dom-attr"
], function (on, dom, event, domform, registry, listHeadings, runRender, runQuiz,
        Request, dwPageUi, domClass, dispatcher, att) {

    var eventHandlers = new Array();



    var res = function (id, params) {
        //JSINFO.id=params.ns;

        var $tree = jQuery('#media__tree');
        $tree.dw_tree({toggle_selector: 'img',
            toggle_display: function ($clicky, opening) {
                $clicky.attr('src',
                        DOKU_BASE + 'lib/images/' +
                        (opening ? 'minus' : 'plus') + '.gif');
            }});
        var domNode = dom.byId(id);
        //Es desconnecten els esdeveniments que havia connectats en aquest domNode.id
        /*dojo.forEach(connects[domNode.id], function (handle) {
         dojo.disconnect(handle);
         });*/
        var requestMedia = new Request();
        requestMedia.urlBase = "/dokuwiki_30/lib/plugins/ajaxcommand/ajax.php?call=media";
        requestMedia.updateSectok = function (sk) {
            this.sectok = sk;
        };


        eventHandlers.push(on(domNode, 'img:click', function (e) {
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
                );

        eventHandlers.push(on(domNode, '[name="fileoptions"]:change', function (checked) {
            if (checked) {
                if (this.id === "thumbs") {
                    dojo.query(".rows").addClass("thumbs");
                    dojo.query(".rows").removeClass("rows");
                }
                if (this.id === "rows") {
                    dojo.query(".thumbs").addClass("rows");
                    dojo.query(".thumbs").removeClass("thumbs");
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
                var list = dojo.query('input[type=radio][name=fileoptions]:checked')[0].value;
                var sort = dojo.query('input[type=radio][name=filesort]:checked')[0].value;
                query = 'id=' + elid + '&ns=' + elid + '&do=media&list='+list+'&sort='+sort;
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
                var list = dojo.query('input[type=radio][name=fileoptions]:checked')[0].value;
                var sort = dojo.query('input[type=radio][name=filesort]:checked')[0].value;
                query = 'id=' + elid + '&ns=' + elid + '&do=media&list='+list+'&sort='+sort+
                        '&qqfile=' + file.name + '&tab_details=view' + '&tab_files=files' + '&isupload=upload'
                        + ow + mediaid;
                requestMedia.sendForm("dw__upload", query);
            } else {
                alert("S'ha de seleccionar un fitxer");
            }


        })
                );




    };
    return res;
});



