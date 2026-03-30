let cart = JSON.parse(localStorage.getItem("darshan_cart")) || [];

function toggleCart() {
  document.getElementById("cart-sidebar").classList.toggle("open");
}

function addToCart(name, state, price) {
  const bookingDate = new Date().toLocaleDateString("en-IN");
  const itemPrice = parseInt(price.replace(/[₹,]/g, ""));

  cart.push({
    name,
    state,
    price: itemPrice,
    date: bookingDate,
  });

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
}

function updateCartUI() {
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");

  cartCount.innerText = cart.length;

  if (cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-msg">No destinations added yet.</p>';
    cartTotal.innerText = "₹0";
    return;
  }

  let total = 0;
  cartItems.innerHTML = cart
    .map((item, index) => {
      total += item.price;
      return `
            <div class="cart-item">
              <div>
                <p class="item-name">${item.name}</p>
                <p class="item-meta">${item.state} | ${item.date}</p>
                <p class="item-price">₹${item.price.toLocaleString("en-IN")}</p>
              </div>
              <span class="material-icons-outlined delete-btn" onclick="removeFromCart(${index})">delete</span>
            </div>
          `;
    })
    .join("");

  cartTotal.innerText = "₹" + total.toLocaleString("en-IN");
}

function checkout() {
  if (cart.length === 0) return alert("Your cart is empty!");
  alert("Thank you! Your " + cart.length + " booking has been recorded.");
  cart = [];
  saveAndRefresh();
  toggleCart();
}

updateCartUI();
