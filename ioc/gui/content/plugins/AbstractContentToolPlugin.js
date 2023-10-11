define([
    "dojo/_base/declare",
], function (declare) {

    return declare([],

        {
            _contentTool: null,
            _dispatcher: null,

            // Cridat automàticament en instanciar. S'ha de cridar a totes les subclases
            init: function(contentTool) {

                this.contentTool = contentTool;
                this.dispatcher = contentTool.dispatcher;

            }



        });
});
