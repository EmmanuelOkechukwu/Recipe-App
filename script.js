const mealsEl = document.getElementById("meals");
const favouriteContainer = document.getElementById("fav-meals");

const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/random.php"
  );
  const respData = await resp.json();
  const randomMeal = respData.meals[0];

  //   console.log(randomMeal);

  addMeal(randomMeal, true);
}

async function getMealsById(id) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/lookup.php?1=" + id
  );

  const respData = await resp.json();

  const meal = respData.meals[0];

  return meal;
}

async function getMealsBySearch(term) {
  const resp = await fetch(
    "https://www.themealdb.com/api/json/v1/1/search.php?s=" + term
  );

  const respData = await resp.json();
  const meals = respData.meals;

  return meals;
}

function addMeal(mealData, random = false) {
  // console.log(mealData);

  const meal = document.createElement("div");
  meal.classList.add("meal");

  meal.innerHTML = ` 
          <div class="meal-header">
            ${random ? `<span class="random"> Random Recipe </span>` : ""}
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}" />
          </div>
          <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
              <i class="fas fa-heart"></i>
            </button>
          </div>
        `;

  const btn = meal.querySelector(".meal-body .fav-btn");
  btn.addEventListener("click", () => {
    if (btn.classList.contains("active")) {
      removeMealsFromLocalStorage(mealData.idMeal);
      btn.classList.remove("active");
    } else {
      addMealsToLocalStorage(mealData.idMeal);
      btn.classList.add("active");
    }

    // clean the container
    fetchFavMeals();
  });
  mealsEl.appendChild(meal);
}

function addMealsToLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();

  localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
}

function removeMealsFromLocalStorage(mealId) {
  const mealIds = getMealsFromLocalStorage();

  localStorage.setItem(
    "mealIds",
    JSON.stringify(mealIds.filter((id) => id !== mealId))
  );
}

function getMealsFromLocalStorage(meal) {
  const mealIds = JSON.parse(localStorage.getItem("mealIds"));

  return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
  // clear the container
  favouriteContainer.innerHTML = "";

  const mealIds = getMealsFromLocalStorage();

  for (let i = 0; i < mealIds.length; i++) {
    const mealId = mealIds[i];
    meal = await getMealsById(mealId);

    addMeal(meal);
  }

  // console.log(meals);
}

function addMealToFav(mealData) {
  const favMeal = document.createElement("li");

  favMeal.innerHTML = `
  <img
  src="${mealData.strMealThumb}"
  alt="${mealData.strMeal}"
  /><span>${mealData.strMeal}</span>
  <button class="clear">
    <i class="fas fa-window-close"></i>
  </button>
  `;

  const btn = favMeal.querySelector(".clear");
  btn.addEventListener("click", () => {
    removeMealsFromLocalStorage(mealData.idMeal);

    fetchFavMeals();
  });

  favouriteContainer.appendChild(favMeal);
  // console.log(favouriteContainer);
}

searchBtn.addEventListener("click", async () => {
  // clear container
  mealsEl.innerHTML = "";

  const search = searchTerm.value;
  const meals = await getMealsBySearch(search);
  if (meals) {
    meals.forEach((meal) => {
      addMeal(meal);
    });
  }
});
