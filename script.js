const API_URL = "http://localhost:3000";
import store from "./store/store.js";
import { addItem, removeItem, clearCart } from "./slice/cartSlice.js";
import { login, logout } from "./slice/authSlice.js";
import { toggleItem } from "./slice/whishlist.js";

// ==========================================
//  PERSISTENCE
// ==========================================
store.subscribe(() => {
  const state = store.getState();

  localStorage.setItem("darshan_cart", JSON.stringify(state.cart));
  localStorage.setItem("darshan_wishlist", JSON.stringify(state.wishlist));
  localStorage.setItem("darshan_auth", JSON.stringify(state.auth));

  updateCartUI();
  updateWishlistUI();
  updateAuthUI();

  renderPackages(window.currentPackages || []);
});

// ==========================================
//  AUTHENTICATION UI
// ==========================================
function Login() {
  const user = prompt("Username:")?.trim();
  const pass = prompt("Password:")?.trim();

  if (user === "Admin Traveler" && pass === "12345678") {
    store.dispatch(login({ username: "Admin Traveler", role: "admin" }));
    alert("Login Successful!");
  } else {
    alert("Invalid Credentials.");
  }
}

function Logout() {
  store.dispatch(logout());
  alert("Logged out successfully.");
}

function updateAuthUI() {
  const authState = store.getState().auth;
  const authBtn =
    document.querySelector("button[onclick*='Login']") ||
    document.querySelector("button[onclick*='Logout']");
  const navLinks = document.querySelector(".nav-links");
  let greetElement = document.getElementById("user-greet");

  if (authState.isLoggedIn) {
    if (authBtn) {
      authBtn.innerText = "Logout";
      authBtn.setAttribute("onclick", "Logout()");
    }
    const firstName = authState.user.username.split(" ")[0];

    if (!greetElement) {
      if (navLinks) {
        navLinks.insertAdjacentHTML(
          "beforeend",
          `<span id="user-greet" style="margin-left:15px; color:#ff4d4d; font-weight:bold;">Hi, ${firstName}</span>`,
        );
      }
    } else {
      greetElement.innerText = `Hi, ${firstName}`;
    }
  } else {
    if (authBtn) {
      authBtn.innerText = "Login / Register";
      authBtn.setAttribute("onclick", "Login()");
    }
    if (greetElement) greetElement.remove();
  }
}

// ==========================================
// CART & WISHLIST UI DISPATCHERS
// ==========================================
function toggleCart() {
  document.getElementById("cart-sidebar")?.classList.toggle("open");
}
function toggleWishlistSidebar() {
  document.getElementById("wishlist-sidebar")?.classList.toggle("open");
}

function addToCart(name, state, price) {
  const bookingDate = new Date().toLocaleDateString("en-IN");
  const itemPrice = parseInt(String(price).replace(/[₹,]/g, ""));
  store.dispatch(
    addItem({
      name,
      state,
      price: itemPrice,
      date: bookingDate,
    }),
  );
  if (!document.getElementById("cart-sidebar").classList.contains("open"))
    toggleCart();
}

function removeFromCart(index) {
  store.dispatch(removeItem(index));
}

function toggleWishlistItem(name, state, price, image) {
  const itemPrice =
    typeof price === "string" ? parseInt(price.replace(/[₹,]/g, "")) : price;
  store.dispatch(toggleItem({ name, state, price: itemPrice, image }));
}

function checkout() {
  const state = store.getState();
  if (!state.auth.isLoggedIn)
    return alert("Please log in to checkout your cart!");
  if (state.cart.length === 0) return alert("Your cart is empty!");
  alert(
    `Thank You, ${state.auth.user.username}! Your ${state.cart.length} destinations have been booked!`,
  );
  store.dispatch(clearCart());
  toggleCart();
}

function updateCartUI() {
  const cartState = store.getState().cart;
  const cartCount = document.getElementById("cart-count");
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  if (cartCount) cartCount.innerText = cartState.length;

  if (cartState.length === 0 && cartItems) {
    cartItems.innerHTML =
      '<p class="empty-msg" style="text-align:center; padding:20px;">No destinations added yet.</p>';
    if (cartTotal) cartTotal.innerText = "₹0";
    return;
  }

  let total = 0;
  if (cartItems) {
    cartItems.innerHTML = cartState
      .map((item, index) => {
        total += item.price;
        return `
      <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
        <div>
          <p style="font-weight:bold; margin:0;">${item.name}</p>
          <p style="font-size:12px; color:#666; margin:0;">${item.state}</p>
          <p style="color:#ff4d00; font-weight:bold; margin:0;">₹${item.price.toLocaleString("en-IN")}</p>
        </div>
        <span class="material-icons-outlined" style="cursor:pointer; color:red;" onclick="removeFromCart(${index})">delete</span>
      </div>`;
      })
      .join("");
  }
  if (cartTotal) cartTotal.innerText = "₹" + total.toLocaleString("en-IN");
}

