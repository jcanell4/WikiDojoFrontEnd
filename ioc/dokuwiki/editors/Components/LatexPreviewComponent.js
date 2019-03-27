define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/AjaxComponent',
    'ioc/dokuwiki/editors/Renderable',
], function (declare, AjaxComponent, Renderable) {

    return declare([AjaxComponent, Renderable], {

        send: function (text) {

            arguments[1] = {text: text};
            arguments[0] = DOKU_BASE + 'lib/plugins/aceeditor/preview.php';
            arguments.length = 2;

            var context = this;

            var promise = this.inherited(arguments).then(function(data) {

                return context.render(data);

            });

            return promise;
        },

        render: function (data) {
            return {htmlTemplate: '<div ${attributes}><img src="' + (encodeURI(data.url)) + '"/></div>'};
        }

    });
});