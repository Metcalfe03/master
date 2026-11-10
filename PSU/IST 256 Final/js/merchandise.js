// Resolve static assets from this script so nested hosting paths also work.
const merchandiseRoot = new URL("../", document.currentScript.src);
const merchandiseURL = (path) => new URL(path.replace(/^\//, ""), merchandiseRoot).href;

function getCart() {
  return JSON.parse(localStorage.getItem("cart")) || [];
}

function setCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const cart = getCart();
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  const totalQty = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  badge.textContent = totalQty;
}

function showToast(message) {
  const toastEl = document.getElementById("cartToast");
  if (!toastEl) return;

  toastEl.querySelector(".toast-body").textContent = message;
  const toast = new bootstrap.Toast(toastEl);
  toast.show();
}

function addToCart(item) {
  const cart = getCart();
  const existing = cart.find((i) => i.id === item.id && i.size === item.size);
  if (existing) existing.quantity += item.quantity || 1;
  else
    cart.push({
      id: item.id,
      name: item.name,
      price: item.price,
      size: item.size,
      quantity: item.quantity || 1,
    });
  setCart(cart);
  showToast(`${item.name} added to cart!`);
}

function removeFromCartByIdSize(id, size) {
  const cart = getCart();
  const index = cart.findIndex((item) => item.id === id && item.size === size);
  if (index === -1) return;

  if (cart[index].quantity > 1) cart[index].quantity -= 1;
  else cart.splice(index, 1);

  setCart(cart);
  renderCartModal();
}

function renderCartModal() {
  const cart = getCart();
  const modalBody = document.getElementById("cartModalBody");
  if (!modalBody) return;

  if (cart.length === 0) {
    modalBody.innerHTML = "<p class='text-center'>Your cart is empty.</p>";
    return;
  }

  let html = "";
  cart.forEach((item) => {
    const qty = item.quantity || 1;
    const total = (item.price * qty).toFixed(2);
    html += `
      <div class="d-flex justify-content-between border-bottom py-2 align-items-center"
           data-id="${item.id}" data-size="${item.size}">
        <div>
          <strong>${item.name}</strong><br>
          Size: ${item.size}<br>
          Quantity: ${qty}<br>
          $${total}
        </div>
        <div class="d-flex gap-1">
          <button class="btn btn-danger btn-sm removeItem">-</button>
          <button class="btn btn-success btn-sm addItem">+</button>
        </div>
      </div>`;
  });

  modalBody.innerHTML = html;

  // Update cart total
  const cartTotalEl = document.getElementById("cartTotal");
  if (cartTotalEl)
    cartTotalEl.textContent = cart
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
      .toFixed(2);
}

document.addEventListener("click", function (e) {
  if (e.target.classList.contains("addItem")) {
    const row = e.target.closest("[data-id][data-size]");
    const id = row.dataset.id;
    const size = row.dataset.size;
    const cart = getCart();
    const item = cart.find((i) => i.id === id && i.size === size);
    if (item) item.quantity += 1;
    setCart(cart);
    renderCartModal();
  }

  if (e.target.classList.contains("removeItem")) {
    const row = e.target.closest("[data-id][data-size]");
    removeFromCartByIdSize(row.dataset.id, row.dataset.size);
  }
});

const cartButton = document.getElementById("cartButton");
if (cartButton) {
  cartButton.addEventListener("click", function () {
    renderCartModal();
    const modal = new bootstrap.Modal(document.getElementById("cartModal"));
    modal.show();
  });
}

function getProductIdFromURL() {
  return new URLSearchParams(window.location.search).get("id");
}

function loadProductPage() {
  const container = document.getElementById("productContainer");
  if (!container) return;

  const productId = getProductIdFromURL();
  if (!productId) return;

  fetch(merchandiseURL("data/products.json"))
    .then((res) => res.json())
    .then((products) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      container.innerHTML = `
      <div class="col-md-6">
        <img id="mainImage" src="${merchandiseURL(product.images.product_front)}" class="img-fluid border border-success rounded mb-3">
        <div class="d-flex gap-2">
          <img src="${merchandiseURL(product.images.product_front)}" class="img-thumbnail thumb" width="100">
          <img src="${merchandiseURL(product.images.product_back)}" class="img-thumbnail thumb" width="100">
        </div>
      </div>
      <div class="col-md-6">
        <h2 class="text-success">${product.name}</h2>
        <p>${product.description}</p>
        <h4 class="mb-3">$${product.price.amount}</h4>
        <form id="productForm">
          <div class="mb-3">
            <label class="form-label">Select Size</label>
            <select id="size" class="form-select">
              <option value="">--Select Size--</option>
              <option value="S">Small</option>
              <option value="M">Medium</option>
              <option value="L">Large</option>
              <option value="XL">Extra Large</option>
              <option value="XXL">2X Large</option>
            </select>
            <div id="sizeError" class="text-danger mt-2" style="display:none;">
              Please select a size before adding to cart.
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Quantity</label>
            <input type="number" id="quantity" class="form-control" value="1" min="1">
          </div>
          <button type="submit" class="btn btn-success">Add to Cart</button>
        </form>
      </div>`;

      document.querySelectorAll(".thumb").forEach((thumb) => {
        thumb.addEventListener("click", () => {
          document.getElementById("mainImage").src = thumb.src;
        });
      });

      document.getElementById("productForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const size = document.getElementById("size").value;
        const quantity =
          parseInt(document.getElementById("quantity").value) || 1;
        if (!size) {
          document.getElementById("sizeError").style.display = "block";
          return;
        }
        document.getElementById("sizeError").style.display = "none";
        addToCart({
          id: productId,
          name: product.name,
          price: product.price.amount,
          size: size,
          quantity: quantity,
        });
      });
    });
}

