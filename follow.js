const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const SHOW_URL = BASE_URL + "/:id/";

const dataPanel = document.querySelector("#data-panel");
const SEARCH_FORM = document.querySelector("#search-form");
const SEARCH_INPUT = document.querySelector("#search-input");
const follow = document.querySelector("#follow");

const persons = JSON.parse(localStorage.getItem("followsList"));
let filterPersons = [];

// render Person List
function renderPersonList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `<div class="card w-25 text-center">
        <button type="button" class="border border-white" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
          <img src="${item.avatar}" class="card-img-top rounded-3" alt="..." data-id="${item.id}" >
        </button>
        <div class="card-body">
          <p class="card-text">
            ${item.name}  ${item.surname}
          </p>
          <button type="button" class="btn btn-danger" id="follow" data-id="${item.id}">UnFollow</button>
        </div>
      </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

// show Person Modal
function showPersonModal(id) {
  const modalTitle = document.querySelector("#staticBackdropLabel");
  const modalBody = document.querySelector(".modal-body");
  axios.get(INDEX_URL + id)
    .then((response) => {
    const data = response.data;
    modalTitle.innerText = data.name + " " + data.surname;
    modalBody.innerHTML = `
          <img src="${data.avatar}" class="card-img-top rounded-3 mb-3 w-100" alt="..." >
          <p class="text-capitalize">gender: ${data.gender}</p>
          <p class="text-capitalize">age: ${data.age}</p>
          <p class="text-capitalize">region: ${data.region}</p>
          <p class="text-capitalize">birthday: ${data.birthday}</p>
          <p>Email: ${data.email}</p>`
    })
    .catch(ero => console.log(ero))
}

function removefollow(id) {
  if (!persons) return

  const personIndex = persons.findIndex(person => person.id === id)
  if (personIndex === -1) return

  persons.splice(personIndex, 1)
  localStorage.removeItem('followsList', JSON.stringify(persons))
  renderPersonList(persons)
}

// listen SEARCH_FORM
SEARCH_FORM.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyWords = SEARCH_INPUT.value.trim().toLowerCase();
  // if (!keyWords.length) {
  //   // rendeasdasdrPersonList(persons);
  //   return alert("請輸入有效字串！");
  // }
  filterPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(keyWords)
  );
  if (filterPersons.length > 0) {
    renderPersonList(filterPersons);
  } else {
    alert("査無資料");
    renderPersonList(persons);
  }
});

// listen data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".card-img-top")) {
    showPersonModal(event.target.dataset.id);
  } else if (event.target.matches("#follow")) {
    removefollow(Number(event.target.dataset.id))
  }
});

renderPersonList(persons)