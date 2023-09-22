const global = {
    currentPage: window.location.pathname,
    api: {
        key: '1639f46108f53f0a3d350e6ed39f2fcb',
        url: 'https://api.themoviedb.org/3/',
    },
    search: {
        term: '',
        type: '',
        page: 1,
        totalPages: 1,
        totalResults: 0,
    },
};

function init() {
    switch (global.currentPage) {
        case '/':
        case '/index.html':
            displayPopularMovies();
            displaySwiper();
            break;
        case '/shows.html':
            displayPopularShows();
            break;
        case '/movie-details.html':
            displayMovieDetails();
            break;
        case '/tv-details.html':
            displayShowDetails();
            break;
        case '/search.html':
            search();
            break;
    }
    highlightActiveLink();
}

document.addEventListener('DOMContentLoaded', init);

function highlightActiveLink() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        if (link.getAttribute('href') === global.currentPage)
            link.classList.add('active');
    }
    )
}

async function fetchData(endpoint) {
    const apiKey = global.api.key;
    const apiUrl = global.api.url;
    try {
        const res = await fetch(`${apiUrl}${endpoint}?api_key=${apiKey}`, {
            method: 'GET',
            headers: {
                accept: 'application/json',
            }
        });
        if (!res.ok) {
            throw new Error('Fetch Failed');
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

async function searchApiData() {
    const apiKey = global.api.key;
    const apiUrl = global.api.url;

    try {
        const res = await fetch(`${apiUrl}search/${global.search.type}?query=${global.search.term}&page=${global.search.page}&api_key=${apiKey}`, {
            method: 'GET',
            headers: {
                accept: 'application/json',
            }
        });
        if (!res.ok) {
            throw new Error('Fetch Failed');
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.log(error);
    }
}

function createMovieCard(movieObj) {
    const div = document.createElement('div');
    div.classList.add('card');

    const a = document.createElement('a');
    a.setAttribute('href', `movie-details.html?id=${movieObj.id}`);

    const img = document.createElement('img');
    img.classList.add('card-img-top');
    if (movieObj.poster_path === null) { img.setAttribute('src', '/images/no-image.jpg'); }
    else { img.setAttribute('src', `https://image.tmdb.org/t/p/w500${movieObj.poster_path}`); }
    img.setAttribute('alt', `${movieObj.title}`);

    const inDiv = document.createElement('div');
    inDiv.classList.add('card-body');

    const h5 = document.createElement('h5');
    h5.classList.add('card-title');
    h5.textContent = movieObj.title;

    const p = document.createElement('p');
    p.classList.add('card-text');

    const small = document.createElement('small');
    small.classList.add('text-muted');
    small.appendChild(document.createTextNode(`Release: ${movieObj.release_date}`));


    div.appendChild(a);
    div.appendChild(inDiv);
    a.appendChild(img);
    inDiv.appendChild(h5);
    inDiv.appendChild(p);
    p.appendChild(small);

    return div;
}

async function displayPopularMovies() {
    showSpinner();
    const { results } = await fetchData('movie/popular');
    // results.splice(8);  // IN CASE WE WANT LESS POPULAR MOVIES
    results.forEach(movie => {
        document.querySelector('#popular-movies').appendChild(createMovieCard(movie));
    });
    setTimeout(hideSpinner, 50);
}

function showSpinner() {
    document.querySelector('.spinner').classList.add('show');
}
function hideSpinner() {
    document.querySelector('.spinner').classList.remove('show');
}

function createShowCard(showObj) {
    const div = document.createElement('div');
    div.classList.add('card');

    const a = document.createElement('a');
    a.setAttribute('href', `tv-details.html?id=${showObj.id}`);

    const img = document.createElement('img');
    img.classList.add('card-img-top');
    if (showObj.poster_path === null) { img.setAttribute('src', '/images/no-image.jpg'); }
    else { img.setAttribute('src', `https://image.tmdb.org/t/p/w500${showObj.poster_path}`); }
    img.setAttribute('alt', `${showObj.name}`);

    const inDiv = document.createElement('div');
    inDiv.classList.add('card-body');

    const h5 = document.createElement('h5');
    h5.classList.add('card-title');
    h5.textContent = showObj.name;

    const p = document.createElement('p');
    p.classList.add('card-text');

    const small = document.createElement('small');
    small.classList.add('text-muted');
    small.appendChild(document.createTextNode(`Release: ${showObj.first_air_date}`));


    div.appendChild(a);
    div.appendChild(inDiv);
    a.appendChild(img);
    inDiv.appendChild(h5);
    inDiv.appendChild(p);
    p.appendChild(small);

    return div;
}

async function displayPopularShows() {
    showSpinner();
    const { results } = await fetchData('tv/popular');
    results.forEach(show => {
        document.querySelector('#popular-shows').appendChild(createShowCard(show));
    });
    setTimeout(hideSpinner, 50);
}

function displayBackground(photoPath) {
    const overlayDiv = document.createElement('div');
    overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original${photoPath})`;
    overlayDiv.style.backgroundPosition = 'center';
    overlayDiv.style.backgroundRepeat = 'no-repeat';
    overlayDiv.style.height = '100vh';
    overlayDiv.style.width = '100vw';
    overlayDiv.style.position = 'fixed';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.zIndex = '-1';
    overlayDiv.style.opacity = '0.1';

    if (global.currentPage === '/movie-details.html')
        document.querySelector('#movie-details').appendChild(overlayDiv);
    else document.querySelector('#show-details').appendChild(overlayDiv);
}

async function displayMovieDetails() {
    let photo;
    showSpinner();
    const movieId = Number(window.location.search.slice(4));
    const movieDetails = await fetchData(`/movie/${movieId}`);
    setTimeout(hideSpinner, 50);

    displayBackground(movieDetails.backdrop_path);

    if (movieDetails.poster_path) {
        photo = `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`;
    } else {
        photo = 'images/no-image.jpg';
    }

    document.querySelector('.details-top').innerHTML = (
        `<div>
        <img
          src="${photo}"
          class="card-img-top"
          alt="${movieDetails.title}"
        />
      </div>
      <div>
        <h2>${movieDetails.title}</h2>
        <p>
          <i class="fas fa-star text-primary"></i>
          ${movieDetails.vote_average.toFixed(2)} / 10
        </p>
        <p class="text-muted">Release Date: ${movieDetails.release_date}</p>
        <p>
          ${movieDetails.overview}
        </p>
        <h5>Genres</h5>
        <ul class="list-group">
        </ul>
        <a href="#" target="_blank" class="btn">Visit Movie Homepage</a>
      </div>`
    )

    movieDetails.genres.forEach(genre => {
        const li = document.createElement('li');
        li.appendChild(document.createTextNode(`${genre.name}`));
        document.querySelector('ul.list-group').appendChild(li);
    });

    document.querySelector('.details-bottom').innerHTML = (
        `<h2>Movie Info</h2>
        <ul>
          <li><span class="text-secondary">Budget:</span> $${movieDetails.budget.toLocaleString('en')}</li>
          <li><span class="text-secondary">Revenue:</span> $${movieDetails.revenue.toLocaleString('en')}</li>
          <li><span class="text-secondary">Runtime:</span> ${movieDetails.runtime} minutes</li>
          <li><span class="text-secondary">Status:</span> ${movieDetails.status}</li>
        </ul>
        <h4>Production Companies</h4>
        <div class="list-group">${movieDetails.production_companies.map(company => `<span>${company.name}</span>`).join(', ')}</div>`
    )
}

async function displayShowDetails() {
    let photo;
    showSpinner();
    const showId = Number(window.location.search.slice(4));
    const showDetails = await fetchData(`/tv/${showId}`);
    console.log(showDetails);
    setTimeout(hideSpinner, 50);

    if (showDetails.poster_path) {
        photo = `https://image.tmdb.org/t/p/w500${showDetails.poster_path}`;
    } else {
        photo = 'images/no-image.jpg';
    }

    document.querySelector('#show-details').innerHTML = (
        `<div id="show-details">
        <div class="details-top">
          <div>
            <img
              src="${photo}"
              class="card-img-top"
              alt="${showDetails.name}"
            />
          </div>
          <div>
            <h2>${showDetails.name}</h2>
            <p>
              <i class="fas fa-star text-primary"></i>
              ${showDetails.vote_average.toFixed(2)} / 10
            </p>
            <p class="text-muted">First Air Date: ${showDetails.first_air_date} </p>
            <p>
              ${showDetails.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
                ${showDetails.genres.map(genre => `<li>${genre.name}</li>`).join('')}
            </ul>
            <a href="#" target="_blank" class="btn">Visit Show Homepage</a>
          </div>
        </div>
        <div class="details-bottom">
          <h2>Show Info</h2>
          <ul>
            <li><span class="text-secondary">Number Of Episodes:</span> ${showDetails.number_of_episodes}</li>
            <li>
              <span class="text-secondary">Last Episode To Air:</span> ${showDetails.last_episode_to_air.name}</li>
            <li><span class="text-secondary">Status:</span> ${showDetails.status}</li>
          </ul>
          <h4>Production Companies</h4>
          <div class="list-group">${showDetails.production_companies.map(company => company.name).join(', ')}</div>
        </div>
      </div>`
    )
    displayBackground(showDetails.backdrop_path);
}

async function displaySwiper() {
    const data = await fetchData('movie/now_playing');

    data.results.forEach(movie => {
        const div = document.createElement('div');
        div.classList.add('swiper-slide');
        div.innerHTML =
            `<a href="movie-details.html?id=${movie.id}">
                <img src="https://image.tmdb.org/t/p/original/${movie.poster_path}" alt="${movie.title}"/>
            </a>
            <h4 class="swiper-rating">
            <i class="fas fa-star text-secondary"></i> ${movie.vote_average} / 10
            </h4>`
        document.querySelector('.swiper-wrapper').appendChild(div);
    })
    initSwiper();
}

function initSwiper() {
    const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        freeMode: true,
        loop: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            500: {
                slidesPerView: 2,
            },
            700: {
                slidesPerView: 3,
            },
            1200: {
                slidesPerView: 4,
            },
        }
    })
}

