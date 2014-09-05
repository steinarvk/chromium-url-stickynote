function setupStickyNote(url, ui) {
    var originalText = "URL: " + url;

    function onReset() {
        ui.editor.val(originalText);
    }

    function onSave() {
        originalText = ui.editor.val();
    }

    ui.editor.val(originalText);
    ui.reset.click(onReset);
    ui.save.click(onSave);
};

function grabUi() {
    return {
        editor: $("#stickynote-editor"),
        reset: $("#stickynote-reset"),
        save: $("#stickynote-save")
    }
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.getSelected(function(tab) {
        setupStickyNote(tab.url, grabUi());
    });
});
