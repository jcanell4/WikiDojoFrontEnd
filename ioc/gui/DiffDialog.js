define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/_base/declare',
    'ioc/gui/CustomDialog',
    'ioc/gui/jsdifflib/jsdifflib-amd',
    'dojo/text!./templates/DiffDialog.html',
    'dijit/form/Button'
], function (TemplatedMixin, WidgetsInTemplateMixin, declare, CustomDialog, jsdifflib, template) {

    return declare("ioc.gui.DiffDialog", [CustomDialog, TemplatedMixin, WidgetsInTemplateMixin], {

        templateString: template,

        startup: function () {
            this.inherited(arguments);
            //console.log("Document:", this.document);
            //console.log("Draft:", this.draft);

            var documentLabel = "Document (" + this.document.date + ")",
                draftLabel = "Esborrany (" + this.draft.date + ")",
                diff = jsdifflib.getDiff(this.document.content, this.draft.content, documentLabel, draftLabel);

            this.diffNode.appendChild(diff);

            jQuery(this.diffNode).animate({scrollTop: (0)});
        }
    });
});
