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
  let adminBtn = document.getElementById("admin-panel-btn");

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

    if (authState.user.role === "admin") {
      if (!adminBtn && navLinks) {
        navLinks.insertAdjacentHTML(
          "afterbegin",
          `<a href="#" id="admin-panel-btn" onclick="openAdminPanel()" style="color:var(--primary-color);">Admin Panel</a>`,
        );
      }
    } else if (adminBtn) {
      adminBtn.remove();
    }
  } else {
    if (authBtn) {
      authBtn.innerText = "Login / Register";
      authBtn.setAttribute("onclick", "Login()");
    }
    if (greetElement) greetElement.remove();
    if (adminBtn) adminBtn.remove();
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

  const bookings = JSON.parse(localStorage.getItem("darshan_bookings") || "[]");
  const totalAmount = state.cart.reduce((sum, item) => sum + item.price, 0);
  const newBooking = {
    id: Date.now(),
    user: state.auth.user.username,
    date: new Date().toLocaleDateString("en-IN"),
    items: state.cart,
    total: totalAmount,
  };
  bookings.push(newBooking);
  localStorage.setItem("darshan_bookings", JSON.stringify(bookings));

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
  let saved = localStorage.getItem("darshan_packages");
  if (!saved) {
    localStorage.setItem("darshan_packages", JSON.stringify(mockPackages));
    saved = JSON.stringify(mockPackages);
  }
  window.currentPackages = JSON.parse(saved);
  renderPackages(window.currentPackages);
}

function renderPackages(packages) {
  if (!packages || packages.length === 0) return;
  const grid1 = document.getElementById("grid-1");
  if (!grid1) return;
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

  const grid1Pkgs = [];
  const grid2Pkgs = [];

  packages.forEach((pkg, index) => {
    if (pkg.category === "grid-1") {
      grid1Pkgs.push(pkg);
    } else if (pkg.category === "grid-2") {
      grid2Pkgs.push(pkg);
    } else {
      // Sequence fallback for original/existing packages
      if (index < 4) {
        grid1Pkgs.push(pkg);
      } else if (index < 8) {
        grid2Pkgs.push(pkg);
      } else {
        // New packages without a saved category alternate by sequence
        if ((index - 8) % 2 === 0) grid1Pkgs.push(pkg);
        else grid2Pkgs.push(pkg);
      }
    }
  });

  grid1.innerHTML = grid1Pkgs.map(createCard).join("");
  grid2.innerHTML = grid2Pkgs.map(createCard).join("");
}

window.onload = () => {
  updateCartUI();
  updateWishlistUI();
  updateAuthUI();
  fetchPackages();
};

// ==========================================
// ADMIN PANEL LOGIC
// ==========================================
function initAdminUI() {
  if (document.getElementById("admin-overlay")) return;
  const adminHTML = `
    <div class="admin-overlay" id="admin-overlay" style="display:none;"></div>
    <div class="admin-modal" id="admin-modal" style="display:none;">
      <div class="admin-header">
        <h2>Admin Dashboard</h2>
        <span class="material-icons-outlined" style="cursor:pointer;" onclick="closeAdminPanel()">close</span>
      </div>
      <div class="admin-body">
        <div class="admin-sidebar">
          <ul>
            <li onclick="switchAdminTab('dashboard')" id="tab-dashboard" class="active">Dashboard Stats</li>
            <li onclick="switchAdminTab('packages')" id="tab-packages">Manage Packages</li>
            <li onclick="switchAdminTab('bookings')" id="tab-bookings">View Bookings</li>
          </ul>
        </div>
        <div class="admin-content" id="admin-content"></div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", adminHTML);
}

function openAdminPanel() {
  initAdminUI();
  document.getElementById("admin-overlay").style.display = "block";
  document.getElementById("admin-modal").style.display = "flex";
  switchAdminTab("dashboard");
}

function closeAdminPanel() {
  document.getElementById("admin-overlay").style.display = "none";
  document.getElementById("admin-modal").style.display = "none";
}

function switchAdminTab(tab) {
  document
    .querySelectorAll(".admin-sidebar li")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById(`tab-${tab}`).classList.add("active");

  const content = document.getElementById("admin-content");
  if (tab === "dashboard") renderAdminDashboard(content);
  else if (tab === "packages") renderAdminPackages(content);
  else if (tab === "bookings") renderAdminBookings(content);
}

function renderAdminDashboard(container) {
  const pkgs = JSON.parse(localStorage.getItem("darshan_packages") || "[]");
  const bookings = JSON.parse(localStorage.getItem("darshan_bookings") || "[]");
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total, 0);

  container.innerHTML = `
    <h3>Dashboard Statistics</h3>
    <div class="admin-stats">
      <div class="stat-card"><h3>Total Packages</h3><p>${pkgs.length}</p></div>
      <div class="stat-card"><h3>Total Bookings</h3><p>${bookings.length}</p></div>
      <div class="stat-card"><h3>Total Revenue</h3><p>₹${totalRevenue.toLocaleString("en-IN")}</p></div>
    </div>
  `;
}

function renderAdminPackages(container) {
  const pkgs = JSON.parse(localStorage.getItem("darshan_packages") || "[]");
  let html = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
      <h3>Manage Packages</h3>
      <button class="admin-btn" onclick="openPackageForm()">+ Add New Package</button>
    </div>
    <div id="package-form-container" style="display:none; background:#f9f9f9; padding:15px; border:1px solid #ddd; margin-bottom:15px; border-radius:8px;">
      <h4 id="pkg-form-title">Add Package</h4>
      <input type="hidden" id="pkg-id">
      <div class="admin-form-group">
        <label>Category (Section)</label>
        <select id="pkg-category" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
          <option value="grid-1">Metropolitan & Heritage</option>
          <option value="grid-2">Scenic & Spiritual Escapes</option>
        </select>
      </div>
      <div class="admin-form-group"><label>City Name</label><input type="text" id="pkg-name" placeholder="e.g. Mumbai"></div>
      <div class="admin-form-group"><label>State</label><input type="text" id="pkg-state" placeholder="e.g. Maharashtra"></div>
      <div class="admin-form-group"><label>Description</label><textarea id="pkg-desc" placeholder="Brief description..."></textarea></div>
      <div class="admin-form-group"><label>Price (Formatted)</label><input type="text" id="pkg-price" placeholder="e.g. ₹15,000"></div>
      <div class="admin-form-group"><label>Image URL</label><input type="text" id="pkg-image" placeholder="asset/image.jpg or http://..."></div>
      <button class="admin-btn" onclick="savePackage()">Save Package</button>
      <button class="admin-btn danger" onclick="closePackageForm()">Cancel</button>
    </div>
    <table class="admin-table">
      <thead><tr><th>City Name</th><th>State</th><th>Price</th><th>Actions</th></tr></thead>
      <tbody>
        ${pkgs
          .map(
            (p, index) => `
          <tr>
            <td>${p.name}</td><td>${p.state}</td><td>${p.price}</td>
            <td>
              <button class="admin-btn edit" onclick="editPackage(${index})">Edit</button>
              <button class="admin-btn danger" onclick="deletePackage(${index})">Delete</button>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
  container.innerHTML = html;
}

