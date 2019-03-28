define([
    "dojo/_base/declare",
    "ioc/wiki30/processor/ProjectEditContentProcessor",
    // "dijit/registry",
    // "ioc/gui/content/contentToolFactory"
], function (declare, ProjectEditContentProcessor/*, registry, contentToolFactory*/) {
    /**
     * Aquesta classe s'encarrega de processar les dades i generar un formulari de projecte editable.
     *
     * @class ProjectContentProcessor
     * @extends FormContentProcessor
     */
    return declare([ProjectEditContentProcessor], {

        type: "project_partial",

        editable: false,

        showOnlyOneElement: true,

    });
    
});
