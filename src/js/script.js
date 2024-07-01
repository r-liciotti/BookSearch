import axios from 'axios';
import * as bookComponent from './components/book.js';
import { createSettingsBar } from './components/settingsBar.js';
import * as utility from "./components/utility.js";
import * as api from "./components/api.js";

var screenWidth = window.innerWidth;
var mobileScreen = screenWidth < 451 ? true : false;
console.log("screnWidth " + screenWidth);


var booksMax = 0; // Numero di book massimi della ricerca
var el_forPage = 12; // Elementi per pagina

const containerSearch = document.querySelector(".container-search"); // Pulsante cerca

var textSearch = ""; // Testo da cercare
var bookList = null; // vettore che conterrà i risultati

var bookOld; // variabile temporanea per salvare il vecchio stato dell'elemento book, utilizzato quandi si apre in dettaglio un libro

const inputElement = document.querySelector('input');  // casella di testo


// Logica per ricerca libri
containerSearch.addEventListener("click", function (e) {

    if (e.target.parentElement.className === "filtri") {
        gestioneActiveClassButton("containerSearch", e); // gestione classe active che evidenzia la scelta di tipologia di ricerca
        return;
    } else if (e.target.textContent.trim() === "search") {
        callOpenLibraryAPI(); // richiama le api
    }

});

inputElement.addEventListener('input', (e) => { // salvo il testo che viene inserito
    // Aggiorna la variabile con il valore attuale dell'input
    textSearch = utility.formatTextSearch(e.target.value);
});

// Aggiungi un event listener per la ricerca quando viene premuto il tasto enter
inputElement.addEventListener('keydown', function (e) {
    // Verifica se il tasto premuto è il tasto Invio
    if (e.key === 'Enter') {
        textSearch = utility.formatTextSearch(e.target.value);
        callOpenLibraryAPI(); // richiama le api
    }
});


// Gestisce la classe active che evidenzia le scelte selezionate cambiando lo stile dell'elemento relativo
function gestioneActiveClassButton(objListener, e) {
    const el = e.target;
    if (objListener === "containerSearch" && (el.tagName === 'LI' || el.tagName === 'SPAN')) {

        const liElement = el.tagName === 'SPAN' ? el.parentNode : el; // recupero l'elemento <li> 

        if (liElement.classList.contains("active")) {
            liElement.classList.remove("active");
            return;
        }
        containerSearch.querySelectorAll('li').forEach(li => li.classList.remove('active'));
        liElement.classList.add("active");
    } else if (objListener === "order-settings") { // gestione active della barra dei settings
        if (el.classList.contains("active")) { return; }
        el.parentNode.querySelectorAll(el.tagName.toLowerCase()).forEach(o => o.classList.remove('active'));
        el.classList.add("active");
    }
}


// Chiamata alle api OpenLibrary
async function callOpenLibraryAPI(_page = "", _limit = "") {
    if (textSearch === "") return;
    console.log("Call OpenLibraryAPI");

    createLoader(); // Creo il loader

    // Chiamo api ed ottengo i dati
    try {
        const bookData = await api.getBooksListData(textSearch, utility.getTypeSearch(), el_forPage, utility.getNumeroPagina(), "asc");
   
        // creo la listas di libri
        bookList = bookData.docs;
        // ottengo quanti libri ci sono
        booksMax = parseInt(bookData.numFound);
    } catch (error) {
        console.error("Errore durante il recupero dei dati:", error);
        // Gestisco l'errore impostando bookList come un array vuoto
        bookList = [];
    }
   

    // creo la sezione dove ci saranno libri
    createSection();

    const container = document.querySelector(".container-book-list");

    // sovrascrivo booklist per otttnere un array [obj, divElement] 
    bookList = await Promise.all(bookList.map(async el => {
        const bookElement = await bookComponent.createBook(el); // creo la l'elemento libro
        container.appendChild(bookElement);// append dell'elemento 

        return {
            bookObj: el,
            bookElement: bookElement
        };
    }));
    //  assegno eventi di apertura ai libri
    bookList.forEach(el => {
        el.bookElement.addEventListener("mousedown", e => book_mouseDownEvent(e));
        el.bookElement.addEventListener("mouseup", e => book_mouseUpEvent(e));
    });

    console.log(bookList);
    removeLoader(); // rimuovo il loader
}