function updateWishlistUI() {
  const wishlistState = store.getState().wishlist;
  const wishlistCount = document.getElementById("wishlist-count");
  const wishlistItems = document.getElementById("wishlist-items");

  if (wishlistCount) wishlistCount.innerText = wishlistState.length;

  if (wishlistState.length === 0 && wishlistItems) {
    wishlistItems.innerHTML =
      '<p class="empty-msg" style="text-align:center; padding:20px;">Your wishlist is empty.</p>';
    return;
  }

  if (wishlistItems) {
    wishlistItems.innerHTML = wishlistState
      .map(
        (item) => `
      <div class="cart-item" style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
        <div>
          <p style="font-weight:bold; margin:0;">${item.name}</p>
          <p style="font-size:12px; color:#666; margin:0;">${item.state}</p>
        </div>
        <div>
          <span class="material-icons-outlined" style="cursor:pointer; color:var(--primary-color); margin-right:10px" onclick="addToCart('${item.name}', '${item.state}', '${item.price}')">add_shopping_cart</span>
          <span class="material-icons-outlined" style="cursor:pointer; color:#e91e63;" onclick="toggleWishlistItem('${item.name}')">favorite</span>
        </div>
      </div>
    `,
      )
      .join("");
  }
}

// ==========================================
// PACKAGE RENDERING & INIT
// ==========================================
const mockPackages = [
  {
    name: "Mumbai",
    state: "Maharashtra",
    desc: "The City of Dreams and Bollywood.",
    price: "₹15,000",
    image: "asset/Mumbai.jpg",
  },
  {
    name: "New Delhi",
    state: "Delhi NCR",
    desc: "Historic capital with Mughal architecture.",
    price: "₹12,000",
    image: "asset/Delhi1.jpg",
  },
  {
    name: "Bengaluru",
    state: "Karnataka",
    desc: "The Garden City and tech hub.",
    price: "₹14,000",
    image: "asset/Bengaluru.jpg",
  },
  {
    name: "Varanasi",
    state: "Uttar Pradesh",
    desc: "Spiritual capital on the Ganga.",
    price: "₹10,000",
    image: "asset/varanasi.jpg",
  },
  {
    name: "Rishikesh",
    state: "Uttarakhand",
    desc: "The Yoga Capital of the World.",
    price: "₹8,000",
    image: "asset/Rishikesh1.webp",
  },
  {
    name: "Manali",
    state: "Himachal Pradesh",
    desc: "Snow-capped mountains and adventure.",
    price: "₹11,000",
    image: "asset/Manali.jpg",
  },
  {
    name: "Puri",
    state: "Odisha",
    desc: "Jagannath Temple and Golden Beach.",
    price: "₹9,000",
    image: "asset/Puri.jpg",
  },
  {
    name: "Tirupati",
    state: "Andhra Pradesh",
    desc: "Home to the revered Venkateswara Temple.",
    price: "₹7,000",
    image: "asset/tirupati.jpg",
  },
];

async function fetchPackages() {
  window.currentPackages = mockPackages;
  renderPackages(window.currentPackages);
}

function renderPackages(packages) {
  if (!packages || packages.length === 0) return;
  const grid1 = document.getElementById("grid-1");
  const grid2 = document.getElementById("grid-2");
  if (!grid1 || !grid2) return;

  const wishlistState = store.getState().wishlist;

  const createCard = (pkg) => {
    const isWishlisted = wishlistState.some((item) => item.name === pkg.name);
    const heartClass = isWishlisted ? "active" : "";
    const iconName = isWishlisted ? "favorite" : "favorite_border";

    return `
      <div class="city-card">
        <div class="wishlist-btn ${heartClass}" onclick="toggleWishlistItem('${pkg.name}', '${pkg.state}', '${pkg.price}', '${pkg.image}')">
          <span class="material-icons-outlined">${iconName}</span>
        </div>
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
  };

  grid1.innerHTML = packages.slice(0, 4).map(createCard).join("");
  grid2.innerHTML = packages.slice(4, 8).map(createCard).join("");
}

window.onload = () => {
  updateCartUI();
  updateWishlistUI();
  updateAuthUI();
  fetchPackages();
};

// ==========================================
// FIX: BIND FUNCTIONS TO WINDOW OBJECT
// ==========================================
// If this script is loaded as a module, inline HTML 'onclick' tags will fail
// because they can't find these functions. This explicitly makes them globally available.
window.Login = Login;
window.Logout = Logout;
window.toggleCart = toggleCart;
window.toggleWishlistSidebar = toggleWishlistSidebar;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.toggleWishlistItem = toggleWishlistItem;
window.checkout = checkout;
