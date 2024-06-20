import axios from 'axios';
import * as api from './api.js';
import * as utility from "./utility.js";

export async function createBook(book) {
  const ImgUrl = await api.getImageUrl(book.cover_i);
  const desc = await api.fetchDescription(book.key);
  let title = book.title;
  if(title.length  > 37) {title = title.substring(0, 34).trimEnd()  + "...";}
  if(window.innerWidth < 450 && title.length  > 23) {title = title.substring(0,17).trimEnd()  + "...";}
  if(window.innerWidth < 769 && title.length  > 26) {title = title.substring(0,20).trimEnd()  + "...";}
  

  const div = document.createElement('div');
  div.className = 'book';
  div.innerHTML = `
        <span class="key-book">${book.key}</span>
        <div class="img-container">
          <img alt="${book.title}" src="${ImgUrl}">
        </div>
        <div class="testo">
          <div class="testo-principale">
            <h2 class="titolo">${title}</h2>
            <h3 class="autore">${book.author_name[0]}</h3>
            <p class="descrizione">${desc}</p>
          </div>
          <div class="testo-secondario"></div>
        </div>
        <span class="material-symbols-outlined close">close</span>
    `;
  return div;
}

export function createExtraInfoStructure(bookObj) {
  const divLeft = utility.createElement("ul", null, null, null);
  //const divRight = utility.createElement("div", null, "testo-secondario__right", null);
  const li1 = utility.createElement("li", null, null, null);
  li1.appendChild(utility.createElement("div", null, "label", "Categorie: "));

  const categorie = bookObj.subject_key.slice(1, 6).map(s => s.replace(/_/g, ' ')).join(', ');
  li1.appendChild(utility.createElement("div", null, "value", categorie));
  divLeft.appendChild(li1);

  const li2 = utility.createElement("li", null, null, null);
  li2.appendChild(utility.createElement("div", null, "label", "Anno: "));
  li2.appendChild(utility.createElement("div", null, "value", bookObj.first_publish_year));
  divLeft.appendChild(li2);

  const li3 = utility.createElement("li", null, null, null);
  li3.appendChild(utility.createElement("div", null, "label", "Pagine: "));
  li3.appendChild(utility.createElement("div", null, "value", bookObj.number_of_pages_median));
  divLeft.appendChild(li3);
  return divLeft;
}

