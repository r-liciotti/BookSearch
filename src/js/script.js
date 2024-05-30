import axios from 'axios';
import * as funzioni from "./functions.js";




var searchUrl = "https://openlibrary.org/search.json?";
const fieldsUrl = "&fields=key,title,author_name,subject,cover_i";

const limitUrl = "&limit=12";
const page = "&page=1";
var sort = "Asc";

const containerSearch = document.querySelector(".container-search");
var textSearch = "";
containerSearch.addEventListener("click", function (e) {

    funzioni.gestioneFiltri(e);

});

const inputElement = document.querySelector('input');
var bookList = null;
// Aggiungi un event listener per l'evento 'keypress' o 'keydown'
inputElement.addEventListener('keydown', function (e) {
    // Verifica se il tasto premuto è il tasto Invio (codice 13)
    if (e.key === 'Enter') {
        textSearch = formatTextSearch(e.target.value);
        callOpenLibraryAPI();
    }
});




function getNumeroElementiPagina() {
    const select = document.body.querySelector('#limit select');
    if (select === null) return 12;
    console.log(document.body.querySelector('#limit select'));

    return parseInt(select.value);
}

function getNumeroPagina() {
    console.log(document.body.querySelector("#pagination .current"));

    if (document.body.querySelector(".current") === null) return 1;
    const N_Page = parseInt(document.body.querySelector(".current").textContent);
    return N_Page === null ? 1 : N_Page;
}


async function callOpenLibraryAPI(_page = "", _limit = "") {
    const url = `${searchUrl}${funzioni.getTypeSearch()}${textSearch}${fieldsUrl}&limit=${getNumeroElementiPagina()}&page=${getNumeroPagina()}&title_sort=${sort}`;
    console.log("Call OpenLibraryAPI");
    console.log(url);

    try {
        // Fare una chiamata GET all'API di esempio
        const response = await axios.get(url, {
            validateStatus: () => true,
        });

        createSection();
        document.body.querySelectorAll('.book').forEach(el => el.remove());
        bookList = response.data.docs;
        // console.log(mainData);
        await Promise.all(bookList.map(async el => {
            await generaCard(el);
        }));
        scrollToSectionList();
        //  bindingEventOrderSetting();

    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log("error.response");
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log("error.request");
            console.log(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log("error");
            console.log('Error', error.message);
        }

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
    img.src = await getImageUrl(el.cover_i);
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
        console.error(`--Errore nel fetch della descrizione per l'ID ${key}`, error);
        return 'Descrizione non disponibile'; // Messaggio di fallback
    }
}

async function getImageUrl(coverId) {

    try {
        const url = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg?default=false`;
        const response = await axios.get(url);
        if (response.status === 200) {
            return url;
        }
    } catch (error) {
        console.log(error.messae);
    }
    return "";

}

function createSection() {
    console.log("createSection");
    if (document.querySelector("#books") !== null) return;
    const section = createElement("section", "books", null, null);
    const orderSettingsDiv = createElement("div", null, "order-settings", null);
    const orderList = createElement("ul", null, "order", null);

    const limitListItem = createElement("li", "limit", null, null);
    const limitSelect = createElement("select", null, null, null);
    limitSelect.setAttribute('name', 'limit');

    // Aggiunta delle opzioni al menu a discesa
    [8, 12, 16, 20].forEach(value => {
        const option = createElement("option", null, null, value);
        option.setAttribute('value', value);
        limitSelect.appendChild(option);
    });
    limitSelect.value = 12;
    limitListItem.appendChild(limitSelect);

    const gridListItem = createElement("li", "grid", null, null);

    // Array di simboli per la griglia
    const gridSymbols = ['table_rows_narrow', 'view_column', 'view_column_2'];

    // Aggiunta dei simboli alla lista interna
    gridSymbols.forEach(el => {
        const span = createElement("span", null, "material-symbols-outlined", el)
        gridListItem.appendChild(span);
    });

    const sortListItem = createElement("li", "sort", null, null);
    const ascSymbol = createElement("span", null, "material-symbols-outlined", "arrow_upward");
    const ascText = createElement("span", null, null, "Asc");
    sortListItem.appendChild(ascSymbol);
    sortListItem.appendChild(ascText);

    const paginationListItem = createElement("li", "pagination", null, null);
    paginationListItem.appendChild(createElement("span", null, "material-symbols-outlined button before", "chevron_left"));
    paginationListItem.appendChild(createElement("span", null, "before", ""));
    paginationListItem.appendChild(createElement("span", null, "current", "1"));
    paginationListItem.appendChild(createElement("span", null, "next", "2"));
    paginationListItem.appendChild(createElement("span", null, "material-symbols-outlined button next", "chevron_right"));

    orderList.appendChild(limitListItem);
    orderList.appendChild(gridListItem);
    orderList.appendChild(sortListItem);
    orderList.appendChild(paginationListItem);

    orderSettingsDiv.appendChild(orderList);
    section.appendChild(orderSettingsDiv);

    const containerBook = createElement("div", null, "container-book-list grid-4-columns", null);
    section.appendChild(containerBook);
    document.body.appendChild(section);

    orderSettingsDiv.addEventListener("click", function (e) {
        bindingEventOrderSetting(e);
    });

}

function scrollToSectionList() {
    // Scorrere automaticamente fino alla lista
    document.getElementById('books').scrollIntoView({ behavior: "smooth", block: "start" });
}

function bindingEventOrderSetting(e) {
    const parent = e.target.parentElement;
    console.log("Parent");
    console.log(e.target.parentElement);

    if (parent.id === "limit") {
        console.log("limit");
        const selectedValue = e.target.value;
        gestisciNumeroElementi();
    }
    // Verifica se l'elemento cliccato è un'icona all'interno di un <li> nell'area "#grid"
    else if (parent.id === 'grid') {
        console.log("grid");
        console.log(e.target);
        const iconName = e.target.textContent;
        // console.log('Icona di griglia cliccata:', iconName);
        return;
    }
    // Verifica se l'elemento cliccato è un'icona nell'area "#sort"
    else if (parent.id === 'sort') {

        if (parent.children[1].textContent === "Asc") {
            parent.children[0].textContent = "arrow_downward";
            parent.children[1].textContent = "Desc";
        }else{
            parent.children[0].textContent = "arrow_upward";
            parent.children[1].textContent = "Asc";
        }
        sort = parent.children[1].textContent.toLowerCase();
    } else if (parent.id === "pagination") {

        paginationLogicEvent(e.target);
    }

    callOpenLibraryAPI();
}


function paginationLogicEvent(target) {
    let currentPage = parseInt(target.parentElement.querySelector("span.current").textContent);
    var spanElementsNodeList = document.body.querySelectorAll('#pagination span:not(.button)');

    if (target.classList.contains("before")) {
        if (currentPage === 1) return;
        spanElementsNodeList.forEach(el => {
            el.textContent = el.textContent === "1" ? "" : parseInt(el.textContent) - 1;
        });
    }
    if (target.classList.contains("next")) {
        spanElementsNodeList.forEach(el => {
            console.log(el.textContent);
            el.textContent = el.textContent === "" ? "1" : parseInt(el.textContent) + 1;
        });
    }

    
}