function setupStickyNote(fullUrl, ui, idb) {
    var url = normalizeUrl(fullUrl);
    var dbName = "URLStickyNote";
    var dbVersion = 4;
    var noteStoreName = "note";
    var db = null;

    function normalizeUrl(url) {
        var i = url.search("\\?");
        if(i === -1) {
            return url;
        } else {
            return url.substr(0, i);
        }
    }

    function onReset() {
        fetchFromDatabase();
    }

    function onSave() {
        saveToDatabase();
    }

    function setStatus(text) {
        ui.message.text(text);
    }

    function onDatabaseError(e) {
        setStatus("Error");
        console.log(e);
    }

    function fetchFromDatabase() {
        var transaction = db.transaction([noteStoreName], "readonly");
        var store = transaction.objectStore(noteStoreName);
        var request = store.get(url);

        request.onsuccess = function(e) {
            if(!request.result) {
                setStatus("New");
                setNoteText("");
            } else {
                setStatus("Loaded");
                setNoteText(request.result.text);
            }
        }
    }

    function getNoteText() {
        return ui.editor.val();
    }

    function setNoteText(text) {
        ui.editor.val(text);
    }

    function saveToDatabase() {
        var transaction = db.transaction([noteStoreName], "readwrite");
        var store = transaction.objectStore(noteStoreName);
        var request = store.put({
                normalizedUrl: url,
                fullUrl: fullUrl,
                text: getNoteText(),
        });
        request.onsuccess = function(e) {
            setStatus("Saved!");
        }
    }

    function initializeDatabase() {
        var request = idb.open(dbName, dbVersion);

        request.onupgradeneeded = function(e) {
            var db = e.target.result;

            e.target.transaction.onerror = onDatabaseError;

            if(db.objectStoreNames.contains(noteStoreName)) {
                db.deleteObjectStore(noteStoreName);
            }

            var objectStore = db.createObjectStore(
                noteStoreName,
                {
                    keyPath: "normalizedUrl",
                }
            );
        };

        request.onsuccess = function(e) {
            db = e.target.result;

            fetchFromDatabase();
        };

        request.onerror = onDatabaseError;
    }

    function initialize() {
        initializeDatabase();
    }

    setStatus("Loading...");

    return {
        reset: onReset,
        save: onSave,
        normalizeUrl: normalizeUrl,
        initialize: initialize,
    };
}

function grabUi() {
    return {
        editor: $("#stickynote-editor"),
        reset: $("#stickynote-reset"),
        save: $("#stickynote-save"),
        message: $("#stickynote-message"),
    }
}

function connectUi(ui, functions) {
    ui.reset.click(functions.reset);
    ui.save.click(functions.save);
}

document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.getSelected(function(tab) {
        var ui = grabUi(),
            sticky = setupStickyNote(tab.url,
                                     ui,
                                     indexedDB);
        connectUi(ui, sticky);
        sticky.initialize();
    });
});
