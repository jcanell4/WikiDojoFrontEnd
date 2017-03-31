define([
    "dojo/_base/declare", // declare
    "ioc/wiki30/processor/AbstractResponseProcessor"

], function (declare, AbstractResponseProcessor) {

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
                newWin.document.write(value);
                newWin.document.close();
                newWin.focus();
//                newWin.print();
//                newWin.close();                
            },

        });
    return ret;
});


