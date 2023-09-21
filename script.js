// PinchZoom class for pinch zooming
class PinchZoom {
  constructor(element) {
    this.element = element;
    this.scale = 1.0;
    this.originalScale = 1.0; // Store the original scale
    this.lastDistance = null;
    this.position = { x: 0, y: 0 }; // Store the position

    this.setEventListeners();
  }

  doZoom(delta) {
    const newScale = this.scale + delta;

    // Calculate the current width and height
    const currentWidth = this.element.clientWidth * newScale;
    const currentHeight = this.element.clientHeight * newScale;

    if (currentWidth >= 50 && currentHeight >= 50) {
      // Check if the new width and height are greater than or equal to 50px
      this.scale = newScale;
      this.element.style.transform = `scale(${this.scale}) translate(${this.position.x}px, ${this.position.y}px)`;
    }
  }

  setEventListeners() {
    // Touch events for pinch zoom
    this.element.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (e.targetTouches.length == 2) {
        // Pinch zoom
        const p1 = e.targetTouches[0];
        const p2 = e.targetTouches[1];
        const currentDistance = Math.sqrt(
          Math.pow(p2.pageX - p1.pageX, 2) + Math.pow(p2.pageY - p1.pageY, 2)
        );

        if (this.lastDistance !== null) {
          const delta = (currentDistance - this.lastDistance) / 100; // You can adjust the sensitivity
          this.doZoom(delta);
        }

        this.lastDistance = currentDistance;
      }
    });

    // Mouse scroll for pinch zoom
    this.element.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = -e.deltaY / 100; // You can adjust the sensitivity
      this.doZoom(delta);
    });

    // Reset lastDistance when touch ends
    this.element.addEventListener("touchend", () => {
      this.lastDistance = null;
    });
  }
}

// DraggableDiv class for dragging
class DraggableDiv {
  constructor(element, pinchZoom) {
    this.element = element;
    this.pinchZoom = pinchZoom;
    this.isDragging = false;
    this.position = { x: 0, y: 0 };
    this.lastX = 0;
    this.lastY = 0;

    this.setEventListeners();
  }

  doMove(deltaX, deltaY) {
    this.position.x += deltaX;
    this.position.y += deltaY;

    // Apply the position to the div
    this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px) scale(${this.pinchZoom.scale})`;
  }

  setEventListeners() {
    // Mouse click for dragging
    this.element.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;

      // Store the original position when dragging starts
      this.originalPosition = { ...this.position };
    });

    // Mouse move for dragging
    window.addEventListener("pointermove", (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.lastX;
        const deltaY = e.clientY - this.lastY;
        this.doMove(deltaX, deltaY);
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      }
    });

    // Mouse release to stop dragging
    window.addEventListener("pointerup", () => {
      this.isDragging = false;
    });
  }
}

const myDiv = document.getElementById("mydiv");

// Apply both classes to the same div element
const pinchZoom = new PinchZoom(myDiv);
const draggableDiv = new DraggableDiv(myDiv, pinchZoom);

// Handle zoom events for draggableDiv
pinchZoom.element.addEventListener("wheel", (e) => {
  e.preventDefault();
  const delta = -e.deltaY / 100; // You can adjust the sensitivity
  pinchZoom.doZoom(delta);

  // Restore the original position when zooming out
  if (pinchZoom.scale < pinchZoom.originalScale) {
    pinchZoom.position = { ...pinchZoom.originalPosition };
    pinchZoom.element.style.transform = `scale(${pinchZoom.scale}) translate(${pinchZoom.position.x}px, ${pinchZoom.position.y}px)`;
  }
});
