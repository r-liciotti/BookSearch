// src/components/bookListComponent.js
import { createElement, getImageUrl, fetchDescription } from './dom.js';

export async function generaCard(el) {
    const container = document.querySelector(".container-book-list");

    const book = createElement("div", null, "book", null);
    const img = document.createElement('img');
    img.alt = el.title;
    img.src = await getImageUrl(el.cover_i);
    const imgContainer = createElement("div", null, "img-container", null);
    const testoDiv = createElement("div", null, "testo", null)
    const title = (el.title.length > 30) ? el.title.substring(0, 30) + '...' : el.title;
    const titolo = createElement("h2", null, "titolo", title);
    const autore = createElement("h3", null, "autore", el.author_name[0]);
    const descrizione = createElement("p", null, "descrizione", await fetchDescription(el.key));
    imgContainer.appendChild(img);
    book.appendChild(imgContainer);
    testoDiv.appendChild(titolo);
    testoDiv.appendChild(autore);
    testoDiv.appendChild(descrizione);
    book.appendChild(testoDiv);
    container.appendChild(book);
}

export function clearBookList() {
    document.body.querySelectorAll('.book').forEach(el => el.remove());
}
