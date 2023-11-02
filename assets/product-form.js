if (!customElements.get('product-form')) {
  customElements.define('product-form', class ProductForm extends HTMLElement {
    constructor() {
      super();

      this.form = this.querySelector('form');
      this.form.querySelector('[name=id]').disabled = false;
      this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
      this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
      this.submitButton = this.querySelector('[type="submit"]');
      if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

      this.listProductUpsell = document.querySelectorAll('.product__upsell input[type="checkbox"]');
      this.price = document.querySelector('.product__info-container .price.price--on-sale');

      if ( this.price) {
        this.productPrice = document.querySelector('.price__container .price__sale span.price-item');
      } else {
        this.productPrice = document.querySelector('.price__container .price__regular span.price-item');
      }

      this.calcPrice();
    }

    onSubmitHandler(evt) {
      evt.preventDefault();
      if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

      this.handleErrorMessage();

      this.submitButton.setAttribute('aria-disabled', true);
      this.submitButton.classList.add('loading');
      this.querySelector('.loading-overlay__spinner').classList.remove('hidden');  

      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];

      const formData = new FormData(this.form);
      if (this.cart) {
        formData.append('sections', this.cart.getSectionsToRender().map((section) => section.id));
        formData.append('sections_url', window.location.pathname);
        this.cart.setActiveElement(document.activeElement);
      }
 
      config.body = this.createNewFormData(formData);
      config.headers['Content-Type'] = 'application/json';
      
      fetch(`${routes.cart_add_url}`, config)
        .then((response) => response.json())
        .then((response) => {
          if (response.status) {
            this.handleErrorMessage(response.description);

            const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
            if (!soldOutMessage) return;
            this.submitButton.setAttribute('aria-disabled', true);
            this.submitButton.querySelector('span').classList.add('hidden');
            soldOutMessage.classList.remove('hidden');
            this.error = true;
            return;
          } else if (!this.cart) {
            window.location = window.routes.cart_url;
            return;
          }

          if (!this.error) publish(PUB_SUB_EVENTS.cartUpdate, {source: 'product-form'});
          this.error = false;
          const quickAddModal = this.closest('quick-add-modal');
          if (quickAddModal) {
            document.body.addEventListener('modalClosed', () => {
              setTimeout(() => { this.cart.renderContents(response) });
            }, { once: true });
            quickAddModal.hide(true);
          } else {
            this.cart.renderContents(response);
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.submitButton.classList.remove('loading');
          if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
          if (!this.error) this.submitButton.removeAttribute('aria-disabled');
          this.querySelector('.loading-overlay__spinner').classList.add('hidden');
        });
    }

    handleErrorMessage(errorMessage = false) {
      this.errorMessageWrapper = this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
      if (!this.errorMessageWrapper) return;
      this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

      this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

      if (errorMessage) {
        this.errorMessage.textContent = errorMessage;
      }
    }

    calcPrice() {
      let priceCurrent = Number( this.productPrice.getAttribute('data-price'));
      this.listProductUpsell.forEach((productUpsell) => {
        productUpsell.addEventListener('change', () => {
          let totalPriceUpsell = 0;
          this.listProductUpsell.forEach(product => {
            if (product.checked) {
              let priceUpsell = Number(product.value);   
              totalPriceUpsell = totalPriceUpsell + priceUpsell;    
            }
          });          
          let totalPrice = Shopify.formatMoney(priceCurrent + totalPriceUpsell);          
          this.productPrice.innerHTML = totalPrice; 
        });
      });
    }

    createNewFormData(formData) { 
      let numberRandom;
      if ( document.querySelectorAll('.product__upsell input:checked').length === 0 ) {
        numberRandom = 0;        
      } else {
        numberRandom = Math.random();    
      }

      let productMessage = document.querySelector('.product__message textarea').value;

      let objProduct = {
        quantity: Number(formData.get("quantity")),
        id: Number(formData.get("id")),
        properties: {
          _tags: product.tags,
          _group_product: numberRandom,
          gift_message: productMessage
        }
      };

      let products = Array.from(document.querySelectorAll('.product__upsell input:checked'))
      .map(product => ({
        quantity:1,
        id: Number(product.getAttribute('data-id')),
        properties: {
          add_on: Number(formData.get("id")),
          _group_product: numberRandom
        }
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
        'items': arrProductNew,
        sections: formData.get("sections"),
        sections_url: formData.get("sections_url")
      };

      return JSON.stringify(arrProduct); 
    }
  });
}
