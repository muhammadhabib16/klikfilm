const BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = "ed831ee3f6385120dbb46f374561b1cc";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w1280";

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

      tvSeriesUi(valueInput);
      document.addEventListener("click", async function (e) {
        if (e.target.classList.contains("modal-detail-button")) {
          const tmdbId = e.target.dataset.tvid;
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
  return fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${keywordInput}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => data.results);
}
//akhir logika searching

//logika tv series

//logika tv series populer
getTvSeries();

function getTvSeries() {
  return fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}`)
    .then((response) => response.json())
    .then((data) => tvSeriesUi(data.results));
}

function tvSeriesUi(data) {
  let series = "";
  data.forEach((m) => (series += kartuView(m)));
  const tvCard = document.querySelector(".card-session");
  tvCard.innerHTML = series;
}

const kartuView = (m) => {
  const posterUrl = m.poster_path
    ? `${IMAGE_BASE_URL}${m.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  return `<div class="col-12 col-sm-6 col-md-4 col-lg-3 my-3">
  <div class="card h-100">
  <img src="${posterUrl}" class="card-img-top" alt="${m.name}">
  <div class="card-body">
    <h5 class="card-title">${m.name}</h5>
     <h6 class="card-subtitle mb-2 text-muted">${m.first_air_date.substring(
       0,
       4
     )}</h6>
    <a href="#" class="btn btn-primary modal-detail-button" data-bs-toggle="modal"
      data-bs-target="#movieDetailModal" data-tvid="${m.id}">Detail</a> 
  </div>
</div>
</div>`;
};
//akhir logika tv series populer

//logika detail tv series
document.addEventListener("click", async function (e) {
  if (e.target.classList.contains("modal-detail-button")) {
    const tmdbId = e.target.dataset.tvid;
    const movieDetails = await getDetails(tmdbId);
    const castCrew = await getDetailsCredit(tmdbId);
    const ageRating = await getDetailsAge(tmdbId);
    detailPopular(castCrew, movieDetails, ageRating);
  }

  // Logika untuk tombol "See Trailer"
  if (e.target.classList.contains("btn-trailer")) {
    const tmdbId = e.target.dataset.tvid;
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
  return fetch(`${BASE_URL}/tv/${tmdbId}/credits?api_key=${API_KEY}`)
    .then((Response) => Response.json())
    .then((m) => m);
}

function getDetails(tmdbId) {
  return fetch(`${BASE_URL}/tv/${tmdbId}?api_key=${API_KEY}`)
    .then((Response) => Response.json())
    .then((n) => n);
}

function getDetailsAge(tmdbId) {
  return fetch(
    `${BASE_URL}/tv/${tmdbId}/content_ratings?api_key=${API_KEY}`
  ).then((response) => response.json());
}

function getVideos(tmdbId) {
  return fetch(`${BASE_URL}/tv/${tmdbId}/videos?api_key=${API_KEY}`).then(
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
    trailerButton.dataset.tvid = n.id;
  }
}

function showDetail(m, n, age) {
  const year = n.first_air_date ? n.first_air_date.substring(0, 4) : "N/A";
  const actors = m.cast
    .slice(0, 5)
    .map((nama) => nama.name)
    .join(", ");
  const posterUrl = n.poster_path
    ? `${IMAGE_BASE_URL}${n.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";

  let ageRating = "N/A";
  const ratingData = age.results.find((r) => r.iso_3166_1 === "US"); // Cari rating untuk US
  if (ratingData && ratingData.rating) {
    ageRating = ratingData.rating;
  }

  return `<div class="container-fluid">
        <div class="row">
            <div class="col-md-4">
                <img src="${posterUrl}" alt="${
    n.name
  }" class="img-fluid rounded" />
            </div>
            <div class="col-md-8">
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">
                        <h3 class="mb-1">${n.name}</h3>
                        <small class="text-body-secondary">${year}</small>
                    </li>
                    <li class="list-group-item">
                        <strong>Status:</strong> ${n.status}
                    </li>
                    <li class="list-group-item">
                        <strong>Actors/Characters :</strong> ${
                          actors ? actors : "N/A"
                        }
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
