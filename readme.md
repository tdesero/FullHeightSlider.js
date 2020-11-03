required markup:

```
<div id="fullscreen-slide-container">
    <div class="fullscreen-slide">
      Slide1
    </div>
    <div class="fullscreen-slide">
      Slide2
    </div>
    <div class="fullscreen-slide">
      Slide3
    </div>
    <div class="fullscreen-slider-nav">
    </div>
</div>
```

initializing with:

```
const slider = new FullHeightSlider({
  freezeTime: 1500
});

slider.init();
```