// Funzione per la chisura del libro
function book_close(e, bookOld) {
    // ottengo il div.book
    const book = utility.findParentWithClass(e.target, "book");

    // chiudo il libro
    closeBook(book, bookOld);

}
// evento per aperutura libro
function book_mouseDownEvent(e) {
    if (e.button !== 0 || isBookAlredyOpen()) {
        return;
    }

    // mi assicuro di prendere l'elemento padre per assegnare la classe click
    const book = utility.findParentWithClass(e.target, "book");
    book.classList.add("click");
}
function book_mouseUpEvent(e) {
    if (e.button !== 0 || isBookAlredyOpen()) {
        return;
    }
    // mi assicuro di prendere l'elemento padre
    const book = utility.findParentWithClass(e.target, "book");
    // dall'elemento div ottengo l'oggetto da booklist
    const bookObj = bookList.find(el => el.bookElement === book).bookObj;

    book.classList.remove("click");

    // apro libro
    openBook(book, bookObj);
}




// Creo sezione e barra di controllo 
function createSection() {
    if (document.querySelector("#books") !== null) return;
    console.log("createSection");

    const section = utility.createElement("section", "books", null, null);

    const orderSettingsDiv = createSettingsBar();

    let limitSelect = orderSettingsDiv.querySelector("select");
    limitSelect.value = 12;
    el_forPage = parseInt(limitSelect.value);
    section.appendChild(orderSettingsDiv);


    let containerBook = utility.createElement("div", null, "container-book-list grid-3-columns", null);
    if (screenWidth > 1024) containerBook = utility.createElement("div", null, "container-book-list grid-4-columns", null);
    section.appendChild(containerBook);


    document.body.appendChild(section);


    orderSettingsDiv.addEventListener("click", function (e) {
        bindingEventOrderSetting(e);
    });

}


// Funzione per effettuare lo scroll
function scrollToSectionList(scrollTo) {
    // Scorrere automaticamente fino alla lista
    if (scrollTo.includes("#")) {

        document.getElementById(scrollTo.substring(1)).scrollIntoView({ behavior: "smooth", block: "start" });

    } else {
        document.getElementsByTagName(scrollTo)[0].scrollIntoView({ behavior: "smooth", block: "start" });
    }

}

// Funzione per il binding degli eventi con gli elementi della barra di controllo
function bindingEventOrderSetting(e) {
    const parent = e.target.parentElement;

    if (parent.id === "limit") {
        console.log("limit");

        if (el_forPage === parseInt(e.target.value)) { return; }
        el_forPage = parseInt(e.target.value);
    }
    // Verifica se l'elemento cliccato è un'icona all'interno di un <li> nell'area "#grid"
    else if (parent.id === 'grid') {
        console.log("grid");

        gestioneActiveClassButton("order-settings", e);

        const containerBook = document.querySelector(".container-book-list");
        if (e.target.textContent === "table_rows_narrow") { containerBook.classList = "container-book-list grid-4-columns"; }
        if (e.target.textContent === "view_column") { containerBook.classList = "container-book-list grid-3-columns"; }
        if (e.target.textContent === "view_column_2") { containerBook.classList = "container-book-list grid-2-columns"; }

        return;
    }
    else if (parent.id === "pagination") {

        paginationLogicEvent(e.target);
    } else {
        return;
    }

    callOpenLibraryAPI(); // richiamo le api se l'utente cambia dei settaggi
}

