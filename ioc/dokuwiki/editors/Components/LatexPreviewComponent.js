define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/AjaxComponent',
    'ioc/dokuwiki/editors/Renderable',
], function (declare, AjaxComponent, Renderable) {

    return declare([AjaxComponent, Renderable], {

        send: function (text) {
            arguments = [DOKU_BASE + 'lib/plugins/aceeditor/preview.php', {text: text}, "POST"]
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