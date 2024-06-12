import axios from 'axios';
import { creaSezione, scrollToSectionList } from './dom.js';
import { generaCard, clearBookList } from './bookListComponent.js';

const searchUrl = "https://openlibrary.org/search.json?";
const fieldsUrl = "&fields=key,title,author_name,subject,cover_i";
let sort = "Asc";

export async function callOpenLibraryAPI(textSearch, _page = "", _limit = "") {
    const url = `${searchUrl}${getTypeSearch()}${textSearch}${fieldsUrl}&limit=${getNumeroElementiPagina()}&page=${getNumeroPagina()}&title_sort=${sort}`;
    console.log("Call OpenLibraryAPI");
    console.log(url);

    try {
        const response = await axios.get(url, { validateStatus: () => true });
        creaSezione();
        clearBookList();
        const bookList = response.data.docs;
        await Promise.all(bookList.map(async el => {
            await generaCard(el);
        }));
        scrollToSectionList();

    } catch (error) {
        handleAPIError(error);
    }
}

export function formatTextSearch(text) {
    return text.toLowerCase().replace(/\s+/g, '_');
}

function handleAPIError(error) {
    if (error.response) {
        console.error("error.response", error.response.data, error.response.status, error.response.headers);
    } else if (error.request) {
        console.error("error.request", error.request);
    } else {
        console.error("error", error.message);
    }
}
