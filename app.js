let user = JSON.parse(localStorage.getItem("USER")) || {};
let accounts = JSON.parse(localStorage.getItem("ACCOUNTS")) || [];
localStorage.setItem("USER", JSON.stringify(user));
localStorage.setItem("ACCOUNTS", JSON.stringify(accounts));

// add to cart and fav handler
function itemActions(payload, type, button) {
  if (!user.name) {
    toastPopup("You need to log in");
    return;
  }
  let btnText = "";
  // check if the item does already exists
  const item = user[type].find(({ id }) => id === payload.id);

  if (type === "cart") {
    if (item) {
      item.qty += 1;
      toastPopup(`${payload.name} quantity increased in cart!`);
    } else {
      user.cart.push({ ...payload, qty: 1 });
      toastPopup(`${payload.name} added to cart!`);
    }
    btnText = `Added (${item?.qty || 1})`;
  } else if (type === "favorite") {
    if (item) {
      user.favorite = user.favorite.filter(({ id }) => id !== payload.id);
      btnText = `<i class="fa-regular fa-heart"></i>`;
    } else {
      user.favorite.push(payload);
      btnText = `<i class="fa-solid fa-heart" style="color: #fa0000;"></i>`;
    }
  }

  // update local storage
  localStorage.setItem("USER", JSON.stringify(user));

  // update user in accounts array
  let authIndex = accounts.findIndex((acc) => acc.email === user.email);
  if (authIndex !== -1) {
    accounts[authIndex] = user;
    localStorage.setItem("ACCOUNTS", JSON.stringify(accounts));
  }

  // update button text immediately
  button.innerHTML = btnText;
}

function toastPopup(text) {
  const toast = document.getElementById("toast");
  toast.innerHTML = text;
  toast.style.transform = "translate(-50%,-100%)";
  setTimeout(() => {
    toast.style.transform = "translate(-50%,100%)";
    setTimeout(() => {
      text == "account created successfully" && window.location.reload();
    }, 500);
  }, 1500);
}

