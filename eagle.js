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
    canvas.setAttribute("style", "background:#008cFF;width:300px;height:250px;");
    
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
    
    var logo = new Image();
    
    //base64 SVG of the Now Native logo.
    logo.src = 'data:image/svg+xml;utf8,<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="262.531px" height="52.392px" viewBox="0 0 262.531 52.392" enable-background="new 0 0 262.531 52.392" xml:space="preserve"><g><path fill="#FFFFFF" d="M14.277,26.342V51.8c-4.588,0-9.177,0-13.691,0V-0.226h4.811L31.595,25.38V-0.004c4.514,0,9.028,0,13.543,0 v51.878h-4.736L14.277,26.342z"/><path fill="#FFFFFF" d="M87.316,45.287H66.891L63.856,51.8H50.906v-1.924L74.217-0.67h5.698l23.386,50.545V51.8H90.35 L87.316,45.287z M77.029,20.348l-5.846,13.617h11.841L77.029,20.348z"/><path fill="#FFFFFF" d="M100.633,11.837c0-3.996,0-7.918,0-11.841h38.483c0,3.922,0,7.845,0,11.841h-12.655V51.8 c-4.367,0-8.733,0-13.099,0V11.837H100.633z"/><path fill="#FFFFFF" d="M168.419,40.181V51.8h-26.272V40.181h6.587v-28.64h-6.069V-0.004h25.236v11.545h-6.068v28.64H168.419z"/><path fill="#FFFFFF" d="M197.203,29.302h0.37l11.841-29.306h12.729v1.998l-21.979,50.397h-5.624L172.337,1.994v-1.998h12.729 L197.203,29.302z"/><path fill="#FFFFFF" d="M261.879,11.837c-7.695,0-11.543,0-19.167,0v7.327h17.614c0,3.922,0,7.845,0,11.767h-17.614 c0,3.034,0,5.995,0,9.103c7.623,0,12.063,0,19.833,0c0,3.848,0,7.844,0,11.767c-12.136,0-21.016,0-33.005,0 c0-17.317,0-34.634,0-51.804c11.989,0,20.203,0,32.339,0C261.879,3.845,261.879,7.841,261.879,11.837z"/></g></svg>';
    
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
        if(logo.height !== undefined){
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