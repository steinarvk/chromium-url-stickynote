document.addEventListener('DOMContentLoaded', function() {
    var editor = document.getElementById("stickynote-editor");
    if(!editor) {
        return;
    }

    editor.value = "Hello world: " + Math.random();
});
