import axios from 'axios';

console.log("Script js");


const searchUrl = "https://openlibrary.org/search.json?";
const fildsUrl = "&fields=key,title,author_name,subject,isbn";
const limitUrl = "&limit=10";

const containerSearch = document.querySelector(".container-search");

containerSearch.addEventListener("click", function (e) {


    if (e.target.tagName === 'LI' || e.target.tagName === 'SPAN') {
        const liElement = e.target.tagName === 'SPAN' ? e.target.parentNode : e.target;

        if (liElement.classList.contains("active")) {
            liElement.classList.remove("active");
            return;
        }
        containerSearch.querySelectorAll('li').forEach(li => li.classList.remove('active'));
        liElement.classList.add("active");
    }

});

const inputElement = document.querySelector('input');

// Aggiungi un event listener per l'evento 'keypress' o 'keydown'
inputElement.addEventListener('keydown', function (e) {
    // Verifica se il tasto premuto è il tasto Invio (codice 13)
    if (e.keyCode === 13 || e.key === 'Enter') {
        const text = formatTextSearch(e.target.value);
        const url = `${searchUrl}${getTypeSearch()}${text}${fildsUrl}${limitUrl}` //typeSearch + e.target.value; 
        callOpenLibraryAPI(url);
    }
});


function getTypeSearch() {
    const content = document.querySelector(".active").childNodes[1].textContent;
    console.log(content);
    switch (content) {
        case "Autore":
            return "author=";
        case "Genere":
            return "subject=";
        case "Titolo":
            return "title=";
    }
}

async function callOpenLibraryAPI(url) {
    console.log("Call OpenLibraryAPI");

    try {
        // Fare una chiamata GET all'API di esempio
        const response = await axios.get(url); // URL della tua API principale
        const mainData = response.data.docs;
        // console.log(mainData);
        mainData.forEach(async el => {
            generaCard(el);
        });
    } catch (error) {
        console.error("Errore durante la chiamata all'API di Open Library", error);
    }



}


function formatTextSearch(text) {
    return text.toLowerCase().replace(/\s+/g, '_');
}

async function generaCard(el) {
    const container = document.querySelector(".container-book-list");

    const book = createElement("div", null, "book", null);
    const img = document.createElement('img');
    img.alt = el.title;
    img.src = ""//await getImageUrl(el.isbn);
    const img_contianer = createElement("div", null, "img-container", null);
    const testoDiv = createElement("div", null, "testo", null)
    const title = (el.title.length > 30) ? el.title.substring(0, 30) + '...' : el.title;
    const titolo = createElement("h2", null, "titolo", title);
    const autore = createElement("h3", null, "autore", el.author_name[0]);
    const descrizione = createElement("p", null, "descrizione", await fetchDescription(el.key));
    img_contianer.appendChild(img);
    book.appendChild(img_contianer);
    testoDiv.appendChild(titolo);
    testoDiv.appendChild(autore);
    testoDiv.appendChild(descrizione);
    book.appendChild(testoDiv);
    container.appendChild(book);
}

// Funzione per creare gli elementi html
function createElement(tag, id, className, content) {
    const el = document.createElement(tag);
    if (id !== null) { el.id = id; }
    if (className !== null) { el.className = className; }
    if (content !== null) { el.innerHTML = content }
    return el;
}

async function fetchDescription(key) {
    try {
        const response = await axios.get(`https://openlibrary.org${key}.json`); // URL della tua API per descrizioni  
        let desc = (typeof response.data.description === 'object') ? response.data.description.value : response.data.description;
        if (desc.length > 90) {
            desc = desc.substring(0, 90) + '...';
        }
        return desc;

    } catch (error) {
        console.error(`Errore nel fetch della descrizione per l'ID ${key}`, error);
        return 'Descrizione non disponibile'; // Messaggio di fallback
    }
}

async function getImageUrl(isbns) {

    for (let i = isbns.length - 1; i >= 0; i--) { // Parti dall'ultimo elemento e decrementa l'indice
        const isbn = isbns[i];
        const url = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=true`;

        try {
            const response = await axios.get(url);
            if (response.status === 200) {
                return url;
            }
        } catch (error) {

            if (error.response && error.response.status === 404) {
                console.log(`Immagine non trovata per ISBN: ${isbn}, tentativo con il prossimo.`);
            } else {
                console.error(`Errore durante il recupero dell'immagine per ISBN: ${isbn}`, error);
                // Gestisci altri tipi di errori qui, se necessario
            }
        }
    }
    // Se nessuna immagine è trovata, puoi restituire un'immagine di default
    return `https://covers.openlibrary.org/b/isbn/${isbns[0]}-M.jpg?default=false`;
}