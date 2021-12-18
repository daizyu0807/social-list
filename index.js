const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const SHOW_URL = BASE_URL + "/:id/";

const dataPanel = document.querySelector("#data-panel");
const SEARCH_FORM = document.querySelector("#search-form");
const SEARCH_INPUT = document.querySelector("#search-input");
const follow = document.querySelector("#follow");
const paginator = document.querySelector('#paginator')

const dataPerPage = 20 // 分頁資料筆數
const paginationPerLayer = 5 // 每層分頁數量
let LayerOfPaginator = 0 // 分頁層數

const persons = [];
let filterPersons = [];

// API for persons
axios
  .get(INDEX_URL)
  .then((response) => {
    persons.push(...response.data.results);
    renderPersonList(getDataByPage(1)); // 顯示第一頁資料
    renderPaginator(persons.length / dataPerPage) 
  })
  .catch((err) => console.log(err));

// render paginator
function renderPaginator(amount) {
  const pageStart = LayerOfPaginator * paginationPerLayer + 1 // 分頁起始頁面
  const pageEnd = pageStart + paginationPerLayer // 分頁結束頁面

  let rawHTML = `
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Previous" data-page="" data-control="Previous">
        <span data-control="Previous" aria-hidden="true">&laquo;</span>
      </a>
    </li>`
  for (page = pageStart; page < pageEnd; page++) { // 迴圈產出所有分頁
    if (page > amount) {
      break
    }
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  rawHTML += `
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Next" data-page="" data-control="Next">
        <span data-control="Next" aria-hidden="true">&raquo;</span>
      </a>
    </li>`
  paginator.innerHTML = rawHTML

  // 第一分頁顯示為 active 樣式
  let activeItem = document.querySelector('.page-item').nextSibling 
  activeItem.classList += ' active'  
}

// get Persons By Page
function getDataByPage(page) {
  const data = filterPersons.length ? filterPersons : persons // 資料來源為查詢或原資料
  const startIndex = (page - 1) * dataPerPage

  return data.slice(startIndex, startIndex + dataPerPage) // 處理畫面顯示資料範圍
}

// render Person List
function renderPersonList(data) {
  let rawHTML =''
  data.forEach((item) => { // 迴圈顯示畫面資料
    rawHTML += `<div class="card w-25 text-center">
        <div type="button" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
          <img src="${item.avatar}" class="card-img-top rounded-3" alt="..." data-id="${item.id}" >
        </div>
        <div class="card-body">
          <p class="card-text">
            ${item.name}  ${item.surname}
          </p>
          <button type="button" class="btn btn-primary" id="follow" data-id="${item.id}">Follow</button>
        </div>
      </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}

// show Person Modal
function showPersonModal(id) {
  const modalTitle = document.querySelector("#staticBackdropLabel");
  const modalBody = document.querySelector(".modal-body");
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data;
    modalTitle.innerText = data.name + " " + data.surname;
    modalBody.innerHTML = `
          <img src="${data.avatar}" class="card-img-top rounded-3 mb-3 w-100" alt="..." >
          <p class="text-capitalize">gender: ${data.gender}</p>
          <p class="text-capitalize">age: ${data.age}</p>
          <p class="text-capitalize">region: ${data.region}</p>
          <p class="text-capitalize">birthday: ${data.birthday}</p>
          <p>Email: ${data.email}</p>
    `;
  });
}

// add follow
function newFollow(id) {
  const list = JSON.parse(localStorage.getItem("followsList")) || [];
  const followPerson = persons.find(followPerson => followPerson.id === id)

  if (list.some(followPerson => followPerson.id === id)) {
    return alert('already follow')
  }

  list.push(followPerson)
  localStorage.setItem('followsList', JSON.stringify(list))
}

// listen SEARCH_FORM
SEARCH_FORM.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyWords = SEARCH_INPUT.value.trim().toLowerCase();

  filterPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(keyWords)
  );
  if (filterPersons.length) {
    LayerOfPaginator = 0
    renderPersonList(getDataByPage(1)); // 查詢後顯示第一頁資料
    renderPaginator(Math.ceil(filterPersons.length / dataPerPage)) // 根據查詢結果重新產出分頁器
  } else {
    alert("査無資料");
  }
});

// listen data panel
dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".card-img-top")) {
    showPersonModal(event.target.dataset.id);
  } else if (event.target.matches("#follow")) {
    newFollow(Number(event.target.dataset.id))
  }
});

// listen to paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  const targetPage = event.target.dataset.page
  // 根據有無查詢宣告總分頁數
  const paginationAmount = Math.ceil(filterPersons.length ? filterPersons.length / dataPerPage : persons.length / dataPerPage)

  if (event.target.dataset.control === "Previous") { // 監聽點擊 previous
    if (LayerOfPaginator > 0) {
      LayerOfPaginator -= 1 // 減少分頁層
      renderPaginator(paginationAmount) // 重新產出分頁器
      let activePageData = document.querySelector('#paginator .active').firstChild.dataset.page // 取得當下已點擊頁碼
      renderPersonList(getDataByPage(activePageData)) // 根據已點擊頁碼產生頁面
    }
    
  } else if (event.target.dataset.control === "Next") { // 監聽點擊 next
    if (LayerOfPaginator + 1 < Math.ceil(paginationAmount / paginationPerLayer)) {
      LayerOfPaginator += 1 // 增加分頁層
      renderPaginator(paginationAmount) // 重新產出分頁器
      let activePageData = document.querySelector('#paginator .active').firstChild.dataset.page // 取得當下已點擊頁碼
      renderPersonList(getDataByPage(activePageData)) // 根據已點擊頁碼產生頁面
    }
  } else {
    renderPersonList(getDataByPage(targetPage)) // 根據已點擊頁碼產生頁面
    changePaginatorStyle(event) // 點擊目標增加 active樣式
  }
})

// 變更點擊分頁樣式
function changePaginatorStyle(event) {
  let currentActive = document.querySelector('#paginator .active')
  currentActive.classList.remove('active')
  event.target.parentElement.classList += ' active'
}