// Logica per la paginazione 
function paginationLogicEvent(target) {
    let currentPage = parseInt(target.parentElement.querySelector("span.current").textContent);
    var spanElementsNodeList = document.body.querySelectorAll('#pagination span:not(.material-symbols-outlined)');

    if (target.classList.contains("before")) { //pagina antecedente
        if (currentPage === 1) return;
        spanElementsNodeList.forEach(el => {
            el.textContent = el.textContent === "1" ? "" : parseInt(el.textContent) - 1;
        });
    }
    if (target.classList.contains("after")) { // pagina successiva
        spanElementsNodeList.forEach(el => {
            console.log(el.textContent);
            el.textContent = el.textContent === "" ? "1" : parseInt(el.textContent) + 1;
        });
    }
    if (target.classList.contains("first_page")) { // va alla pagina 1
        spanElementsNodeList.forEach(el => {
            el.style.fontSize = "";
        });
        spanElementsNodeList[0].textContent = "";
        spanElementsNodeList[1].textContent = "1";
        spanElementsNodeList[2].textContent = "2";
    }
    if (target.classList.contains("last_page")) { // ultima pagina
        let pageMax = booksMax / el_forPage | 0;

        if (pageMax.toString().length > 2) {
            spanElementsNodeList.forEach(el => {
                el.style.fontSize = "1rem";
            });
        }
        spanElementsNodeList[0].textContent = pageMax - 1;
        spanElementsNodeList[1].textContent = pageMax;
        spanElementsNodeList[2].textContent = "";
    }


}

// Funzione apertura libro, aggiunge informazioni secondarie
async function openBook(book, bookObj) {
    console.log("openBook");

    // salvo una versione di backup del libro,  prima di aggiungere elementi
    bookOld = book.cloneNode(true); // true indica di clonare anche tutti i suoi discendenti
    console.log(book);

    book.classList.add("open");
    // ottengo la descrizione piu lunga
    book.querySelector(".descrizione").textContent = await api.fetchDescription(bookObj.key, true);
    // creo elemento link per wikipedia
    const linkWiki = utility.createElement("a", "", "link-wikipedia", "Wikipedia");
    // ottengo l'indirizzo specifico del libro a wikipedia
    linkWiki.href = await api.getWikipediaApi(bookObj.title); // Ritorna Url
    // Se dimensioni schermo piccole visualizzo solo il testo "W" altrimenti "Wikipedia"
    if (mobileScreen) linkWiki.textContent = "W";
    linkWiki.target = "_blank";
    if (linkWiki.href !== "") book.appendChild(linkWiki);

    // Agggiungo informazioni secondarie relative al libro
    book.querySelector(".testo-secondario").appendChild(bookComponent.createExtraInfoStructure(bookObj));

    // Rimuovo eventi inerenti all'apertura libro, perche gia apaerto
    book.removeEventListener("mousedown", book_mouseDownEvent);
    book.removeEventListener("mouseup", book_mouseUpEvent);

    // aggiungo evento per chiusuras
    book.querySelector(".close").addEventListener("click", e => book_close(e, bookOld));
}

// Logica per chiusura libro
function closeBook(book, bookOld) {
    // Rimuovo classe open    
    book.classList.remove("open");

    // Riporto book alla sua versione originaria riscrivendolo utilizzando bookOld la versione di backup
    const propertiesToCopy = ["textContent", "innerHTML", "value", "href"];
    propertiesToCopy.forEach(property => {
        const value = bookOld[property];
        if (value !== undefined) {
            book[property] = value;
        }
    });

    // aggiungo eventi inerenti all'apertura del libro
    book.addEventListener("mousedown", book_mouseDownEvent);
    book.addEventListener("mouseup", book_mouseUpEvent);
}


function createLoader() {
    console.log("createLoader");
    scrollToSectionList("main");
    document.body.style = "overflow: hidden;";
    document.body.querySelector("main").appendChild(utility.createElement("span", null, "loader", null));
    document.body.querySelectorAll('.book').forEach(el => el.remove());
}
function removeLoader() {
    document.body.querySelector("main .loader").remove();
    document.body.style = "";
    scrollToSectionList("#books");
}



// controllo se ci sono libri aperti
function isBookAlredyOpen() {
    return bookList.some(el => el.bookElement.classList.contains("open"));
}