document.addEventListener("DOMContentLoaded", () => {
  const currUrl = location.pathname.split("/").pop();
  const API = "https://cdn.getsolo.io/apps/production/cQhyxA8MVeI-menu-30.json";
  const navLinks = document.querySelectorAll(".nav-link");
  const categoryBtns = document.querySelectorAll(".category-btn");
  const searchInp = document.querySelector("#search-inp");

  // ative nav link highlighting
  navLinks.forEach((link) => {
    const linkFile = link.getAttribute("href").split("/").pop();
    link.classList.toggle("active", linkFile === currUrl);
    // if not logedin go to sigin-ni&siginup page
    link.addEventListener("click", (e) => {
      if (linkFile === "profile.html" && !user.name) {
        e.preventDefault();
        location.pathname = "/pages/sigin-siginUp.html";
      }
    });
  });

  let data = [];
  let selectedCat = null;

  // fetching menu data
  (async () => {
    try {
      const response = await fetch(API);
      const apiData = await response.json();

      data = apiData.data.map((list) => ({
        category: list.attributes.category.name["en-us"],
        categoryImg: list.attributes.category["image-uri"],
        categoryItems: list.attributes.items.map((item) => ({
          id: item.id,
          name: item.name["en-us"],
          price: item.price,
          img: item["image-uri"],
          des: item.description["en-us"] ?? item.name["en-us"],
        })),
      }));

      // display the first category by default
      selectedCat = data[7];
      applyFilters();
    } catch (error) {
      console.error("Error fetching the API:", error);
    }
  })();

  // handle category filtering
  categoryBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryBtns.forEach((button) => button.classList.remove("active"));
      btn.classList.add("active");

      const selectedCategory = btn.getAttribute("value");
      selectedCat = data.find((item) => item.category === selectedCategory);
      applyFilters();
    });
  });

  // handle search filtering
  searchInp?.addEventListener("keyup", () => {
    applyFilters();
  });

  function applyFilters() {
    if (!selectedCat || !searchInp) return;

    const searchTitle = searchInp.value.toLowerCase();
    const filteredItems = selectedCat.categoryItems.filter((item) =>
      item.name.toLowerCase().includes(searchTitle)
    );

    renderSelectedItems(filteredItems);
  }

  function isInList(payload, type) {
    if (!user.name) return null;
    const item = user[type].find(({ id }) => id == payload.id);
    return item ? (type === "cart" ? item.qty : true) : false;
  }

  function renderSelectedItems(categoryItems) {
    const menuContainer = document.querySelector("#menu-container");

    menuContainer.innerHTML =
      categoryItems.length === 0
        ? `<div class="h-dvh col-span-4 text-4xl text-center text-Brown">No items found</div>`
        : categoryItems
            .map((payload) => {
              // update btn text on re-render
              const isFavorite = isInList(payload, "favorite");
              const cartQty = isInList(payload, "cart");

              return `
        <div class="item-card">
          <img src="${payload.img}" alt="${payload.name}">
          <div class="w-full text-center space-y-4">
            <h1 class="text-Brown">${payload.name}</h1>
            <h2 class="text-red-700">${payload.price} EGP</h2>
            <div id="action-btns">
              <button class="fav-btn bg-white" 
                onclick='itemActions(${JSON.stringify(
                  payload
                )}, "favorite", this)'>
                ${
                  isFavorite
                    ? `<i class="fa-solid fa-heart" style="color: #fa0000;"></i>`
                    : `<i class="fa-regular fa-heart"></i>`
                }
              </button>
              <button class="cart-btn bg-Orange w-full text-white hover:bg-Brown" 
                onclick='itemActions(${JSON.stringify(payload)}, "cart", this)'>
                ${cartQty ? `Added (${cartQty})` : "Add to cart"}
              </button>
            </div>
          </div>
        </div>
        `;
            })
            .join("");
  }

  // sign-in and sign-up Authentication
  const linkTo = document.querySelectorAll(".link");
  const showPassword = document.querySelectorAll(".toggle-password");
  const forms = document.querySelectorAll("form");

  // show password toggle
  showPassword.forEach((btn) => {
    btn.onclick = () => {
      const passwordInputs = document.querySelectorAll(
        'input[name="password"]'
      );
      passwordInputs.forEach((passwordInput) => {
        passwordInput.type =
          passwordInput.type === "password" ? "text" : "password";
        btn.innerHTML =
          passwordInput.type === "password"
            ? `<i class="fa-regular fa-eye-slash"></i>`
            : `<i class="fa-regular fa-eye"></i>`;
      });
    };
  });

  // switching between login and registration
  linkTo.forEach((link) => {
    link.onclick = (e) => {
      const login = document.getElementById("login");
      const rejister = document.getElementById("rejister");
      login.style.display = e.target.value === "login" ? "block" : "none";
      rejister.style.display = e.target.value === "rejister" ? "block" : "none";
    };
  });

  function collectData(form) {
    const formData = new FormData(form);
    let data = {};
    formData.forEach((val, key) => {
      data = { ...data, [key]: val, cart: [], favorite: [] };
    });
    return data;
  }

  //handle form submit
  forms.forEach((form) => {
    form.onsubmit = (e) => {
      e.preventDefault();
      const data = collectData(form);
      validation(data, form);
    };
  });

  // validation handler
  function validation(data, form) {
    const loginEmail = document.getElementById("login-email");
    const loginPassword = document.getElementById("login-password");
    const rejisterEmail = document.getElementById("rejister-email");

    const existingAccount = accounts.find((acc) => acc.email === data.email);

    if (existingAccount) {
      if (form.closest("#login")) {
        if (existingAccount.password === data.password) {
          localStorage.setItem("USER", JSON.stringify(existingAccount));
          window.location.href = "profile.html";
        } else {
          loginPassword.innerHTML = "Incorrect password!";
          loginEmail.innerHTML = "";
        }
      } else {
        rejisterEmail.innerHTML = "Account already exists.";
      }
    } else {
      if (form.closest("#login")) {
        loginEmail.innerHTML = "Invalid email!";
      } else {
        accounts.push(data);
        localStorage.setItem("ACCOUNTS", JSON.stringify(accounts));
        form.reset();
        toastPopup("account created successfully");
      }
    }
  }

  // logout Handler
  function logout() {
    localStorage.setItem("USER", JSON.stringify({}));
  }
});
