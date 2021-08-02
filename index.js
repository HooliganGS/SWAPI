const mainContent = document.querySelector('.main__content');
const mainTitle = document.querySelector('.main__title');
const forbiddenKeys = ['name', 'created', 'edited', 'url', 'homeworld'];
const searchForm = document.querySelector('form.search');
const searchInput = searchForm.querySelector('.search__input');
const pagination = document.querySelector('.pagination');
const navList = document.querySelector('.nav__list');
const itemsPerPage = 10;

async function renderData(isPagination, href) {
    const response = await fetch(href);
    if (response.ok) {
        const obj = await response.json();
        const { results } = obj;
        renderMainItems(results);
        if (!isPagination) {
            const countOfPages = Math.ceil(obj.count / itemsPerPage);
            renderPagination(href, countOfPages);
        }
    } else {
        console.log(`ERROR HTTP: ${response.status}`);
    }
}

function clickHandler(e) {
    e.preventDefault();
    const { href } = e.target;
    let isPagination = true;
    if (e.target.classList.contains('nav__category')) {
        isPagination = false;
        mainTitle.textContent = e.target.textContent;
        searchInput.value = '';
    }
    renderData(isPagination, href);
}

function renderMainItems(results) {
    clearListeners();
    mainContent.innerHTML = '';
    for (let i = 0; i < results.length; i++) {
        const itemData = results[i];
        const item = createItem(itemData);
        mainContent.append(item);
    }
}
//old
function clearListeners() {
    const oldItems = mainContent.querySelectorAll('.main__item-wrap');
    if (oldItems) {
        oldItems.forEach(item => {
            item.removeEventListener('click', openCard);
        })
    }
}

function createItem(itemData) {
    const itemWrap = createElem('div', 'main__item-wrap');
    const item = createElem('div', 'main__item item');
    const itemTitle = createElem('h3', 'item__title', itemData.name || itemData.title);
    const itemList = createElem('ul', 'item__list');

    itemWrap.prepend(item);
    item.prepend(itemTitle);
    item.append(itemList);
    for (let key in itemData) {
        if (typeof itemData[key] === 'string') {
            const [categoryName, categoryValue] = textForListItem(itemData, key);

            const listItem = createElem('li', 'item__list-item', categoryName);
            const span = createElem('span', '', categoryValue);

            listItem.append(span);
            itemList.append(listItem);
        }
    }

    itemWrap.addEventListener('click', openCard.bind(null, itemWrap, itemList));
    return itemWrap;
}

function textForListItem(data, key) {
    for (let i = 0; i < forbiddenKeys.length; i++) {
        if (key === forbiddenKeys[i]) {
            return '';
        }
    }
    return convertText(data, key);
}

function convertText(data, key) {
    let [firstPart, secondPart] = key.split('_');
    firstPart = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
    const categoryName = `${firstPart}${secondPart ? ` ${secondPart}` : ''}: `;

return [categoryName, data[key]];
}

function openCard(itemWrap, itemList) {
  if (itemList.classList.contains('open')) {
      itemList.classList.toggle('open');
      itemList.style.height = '';
      itemWrap.style.alignSelf = '';
  } else {
      itemList.classList.toggle('open');
      itemWrap.classList.add('open');
      itemList.style.height = itemList.scrollHeight + 'px';
  }
}

function createElem(elemName = 'div', nameOfClass = '', text = '') {
  const elem = document.createElement(elemName);
  elem.className = nameOfClass;
  elem.textContent = text;
  return elem;
}

function addNavLinksListeners() {
  const navLinks = navList.querySelectorAll('.nav__category');
  navLinks.forEach(item => {
      item.addEventListener('click', clickHandler);
  })
}

function renderPagination(href, countOfPagination) {
  clearPagination();
  if (countOfPagination > 1) {
      const paginationList = createElem('ul', 'pagination__list');
      for (let i = 0; i < countOfPagination; i++) {
          const paginationItem = createElem('li', 'pagination__item');
          const paginationLink = createPaginationLink(href, i + 1);
          paginationLink.addEventListener('click', clickHandler);
          paginationItem.append(paginationLink);
          paginationList.append(paginationItem);
      }
      pagination.prepend(paginationList);
  }
}

function clearPagination() {
  const clearPaginationList = document.querySelector('.pagination__list');
  if (clearPaginationList) {
      const oldLinks = clearPaginationList.querySelectorAll('a');
      oldLinks.forEach(item => item.removeEventListener('click', clickHandler));
      clearPaginationList.remove();
  }
}


function createPaginationLink(href, serialNumber) {
  const link = document.createElement('a');
  link.className = 'pagination__link';
  link.href = href.slice(0, href.length - 1) + serialNumber;
  link.textContent = serialNumber;
  return link;
};

function search(e) {
  e.preventDefault();
  const category = document.querySelector('.main__title').textContent.toLowerCase();
  const searchValue = searchInput.value.trim();
  const href = convertLink(category, searchValue);
  searchInput.value = '';
  renderData(false, href);
}

function convertLink(category, searchValue) {
  return `https://swapi.dev/api/${category}/?search=${searchValue}&page=1`;
}

function addSearchFormListener() {
  searchForm.addEventListener('submit', search);
}

renderData(false, 'https://swapi.dev/api/people/?page=1');
addNavLinksListeners();
addSearchFormListener();