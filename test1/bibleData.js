let Bible = {};
let bibleLoaded = false;

// Normalize book names
function normalizeBookName(name) {
    return name.replace(/\s+/g, " ").trim().toLowerCase();
}

// Flexible verse lookup
function getVerse(book, chapter, verse) {
    const normalized = normalizeBookName(book);

    for (const key of Object.keys(Bible)) {
        if (key.toLowerCase() === normalized) {
            return Bible[key]?.[chapter]?.[verse] || null;
        }
    }

    return null;
}

// Load selected Bible version from JSON
async function loadBible(versionName) {

    bibleLoaded = false;

    const file =
        versionName.toLowerCase() + ".json";

    try {

        const response =
            await fetch(file);

        console.log("Fetched:", file);

        Bible =
            await response.json();

        console.log(
            "Books loaded:",
            Object.keys(Bible).length
        );

        bibleLoaded = true;

    } catch (err) {

        console.error(
            "Error loading Bible:",
            err
        );

        bibleLoaded = false;
    }
}