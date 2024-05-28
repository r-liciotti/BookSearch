import './css/style.css';

import scriptJs from "./js/script.js";
import foto from "./img/foto.jpeg";

document.querySelectorAll('img').forEach(element => {
    element.src = foto;
});
