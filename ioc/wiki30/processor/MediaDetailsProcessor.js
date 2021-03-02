define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/registry",
    "ioc/wiki30/processor/ContentProcessor",
    "ioc/gui/content/contentToolFactory"
], function (declare, lang, registry, ContentProcessor, contentToolFactory) {

    var ret = declare([ContentProcessor],
        /**
         * @class MediaDetailsProcessor
         * @extends ContentProcessor
         */
        {
            type: "mediadetails",
            idSelect: null,
            requester: null,
            /**
             * @param {*} value
             * @param {ioc.wiki30.Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                if (value.mediaDetailsAction == "delete") {
                    this._detailsRemoveProcess(value, dispatcher);
                } else {
                    //this._detailsProcess(value, dispatcher);
                    this.inherited(arguments);
                }
                this.idSelect = value.id.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
                this.portions_slider();
                this.opacity_slider();

            },
            _detailsRemoveProcess: function (value, dispatcher) {
                var container = registry.byId(dispatcher.containerNodeId);
                container.clearContainer(value.id);
                if (dispatcher.getGlobalState().pages["media"]["ns"]) {
                    this._createRequest();
                    this.requester.urlBase = "lib/exe/ioc_ajax.php?call=media";
                    var elid = value.ns;
                    var list = dojo.query('input[type=radio][name=fileoptions]:checked')[0].value;
                    var sort = dojo.query('input[type=radio][name=filesort]:checked')[0].value;
                    var query = 'id=' + elid + '&ns=' + elid + '&do=media&list=' + list + '&sort=' + sort;
                    this.requester.sendRequest(query);
                }
            },
            _createRequest: function () {

                require(["ioc/wiki30/Request"], lang.hitch(this, function (Request) {
                    this.requester = new Request();
                }));
            },
            /**
             * Actualitza els valors del dispatcher i el GlobalState fent servir el valor passat com argument, i afegeix
             * el valor de la acció a "mediadetails".
             *
             * @param {ioc.wiki30.Dispatcher} dispatcher
             * @param {{id: string, ns: string, title: string, content: string}} value
             *
             * @override
             */
            updateState: function (dispatcher, value) {
                this.inherited(arguments);
                dispatcher.getGlobalState().pages[value.id]["action"] = "mediadetails";
                dispatcher.getGlobalState().pages[value.id]["ns"] = value.ns;
                if(value.mediado){
                    if(value.mediado === "diff"){
                        dispatcher.getGlobalState().getContent(value.id)["mediado"] = value.mediado;
                    }
                }
                dispatcher.getGlobalState().getContent(value.id)["action"] = "mediadetails";
                dispatcher.getGlobalState().getContent(value.id)["ns"] = value.ns;
                dispatcher.getGlobalState().getContent(value.id)["myid"] = value.id;
                dispatcher.getGlobalState().getContent(value.id).rev = value.rev;
            },

            createContentTool: function (content, dispatcher) {
                var urlBase = "lib/exe/ioc_ajax.php?call=mediadetails";
                var urlBase1 = urlBase+"&img="+content.id+"&mediado=save&do=media&tab_details=view&tab_files=files&image="+content.id+"&ns="+content.ns;
                var args = {
                    id: content.id,
                    title: content.title,
                    content: content.content,
                    closable: true,
                    dispatcher: dispatcher,
                    urlBase:  urlBase1,
                    ns: content.ns,
                    difftype: content.difftype,
                    form: "form_"+content.id
                };
                var argsMediaDetailsDecor = {
                    id: content.id,
                    urlBase:  urlBase1,

                    form: "form_"+content.id
                };
                var myForm = document.getElementById("form_"+content.id);
                var argsMediaDetailsForm = {
                    urlBase:  urlBase1,

                    form: myForm
                };

                return contentToolFactory.generate(contentToolFactory.generation.MEDIADETAILS, args);
            },
            /**
            * Sets options for opacity diff slider
            *
            * @author Kate Arzamastseva <pshns@ukr.net>
            */
           opacity_slider: function () {
               var $slider = jQuery( "#mediamanager__diff"+ this.idSelect+" div.slider" );
               if (!$slider.length) return;
               $slider.idSelect = this.idSelect;
               jQuery("#mediamanager__diff"+ this.idSelect).addClass("mediadetailswithid");
               var $image = jQuery('#mediamanager__diff'+ this.idSelect+' div.imageDiff.opacity div.image1 img');
               if (!$image.length) return;
               $slider.width($image.width()-20);

               $slider.slider();
               $slider.slider("option", "min", 0);
               $slider.slider("option", "max", 0.999);
               $slider.slider("option", "step", 0.001);
               $slider.slider("option", "value", 0.5);
               $slider.bind("slide", function(event, ui) {
                   jQuery('#mediamanager__diff'+ $slider.idSelect+' div.imageDiff.opacity div.image2 img').css({ opacity: $slider.slider("option", "value")});
               });
           },

            /**
            * Sets options for red line diff slider
            *
            * @author Kate Arzamastseva <pshns@ukr.net>
            */
           portions_slider: function () {
               var $image1 = jQuery('#mediamanager__diff'+ this.idSelect+' div.imageDiff.portions div.image1 img');
               var $image2 = jQuery('#mediamanager__diff'+ this.idSelect+' div.imageDiff.portions div.image2 img');
               if (!$image1.length || !$image2.length) return;

               var $div = jQuery("#mediamanager__diff"+ this.idSelect);
               jQuery("#mediamanager__diff"+ this.idSelect).addClass("mediadetailswithid");
               if (!$div.length) return;

               $div.width('100%');
               $image2.parent().width('97%');
               $image1.width('100%');
               $image2.width('100%');

               if ($image1.width() < $div.width()) {
                   $div.width($image1.width());
               }

               $image2.parent().width('50%');
               $image2.width($image1.width());
               $image1.width($image1.width());

               var $slider = jQuery("#mediamanager__diff"+ this.idSelect+" div.slider");
               if (!$slider.length) return;
               $slider.idSelect = this.idSelect;
               $slider.width($image1.width()-20);

               $slider.slider();
               $slider.slider("option", "min", 0);
               $slider.slider("option", "max", 97);
               $slider.slider("option", "step", 1);
               $slider.slider("option", "value", 50);
               $slider.bind("slide", function(event, ui) {
                   jQuery('#mediamanager__diff'+ $slider.idSelect+' div.imageDiff.portions div.image2').css({ width: $slider.slider("option", "value")+'%'});
               });
           }
        });
        return ret;
});