function openPackageForm() {
  document.getElementById("package-form-container").style.display = "block";
  document.getElementById("pkg-form-title").innerText = "Add Travel Package";
  ["id", "name", "state", "desc", "price", "image"].forEach(
    (field) => (document.getElementById(`pkg-${field}`).value = ""),
  );
  document.getElementById("pkg-category").value = "grid-1";
}
function closePackageForm() {
  document.getElementById("package-form-container").style.display = "none";
}

function editPackage(index) {
  const pkgs = JSON.parse(localStorage.getItem("darshan_packages") || "[]");
  const p = pkgs[index];
  openPackageForm();
  document.getElementById("pkg-form-title").innerText = "Edit Travel Package";
  document.getElementById("pkg-id").value = index;
  ["name", "state", "desc", "price", "image"].forEach(
    (field) => (document.getElementById(`pkg-${field}`).value = p[field]),
  );
  if (p.category) {
    document.getElementById("pkg-category").value = p.category;
  } else {
    document.getElementById("pkg-category").value =
      index < 4 || (index >= 8 && (index - 8) % 2 === 0) ? "grid-1" : "grid-2";
  }
}

function savePackage() {
  const index = document.getElementById("pkg-id").value;
  const p = {
    name: document.getElementById("pkg-name").value.trim(),
    state: document.getElementById("pkg-state").value.trim(),
    desc: document.getElementById("pkg-desc").value.trim(),
    price: document.getElementById("pkg-price").value.trim(),
    image: document.getElementById("pkg-image").value.trim(),
    category: document.getElementById("pkg-category").value,
  };
  if (!p.name || !p.price) return alert("City Name and Price are required!");
  const pkgs = JSON.parse(localStorage.getItem("darshan_packages") || "[]");
  if (index === "") pkgs.push(p);
  else pkgs[parseInt(index)] = p;

  localStorage.setItem("darshan_packages", JSON.stringify(pkgs));
  window.currentPackages = pkgs;
  renderPackages(pkgs);
  renderAdminPackages(document.getElementById("admin-content"));
}

function deletePackage(index) {
  if (!confirm("Delete this package?")) return;
  const pkgs = JSON.parse(localStorage.getItem("darshan_packages") || "[]");
  pkgs.splice(index, 1);
  localStorage.setItem("darshan_packages", JSON.stringify(pkgs));
  window.currentPackages = pkgs;
  renderPackages(pkgs);
  renderAdminPackages(document.getElementById("admin-content"));
}

function renderAdminBookings(container) {
  const bookings = JSON.parse(localStorage.getItem("darshan_bookings") || "[]");
  container.innerHTML = `
    <h3>Booking History</h3>
    <table class="admin-table">
      <thead><tr><th>ID</th><th>User</th><th>Date</th><th>Destinations</th><th>Total Amount</th></tr></thead>
      <tbody>
        ${bookings.map((b) => `<tr><td>#${b.id}</td><td>${b.user}</td><td>${b.date}</td><td>${b.items.map((i) => i.name).join(", ")}</td><td>₹${b.total.toLocaleString("en-IN")}</td></tr>`).join("")}
        ${bookings.length === 0 ? '<tr><td colspan="5" style="text-align:center;">No bookings found.</td></tr>' : ""}
      </tbody>
    </table>
  `;
}

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
window.openAdminPanel = openAdminPanel;
window.closeAdminPanel = closeAdminPanel;
window.switchAdminTab = switchAdminTab;
window.openPackageForm = openPackageForm;
window.closePackageForm = closePackageForm;
window.savePackage = savePackage;
window.editPackage = editPackage;
window.deletePackage = deletePackage;