function showAlert(message, classType = 'error') {
    const alertElem = document.createElement('div');
    alertElem.classList.add('alert');
    alertElem.classList.add(classType);
    alertElem.appendChild(document.createTextNode(message));
    document.querySelector('#alert').appendChild(alertElem);

    setTimeout(() => document.querySelector('.alert').remove(), 3500);
}

async function search() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    global.search.term = urlParams.get('search-term');
    global.search.type = urlParams.get('type');

    if (!(global.search.term !== null && global.search.term !== '')) {
        showAlert('Text field cannot be empty.');
        return;
    }

    const { results, total_pages, page, total_results } = await searchApiData();
    console.log(results, total_pages, page, total_results);

    global.search.page = page;
    global.search.totalPages = total_pages;
    global.search.totalResults = total_results;

    if (results.length === 0) {
        showAlert('No results found.');
        return;
    }

    displaySearchResults(results);
    document.querySelector('#search-term').value = '';
}

function displaySearchResults(results) {
    showSpinner();
    if(global.search.type === 'movie'){
        results.forEach(movie => {
            document.querySelector('#search-results').appendChild(createMovieCard(movie));
        });
    } else {
        results.forEach(show => {
            document.querySelector('#search-results').appendChild(createShowCard(show));
        });
    }
    document.querySelector('#search-results-heading').innerHTML = `
    <h2>${results.length} of ${global.search.totalResults} results for ${global.search.term}</h2>
    `
    displayPagination();
    setTimeout(hideSpinner, 50);
}

function displayPagination() {
    const div = document.createElement('div');
    div.classList.add('pagination');

    div.innerHTML = `<button class="btn btn-primary" id="prev">Prev</button>
        <button class="btn btn-primary" id="next">Next</button>
        <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>`
    document.querySelector('#pagination').appendChild(div);

    // DISABLE BUTTONS IF FIRST/LAST PAGE
    if (global.search.page === 1) {
        document.querySelector('#prev').disabled = true;
    }

    if (global.search.page === global.search.totalPages) {
        document.querySelector('#next').disabled = true;
    }
    // BUTTON CLICKS
    document.querySelector('#next').addEventListener('click', async () => {
        global.search.page++;
        const { results} = await searchApiData();
        document.querySelector('#search-results').innerHTML = '';
        document.querySelector('#pagination').innerHTML = '';
        displaySearchResults(results);
    });
    document.querySelector('#prev').addEventListener('click', async () => {
        global.search.page--;
        const { results} = await searchApiData();
        document.querySelector('#search-results').innerHTML = '';
        document.querySelector('#pagination').innerHTML = '';
        displaySearchResults(results);
    });
}