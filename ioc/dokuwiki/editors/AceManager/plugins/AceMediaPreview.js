define([
    'dojo/_base/declare',
    'ioc/dokuwiki/editors/AceManager/plugins/AbstractAcePlugin',
    'ioc/dokuwiki/editors/Renderable',
    "dojo/string", // string.substitute
], function (declare, AbstractAcePlugin, RenderizablePlugin, string) {

    let MAX_WIDTH = "200px";

    return declare([AbstractAcePlugin, RenderizablePlugin], {

        init: function (args) {
            this.url = args.url;
            this.allowedTypes = args.allowedTypes;
            this.addEditorListener('change, changeCursor', this.process.bind(this));
            this._update = _.debounce(this._update, 1000).bind(this);
        },

        process: function () {
            this.setupEditor.remove_marker(this.marker);
            this._update();
        },

        _update: function () {
            // ALERTA! Un cop s'inicia el plugin aquest continuarà actualitzant-se encara que es tanqui l'editor
            // així doncs, si canviem a una pestanya amb un altre tipus d'error es produirà un error

            // solució provicional: comprovem que l'editor tingi el mètode getPosition()
            // TODO: afegir una propietat o getter que retorni el tipus d'editor?
            if (!this.getEditor().getPosition) {
                return;
            }

            let pos = this.getEditor().getPosition();
            let line = this.getEditor().getRow(pos.row);

            let pattern = new RegExp("{{(.*?)(?:[\\|?].*?)?}}", "g");

            let tokens = [];
            let token;


            let firstIndex, lastIndex;

            while (token = pattern.exec(line)) {
                // console.log("Afegint token", token);
                let newToken = {
                    value: token[1],
                    startIndex: token.index,
                    endIndex: token.index + token[0].length - 1
                }

                // Comprovem si hi ha tipus i si el tipus és vàlid
                let typePattern = new RegExp("(.*?)\>.*");

                let type = typePattern.exec(newToken.value);
                type = type && type.length>0 ? type[1] : false;



                // Ignorem els tipus no permesos, per exemple els vídeos
                if (type && !this.allowedTypes.includes(type)) {
                    // console.log("Tipus no permés");
                    continue;
                }


                if (type) {
                    // Ajustem el valor del token per excloure l'indicador del type
                    newToken.value = newToken.value.substr(type.length+1);
                    // console.log("Valor retallat:", newToken.value);
                }



                if (firstIndex === undefined) {
                    firstIndex = newToken.startIndex;
                }

                lastIndex = newToken.endIndex;

                tokens.push(newToken)

            }

            // cas 1, no hi ha tokens així que no hi ha cap imatge
            if (tokens.length === 0) {
                // console.log("No hi ha cap token d'imatge a la fila");
                return;
            }

            // cas 2, el cursor es troba abans que la primera imatge, així que no s'ha clicat cap
            if (pos.column < firstIndex) {
                // console.log("Cursor abans de la primera imatge")
                return;
            }
            // cas 3, el cursor es troba darrera de la darrera imatge

            if (pos.column > lastIndex) {
                // console.log("Cursor després de la darrera imatge", pos.column, lastIndex)
                return;
            }

            let imageName;

            // Comprovem si es troba entre etiquetes
            for (let i = 0; i < tokens.length; i++) {
                // console.log("Comprovant posició", pos.column, " amb ", tokens[i].startIndex, tokens[i].endIndex)
                if (pos.column >= tokens[i].startIndex && pos.column <= tokens[i].endIndex) {
                    // console.log("Imatge trobada", pos.column, tokens[i]);
                    imageName = tokens[i].value;
                    this.start = {row : pos.row, column: tokens[i].startIndex};
                    this.end = {row : pos.row, column: tokens[i].endIndex};
                    break;
                }
            }

            if (!imageName) {
                // console.log("El cursor no és sobre cap imatge");
                return;
            }

            let innerEditor = this.getInnerEditor();
            innerEditor.remove_marker(this.marker);

            // això és el que retornava la petició, però ficant directament la URL
            let url = DOKU_BASE + this.url + "?media=" + imageName;
            // console.log("url creada:", url);
            let template = '<div ${attributes}><img src="' + (encodeURI(url)) + '"/ style="max-width:'+MAX_WIDTH+'"></div>';
            this.render(template);
        },

        render: function (htmlTemplate) {
            let innerEditor = this.getInnerEditor();

            this.marker = innerEditor.add_marker({
                start_row: this.start.row,
                start_column: this.start.column,
                end_row: this.end.row,
                end_column: this.end.column,
                klass: 'preview',
                on_render: function (editor) {
                    var attributes, style, vertical_pos;
                    vertical_pos = editor.top > editor.screen_height - editor.bottom ? "bottom: "
                        + (editor.container_height - editor.top) + "px;" : "top: " + editor.bottom + "px;";

                    style = "left: " + editor.left + "px; " + vertical_pos;
                    attributes = "class=\"ace_preview\" style=\"" + style + "\"";

                    return string.substitute(htmlTemplate, {attributes: attributes});
                }
            });
        }

    });
});