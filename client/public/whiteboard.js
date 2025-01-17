document.addEventListener('DOMContentLoaded', () => {
    const canvas = new fabric.Canvas('canvas', {
        isDrawingMode: true
    });

    // Make canvas responsive
    function resizeCanvas() {
        canvas.setWidth(window.innerWidth * 0.95);
        canvas.setHeight(window.innerHeight - 300);
        canvas.renderAll();
    }

    // Initial resize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Tool elements
    const pencilBtn = document.getElementById('pencil');
    const eraserBtn = document.getElementById('eraser');
    const textBtn = document.getElementById('text');
    const rectangleBtn = document.getElementById('rectangle');
    const circleBtn = document.getElementById('circle');
    const lineBtn = document.getElementById('line');
    const undoBtn = document.getElementById('undo');
    const redoBtn = document.getElementById('redo');
    const colorPicker = document.getElementById('colorPicker');
    const brushSize = document.getElementById('brushSize');
    const clearBtn = document.getElementById('clear');
    const saveBtn = document.getElementById('save');

    // Set up drawing brush
    canvas.freeDrawingBrush.width = 5;
    canvas.freeDrawingBrush.color = '#000000';

    // Tool handlers
    pencilBtn.addEventListener('click', () => {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = colorPicker.value;
        pencilBtn.classList.add('active');
        eraserBtn.classList.remove('active');
        textBtn.classList.remove('active');
        rectangleBtn.classList.remove('active');
        circleBtn.classList.remove('active');
        lineBtn.classList.remove('active');
    });

    eraserBtn.addEventListener('click', () => {
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush.color = '#ffffff';
        eraserBtn.classList.add('active');
        pencilBtn.classList.remove('active');
        textBtn.classList.remove('active');
        rectangleBtn.classList.remove('active');
        circleBtn.classList.remove('active');
        lineBtn.classList.remove('active');
    });

    textBtn.addEventListener('click', () => {
        canvas.isDrawingMode = false;
        const text = new fabric.IText('Double-click to edit', {
            left: 100,
            top: 100,
            fill: colorPicker.value,
            fontSize: brushSize.value
        });
        canvas.add(text).setActiveObject(text);
        text.enterEditing();
        text.selectAll();
        textBtn.classList.add('active');
        pencilBtn.classList.remove('active');
        eraserBtn.classList.remove('active');
        rectangleBtn.classList.remove('active');
        circleBtn.classList.remove('active');
        lineBtn.classList.remove('active');
    });

    rectangleBtn.addEventListener('click', () => {
        canvas.isDrawingMode = false;
        const rect = new fabric.Rect({
            left: 100,
            top: 100,
            fill: colorPicker.value,
            width: 100,
            height: 100
        });
        canvas.add(rect).setActiveObject(rect);
        rectangleBtn.classList.add('active');
        pencilBtn.classList.remove('active');
        eraserBtn.classList.remove('active');
        textBtn.classList.remove('active');
        circleBtn.classList.remove('active');
        lineBtn.classList.remove('active');
    });

    circleBtn.addEventListener('click', () => {
        canvas.isDrawingMode = false;
        const circle = new fabric.Circle({
            left: 100,
            top: 100,
            fill: colorPicker.value,
            radius: 50
        });
        canvas.add(circle).setActiveObject(circle);
        circleBtn.classList.add('active');
        pencilBtn.classList.remove('active');
        eraserBtn.classList.remove('active');
        textBtn.classList.remove('active');
        rectangleBtn.classList.remove('active');
        lineBtn.classList.remove('active');
    });

    lineBtn.addEventListener('click', () => {
        canvas.isDrawingMode = false;
        const line = new fabric.Line([50, 100, 200, 200], {
            left: 100,
            top: 100,
            stroke: colorPicker.value,
            strokeWidth: brushSize.value
        });
        canvas.add(line).setActiveObject(line);
        lineBtn.classList.add('active');
        pencilBtn.classList.remove('active');
        eraserBtn.classList.remove('active');
        textBtn.classList.remove('active');
        rectangleBtn.classList.remove('active');
        circleBtn.classList.remove('active');
    });

    colorPicker.addEventListener('input', (e) => {
        canvas.freeDrawingBrush.color = e.target.value;
        pencilBtn.classList.add('active');
        eraserBtn.classList.remove('active');
    });

    brushSize.addEventListener('input', (e) => {
        canvas.freeDrawingBrush.width = parseInt(e.target.value);
    });

    clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the canvas?')) {
            canvas.clear();
        }
    });

    saveBtn.addEventListener('click', () => {
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1
        });
        const link = document.createElement('a');
        link.download = 'whiteboard.png';
        link.href = dataURL;
        link.click();
    });

    // Handle responsive navigation
    document.querySelector('.hamburger-menu').addEventListener('click', function() {
        this.classList.toggle('active');
        document.querySelector('.sidebar').classList.toggle('active');
        document.querySelector('.overlay').classList.toggle('active');
    });

    document.querySelector('.overlay').addEventListener('click', function() {
        document.querySelector('.hamburger-menu').classList.remove('active');
        document.querySelector('.sidebar').classList.remove('active');
        this.classList.remove('active');
    });

    // Canvas history for undo/redo
    const canvasHistory = [];
    let historyIndex = -1;

    function saveHistory() {
        if (historyIndex < canvasHistory.length - 1) {
            canvasHistory.splice(historyIndex + 1);
        }
        canvasHistory.push(JSON.stringify(canvas));
        historyIndex++;
        updateUndoRedoButtons();
    }

    function updateUndoRedoButtons() {
        undoBtn.disabled = historyIndex <= 0;
        redoBtn.disabled = historyIndex >= canvasHistory.length - 1;
    }

    canvas.on('object:added', saveHistory);
    canvas.on('object:modified', saveHistory);
    canvas.on('object:removed', saveHistory);

    undoBtn.addEventListener('click', () => {
        if (historyIndex > 0) {
            historyIndex--;
            canvas.loadFromJSON(canvasHistory[historyIndex], canvas.renderAll.bind(canvas));
            updateUndoRedoButtons();
        }
    });

    redoBtn.addEventListener('click', () => {
        if (historyIndex < canvasHistory.length - 1) {
            historyIndex++;
            canvas.loadFromJSON(canvasHistory[historyIndex], canvas.renderAll.bind(canvas));
            updateUndoRedoButtons();
        }
    });

    // Initial save to history
    saveHistory();
});