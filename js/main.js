import '../css/style.css';
import { getJSON } from './utils/getJSON';

let books,
  chosenCategoryFilter = 'all',
  chosenAuthorFilter = 'all',
  chosenPriceMinFilter,
  chosenPriceMaxFilter,
  chosenSortOption = 'titleAscending',
  categories = [],
  authors = [],
  cart = [];

async function start() {
  books = await getJSON('/json/books.json');
  getCategories();
  getAuthors();
  addFilters();
  addSortingOptions();
  displayBooks();
}

function sortBooks(books, sortBy) {
  switch (sortBy) {
    case 'titleAscending':
      books.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'titleDescending':
      books.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'priceAscending':
      books.sort((a, b) => a.price - b.price);
      break;
    case 'priceDescending':
      books.sort((a, b) => b.price - a.price);
      break;
    case 'authorAscending':
      books.sort((a, b) => a.author.localeCompare(b.author));
      break;
    case 'authorDescending':
      books.sort((a, b) => b.author.localeCompare(a.author));
      break;
    default:
      break;
  }
}

function getCategories() {
  categories = [...new Set(books.map(book => book.category))];
  categories.sort();
}

function getAuthors() {
  authors = [...new Set(books.map(book => book.author))];
  authors.sort();
}

function addFilters() {
  document.querySelector('.filters').innerHTML = /*html*/`
    <label><span>Filter by category:</span>
      <select class="categoryFilter">
        <option value="all">All</option>
        ${categories.map(category => `<option value="${category}">${category}</option>`).join('')}
      </select>
    </label>
    <label><span>Filter by author:</span>
      <select class="authorFilter">
        <option value="all">All</option>
        ${authors.map(author => `<option value="${author}">${author}</option>`).join('')}
      </select>
    </label>
    <label><span>Filter by price:</span>
      <input type="number" class="priceMinFilter" placeholder="Min price">
      <input type="number" class="priceMaxFilter" placeholder="Max price">
    </label>
    <button class="btn btn-primary" id="filterBtn">Filter</button>
  `;

  document.querySelector('.categoryFilter').addEventListener('change', event => {
    chosenCategoryFilter = event.target.value;
    displayBooks();
  });

  document.querySelector('.authorFilter').addEventListener('change', event => {
    chosenAuthorFilter = event.target.value;
    displayBooks();
  });

  document.getElementById('filterBtn').addEventListener('click', () => {
    chosenPriceMinFilter = parseFloat(document.querySelector('.priceMinFilter').value) || undefined;
    chosenPriceMaxFilter = parseFloat(document.querySelector('.priceMaxFilter').value) || undefined;
    displayBooks();
  });
}

function addSortingOptions() {
  document.querySelector('.sortingOptions').innerHTML = /*html*/`
    <label><span>Sort by:</span>
      <select class="sortOption">
        <option value="titleAscending">Title (A-Z)</option>
        <option value="titleDescending">Title (Z-A)</option>
        <option value="priceAscending">Price (Low-High)</option>
        <option value="priceDescending">Price (High-Low)</option>
        <option value="authorAscending">Author (A-Z)</option>
        <option value="authorDescending">Author (Z-A)</option>
      </select>
    </label>
  `;

  document.querySelector('.sortOption').addEventListener('change', event => {
    chosenSortOption = event.target.value;
    displayBooks();
  });
}

function displayBooks() {
  let filteredBooks = books.filter(book =>
    (chosenCategoryFilter === 'all' || book.category === chosenCategoryFilter) &&
    (chosenAuthorFilter === 'all' || book.author === chosenAuthorFilter) &&
    (chosenPriceMinFilter === undefined || book.price >= chosenPriceMinFilter) &&
    (chosenPriceMaxFilter === undefined || book.price <= chosenPriceMaxFilter)
  );

  sortBooks(filteredBooks, chosenSortOption);

  const bookCards = filteredBooks.map(book => /*html*/`
    <div class="col-md-3 mb-4 d-flex align-items-stretch">
      <div class="card">
        <img src="${book.image}" class="card-img-top" alt="${book.title}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${book.title}</h5>
          <p class="card-text">${book.author}</p>
          <p class="card-text mt-auto">$${book.price.toFixed(2)}</p>
          <div class="d-flex justify-content-between mt-3">
            <button class="btn btn-primary btn-detail" data-id="${book.id}">Details</button>
            <button class="btn btn-success btn-buy" data-id="${book.id}">Buy</button>
          </div>
        </div>
      </div>
    </div>
  `);

  document.querySelector('.bookList').innerHTML = bookCards.join('');

  // Attach event listeners after rendering the books
  document.querySelectorAll('.btn-detail').forEach(button => {
    button.addEventListener('click', event => {
      const bookId = event.target.getAttribute('data-id');
      console.log(`Detail button clicked for book ID: ${bookId}`);
      showBookDetail(bookId);
    });
  });

  document.querySelectorAll('.btn-buy').forEach(button => {
    button.addEventListener('click', event => {
      const bookId = event.target.getAttribute('data-id');
      console.log(`Buy button clicked for book ID: ${bookId}`);
      addToCart(bookId);
    });
  });
}

function showBookDetail(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  console.log(`Showing details for book ID: ${bookId}`);

  document.querySelector('.bookDetail').innerHTML = /*html*/`
    <div class="card mb-4 shadow-sm">
      <img src="${book.image}" class="card-img-top" alt="${book.title}">
      <div class="card-body">
        <h5 class="card-title">${book.title}</h5>
        <p class="card-text">${book.author}</p>
        <p class="card-text">$${book.price.toFixed(2)}</p>
        <p class="card-text">${book.description}</p>
        <div class="d-flex justify-content-between">
          <button class="btn btn-success btn-buy" data-id="${book.id}">Buy</button>
          <button class="btn btn-secondary btn-back">Back</button>
        </div>
      </div>
    </div>
  `;

  document.querySelector('.btn-back').addEventListener('click', () => {
    console.log('Back button clicked');
    document.querySelector('.bookDetail').innerHTML = '';
  });

  document.querySelector('.btn-buy').addEventListener('click', event => {
    const bookId = event.target.getAttribute('data-id');
    console.log(`Buy button clicked from details for book ID: ${bookId}`);
    addToCart(bookId);
  });
}

document.getElementById('cartToggleBtn').addEventListener('click', () => {
  console.log('Toggle cart button clicked');
  document.querySelector('.shoppingCart').classList.toggle('d-none');
});

function addToCart(bookId) {
  const book = books.find(b => b.id === bookId);
  if (!book) return;

  console.log(`Adding book ID: ${bookId} to cart`);

  const cartItem = cart.find(item => item.book.id === bookId);
  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({ book, quantity: 1 });
  }
  updateCart();
}

function updateCart() {
  const cartContent = cart.map(item => /*html*/`
    <div class="cart-item">
      <span class="cart-item-title">${item.book.title}</span>
      <span class="cart-item-quantity">${item.quantity}</span>
      <span class="cart-item-price">$${item.book.price.toFixed(2)}</span>
      <span class="cart-item-total">$${(item.book.price * item.quantity).toFixed(2)}</span>
    </div>
  `).join('');

  const totalSum = cart.reduce((sum, item) => sum + item.book.price * item.quantity, 0).toFixed(2);

  document.querySelector('.shoppingCart').innerHTML = /*html*/`
    ${cartContent}
    <div class="cart-total">Total: $${totalSum}</div>
  `;
}

start();
