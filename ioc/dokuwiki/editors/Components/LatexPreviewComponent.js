define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/Components/AjaxComponent'
], function (declare, AjaxComponent) {

    return declare(AjaxComponent, {

        send: function (text) {

            arguments[0] = DOKU_BASE + 'lib/plugins/aceeditor/preview.php';
            arguments[1] = {text: text};

            var promise = this.inherited(arguments).then(function(data) {

                return {htmlTemplate: '<div ${attributes}><img src="' + (encodeURI(data.url)) + '"/></div>'};
            });

            return promise;
        }

    });
});