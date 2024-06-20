import axios from 'axios';



export async function getBooksListData(textSearch, typeSearch, el_forPage, n_page, sort) {
  var searchUrl = "https://openlibrary.org/search.json?";
  const fieldsUrl = "&fields=key,title,author_name,subject,subject_key,cover_i,first_publish_year,availability,number_of_pages_median";

  const url = `${searchUrl}${typeSearch}${textSearch}${fieldsUrl}&limit=${el_forPage}&page=${n_page}&title_sort=${sort}`;
  console.log("api");
  console.log(url);
  try {
    const response = await axios.get(url, {
      validateStatus: () => true,
    });
    console.log("response lung" + parseInt(response.data.numFound));
    return response.data;

  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log("error.response");
      console.log(error.response.data);
      console.log(error.response.status);
      console.log(error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
      // http.ClientRequest in node.js
      console.log("error.request");
      console.log(error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.log("error");
      console.log('Error', error.message);
    }
  }

}

export async function getImageUrl(coverId) {
  try {
    const url = `https://covers.openlibrary.org/b/id/${coverId}-M.jpg?default=false`;
    const response = await axios.get(url);
    if (response.status === 200) {
      return url;
    }
  } catch (error) {
    console.log(error.message);
  }
  return "";
}

export async function fetchDescription(key, fullDesc = false) {
  try {

    const response = await axios.get(`https://openlibrary.org${key}.json`); // URL della tua API per descrizioni  
    let desc = (typeof response.data.description === 'object') ? response.data.description.value : response.data.description;
    if (fullDesc) { return desc; }
    if (desc.length > 85) { desc = desc.substring(0, 85) + '...'; }
  
    return desc;

  } catch (error) {
    console.error(`--Errore nel fetch della descrizione per l'ID ${key}`, error);
    return 'Descrizione non disponibile'; // Messaggio di fallback
  }
}

export async function getWikipediaApi(title) {
  title = title.replace(/ /g, "_");
  try {
      const response = await axios.get('https://it.wikipedia.org/w/api.php', {
          params: {
              action: 'opensearch',
              search: title,
              limit: 1,
              origin: "*"
          }
      });
      const url = response.data[3];
      return url;


  } catch (error) {
      console.error('Errore durante il recupero dei dati da Wikipedia:', error);
      return null;
  }

}
