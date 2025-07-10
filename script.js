const API_KEY = "ed831ee3f6385120dbb46f374561b1cc";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const IMAGE_BANNER_URL = "https://image.tmdb.org/t/p/w1280";

//logika untuk film populer
const film = getMoviesPopular();
function getMoviesPopular() {
  return fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      popularUi(data.results);
    });
}

//fungsi untuk nampilkan daftar film populer
function popularUi(popular) {
  let cards = "";
  popular.forEach((m) => {
    cards += kartuView(m);
  });
  const kartuFilm = document.querySelector(".card-session");
  kartuFilm.innerHTML = cards;
}

//card untuk film
const kartuView = (m) => {
  const posterUrl = m.poster_path
    ? `${IMAGE_BASE_URL}${m.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  return `<div class="col-12 col-sm-6 col-md-4 col-lg-3 my-3">
  <div class="card h-100">
  <img src="${posterUrl}" class="card-img-top" alt="${m.title}">
  <div class="card-body">
    <h5 class="card-title">${m.title}</h5>
     <h6 class="card-subtitle mb-2 text-muted">${m.release_date.substring(
       0,
       4
     )}</h6>
    <a href="#" class="btn btn-primary modal-detail-button" data-bs-toggle="modal"
      data-bs-target="#movieDetailModal" data-movieid="${m.id}">Detail</a> 
  </div>
</div>
</div>`;
};

//logika untuk detail
document.addEventListener("click", async function (e) {
  if (e.target.classList.contains("modal-detail-button")) {
    const tmdbId = e.target.dataset.movieid;
    const movieDetails = await getDetails(tmdbId);
    const castCrew = await getDetailsCredit(tmdbId);
    const ageRating = await getDetailsAge(tmdbId);
    detailPopular(castCrew, movieDetails, ageRating);
  }

  // Logika untuk tombol "See Trailer"
  if (e.target.classList.contains("btn-trailer")) {
    const tmdbId = e.target.dataset.movieid;
    if (!tmdbId) return; // Hentikan jika tidak ada movie id

    const videos = await getVideos(tmdbId);
    const trailer = videos.results.find(
      (video) => video.type === "Trailer" && video.site === "YouTube"
    );

    if (trailer) {
      window.open(`https://www.youtube.com/watch?v=${trailer.key}`, "_blank");
    } else {
      alert("Trailer untuk film ini tidak ditemukan.");
    }
  }
});

function getDetailsCredit(tmdbId) {
  return fetch(`${BASE_URL}/movie/${tmdbId}/credits?api_key=${API_KEY}`)
    .then((Response) => Response.json())
    .then((m) => m);
}

function getDetails(tmdbId) {
  return fetch(`${BASE_URL}/movie/${tmdbId}?api_key=${API_KEY}`)
    .then((Response) => Response.json())
    .then((n) => n);
}

function getDetailsAge(tmdbId) {
  return fetch(
    `${BASE_URL}/movie/${tmdbId}/release_dates?api_key=${API_KEY}`
  ).then((response) => response.json());
}

function getVideos(tmdbId) {
  return fetch(`${BASE_URL}/movie/${tmdbId}/videos?api_key=${API_KEY}`).then(
    (response) => response.json()
  );
}

function detailPopular(m, n, age) {
  const detailMovieModal = document.querySelector(".modal-body");
  detailMovieModal.innerHTML = showDetail(m, n, age);

  const trailerButton = document.querySelector(
    "#movieDetailModal .btn-trailer"
  );
  if (trailerButton) {
    trailerButton.dataset.movieid = n.id;
  }
}

