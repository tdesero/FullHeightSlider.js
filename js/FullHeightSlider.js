
class FullHeightSlider {
  constructor(options = {}) {
      this.onNextSlide = options.onNextSlide ? options.onNextSlide : undefined,
      this.onPrevSlide = options.onPrevSlide ? options.onPrevSlide : undefined,
      this.onChangeSlide = options.onChangeSlide ? options.onChangeSlide : undefined,
      this.onLeave= options.onLeave ? options.onLeave : undefined,
      this.freezeTime = options.freezeTime ? options.freezeTime : 1500; /* in ms */

      this.container = document.querySelector('#fullscreen-slide-container');
      this.slides = this.container.querySelectorAll('.fullscreen-slide');
      this.nav = this.container.querySelector('.fullscreen-slider-nav');
      this.navDots = [];
      this.active = 0; /* index of active: first one is active */
      this.freeze = false;
      
      this.touchStart = false;
      this.touchPosStart;
      this.lastTouchPos;
      this.unlock = false;
      this.isAtBottom = false;

      /* bindings */
      this.handleWheel = this.handleWheel.bind(this);
      this.handleTouchStart = this.handleTouchStart.bind(this);
      this.handleTouchMove = this.handleTouchMove.bind(this);
      this.handleTouchEnd = this.handleTouchEnd.bind(this);
      this.handleScroll = this.handleScroll.bind(this);
      this.handleKey = this.handleKey.bind(this);
  }

  init() {

      if ('scrollRestoration' in history) {
          history.scrollRestoration = 'manual';
      }
      window.scrollTo(0,0);

      document.addEventListener('wheel', this.handleWheel, { passive: false });
      this.container.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      window.addEventListener('scroll', this.handleScroll, { passive: false });
      document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      document.addEventListener('touchend', this.handleTouchEnd);
      document.addEventListener('keydown', this.handleKey);  

      this.slides[this.active].classList.add('active');

      this.createNavigation();
  }

  handleTouchStart(e) {
      if ((window.scrollY || window.pageYOffset) > 5) return;

      if ( (this.active === this.slides.length -1) && !this.isAtBottom) {
        this.isAtBottom = true;
        this.unlock = true;
        setTimeout( function() {
          this.unlock = false;
        }.bind(this), this.freezeTime);
      }

      if (this.unlock) return;
      if ( !e.target.matches('a, button, a>*') ) {
        e.preventDefault();
      }

      this.touchStart = true;
      this.touchPosStart = e.touches[0].clientY;
      this.lastTouchPos = e.touches[0].clientY;
      this.isAtBottom = false;
  }
    
  handleTouchMove(e) {
      let shouldPreventScroll = !this.unlock && this.active !== (this.slides.length - 1);
      if (shouldPreventScroll) {
        e.preventDefault();
      }
      this.lastTouchPos = e.touches[0].clientY;
  }
    
  handleTouchEnd(e) {
      if (this.active === this.slides.length -1) {
        if (this.onLeave) {
          this.onLeave();
        }
      }
      
      if (!this.touchStart) return; /* do nothing if touch was not startet */

      if ( (this.active !== this.slides.length -1) && (this.lastTouchPos - this.touchPosStart < -50) ) {
        if ( !this.freeze ) {
          this.nextSlide(); 
        }
      } else if ( (this.active !== 0) && (this.lastTouchPos - this.touchPosStart > 50) ) {
        if (!this.freeze) {
          this.prevSlide(); 
        }
      }

      this.touchStart = false; /* reset touchStart */
  }
    
  handleWheel(e) {
      if ((window.scrollY || window.pageYOffset) > 5 ) {
        if (this.onLeave) {
          this.onLeave();
        }
        return;
      }
      
      if (this.freeze) {
        e.preventDefault();
        return;
      } 
        
      if ( (this.active !== this.slides.length -1) && (e.deltaY > 0) ) {
        e.preventDefault();
        if ( !this.freeze ) {
          this.nextSlide();
        }
      } else if ( (this.active !== 0) && (e.deltaY < 0) ) {
        e.preventDefault();
        if ( !this.freeze ) {
          this.prevSlide();
        }
      } 
  }
    
  handleScroll(e) {
    let shouldPreventScroll = !this.unlock && this.active !== (this.slides.length - 1);
    if ( shouldPreventScroll ) {
      e.preventDefault();
      e.stopPropagation();
      window.scrollTo(0,0);
    }
  }

  handleKey(e) {
    if (this.freeze) {
      e.preventDefault();
      return;
    } 

    if (e.key === "ArrowDown" && (this.active !== this.slides.length -1)) {
      e.preventDefault();
      this.nextSlide();
    }
    if (e.key === "ArrowUp" && (this.active !== 0) && ((window.scrollY || window.pageYOffset) < 5)) {
      e.preventDefault();
      this.prevSlide();
    }
  }
    
  nextSlide() {
      this.changeSlide(+1);

      if (this.onNextSlide) {
        this.onNextSlide(this.active);
      }
  }
    
  prevSlide() {
      this.changeSlide(-1);

      if (this.onPrevSlide) {
        this.onPrevSlide(this.active);
      }
  }
  
  /**
   * Jump to another Slide relatively(!) from current active Slide
   * @param {number} value either +1 or -1 to jump to next or previous slide
   */
  changeSlide(value) {

      this.freeze = true;
      let inClass = value > 0 ? 'fadeInUp' : 'fadeInDown';
      let outClass = value > 0 ? 'fadeOutUp' : 'fadeOutDown';
      
      this.slides[this.active].classList.remove('active');
      this.slides[this.active].classList.add( outClass );
      this.navDots[this.active].classList.remove('active');

      this.active += value;

      this.slides[this.active].classList.add('active', inClass );
      this.navDots[this.active].classList.add('active');

      const deleteClass = function() {
        this.slides[this.active].classList.remove( inClass );
        this.slides[this.active - value].classList.remove( outClass );
        this.freeze = false;
      };
      setTimeout( deleteClass.bind(this), this.freezeTime);

      if (this.onChangeSlide) {
        this.onChangeSlide(this.active);
      }
  }

  /**
   * Jump to a specific slide via the index
   * @param {number} index
   */
  jumpToSlide(index) {
    const diff = index - this.active;
    this.changeSlide(diff);
  }

  createNavigation() {
    this.slides.forEach( ( slide, index) => {
      const dot = document.createElement('div');
      dot.classList.add('nav-dot');
      if ( index === this.active ) {
        dot.classList.add('active');
      }
      dot.addEventListener( 'click', () => {
        if (!this.freeze) {
          this.jumpToSlide(index);
        }
      });
      this.navDots[index] = dot;
      this.nav.appendChild(dot);
    });
  }
}