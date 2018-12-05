define([
    "dojo/_base/declare",
    'ioc/dokuwiki/editors/DojoManager/plugins/AbstractDojoPlugin',
    "dojo/_base/lang",
    "dijit/_editor/_Plugin",
    "dojo/string"
], function (declare, AbstractDojoPlugin, lang, _Plugin, string) {

    var SoundButton = declare(AbstractDojoPlugin, {

        init: function(args) {
            this.inherited(arguments);

            this.htmlTemplate = '<iframe width="100%" height="20" scrolling="no" frameborder="no" src="${url}"></iframe>'

            this.sample = args.sample;

            this.prompt = args.prompt;

            var config = {
                label: args.title,
                ownerDocument: this.editor.ownerDocument,
                dir: this.editor.dir,
                lang: this.editor.lang,
                showLabel: false,
                iconClass: this.iconClassPrefix + " " + this.iconClassPrefix + args.icon,
                tabIndex: "-1",
                onClick: lang.hitch(this, "process")
            };

            this.addButton(config);
        },

        process: function () {

            var id = prompt(this.prompt, this.sample);

            // No cal indicar el secret token, pot ser es per audios privats?

            // TODO[Xavi] passar la URL des del plugin factory?
            var url = 'https://w.soundcloud.com/player/?url=https://api.soundcloud.com/tracks/${id}?secret_token=none&color=%230066cc&inverse=false&auto_play=false&show_user=true';
            url = string.substitute(url, {id: id});

            this.editor.execCommand('inserthtml', string.substitute(this.htmlTemplate, {url: url}));
        },


    });


    // Register this plugin.
    _Plugin.registry["insert_sound"] = function () {
        return new FormatButton({command: "insert_sound"});
    };

    return SoundButton;
});