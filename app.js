document.addEventListener("DOMContentLoaded", () => {
  const currUrl = location.pathname.split("/").pop();
  const API = "https://cdn.getsolo.io/apps/production/cQhyxA8MVeI-menu-30.json";
  const navLinks = document.querySelectorAll(".nav-link");
  const categoryBtns = document.querySelectorAll(".category-btn");
  const menuContainer = document.querySelector("#menu-container");
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

  function renderSelectedItems(categoryItems) {
    menuContainer.innerHTML =
      categoryItems.length === 0
        ? `<div class="h-dvh col-span-4 text-4xl text-center text-Brown">No items found</div>`
        : categoryItems
            .map(
              ({ img, price, name }) => `
        <div class="item-card">
          <img src="${img}" alt="${name}">
          <div class="w-full text-center space-y-4">
            <h1 class="text-Brown">${name}</h1>
            <h2 class="text-red-700">${price} EGP</h2>
            <div id="action-btns">
              <button class="bg-white">fav</button>
              <button class="bg-Orange w-full text-white hover:bg-Brown">
                Add to cart
              </button>
            </div>
          </div>
        </div>
      `
            )
            .join("");
  }

  // sign-in and sign-up Authentication
  const linkTo = document.querySelectorAll(".link");
  const login = document.getElementById("login");
  const rejister = document.getElementById("rejister");
  const showPassword = document.querySelectorAll(".toggle-password");
  const forms = document.querySelectorAll("form");
  const toast = document.getElementById("toast");

  let user = JSON.parse(localStorage.getItem("USER")) || {};
  localStorage.setItem("USER", JSON.stringify(user));

  let accounts = JSON.parse(localStorage.getItem("ACCOUNTS")) || [];
  localStorage.setItem("ACCOUNTS", JSON.stringify(accounts));

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

  // sitching between login and registration
  linkTo.forEach((link) => {
    link.onclick = (e) => {
      login.style.display = e.target.value === "login" ? "block" : "none";
      rejister.style.display = e.target.value === "rejister" ? "block" : "none";
    };
  });

  function collectData(form) {
    const formData = new FormData(form);
    let data = {};
    formData.forEach((val, key) => {
      data = { ...data, [key]: val };
    });
    return data;
  }

  //handle form submission
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
          getUser(existingAccount);
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
        toast.style.transform = "translate(-50%,-100%)";
        setTimeout(() => {
          toast.style.transform = "translate(-50%,100%)";
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }, 2500);
      }
    }
  }

  // logout Handler
  function logout() {
    localStorage.setItem("USER", JSON.stringify({}));
  }

  // ✅ Placeholder function for setting user data
  function getUser(user) {
    console.log("User logged in:", user);
  }
});
