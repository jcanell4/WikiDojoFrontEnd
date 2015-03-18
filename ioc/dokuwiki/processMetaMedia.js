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



    var res = function (id, params) {
        //JSINFO.id=params.ns;


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

        on(domNode, 'li:click', function (e) {
            //setCurrentElement(this);
            var nodea = dwPageUi.getElementWhithNodeId(this, "A");
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
            query = 'id=' + elid + '&ns=' + elid + '&do=media';
            requestMedia.sendRequest(query);
            event.stop(e);
        });

        on(domNode, '[name="fileoptions"]:change', function (checked) {
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
        });

        on(domNode, '[name="filesort"]:change', function (checked) {
            if (checked) {
                var elid = dispatcher.getGlobalState().pages["media"]["ns"];
                var elsort = "";
                if (this.id === "nom") {
                    elsort = "name";

                }
                if (this.id === "data") {
                    elsort = "date";
                }
                query = 'id=' + elid + '&ns=' + elid + '&do=media' + '&sort=' + elsort;
                requestMedia.sendRequest(query);
            }
        });

        //File upload del Media Manager
        on(domNode, '#dw__upload:submit', function (e) {
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
                query = 'id=' + elid + '&ns=' + elid + '&do=media' +
                        '&qqfile=' + file.name + '&tab_details=view' + '&tab_files=files' + '&isupload=upload'
                        + ow + mediaid;
                alert("hola");

                requestMedia.getPostData = function () {
                    var x = document.getElementById("upload__file");
                    var data = new FormData();
                    var file = x.files[0];
                    //var fileName  = x.files[0].name;
                    //var fileSize  = x.files[0].size;
                    //var fileType  = x.files[0].type;
                    data.append("upload", file);
                    //data.append("fileName", fileName);
                    //data.append("fileSize", fileSize);
                    //data.append("fileType", fileType);
                    return data;
                }
                /*requestMedia.getPostData = function () {
                 var x = document.getElementById("dw__upload");
                 return formData = new FormData(x);
                 }*/
                requestMedia.sendRequest(query);
            } else {
                alert("S'ha de seleccionar un fitxer");
            }

            event.stop(e);
        });




    };
    return res;
});