function showDetail(m, n, age) {
  let ageRating = "";
  const director = m.crew.find((person) => person.job === "Director");
  const year = n.release_date ? n.release_date.substring(0, 4) : "N/A";
  const actors = m.cast
    .slice(0, 5)
    .map((nama) => nama.name)
    .join(", ");
  const posterUrl = n.poster_path
    ? `${IMAGE_BASE_URL}${n.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  // Cari data untuk negara Indonesia ('ID') atau Amerika ('US') sebagai cadangan
  const countryData =
    age.results.find((r) => r.iso_3166_1 === "ID") ||
    age.results.find((r) => r.iso_3166_1 === "US");
  if (countryData) {
    // Cari sertifikasi pertama yang tidak kosong
    const release = countryData.release_dates.find((rd) => rd.certification);
    if (release) {
      ageRating = release.certification;
    }
  }

  return `<div class="container-fluid">
        <div class="row">
            <div class="col-md-4">
                <img src="${posterUrl}" alt="${
    n.title
  }" class="img-fluid rounded" />
            </div>
            <div class="col-md-8">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        <h3 class="mb-1">${n.title}</h3>
                        <small class="text-body-secondary">${year}</small>
                    </li>
                    <li class="list-group-item">
                        <strong>Director:</strong> ${
                          director ? director.name : "N/A"
                        }
                    </li>
                    <li class="list-group-item">
                        <strong>Actors:</strong> ${actors ? actors : "N/A"}
                    </li>
                    <li class="list-group-item">
                        <strong>Genre:</strong> ${n.genres
                          .map((g) => g.name)
                          .join(", ")}
                    </li>
                    <li class="list-group-item">
                        <strong>Plot:</strong><br>
                        ${n.overview}
                    </li>
                     <li class="list-group-item">
                        <strong>Rating Age:</strong><br>
                        ${ageRating}
                    </li>
                      <li class="list-group-item">
                        <strong>Rating :</strong><br>
                        ${n.vote_average.toFixed(1)}/10
                    </li>
                </ul>
            </div>
        </div>
    </div>`;
}
//akhir logika detail

//logika searching
const search = document.querySelector(".search-btn");
search.addEventListener("click", async function (e) {
  e.preventDefault();

  try {
    const keywordInput = document.querySelector(".input-keyword");
    const query = keywordInput.value;
    if (!query) {
      // Jangan lakukan apa-apa jika input kosong
      return;
    }
    const valueInput = await getSearchMovie(keywordInput.value);
    if (valueInput.length === 0) {
      alert(`Film dengan judul "${query}" tidak ditemukan.`);
    } else {
      //  const searchCredit = await getCreditSearch();
      const trendingTitle = document.querySelector(".container h2");
      trendingTitle.innerHTML = `Hasil Pencarian untuk: "${query}"`;

      popularUi(valueInput);
      document.addEventListener("click", async function (e) {
        if (e.target.classList.contains("modal-detail-button")) {
          const tmdbId = e.target.dataset.movieid;
          const movieDetails = await getDetails(tmdbId);
          const castCrew = await getDetailsCredit(tmdbId);
          const ageRating = await getDetailsAge(tmdbId);
          detailPopular(castCrew, movieDetails, ageRating);
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

function getSearchMovie(keywordInput) {
  return fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${keywordInput}`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => data.results);
}
//akhir logika searching

const home = document.querySelector(".Home-click");

home.addEventListener("click", function (e) {
  e.preventDefault();
  const trendingTitle = document.querySelector(".container h2");
  trendingTitle.innerHTML = "TRENDING NOW";

  getMoviesPopular();
});

getBannerFilm();
//logika untuk banner
function getBannerFilm() {
  return fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`)
    .then((response) => response.json())
    .then((data) => {
      const topFiveMovies = data.results.slice(0, 6);
      carouselUi(topFiveMovies);
    });
}

function carouselUi(data) {
  let banner = "";
  let bannerButton = "";
  data.forEach((m, index) => {
    const isActive = index === 0;
    banner += showCarousel(m, isActive);
    bannerButton += showCarouselButton(index, isActive);
  });

  const carouselButton = document.querySelector(".carousel-indicators");
  const carouselBanner = document.querySelector(".carousel-inner");

  carouselButton.innerHTML = bannerButton;
  carouselBanner.innerHTML = banner;
}

function showCarousel(data, isActive) {
  const bannerImg = data.backdrop_path
    ? `${IMAGE_BANNER_URL}${data.backdrop_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  const activeClass = isActive ? "active" : "";

  return ` <div class="carousel-item ${activeClass}">
            <img src="${bannerImg}" class="d-block w-100 rounded" alt="${data.title}" />
            <div class="carousel-caption d-none d-md-block">
              <h1>${data.title}</h1>
              <p>
                ${data.overview}
              </p>
            </div>
          </div>`;
}

function showCarouselButton(index, isActive) {
  const activeClass = isActive ? `class="active" aria-current="true"` : "";

  return `<button
            type="button"
            data-bs-target="#carouselExampleCaptions"
            data-bs-slide-to="${index}"
            ${activeClass}
            aria-label="Slide ${index + 1}"
          ></button>`;
}
//akhir logika untuk banner
