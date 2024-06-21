import axios from 'axios';
import * as bookComponent from './components/book.js';
import { createSettingsBar } from './components/settingsBar.js';
import * as utility from "./components/utility.js";
import * as api from "./components/api.js";

var screenWidth = window.innerWidth;
var mobileScreen = screenWidth< 451 ? true : false;
console.log("screnWidth " + screenWidth);


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
    textSearch = utility.formatTextSearch(e.target.value);
});

// Aggiungi un event listener per l'evento 'keypress' o 'keydown'
inputElement.addEventListener('keydown', function (e) {
    // Verifica se il tasto premuto è il tasto Invio
    if (e.key === 'Enter') {
        textSearch = utility.formatTextSearch(e.target.value);
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






async function callOpenLibraryAPI(_page = "", _limit = "") {
    if (textSearch === "") return;
    console.log("Call OpenLibraryAPI");

    createLoader();

    const bookData = await api.getBooksListData(textSearch, utility.getTypeSearch(), el_forPage, utility.getNumeroPagina(), sort);  


    bookList = bookData.docs;
    booksMax = parseInt(bookData.numFound);


    createSection();

    const container = document.querySelector(".container-book-list");

    bookList = await Promise.all(bookList.map(async el => {
        const bookElement = await bookComponent.createBook(el);
        container.appendChild(bookElement);

        return {
            bookObj: el,
            bookElement: bookElement
        };
    }));
    bookList.forEach(el => {
        el.bookElement.addEventListener("mousedown", e => book_mouseDownEvent(e));
        el.bookElement.addEventListener("mouseup", e => book_mouseUpEvent(e));
    });

    console.log(bookList);
    removeLoader();
}





function book_close(e, bookOld) {
    const book = utility.findParentWithClass(e.target, "book");

    closeBook(book, bookOld);

}
function book_mouseDownEvent(e) {
    console.log("mouseDownEvent");

    if (e.button !== 0 || isBookAlredyOpen()) {
        return;
    }

    const book = utility.findParentWithClass(e.target, "book");
    book.classList.add("click");
}
function book_mouseUpEvent(e) {
    console.log("book_mouseUpEvent");
    if (e.button !== 0 || isBookAlredyOpen()) {
        return;
    }

    const book = utility.findParentWithClass(e.target, "book");
    const bookObj = bookList.find(el => el.bookElement === book).bookObj;

    book.classList.remove("click");

    openBook(book, bookObj);
}





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

function scrollToSectionList(scrollTo) {
    // Scorrere automaticamente fino alla lista
    if (scrollTo.includes("#")) {

        document.getElementById(scrollTo.substring(1)).scrollIntoView({ behavior: "smooth", block: "start" });                    
                 
    }else{
        document.getElementsByTagName(scrollTo)[0].scrollIntoView({ behavior: "smooth", block: "start" });                    
    }
    
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

async function openBook(book, bookObj) {
    console.log("openBook");

    bookOld = book.cloneNode(true); // true indica di clonare anche tutti i suoi discendenti
    console.log(book);

    book.classList.add("open");
    book.querySelector(".descrizione").textContent = await api.fetchDescription(bookObj.key, true);

    const linkWiki = utility.createElement("a", "", "link-wikipedia", "Wikipedia");
        
    linkWiki.href = await api.getWikipediaApi(bookObj.title); // Ritorna Url
    if (mobileScreen) linkWiki.textContent = "W";
    linkWiki.target = "_blank";
    if (linkWiki.href !== "") book.appendChild(linkWiki);


    book.querySelector(".testo-secondario").appendChild(bookComponent.createExtraInfoStructure(bookObj));

    book.removeEventListener("mousedown", book_mouseDownEvent);
    book.removeEventListener("mouseup", book_mouseUpEvent);
    book.querySelector(".close").addEventListener("click", e => book_close(e, bookOld));

}

function closeBook(book, bookOld) {
    console.log("closeBook");
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




function isBookAlredyOpen() {
    return bookList.some(el => el.bookElement.classList.contains("open"));
}