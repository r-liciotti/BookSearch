// src/components/searchComponent.js
import axios from 'axios';
import * as funzioni from "./functions.js";
import { callOpenLibraryAPI, formatTextSearch } from './api.js';

export function initializeSearchComponent() {
    const containerSearch = document.querySelector(".container-search");
    let textSearch = "";

    containerSearch.addEventListener("click", function (e) {
        funzioni.gestioneFiltri(e);
    });

    const inputElement = document.querySelector('input');
    inputElement.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            textSearch = formatTextSearch(e.target.value);
            callOpenLibraryAPI(textSearch);
        }
    });
}
