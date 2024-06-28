const interact = require('interactjs');
import quillControl from '../write/quill';

interact('.resize-drag')
  .resizable({
    // resize from all edges and corners
    edges: { left: true, right: true, bottom: true, top: true },

    listeners: {
      move(event) {
        var target = event.target;

        // Calculate width and height as percentages relative to the parent element
        var parentWidth = target.parentElement.offsetWidth;
        var parentHeight = target.parentElement.offsetHeight;

        var widthPercent = (event.rect.width / parentWidth) * 100;
        var heightPercent = (event.rect.height / parentHeight) * 100;

        // Update the element's style with percentage values
        target.style.width = widthPercent + '%';
        target.style.height = heightPercent + '%';

        // Use quill controller to update Quill editor
        quillControl.format('width', `${parseFloat(widthPercent).toFixed(2)}%`);
        quillControl.format('height', `${parseFloat(heightPercent).toFixed(2)}%`);

        // Translate when resizing from top or left edges
        var x = (parseFloat(target.getAttribute('data-x')) || 0);
        var y = (parseFloat(target.getAttribute('data-y')) || 0);
        x += event.deltaRect.left;
        y += event.deltaRect.top;
        target.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);

        target.textContent = Math.round(event.rect.width) + '\u00D7' + Math.round(event.rect.height);
      }
    },
    modifiers: [
      // Keep the edges inside the parent
      interact.modifiers.restrictEdges({
        outer: 'parent',
        endOnly: true // Allow free resizing without constraints before the end of action
      }),

      // Minimum size
      interact.modifiers.restrictSize({
        min: { width: 100, height: 50 }
      })
    ],

    inertia: true
  })
  .draggable({
    listeners: { move: window.dragMoveListener },
    inertia: true,
    modifiers: [
      interact.modifiers.restrictRect({
        restriction: 'parent',
        endOnly: true
      })
    ]
  });
