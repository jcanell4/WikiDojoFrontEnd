define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/AbstractResponseProcessor",
    "dojo/on",
    "dojo/_base/event",
    "dojo/dom-attr"
], function (declare, AbstractResponseProcessor, on, event, att) {

    var ret = declare([AbstractResponseProcessor],
        /**
         * @class PrintProcessor
         * @extends AbstractResponseProcessor
         */
        {
            type: "print",

            /**
             * @param {*} value
             * @param {Dispatcher} dispatcher
             *
             * @override
             */
            process: function (value, dispatcher) {
                var newWin;
                var width;
                var height;
                
                width = Math.max(2*window.screen.width/3, 900);
                Math.min(width, window.screen.width);
                 
                height = window.screen.height -20
                 
                newWin= window.open("", "wikiioc_print", "toolbar=1,scrollbars=1,resizable=1,top=10,left=10,width="+(width)+",height="+(height));
                newWin.document.write(value.html);
                newWin.document.close();
               
               if(!value.notPreview){
                    var onClickWikiLink = function(e){
                        var query = "";
                        var hash = "";
                        var idtag = "";
                        var arr = att.get(this, "href").split("?");
                        if (arr.length > 1) {
                            query = arr[1];
                            arr = query.split("#");
                            query = arr[0];
                            hash = arr[1];
                            idtag= query.substring(query.indexOf("=")+1, query.length);
                        }
                        if(hash && idtag===value.ns){
                            newWin.location.href = "#" + hash;
                        }
                        event.stop(e);            
                    };

                    setTimeout(function(){
                        on(newWin.document.body, 'a[class=wikilink1]:click', onClickWikiLink);
                        on(newWin.document.body, 'a[class=wikilink2]:click', onClickWikiLink);
                    }, 4000);
                }
                newWin.focus();
                if(value.notPreview){
                    newWin.print();
                    newWin.close();    
                }
            },

        });
    return ret;
});


