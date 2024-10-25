if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registriert mit Scope:', registration.scope);
        }).catch(err => {
          console.log('Service Worker Registrierung fehlgeschlagen:', err);
        });
    });
  }

  
  // IndexedDB Setup
let db;
const request = indexedDB.open("NamenDB", 1);

// Event: Wenn die Datenbank erstellt oder aktualisiert wird
request.onupgradeneeded = function(event) {
  db = event.target.result;
  const objectStore = db.createObjectStore("names", { keyPath: "id", autoIncrement: true });
  objectStore.createIndex("name", "name", { unique: false });
};

// Event: Wenn die Datenbank erfolgreich geöffnet wird
request.onsuccess = function(event) {
  db = event.target.result;
  displayNames(); // Zeigt die gespeicherten Namen an, wenn die Seite geladen wird
};

// Event: Bei einem Fehler beim Öffnen der Datenbank
request.onerror = function(event) {
  console.error("IndexedDB Fehler: ", event.target.errorCode);
};

// Namen speichern
document.getElementById('saveButton').addEventListener('click', () => {
  const name = document.getElementById('nameInput').value;
  if (name) {
    const transaction = db.transaction(["names"], "readwrite");
    const objectStore = transaction.objectStore("names");
    const request = objectStore.add({ name: name });

    request.onsuccess = function() {
      document.getElementById('nameInput').value = ''; // Eingabefeld leeren
      displayNames(); // Namen nach dem Speichern anzeigen
    };

    request.onerror = function(event) {
      console.error("Fehler beim Speichern: ", event.target.errorCode);
    };
  }
});

// Gespeicherte Namen anzeigen
function displayNames() {
  const transaction = db.transaction(["names"], "readonly");
  const objectStore = transaction.objectStore("names");

  const nameList = document.getElementById('nameList');
  nameList.innerHTML = ''; // Liste leeren

  // Durch die gespeicherten Namen iterieren und anzeigen
  objectStore.openCursor().onsuccess = function(event) {
    const cursor = event.target.result;
    if (cursor) {
      const li = document.createElement('li');
      li.textContent = cursor.value.name;
      nameList.appendChild(li);
      cursor.continue();
    }
  };
}