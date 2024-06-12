import axios from 'axios';

export function createElement(tag, id, className, content) {
    const el = document.createElement(tag);
    if (id !== null) { el.id = id; }
    if (className !== null) { el.className = className; }
    if (content !== null) { el.innerHTML = content }
    return el;
}

export async function fetchDescription(key) {
    try {
        const response = await axios.get(`https://openlibrary.org${key}.json`);
        let desc = (typeof response.data.description === 'object') ? response.data.description.value : response.data.description;
        return (desc.length > 90) ? desc.substring(0, 90) + '...' : desc;
    } catch (error) {
        console.error(`Errore nel fetch della descrizione per l'ID ${key}`, error);
        return 'Descrizione non disponibile';
    }
}

export async function getImageUrl(coverId) {
    try {
        const url = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg?default=false`;
        const response = await axios.get(url);
        return response.status === 200 ? url : "";
    } catch (error) {
        console.error(error.message);
        return "";
    }
}

export function creaSezione() {
    if (document.querySelector("#books") !== null) return;
    const section = createElement("section", "books", null, null);
    const orderSettingsDiv = createElement("div", null, "order-settings", null);
    const orderList = createElement("ul", null, "order", null);

    const limitListItem = createElement("li", "limit", null, null);
    const limitSelect = createElement("select", null, null, null);
    limitSelect.setAttribute('name', 'limit');

    [8, 12, 16, 20].forEach(value => {
        const option = createElement("option", null, null, value);
        option.setAttribute('value', value);
        limitSelect.appendChild(option);
    });
    limitSelect.value = 12;
    limitListItem.appendChild(limitSelect);

    const gridListItem = createElement("li", "grid", null, null);
    ['table_rows_narrow', 'view_column', 'view_column_2'].forEach(el => {
        const span = createElement("span", null, "material-symbols-outlined", el);
        gridListItem.appendChild(span);
    });

    const sortListItem = createElement("li", "sort", null, null);
    sortListItem.appendChild(createElement("span", null, "material-symbols-outlined", "arrow_upward"));
    sortListItem.appendChild(createElement("span", null, null, "Asc"));

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

export function scrollToSectionList() {
    document.getElementById('books').scrollIntoView({ behavior: "smooth", block: "start" });
}
