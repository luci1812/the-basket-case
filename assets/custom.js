// Featured collection 
(function FeaturedCollectionSlide() {
  let listElem = document.querySelectorAll('.collection__slider');
  listElem.forEach(( elem ) => {
    let dataItem = elem.getAttribute('data-class');
    let slideItem = document.querySelector(`[data-class=${dataItem}]`);
    if (slideItem) {
      let flkty = new Flickity( slideItem, {
        cellAlign: 'left',
        prevNextButtons: true,
        freeScroll: false,
        contain: true,
        wrapAround: true,
        pageDots: true
      });
    }
  })
})();


// Footer 
class CollapsibleContent extends HTMLElement {
  constructor(){
    super();
    this.headingMobile = this.querySelector('.collabsible__title--mobile');
    this.heading = this.querySelector('.collabsible__title');
    let bodyWidth = document.querySelector('body').offsetWidth;

    if (this.headingMobile && bodyWidth < 750) {
      this.headingMobile.addEventListener('click', this.showContent.bind(this));
    }

    if (this.heading) {
      this.heading.addEventListener('click', this.showContent.bind(this));      
    }

  }

  showContent() {
    let _this = this;
    _this.classList.toggle('active');
  }
}

customElements.define('collapsible-content', CollapsibleContent);


// Header
const menuItems = document.querySelectorAll('.header__menu-item--child');
let isMegamenuHovered = false;
let isMenuItemHovered = false;

menuItems.forEach(menuItem => {
  const megamenu = menuItem.nextElementSibling;

  if (megamenu) {
    megamenu.addEventListener('mouseenter', () => {
      document.body.classList.add('header__active');
      megamenu.classList.add('active');
      menuItem.parentElement.classList.add('active');
      isMegamenuHovered = true;
    });

    megamenu.addEventListener('mouseleave', () => {
      isMegamenuHovered = false;
        if (!isMegamenuHovered && !menuItem.matches(':hover')) {
          document.body.classList.remove('header__active');
          megamenu.classList.remove('active');
          menuItem.parentElement.classList.remove('active');
        }
    });
  }

  menuItem.addEventListener('mouseenter', () => {
    if (megamenu) {
      document.body.classList.add('header__active');
      megamenu.classList.add('active');
      menuItem.parentElement.classList.add('active');
      isMenuItemHovered = true;
    }
  });

  menuItem.addEventListener('mouseleave', () => {
    if (megamenu) {
      if (!isMegamenuHovered && !megamenu.matches(':hover')) {
        document.body.classList.remove('header__active');
        megamenu.classList.remove('active');
        menuItem.parentElement.classList.remove('active');
      }   
    }
  });
});


// Collection 
class CollectionDescription extends HTMLElement {
  constructor(){
    super();
    this.buttonReadMore = this.querySelector('.js-read-more');
    this.buttonReadLess = this.querySelector('.js-read-less');
    this.collectionContent = this.querySelector('.collection__description--content');
    let heightContent;

    if ( document.querySelector('body').offsetWidth > 749) {
      heightContent = 48;
    } else {
      heightContent = 118;
    }    

    if (this.collectionContent.offsetHeight > heightContent ) {
      this.buttonReadMore.classList.add('active');
      this.collectionContent.classList.add('hide-content');
    }

    this.buttonReadMore.addEventListener('click', this.showContent.bind(this));
    this.buttonReadLess.addEventListener('click', this.hideContent.bind(this));
  }

  showContent() {
    this.collectionContent.classList.add('active');
    this.collectionContent.classList.remove('hide-content');
    this.buttonReadMore.classList.remove('active');
    this.buttonReadLess.classList.add('active');
  }

  hideContent() {
    this.collectionContent.classList.remove('active');
    this.buttonReadMore.classList.add('active');
    this.buttonReadLess.classList.remove('active');
    this.collectionContent.classList.add('hide-content');
  }

}

customElements.define('collection-desctiption', CollectionDescription);


// Product upsells 

(function ProductUpsellsSlide() {
  let listElem = document.querySelectorAll('.slide__upsells');
  listElem.forEach(( elem ) => {
    let dataItem = elem.getAttribute('data-class');
    let slideItem = document.querySelector(`[data-class=${dataItem}]`);
    if (slideItem) {
      let flkty = new Flickity( slideItem, {
        cellAlign: 'left',
        prevNextButtons: true,
        freeScroll: false,
        contain: true,
        wrapAround: true,
        pageDots: true
      });
      
      let carouselStatus = slideItem.nextElementSibling;
      function updateStatus() {
        let slideNumber = flkty.selectedIndex + 1;
        carouselStatus.textContent = slideNumber + ' / ' + flkty.slides.length;
      }
      updateStatus();
    
      flkty.on( 'select', updateStatus );
    }
  });
})();


// Related Articles 

(function RelatedArticles() {
  let relatedProducts = document.querySelector('.template-article .section-featured-collection');
  let relatedArticles = document.querySelector('.relatedArticles');

  if ( relatedProducts && relatedArticles ) {
    relatedProducts.appendChild(relatedArticles);
  }

  let countArticles = Array.from(document.querySelectorAll('.relate-article__item')).length;
  let elem = document.querySelector('.relatedArticles__slider');

  if (elem && countArticles > 3 ) {
    elem.classList.remove('relatedArticles__grid');
    let flkty = new Flickity( elem, {
      cellAlign: 'left',
      prevNextButtons: false,
      freeScroll: false,
      contain: true,
      wrapAround: true,
      pageDots: true
    });
  }
})();


