// Clé API
const API_cle = "e36c21fd18c17d7d14665dfd438cfa4a";
const conteneurCarte = document.querySelector("#cartes-films");
const chargement = document.querySelector("#chargement");
const messageErreur = document.querySelector("#erreur");
const recherche = document.querySelector("#recherche");
const boutonValider = document.querySelector("#valider");

const modale = document.querySelector("#modale");
const synopsis = document.querySelector("#synopsis");
const genres = document.querySelector("#genres");
const boutonFermer = document.querySelector("#fermer");
const titreModale = document.querySelector("#titre-modale");

const conteneurFavoris = document.querySelector("#favoris");

boutonFermer.addEventListener("click", () => {
    modale.style.display = "none";
    conteneurCarte.style.display = "grid";
});

let genresFilms = [];
let favoris = JSON.parse(localStorage.getItem("favoris")) || [];

async function rechercheFilm() {
    try {
        const frappe = recherche.value.trim();
        if (!frappe) {
            alert("veuillez entrer le nom d'un film!");
            return;
        }

        const reponse = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_cle}&query=${frappe}&language=fr-FR`);
        if (!reponse.ok) {
            throw new Error("Un problème est survenu");
        }
        const data = await reponse.json();
        const films = data.results;
        conteneurCarte.innerHTML = "";
        
        if (films.length === 0) {
            messageErreur.textContent = "Film non trouvé";
            return;
        } else {
            messageErreur.textContent = "";
        }

        for (let i = 0; i < films.length; i++) {
            creationCarte(films[i]);
        }

    } catch (erreur) {
        console.log("Oups..." + erreur);
    }
}

boutonValider.addEventListener("click", rechercheFilm);

async function recupererGenres() {
    try {
        const reponse = await fetch(
            `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_cle}&language=fr-FR`
        );

        if (!reponse.ok) {
            throw new Error("Impossible de récupérer les genres");
        }

        const data = await reponse.json();
        genresFilms = data.genres;

    } catch (erreur) {
        console.log("Erreur genres :", erreur);
    }
}

function creationCarte(data) {
    const carte = document.createElement("article");
    carte.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}">
    <h3>${data.title}</h3>
    <p>${data.release_date}</p>
    <span class="badge-note">${data.vote_average}</span>
    <button class="btn-favori">
        <img src="images/prefere.png" alt="coeur-blanc">
    </button>
    `;

    carte.addEventListener("click", () => {
        conteneurCarte.style.display="none";
        modale.style.display = "block";
        titreModale.textContent = data.title;
        synopsis.textContent = data.overview;

        const nomsGenres = [];
        if (data.genre_ids) {
            for (let i = 0; i < data.genre_ids.length; i++) {
                const genre = genresFilms.find(g => g.id === data.genre_ids[i]);
                if (genre) {
                    nomsGenres.push(genre.name);
                }
            }
        }
        genres.textContent = nomsGenres.join(" • ");
    });

    const badge = carte.querySelector(".badge-note");
    couleurNote(data.vote_average, badge);

    const boutonFavori = carte.querySelector(".btn-favori");
    const iconeFavori = boutonFavori.querySelector("img");

    boutonFavori.addEventListener("click", (event) => {
        event.stopPropagation();

        const dejaFavori = favoris.some(film => film.id === data.id);

        if (dejaFavori) {
            favoris = favoris.filter(film => film.id !== data.id);
            if (iconeFavori) iconeFavori.src = "images/prefere.png";
        } else {
            favoris.push(data);
            if (iconeFavori) iconeFavori.src = "images/redheart.png";
        }

        localStorage.setItem("favoris", JSON.stringify(favoris));
        afficherFavoris();
    });

    conteneurCarte.append(carte);
}

function afficherFavoris() {
    if (!conteneurFavoris) return;
    conteneurFavoris.innerHTML = "";

    for (let i = 0; i < favoris.length; i++) {
        creationCarteFavori(favoris[i]);
    }
}

function creationCarteFavori(data) {
    const carte = document.createElement("article");

    carte.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${data.poster_path}" alt="${data.title}">
        <h3>${data.title}</h3>
        <p>${data.release_date}</p>
        <span class="badge-note">${data.vote_average}</span>
        <button class="btn-favori">
            <img src="images/redheart.png" alt="coeur-rouge">
        </button>
    `;

    const badge = carte.querySelector(".badge-note");
    couleurNote(data.vote_average, badge);

    const boutonFavori = carte.querySelector(".btn-favori");

    boutonFavori.addEventListener("click", () => {
        favoris = favoris.filter(film => film.id !== data.id);
        localStorage.setItem("favoris", JSON.stringify(favoris));
        afficherFavoris();
    });

    conteneurFavoris.append(carte);
}

function couleurNote(note, badge) {
    if (note < 5) {
        badge.classList.add("red");
    } else if (note >= 5 && note < 7) {
        badge.classList.add("orange");
    } else {
        badge.classList.add("green");
    }
}

async function recupererFilms() {
    if (chargement) chargement.style.display = "block";
    try {
        const reponse = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${API_cle}&language=fr-FR`);
        if (!reponse.ok) {
            throw new Error("Erreur de connexion à la page");
        }
        const data = await reponse.json();
        const resultat = data.results;

        for (let i = 0; i < resultat.length; i++) {
            creationCarte(resultat[i]);
        }
    } catch (erreur) {
        if (messageErreur) messageErreur.textContent = "Oups, une erreur s'est produite...";
    } finally {
        if (chargement) chargement.style.display = "none";
    }
}

// Initialisation
recupererGenres();
recupererFilms();
afficherFavoris();