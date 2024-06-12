
export function gestioneFiltri(e){
    if (e.target.tagName === 'LI' || e.target.tagName === 'SPAN') {
        const liElement = e.target.tagName === 'SPAN' ? e.target.parentNode : e.target;

        if (liElement.classList.contains("active")) {
            liElement.classList.remove("active");
            return;
        }
        containerSearch.querySelectorAll('li').forEach(li => li.classList.remove('active'));
        liElement.classList.add("active");
    }
}

export function getTypeSearch() {
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


export function getNumeroElementiPagina() {
    const select = document.body.querySelector('#limit select');
    return select ? parseInt(select.value) : 12;
}

export function getNumeroPagina() {
    const currentPageElement = document.body.querySelector(".current");
    return currentPageElement ? parseInt(currentPageElement.textContent) : 1;
}

export function bindingEventOrderSetting(e) {
    const parent = e.target.parentElement;

    if (parent.id === "limit") {
        const selectedValue = e.target.value;
        // gestisciNumeroElementi(); // Implementa questa funzione se necessaria
    } else if (parent.id === 'grid') {
        // Gestisci l'evento del cambio di griglia
    } else if (parent.id === 'sort') {
        const sortIcon = parent.children[0];
        const sortText = parent.children[1];

        if (sortText.textContent === "Asc") {
            sortIcon.textContent = "arrow_downward";
            sortText.textContent = "Desc";
        } else {
            sortIcon.textContent = "arrow_upward";
            sortText.textContent = "Asc";
        }
        sort = sortText.textContent.toLowerCase();
    } else if (parent.id === "pagination") {
        paginationLogicEvent(e.target);
    }

    callOpenLibraryAPI();
}

export function paginationLogicEvent(target) {
    let currentPage = parseInt(target.parentElement.querySelector("span.current").textContent);
    const spanElementsNodeList = document.body.querySelectorAll('#pagination span:not(.button)');

    if (target.classList.contains("before")) {
        if (currentPage === 1) return;
        spanElementsNodeList.forEach(el => {
            el.textContent = el.textContent === "1" ? "" : parseInt(el.textContent) - 1;
        });
    } else if (target.classList.contains("next")) {
        spanElementsNodeList.forEach(el => {
            el.textContent = el.textContent === "" ? "1" : parseInt(el.textContent) + 1;
        });
    }
}
