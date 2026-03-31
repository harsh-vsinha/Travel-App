let cart = JSON.parse(localStorage.getItem("darshan_cart")) || [];
const API_URL = "http://localhost:3000";

// Fetch Packages
async function fetchPackages() {
  try {
    const response = await fetch(`${API_URL}/packages`);
    if (!response.ok) throw new Error("API not responding");
    const packages = await response.json();

    renderPackages(packages);
  } catch (error) {
    console.log("Backend not connected. Using static HTML from index.html");
  }
}

function renderPackages(packages) {
  const grid1 = document.getElementById("grid-1");
  const grid2 = document.getElementById("grid-2");

  if (!grid1 || !grid2) return;

  const section1Data = packages.slice(0, 4);
  const section2Data = packages.slice(4, 8);

  const createCard = (pkg) => `
    <div class="city-card">
      <img src="${pkg.image}" alt="${pkg.name}" onerror="this.src='https://via.placeholder.com/300x200?text=${pkg.name}'">
      <div class="card-body">
        <h4>${pkg.name}</h4>
        <p class="state">${pkg.state}</p>
        <p class="desc">${pkg.desc}</p>
        <a class="explore-link" onclick="addToCart('${pkg.name}', '${pkg.state}', '${pkg.price}')">
          Book Trip <span class="material-icons-outlined">add_shopping_cart</span>
        </a>
      </div>
    </div>
  `;

  grid1.innerHTML = section1Data.map(createCard).join("");
  grid2.innerHTML = section2Data.map(createCard).join("");
}

// Backend Sync
async function syncWithBackend() {
  try {
    await fetch(`${API_URL}/cart/1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1, items: cart }),
    });
    console.log("Backend Synced!");
  } catch (error) {
    console.error("Backend sync failed:", error);
  }
}

// Cart Functions
function toggleCart() {
  document.getElementById("cart-sidebar").classList.toggle("open");
}

function addToCart(name, state, price) {
  const bookingDate = new Date().toLocaleDateString("en-IN");
  const itemPrice = parseInt(String(price).replace(/[₹,]/g, ""));

  cart.push({ name, state, price: itemPrice, date: bookingDate });
  saveAndRefresh();

  if (!document.getElementById("cart-sidebar").classList.contains("open")) {
    toggleCart();
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveAndRefresh();
}

function saveAndRefresh() {
  localStorage.setItem("darshan_cart", JSON.stringify(cart));
  updateCartUI();
  syncWithBackend();
}

function updateCartUI() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");

  cartCount.innerText = cart.length;

  if (cart.length === 0) {
    cartItems.innerHTML =
      '<p class="empty-msg" style="text-align:center; padding:20px;">No destinations added yet.</p>';
    cartTotal.innerText = "₹0";
    return;
  }

  let total = 0;
  cartItems.innerHTML = cart
    .map((item, index) => {
      total += item.price;
      return `
      <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
        <div>
          <p style="font-weight:bold; margin:0;">${item.name}</p>
          <p style="font-size:12px; color:#666; margin:0;">${item.state} | ${item.date}</p>
          <p style="color:#ff4d00; font-weight:bold; margin:0;">₹${item.price.toLocaleString("en-IN")}</p>
        </div>
        <span class="material-icons-outlined" style="cursor:pointer; color:red;" onclick="removeFromCart(${index})">delete</span>
      </div>
    `;
    })
    .join("");

  cartTotal.innerText = "₹" + total.toLocaleString("en-IN");
}

// Auth Functions
function Login() {
  const user = prompt("Username:");
  const pass = prompt("Password:");
  if (user === "Admin Traveler" && pass === "12345678") {
    localStorage.setItem("isLoggedIn", "true");
    alert("Login Successful!");
    checkAuthStatus();
  } else {
    alert("Invalid Credentials.");
  }
}

function Logout() {
  localStorage.removeItem("isLoggedIn");
  alert("Logged out successfully.");
  checkAuthStatus();
}

function checkAuthStatus() {
  const loginBtn = document.querySelector("button[onclick='Login()']");
  const navLinks = document.querySelector(".nav-links");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (isLoggedIn) {
    if (loginBtn) {
      loginBtn.innerText = "Logout";
      loginBtn.setAttribute("onclick", "Logout()");
    }
    if (!document.getElementById("user-greet")) {
      navLinks.insertAdjacentHTML(
        "beforeend",
        '<span id="user-greet" style="margin-left:15px; color:#ff4d4d; font-weight:bold;">Hi, Admin</span>',
      );
    }
  } else {
    if (loginBtn) {
      loginBtn.innerText = "Login / Register";
      loginBtn.setAttribute("onclick", "Login()");
    }
    const greet = document.getElementById("user-greet");
    if (greet) greet.remove();
  }
}

function checkout() {
  if (cart.length === 0) return alert("Your cart is empty!");
  alert("Thank You! your " + cart.length + " destinations has been booked!");
  cart = [];
  saveAndRefresh();
  toggleCart();
}

window.onload = () => {
  console.log("Window Loaded! Initializing Darshan Travels...");
  updateCartUI(); // Cart render
  checkAuthStatus(); // Login
  fetchPackages(); // API
};
