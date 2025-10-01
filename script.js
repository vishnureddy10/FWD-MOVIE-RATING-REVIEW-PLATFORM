// ✅ OMDb API key
const OMDB_API_KEY = "646f1c3a";

// ✅ RapidAPI IMDb232 (for news)
const RAPID_KEY = "410606497cmsha703f8ef6af47efp102027jsn5f9edba52e3b";
const RAPID_HOST = "imdb232.p.rapidapi.com";

// Store reviews + ratings locally
let reviewsDB = {};

// 🎬 Search movies using OMDb
async function searchMovie() {
  const query = document.getElementById("searchInput").value.trim();
  if (!query) return;

  const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.Response === "True") {
      displayMovies(data.Search);
    } else {
      document.getElementById("movies").innerHTML = `<p>No results found.</p>`;
    }
  } catch (err) {
    console.error("Error searching movie:", err);
  }
}

// 📰 Load celebrity/movie news from RapidAPI
async function getNews() {
  const url = "https://imdb232.p.rapidapi.com/api/news/get-by-category?limit=10&category=CELEBRITY";
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-key": RAPID_KEY,
        "x-rapidapi-host": RAPID_HOST
      }
    });
    const data = await res.json();
    displayNews(data?.news || []);
  } catch (err) {
    console.error("Error fetching news:", err);
  }
}

// 🎥 Display movies
function displayMovies(movies) {
  const container = document.getElementById("movies");
  container.innerHTML = "";

  movies.forEach(movie => {
    const poster = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/250x350?text=No+Image";
    const title = movie.Title;
    const year = movie.Year;
    const id = movie.imdbID;

    const div = document.createElement("div");
    div.className = "movie";
    div.innerHTML = `
      <img src="${poster}" alt="${title}">
      <h3>${title} (${year})</h3>

      <!-- ⭐ Star Rating -->
      <div class="stars" id="stars-${id}">
        ${[1,2,3,4,5].map(n => `<span class="star" data-value="${n}">&#9734;</span>`).join("")}
      </div>

      <button onclick="addReview('${id}', '${title}')">Write Review</button>
      <div class="reviews" id="reviews-${id}"></div>
    `;

    container.appendChild(div);

    // Setup star rating
    setupRating(id);

    // Restore reviews & rating
    if (reviewsDB[id]) {
      updateReviewsUI(id);
      if (reviewsDB[id].rating) {
        updateStarsUI(id, reviewsDB[id].rating);
      }
    }
  });
}

// 📰 Display news
function displayNews(newsList) {
  const container = document.getElementById("movies");
  const section = document.createElement("div");
  // section.innerHTML = "<h2>Latest Celebrity News</h2>";

  newsList.forEach(item => {
    const div = document.createElement("div");
    div.className = "movie";
    div.innerHTML = `
      <img src="${item.image || "https://via.placeholder.com/250x150"}" alt="News">
      <h3>${item.headline}</h3>
      <a href="${item.link}" target="_blank">Read More</a>
    `;
    section.appendChild(div);
  });

  container.appendChild(section);
}

// ⭐ Add a review
function addReview(id, title) {
  const review = prompt(`Write your review for "${title}":`);
  if (review) {
    if (!reviewsDB[id]) reviewsDB[id] = { reviews: [], rating: 0 };
    reviewsDB[id].reviews.push(review);
    updateReviewsUI(id);
    saveReviews();
  }
}

// 🔄 Update reviews UI
function updateReviewsUI(id) {
  const container = document.getElementById(`reviews-${id}`);
  if (!reviewsDB[id]) return;
  container.innerHTML = reviewsDB[id].reviews
    .map(r => `<div class="review">⭐ ${r}</div>`)
    .join("");
}

// ⭐ Handle star rating
function setupRating(id) {
  const stars = document.querySelectorAll(`#stars-${id} .star`);
  stars.forEach(star => {
    star.addEventListener("click", () => {
      const rating = star.getAttribute("data-value");
      if (!reviewsDB[id]) reviewsDB[id] = { reviews: [], rating: 0 };
      reviewsDB[id].rating = rating;
      updateStarsUI(id, rating);
      saveReviews();
    });
  });
}

// 🔄 Update star UI
function updateStarsUI(id, rating) {
  const stars = document.querySelectorAll(`#stars-${id} .star`);
  stars.forEach(star => {
    if (parseInt(star.getAttribute("data-value")) <= rating) {
      star.innerHTML = "&#9733;"; // filled star
      star.style.color = "#FFD700"; // gold
    } else {
      star.innerHTML = "&#9734;"; // empty star
      star.style.color = "#aaa";
    }
  });
}

// 💾 Save reviews to localStorage
function saveReviews() {
  localStorage.setItem("movieReviews", JSON.stringify(reviewsDB));
}

// 📂 Load reviews from localStorage
function loadReviews() {
  const saved = localStorage.getItem("movieReviews");
  if (saved) {
    reviewsDB = JSON.parse(saved);
  }
}

// 🚀 Init
loadReviews();
getNews(); // load news on startup
