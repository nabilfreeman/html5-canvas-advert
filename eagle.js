//this is an anonymous function to prevent conflicts.
(function(){
    //a bunch of init variables. here we have canvas size (doubled because of retina, it will render at MPU size).
    var c_width = 600;
    var c_height = 500;
    
    //these are position settings. The canvas will increment, modify and reset these depending on animation keyframe.
    var text_position_x = 40;
    var text_opacity = 0;
    var text_tween_movement = 10;
    var background_base_position = c_width / 4;
    var background_width = c_width / 4;
    var background_tween_movement = 0.3;
    
    //text that we're going to alternate with array.reverse();
    var captions = [
        "Started from the bottom, now we're here.",
        "Now Native is the future of online advertising."
    ]
    
    //the master keyframe position. requestAnimationFrame will render at approx 60fps, and keyframe increments on every frame render.
    var keyframe = 0;
    
    //let's generate a canvas.
    var canvas = document.createElement("canvas");
    canvas.width = c_width;
    canvas.height = c_height;
    canvas.setAttribute("style", "background:#008cFF;width:300px;height:250px;cursor:pointer;");

    canvas.addEventListener("click", function(){
        window.open("http://nownative.com", "_blank");
    });
    
    //this should be smarter. the ideal behaviour would be to embed the canvas element exactly in the DOM where the script gets executed. you could achieve this with documentwrite, but that means sacrificing asynchronous loading.
    document.body.appendChild(canvas);
    
    //context for canvas, this is like the "paintbrush"
    var x = canvas.getContext("2d");
    
    //neat wrapText function found at:
    //http://www.html5canvastutorials.com/tutorials/html5-canvas-wrap-text-tutorial/
    //...thanks!
    var wrapText = function(context, text, x, y, maxWidth, lineHeight) {
        var words = text.split(' ');
        var line = '';
        
        for(var n = 0; n < words.length; n++) {
            var testLine = line + words[n] + ' ';
            var metrics = context.measureText(testLine);
            var testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                context.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            }
            else {
                line = testLine;
            }
        }
        context.fillText(line, x, y);
    }
    
    let logoLoaded = false;
    var logo = new Image();
    
    logo.onload = function(){
        logoLoaded = true;
    }

    logo.onerror = function(error){
        console.log("Error loading logo", error);
    }

    //base64 SVG of the Now Native logo.
    logo.src = './logo.svg';
    
    //the big function. This runs on every frame and...
    //1) wipes the canvas to redraw. this happens so fast you don't see the "flicker".
    //2) does some Maths to work out the new positions of the objects like slick background, text etc.
    //3) draws these objects in their new position
    //4) logic that watches the keyframe position, works out if it's time to reset things and then increments the keyframe counter
    var draw = function(){
        x.clearRect(0, 0, c_width, c_height);
        
        
        //this is a neato triangle shape thing for the background.
        //we make it move left and right by using the logic at the bottom of this function.
        x.fillStyle = "rgba(255,255,255,0.1)";
        x.beginPath();
        //start
        x.moveTo(background_base_position + background_width, 0);
        
        //corners
        x.lineTo(c_width, 0);
        x.lineTo(c_width, c_height);
        
        //the bottom point of the diagonal line.
        x.lineTo(background_base_position, c_height);
        
        //finish is the same as start. close off the diagonal line.
        x.lineTo(background_base_position + background_width, 0);
        
        //like the paint bucket in MS paint. Fill!
        x.fill();
    
        //our caption formatting. note the wrapText function
        //we also always use the first element in the captions array, and flip the array when it's time to change the text.
        x.font = "300 60px Helvetica Neue, Helvetica, Arial, sans-serif";
        x.fillStyle = "rgba(255,255,255," + text_opacity + ")";
        wrapText(x, captions[0], text_position_x, 100, c_width - 80, 80);
        
        //image - this can load asynchronously, hence the undefined check.
        if(logoLoaded && logo.height !== undefined){
            var newHeight = 50;
            var ratio = newHeight / logo.height;
            
            var newWidth = logo.width * ratio;
            
            x.drawImage(logo, 40, c_height - 60 - newHeight, newWidth, newHeight);   
        }
        
        //increment stuff
        //text
        if(keyframe > 200){
            text_position_x += (text_tween_movement *= 1.04);
            text_opacity -= 0.02;
        } else {
            text_opacity += 0.05;
            if(text_opacity > 1){
                text_opacity = 1;   
            }
        }
        
        //background
        background_base_position += background_tween_movement;
        
        if(background_base_position > (c_width/4)*2 || background_base_position < c_width/4){
            background_tween_movement *= -1;
        }
        
        //reset code
        if(keyframe > 250){
            if(text_position_x > c_width){
                text_position_x = 40;
                text_opacity = 0;
                keyframe = 0;
                text_tween_movement = 10;
                captions.reverse();
            }
        }
        
        //increment the keyframe and re-run
        keyframe += 1;
        requestAnimationFrame(draw);
    };
    
    //push the ball down the hill
    draw();
})();
