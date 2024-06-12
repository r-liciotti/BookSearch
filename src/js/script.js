import axios from 'axios';
import Book from "./BookClass.js"
//import * as funzioni from "./functions.js";

var screenWidth = window.innerWidth;
console.log("screnWidth " + screenWidth);
const MOBILE_WIDTH = 450;

var searchUrl = "https://openlibrary.org/search.json?";
const fieldsUrl = "&fields=key,title,author_name,subject,subject_key,cover_i,first_publish_year,availability,number_of_pages_median";

var booksMax = 0;
var el_forPage = 12;
var sort = "Asc";

const containerSearch = document.querySelector(".container-search");
var textSearch = "";

var bookOld;

containerSearch.addEventListener("click", function (e) {

    if (e.target.parentElement.className === "filtri") {
        gestioneActiveClassButton("containerSearch", e);
        return;
    } else if (e.target.textContent.trim() === "search") {
        callOpenLibraryAPI();
    }

});

const inputElement = document.querySelector('input');
var bookList = null;
inputElement.addEventListener('input', (e) => {
    // Aggiorna la variabile con il valore attuale dell'input
    textSearch = formatTextSearch(e.target.value);
});

// Aggiungi un event listener per l'evento 'keypress' o 'keydown'
inputElement.addEventListener('keydown', function (e) {
    // Verifica se il tasto premuto è il tasto Invio
    if (e.key === 'Enter') {
        textSearch = formatTextSearch(e.target.value);
        callOpenLibraryAPI();
    }
});



function gestioneActiveClassButton(objListener, e) {
    console.log("gestioneActive");
    console.log(e.target);
    const el = e.target;
    if (objListener === "containerSearch" && (el.tagName === 'LI' || el.tagName === 'SPAN')) {

        const liElement = el.tagName === 'SPAN' ? el.parentNode : el;

        if (liElement.classList.contains("active")) {
            liElement.classList.remove("active");
            return;
        }
        containerSearch.querySelectorAll('li').forEach(li => li.classList.remove('active'));
        liElement.classList.add("active");
    } else if (objListener === "order-settings") {
        if (el.classList.contains("active")) {
            //liElement.classList.remove("active");
            return;
        }
        console.clear();
        console.log(el.parentNode);
        console.log(el.tagName.toLowerCase());
        el.parentNode.querySelectorAll(el.tagName.toLowerCase()).forEach(o => o.classList.remove('active'));
        el.classList.add("active");
    }
}

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
    if (textSearch === "") return;
    const url = `${searchUrl}${getTypeSearch()}${textSearch}${fieldsUrl}&limit=${el_forPage}&page=${getNumeroPagina()}&title_sort=${sort}`;
    console.log("Call OpenLibraryAPI");
    console.log(url);

    try {
        createLoader();
        document.body.querySelectorAll('.book').forEach(el => el.remove());
        // Fare una chiamata GET all'API di esempio
        const response = await axios.get(url, {
            validateStatus: () => true,
        });

        booksMax = parseInt(response.data.numFound);
        bookList = response.data.docs;
        //console.log(bookList);
        createSection();


        bookList = await Promise.all(bookList.map(async el => {
            const cardElement = await generaCard(el);
            return {
                book: el,
                card: cardElement
            };
        }));
        console.log(bookList);
        removeLoader();
        scrollToSectionList();

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
    book.appendChild(createElement("span", null, "key-book", el.key));
    const img = document.createElement('img');
    img.alt = el.title;
    img.src = await getImageUrl(el.cover_i);
    const img_contianer = createElement("div", null, "img-container", null);
    const testoDiv = createElement("div", null, "testo", null)
    const title = (el.title.length > 30) ? el.title.substring(0, 30) + '...' : el.title;

    const titolo = createElement("h2", null, "titolo", title);
    const autore = createElement("h3", null, "autore", el.author_name[0]);
    const descrizione = createElement("p", null, "descrizione", await fetchDescription(el.key));
    const testo_principale = createElement("div", null, "testo-principale", null);
    const testo_secondario = createElement("div", null, "testo-secondario", null);

    img_contianer.appendChild(img);
    book.appendChild(img_contianer);
    testo_principale.appendChild(titolo);
    testo_principale.appendChild(autore);
    testo_principale.appendChild(descrizione);
    testoDiv.appendChild(testo_principale);
    testoDiv.appendChild(testo_secondario);

    const closeSpan = createElement("span", null, "material-symbols-outlined close", "close");
    book.appendChild(testoDiv);
    book.appendChild(closeSpan);
    container.appendChild(book);

    book.addEventListener("mousedown", book_mouseDownEvent);
    book.addEventListener("mouseup", book_mouseUpEvent);
//    closeSpan.addEventListener("click", e => book_close(e, bookOld));
    return book;
}