function loadMerchGallery() {
  const galleryContainer = document.getElementById("merchGallery");
  if (!galleryContainer) return;

  fetch(merchandiseURL("data/products.json"))
    .then((res) => res.json())
    .then((products) => {
      let html = "";
      products.forEach((product) => {
        html += `
        <div class="col-md-4 merch-item">
          <div class="card bg-dark text-light border-success h-100">
            <a href="${merchandiseURL("product/index.html")}?id=${product.id}">
              <img src="${merchandiseURL(product.images.product_front)}" class="card-img-top" alt="${product.name}">
            </a>
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${product.name}</h5>
              <p class="card-text">${product.description}</p>
              <p class="fw-bold">$${product.price.amount}</p>
              <a href="${merchandiseURL("product/index.html")}?id=${product.id}" class="btn btn-success mt-auto">View Details</a>
            </div>
          </div>
        </div>`;
      });
      galleryContainer.innerHTML = html;

      // Search filter
      const searchInput = document.getElementById("searchInput");
      if (searchInput) {
        searchInput.addEventListener("keyup", function () {
          const q = this.value.toLowerCase();
          document.querySelectorAll(".merch-item").forEach((item) => {
            const title = item.querySelector("h5").textContent.toLowerCase();
            item.style.display = title.includes(q) ? "block" : "none";
          });
        });
      }
    });
}

document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();
  loadProductPage();
  loadMerchGallery();
});

// Checkout form submission
$("#checkoutForm").submit(function (e) {
  e.preventDefault();
  let valid = true;
  $(".text-danger").text("");

  if ($("#name").val().trim() === "") {
    $("#nameError").text("Name required");
    valid = false;
  }
  if ($("#email").val().trim() === "") {
    $("#emailError").text("Email required");
    valid = false;
  }
  if ($("#address").val().trim() === "") {
    $("#addressError").text("Address required");
    valid = false;
  }
  if (!valid) return;

  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const orderData = {
    name: $("#name").val(),
    email: $("#email").val(),
    address: $("#address").val(),
    cart: cart,
    total: total.toFixed(2),
  };

  $.ajax({
    url: "/api/orders",
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(orderData),
    success: function (response) {
      console.log("Order sent successfully:", response);
      const toast = new bootstrap.Toast(
        document.getElementById("checkoutToast"),
      );
      toast.show();
      localStorage.removeItem("cart");
      setTimeout(() => {
        window.location.href = merchandiseURL("index.html");
      }, 4000);
    },
    error: function (xhr, status, error) {
      console.error("Failed to send order:", error);
      $("#checkoutToast .toast-body").text("Failed to place order. Try again.");
      const toast = new bootstrap.Toast(
        document.getElementById("checkoutToast"),
      );
      toast.show();
    },
  });
});
