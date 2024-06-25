// Trova il genitore con una classe specifica
export function findParentWithClass(element, className) {
    while (element && !element.classList.contains(className)) {
        element = element.parentNode;
    }
    return element;
}

// Funzione per ottenere l'oggetto book in booklist
export function getOggetto_InBookList(_bookElement) {
    //console.log("getOggetto_InBookList");
    //console.log(_card);
    console.log("booklist");
    console.log(booklist);
    const item = bookList.find(item => item.bookElement === _bookElement);
    return item ? item.book : null;
}

export function createElement(tag, id, className, content) {
    const el = document.createElement(tag);
    if (id !== null) { el.id = id; }
    if (className !== null) { el.className = className; }
    if (content !== null) { el.innerHTML = content }
    return el;
  }

 export function getNumeroElementiPagina() {
    const select = document.body.querySelector('#limit select');
    if (select === null) return 12;
    console.log(document.body.querySelector('#limit select'));

    return parseInt(select.value);
}

export function getNumeroPagina() {
    console.log(document.body.querySelector("#pagination .current"));

    if (document.body.querySelector(".current") === null) return 1;
    const N_Page = parseInt(document.body.querySelector(".current").textContent);
    return N_Page === null ? 1 : N_Page;
}

export function formatTextSearch(text) {
    return text.toLowerCase().replace(/\s+/g, '_');
}

export function getTypeSearch() {
    const content = document.querySelector(".active").childNodes[1].textContent;
    switch (content) {
        case "Autore":
            return "author=";
        case "Genere":
            return "subject=";
        case "Titolo":
            return "title=";
    }
}