function book_close(e, bookOld) {
    const book = findParentWithClass(e.target, "book");

    closeBook(book, bookOld);

}
function book_mouseDownEvent(e) {
    console.log("mouseevebt");
    console.log(bookList);
    if ( bookList.some(book => book.card.classList.contains('open'))) {
        return;
    }
    const book = findParentWithClass(e.target, "book");
    if (e.button !== 0) { return; }
    book.classList.add("click");
}
function book_mouseUpEvent(e) {
    if ( bookList.some(book => book.card.classList.contains('open'))) {
        return;
    }
    const book = findParentWithClass(e.target, "book");
     const bookOld = book;
    // console.log("bookOld");
    // console.log(bookOld);
    if (e.button !== 0) { return; }

    book.classList.remove("click");
    if (e.target.classList.contains("close")) {

        closeBook(book , bookOld);        

        book = bookOld;
        return;
    }

    openBook(book);
}


// Funzione per creare gli elementi html
function createElement(tag, id, className, content) {
    const el = document.createElement(tag);
    if (id !== null) { el.id = id; }
    if (className !== null) { el.className = className; }
    if (content !== null) { el.innerHTML = content }
    return el;
}

async function fetchDescription(key, fullDesc = false) {
    try {

        const response = await axios.get(`https://openlibrary.org${key}.json`); // URL della tua API per descrizioni  
        let desc = (typeof response.data.description === 'object') ? response.data.description.value : response.data.description;
        if (fullDesc) { return desc; }
        if (desc.length > 85) {
            desc = desc.substring(0, 85) + '...';
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
    if (document.querySelector("#books") !== null) return;
    console.log("createSection");
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
    el_forPage = parseInt(limitSelect.value);
    limitListItem.appendChild(limitSelect);

    const gridListItem = createElement("li", "grid", null, null);

    if (screenWidth > 1024) {
        gridListItem.appendChild(createElement("span", null, "material-symbols-outlined active", "table_rows_narrow"));
        gridListItem.appendChild(createElement("span", null, "material-symbols-outlined", "view_column"));
    } else { gridListItem.appendChild(createElement("span", null, "material-symbols-outlined active", "view_column")); }

    gridListItem.appendChild(createElement("span", null, "material-symbols-outlined", "view_column_2"));

    const sortListItem = createElement("li", "sort", null, null);
    const ascSymbol = createElement("span", null, "material-symbols-outlined", "arrow_upward");
    const ascText = createElement("span", null, null, "Asc");
    sortListItem.appendChild(ascSymbol);
    sortListItem.appendChild(ascText);

    const paginationListItem = createElement("li", "pagination", null, null);
    paginationListItem.appendChild(createElement("span", null, "material-symbols-outlined button first_page", "first_page"));
    paginationListItem.appendChild(createElement("span", null, "material-symbols-outlined button before", "chevron_left"));
    paginationListItem.appendChild(createElement("span", null, "before", ""));
    paginationListItem.appendChild(createElement("span", null, "current", "1"));
    paginationListItem.appendChild(createElement("span", null, "after", "2"));
    paginationListItem.appendChild(createElement("span", null, "material-symbols-outlined button after", "chevron_right"));
    paginationListItem.appendChild(createElement("span", null, "material-symbols-outlined button last_page", "last_page"));

    orderList.appendChild(gridListItem);
    orderList.appendChild(limitListItem);
    //orderList.appendChild(sortListItem);
    orderList.appendChild(paginationListItem);

    orderSettingsDiv.appendChild(orderList);
    section.appendChild(orderSettingsDiv);

    let containerBook = createElement("div", null, "container-book-list grid-3-columns", null);
    if (screenWidth > 1024) containerBook = createElement("div", null, "container-book-list grid-4-columns", null);
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
    // Verifica se l'elemento cliccato è un'icona nell'area "#sort"
    else if (parent.id === 'sort') {

        if (parent.children[1].textContent === "Asc") {
            parent.children[0].textContent = "arrow_downward";
            parent.children[1].textContent = "Desc";
        } else {
            parent.children[0].textContent = "arrow_upward";
            parent.children[1].textContent = "Asc";
        }
        sort = parent.children[1].textContent.toLowerCase();
    } else if (parent.id === "pagination") {

        paginationLogicEvent(e.target);
    } else {
        return;
    }

    callOpenLibraryAPI();
}

function paginationLogicEvent(target) {
    let currentPage = parseInt(target.parentElement.querySelector("span.current").textContent);
    var spanElementsNodeList = document.body.querySelectorAll('#pagination span:not(.material-symbols-outlined)');

    if (target.classList.contains("before")) {
        if (currentPage === 1) return;
        spanElementsNodeList.forEach(el => {
            el.textContent = el.textContent === "1" ? "" : parseInt(el.textContent) - 1;
        });
    }
    if (target.classList.contains("after")) {
        spanElementsNodeList.forEach(el => {
            console.log(el.textContent);
            el.textContent = el.textContent === "" ? "1" : parseInt(el.textContent) + 1;
        });
    }
    if (target.classList.contains("first_page")) {
        spanElementsNodeList.forEach(el => {
            el.style.fontSize = "";
        });
        spanElementsNodeList[0].textContent = "";
        spanElementsNodeList[1].textContent = "1";
        spanElementsNodeList[2].textContent = "2";
    }
    if (target.classList.contains("last_page")) {
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

async function openBook(book) {
    console.log("openBook");
    bookOld = book.cloneNode(true); // true indica di clonare anche tutti i suoi discendenti

    const bookObj = getOggetto_InBookList(book);
    book.classList.add("open");
    try{
    book.querySelector(".descrizione").textContent = await fetchDescription(bookObj.key, true);
    }catch{
        console.log("errore bookkey");
        console.log(bookObj.key);
    }
    const linkWiki = createElement("a", "", "link-wikipedia", "Wikipedia");
    console.log(getOggetto_InBookList(book));
    // console.log(await getWikipediaApi(book.querySelector(".titolo").textContent));
    linkWiki.href = await getWikipediaApi(bookObj.title); // Ritorna Url
    linkWiki.target = "_blank";
    if (linkWiki.href !== "") book.appendChild(linkWiki);

    book.querySelector(".close").addEventListener("click", e => book_close(e, bookOld));

    console.log(createExtraInfoStructure(bookObj));
    book.querySelector(".testo-secondario").appendChild(createExtraInfoStructure(bookObj));

    book.removeEventListener("mousedown", book_mouseDownEvent);
    book.removeEventListener("mouseup", book_mouseUpEvent);
}

function closeBook(book, bookOld) {
    
    book.classList.remove("open");

    // Riporto book alla sua versione originaria riscrivendolo
    const propertiesToCopy = ["textContent", "innerHTML", "value", "href"];    
    propertiesToCopy.forEach(property => {
        const value = bookOld[property];
        if (value !== undefined) {
            book[property] = value;
        }
    });


    book.addEventListener("mousedown", book_mouseDownEvent);
    book.addEventListener("mouseup", book_mouseUpEvent);
  
   
}

async function getWikipediaApi(title) {
    title = title.replace(/ /g, "_");
    try {
        const response = await axios.get('https://it.wikipedia.org/w/api.php', {
            params: {
                action: 'opensearch',
                search: title,
                limit: 1,
                origin: "*"
            }
        });
        const url = response.data[3];
        return url;


    } catch (error) {
        console.error('Errore durante il recupero dei dati da Wikipedia:', error);
        return null;
    }

}

function createExtraInfoStructure(bookObj) {
    const divLeft = createElement("ul", null, "testo-secondario__left", null);
    //const divRight = createElement("div", null, "testo-secondario__right", null);
    const li1 = createElement("li", null, null, null);
    li1.appendChild(createElement("div", null, "label", "Categorie: "));

    const categorie = bookObj.subject_key.slice(1, 11).map(s => s.replace(/_/g, ' ')).join(', ');
    li1.appendChild(createElement("div", null, "value", categorie));
    divLeft.appendChild(li1);

    const li2 = createElement("li", null, null, null);
    li2.appendChild(createElement("div", null, "label", "Anno: "));
    li2.appendChild(createElement("div", null, "value", bookObj.first_publish_year));
    divLeft.appendChild(li2);

    const li3 = createElement("li", null, null, null);
    li3.appendChild(createElement("div", null, "label", "Pagine: "));
    li3.appendChild(createElement("div", null, "value", bookObj.number_of_pages_median));
    divLeft.appendChild(li3);
    return divLeft;
}

function createLoader() {
    console.log("createLoader");
    document.body.querySelector("main").appendChild(createElement("span", null, "loader", null));
}
function removeLoader() {
    console.log("removeLoader");

    document.body.querySelector("main .loader").remove();
}


function findParentWithClass(element, className) {
    while (element && !element.classList.contains(className)) {
        element = element.parentNode;
    }
    return element;
}

function getOggetto_InBookList(_card) {
    //console.log("getOggetto_InBookList");
    //console.log(_card);
    const item = bookList.find(item => item.card === _card);
    return item ? item.book : null;
}