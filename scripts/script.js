var x = new Array();
var y = new Array();
var z = new Array();
var drawing;
let model;

// Create Canvas into DOM
var canvasBox = document.getElementById('canvas_box');
var canvas    = document.createElement("canvas");
var clearButton = document.getElementsByClassName('clear');
let resultsDiv = document.getElementsByClassName('results')[0];

canvas.setAttribute("width", 150);
canvas.setAttribute("height", 150);
canvas.setAttribute("id", "canvas");
canvasBox.appendChild(canvas);
context = canvas.getContext("2d");


$("#canvas").mousedown(function(e) {
	var rect = canvas.getBoundingClientRect();
	var mouseX = e.clientX- rect.left;;
	var mouseY = e.clientY- rect.top;
	drawing = true;
	addUserGesture(mouseX, mouseY);
	drawOnCanvas();
});


canvas.addEventListener("touchstart", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}

	var rect = canvas.getBoundingClientRect();
	var touch = e.touches[0];

	var mouseX = touch.clientX - rect.left;
	var mouseY = touch.clientY - rect.top;

	drawing = true;
	addUserGesture(mouseX, mouseY);
	drawOnCanvas();

}, false);


$("#canvas").mousemove(function(e) {
	if(drawing) {
		var rect = canvas.getBoundingClientRect();
		var mouseX = e.clientX- rect.left;;
		var mouseY = e.clientY- rect.top;
		addUserGesture(mouseX, mouseY, true);
		drawOnCanvas();
	}
});


canvas.addEventListener("touchmove", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	if(drawing) {
		var rect = canvas.getBoundingClientRect();
		var touch = e.touches[0];

		var mouseX = touch.clientX - rect.left;
		var mouseY = touch.clientY - rect.top;

		addUserGesture(mouseX, mouseY, true);
		drawOnCanvas();
	}
}, false);


$("#canvas").mouseup(function(e) {
	drawing = false;
});


canvas.addEventListener("touchend", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	drawing = false;
}, false);


$("#canvas").mouseleave(function(e) {
	drawing = false;
});


canvas.addEventListener("touchleave", function (e) {
	if (e.target == canvas) {
    	e.preventDefault();
  	}
	drawing = false;
}, false);


function addUserGesture(x, y, dragging) {
	x.push(x);
	y.push(y);
	z.push(dragging);
}


function drawOnCanvas() {
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

	ctx.strokeStyle = "white";
	ctx.lineJoin    = "round";
	ctx.lineWidth   = 10;

	for (var i = 0; i < x.length; i++) {
		ctx.beginPath();
		if(z[i] && i) {
			ctx.moveTo(x[i-1], y[i-1]);
		} else {
			ctx.moveTo(x[i]-1, y[i]);
		}
		ctx.lineTo(x[i], y[i]);
		ctx.closePath();
		ctx.stroke();
	}
}

async function predictDigit(){
   // get image data from canvas
	var imageData = canvas.toDataURL();
	// preprocess canvas
	let tensor = preprocessCanvas(canvas);
   
	// make predictions on the preprocessed image tensor
	let predictions = await model.predict(tensor).data();

	// get the model's prediction results
	let results = Array.from(predictions);

   displayLabel(results)
}

function clearCanvas(){
   ctx.clearRect(0, 0, 150, 150);
	x = new Array();
	y = new Array();
   z = new Array();
   resultsDiv.style.display = "none";
}


async function loadModel() {
 
   model = undefined;
   
   model = await tf.loadLayersModel("../models/model.json");
   
 }
 
 loadModel();

 function preprocessCanvas(image) {
	// resize the input image to target size of (1, 28, 28)
	let tensor = tf.browser.fromPixels(image)
		.resizeNearestNeighbor([28, 28])
		.mean(2)
		.expandDims(2)
		.expandDims()
		.toFloat();
	console.log(tensor.shape);
	return tensor.div(255.0);
}


function calculateResults(data) {
	var max = data[0];
    var maxIndex = 0;

    for (var i = 1; i < data.length; i++) {
        if (data[i] > max) {
            maxIndex = i;
            max = data[i];
        }
    }
    resultsDiv.innerHTML = "I predict a " + maxIndex + " with " + Math.trunc( max*100 )+ "% confidence";
    resultsDiv.style.display = "block"

}