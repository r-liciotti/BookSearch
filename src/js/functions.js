
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
