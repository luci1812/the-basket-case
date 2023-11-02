customElements.define(
  "product-gift-form",
  class ProductGiftForm extends HTMLElement {
    constructor() {
      super();
      this.listProductUpsell = document.querySelectorAll('.product__upsell input[type="checkbox"]');
      this.listProductGift = document.querySelectorAll(".products__gift--item");
      this.submitButton = this.querySelector('[type="submit"]');
      this.cart = document.querySelector("cart-notification") || document.querySelector("cart-drawer");
      this.buttomSubmit = this.querySelector(".product-form__buttons button");
      this.buttomSubmit.addEventListener("click", this.onSubmitHandler.bind(this));
      this.checkbox = document.querySelector('#Product-checkbox');
      this.giftMessage = document.querySelector('#Product-Note');

      this.listProductUpsell.forEach((productUpsell) => {
        productUpsell.addEventListener("change", (event) => {
          this.activeMainProduct();
          this.handleInfoProductUpsellChecked(event);
          this.calcTotalPrice();
        });
      });

      this.checkbox.addEventListener('change', () => {
        this.handleButtonAddToCart();
      });

      this.giftMessage.addEventListener('input', () => {
        this.handleButtonAddToCart();
      })

      this.showVariants();
    }

    activeMainProduct() {
      this.listProductGift.forEach((productGift) => {
        let minProduct = Number(productGift.getAttribute("data-min"));
        let maxProduct = Number(productGift.getAttribute("data-max"));
        let ok =
          minProduct <= document.querySelectorAll("#step-item-1 input:checked").length &&
          document.querySelectorAll("#step-item-1 input:checked").length <= maxProduct;
        productGift.classList.toggle("active", ok);

        if (
          productGift.closest(".products__gift--item.checked") &&
          productGift.closest(".products__gift--item.checked").classList.contains("active") == false
        ) {
          productGift.classList.remove("checked");
          this.buttomSubmit.classList.remove("active");
          document.querySelector(".main-product__gift").innerHTML = "";
        }
      });
      document.querySelectorAll(".products__gift--items").forEach((items) => {
        let itemInItems = items.querySelectorAll(".products__gift--item");
        let hasOk = Array.from(itemInItems).find((i) => i.classList.contains("active"));
        itemInItems.forEach((item) => item.classList.remove("item-visible"));
        if (!hasOk) itemInItems[0].classList.add("item-visible");
      });

      this.handleInfoProductMain();
    }

    showVariants() {
      const items = Array.from(document.querySelectorAll(".products__gift--item"));
      const itemsTitle = [...new Set(items.map((item) => item.querySelector(".product__gift--info h5").innerHTML))];

      itemsTitle.forEach((itemTitle) => {
        const newdiv = document.createElement("div");
        let arrItems = items.filter((item) => item.querySelector(".product__gift--info h5").innerHTML === itemTitle);
        let dataMin = null;

        arrItems.forEach((item) => {
          let currentMin = parseInt(item.getAttribute("data-min"));
          if (!dataMin || currentMin < parseInt(dataMin.getAttribute("data-min"))) {
            dataMin = item;
          }

          newdiv.appendChild(item);
          newdiv.classList.add("products__gift--items");
        });

        if (dataMin) {
          dataMin.classList.add("item-visible");
        }

        document.querySelector(".products__gift--list").appendChild(newdiv);
      });
    }

    handleInfoProductUpsellChecked(event) {
      let elmContainer = document.querySelector(".products__added--content");
      let productUpsell = event.target.closest(".product__upsell");
      let newLi = document.createElement("li");
      newLi.setAttribute("data-id", event.target.getAttribute("data-id"));

      if (event.target.checked) {
        let title = document.createElement("span");
        title.textContent = productUpsell.querySelector("h5").textContent;
        newLi.appendChild(title);

        let price = document.createElement("span");
        price.textContent = Shopify.formatMoney(event.target.value);
        price.classList.add("js-price-item");
        price.setAttribute("data-price", event.target.value);
        newLi.appendChild(price);
        elmContainer.appendChild(newLi);
      } else {
        elmContainer.querySelectorAll("li").forEach((elm) => {
          if (event.target.getAttribute("data-id") == elm.getAttribute("data-id")) {
            elm.remove();
          }
        });
      }
    }

    handleInfoProductMain() {
      let productsMain = document.querySelectorAll(".products__gift--item.active");
      let containerMainProduct = document.querySelector(".main-product__gift");

      productsMain.forEach((product) => {
        product.addEventListener("click", (event) => {
          if (document.querySelector(".products__gift--item.active.checked")) {
            document.querySelector(".products__gift--item.active.checked").classList.remove("checked");
          }
          product.classList.add("checked");

          let productParent = event.target.closest(".products__gift--item");
          let price = productParent.querySelector(".product__info-container .price.price--on-sale");
          let productPrice = null;

          if (price) {
            productPrice = productParent.querySelector(".price__container .price__sale span.price-item").getAttribute("data-price");
          } else {
            productPrice = productParent.querySelector(".price__container .price__regular span.price-item").getAttribute("data-price");
          }

          containerMainProduct.innerHTML = `<div> 
        <span>${product.querySelector("h5").textContent}</span>
        <span class="js-price-item" data-price="${productPrice}">${Shopify.formatMoney(productPrice)}</span>
        </div>`;

          document.querySelector(".main-product__gift").setAttribute("data-id", event.target.closest(".products__gift--item").getAttribute("data-variant-id"));        

          this.calcTotalPrice(event);
          this.addMainProductId(event);
        });
      });
    }

    calcTotalPrice() {
      let totalPriceUpsell = 0;
      let listPrice = document.querySelectorAll(".js-price-item");
      listPrice.forEach((price) => {
        totalPriceUpsell = totalPriceUpsell + Number(price.getAttribute("data-price"));
      });

      document.querySelector(".product-gift__total--price .total__price").innerHTML = `Total: 
    <span>${Shopify.formatMoney(totalPriceUpsell)}</span>`;
    }

    addMainProductId(event) {
      let mainId = event.target.closest(".products__gift--item").getAttribute("data-variant-id");
      let productsUpsell = document.querySelectorAll(".products__added--content li");

      productsUpsell.forEach((productUpsell) => {
        productUpsell.setAttribute("data-main-product-id", mainId);
      });
    }

    createFormData() {
      let productCount = document.querySelector(".step__detail .quantity__input").getAttribute("data-count");
      let mainProductId = document.querySelector(".main-product__gift").getAttribute("data-id");
      let productMessage = document.querySelector('.create-your-own__message textarea').value;

      let objProduct = {
        quantity: productCount,
        id: mainProductId,
        properties: {
          _title_item: document.querySelector('.products__gift--item.checked h5').textContent,
          gift_message: productMessage
        },
      };

      let products = Array.from(document.querySelectorAll(".products__added--content li")).map((product) => ({
        quantity: productCount,
        id: Number(product.getAttribute("data-id")),
        properties: {
          add_on: Number(mainProductId),
        },
      }));

      products.push(objProduct);
      function reverseArr(arr) {
        const arrNew = new Array(arr.length);
        for (let i = 0; i < arr.length; i++) {
          arrNew[i] = arr[arr.length - i - 1];
        }
        return arrNew;
      }

      let arrProductNew = reverseArr(products);

      let arrProduct = {
        items: arrProductNew,
        sections: this.cart.getSectionsToRender().map((section) => section.id),
        sections_url: window.location.pathname,
      };

      return JSON.stringify(arrProduct);
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector(".product-form__error-message-wrapper");
      if (!this.errorMessageWrapper) return;
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector(".product-form__error-message");

      this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }

    onSubmitHandler() {
      const config = fetchConfig("javascript");
      config.headers["X-Requested-With"] = "XMLHttpRequest";
      delete config.headers["Content-Type"];

      config.body = this.createFormData();
      config.headers["Content-Type"] = "application/json";

      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);

            const soldOutMessage = this.submitButton.querySelector(".sold-out-message");
            if (!soldOutMessage) return;
            this.submitButton.setAttribute("aria-disabled", true);
            this.submitButton.querySelector("span").classList.add("hidden");
            soldOutMessage.classList.remove("hidden");
            this.error = true;
            return;
          } else if (!this.cart) {
            window.location = window.routes.cart_url;
            return;
          }

          if (!this.error) publish(PUB_SUB_EVENTS.cartUpdate, { source: "product-form" });
          this.error = false;
          const quickAddModal = this.closest("quick-add-modal");
          if (quickAddModal) {
            document.body.addEventListener(
              "modalClosed",
              () => {
                setTimeout(() => {
                  this.cart.renderContents(response);
                });
              },
              { once: true }
            );
            quickAddModal.hide(true);
          } else {
            this.cart.renderContents(response);
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.submitButton.classList.remove("loading");
          if (this.cart && this.cart.classList.contains("is-empty")) this.cart.classList.remove("is-empty");
          if (!this.error) this.submitButton.removeAttribute("aria-disabled");
          this.querySelector(".loading-overlay__spinner").classList.add("hidden");
        });
    }

    handleButtonAddToCart() {
      if ( this.checkbox.checked || this.giftMessage.value ) {
        this.buttomSubmit.classList.add("active");
      } else if( this.checkbox.checked == false && !this.giftMessage.value  ) {
        this.buttomSubmit.classList.remove("active");
      }
    }
  }
);
