import Matter from 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/+esm'

var Mushy = (function() {
    console.clear();
    
    const originalHTML = document.querySelector("html").outerHTML;

    // Clear junk animation frames (for refreshes on Khan Academy)
    for (let i = window.requestAnimationFrame(function() {}); i > 0; i--) {
        window.cancelAnimationFrame(i);
    }

    /**
     * Math class extensions that use degrees.
    **/
    class Mathf {

        /**
         * Constrains a value between the given minimum and maximum.
         * 
         * @param {number} value - The value to constrain.
         * @param {number} min - The minimum range to constrain to.
         * @param {number} max - The maximum range to constrain to.
         * @returns {number} The constrained value.
        **/
        static constrain(value, min, max) {
            return Math.min(max, Math.max(value, min));
        }

        /**
         * Converts degrees to radians.
         * 
         * @param {number} degrees
         * @returns {number} The angle converted to radians.
        **/
        static radians(degrees) {
            return degrees * (Math.PI / 180);
        }

        /**
         * Converts radians to degrees.
         * 
         * @param {number} radians
         * @returns {number} The angle converted to degrees.
        **/
        static degrees(radians) {
            return radians * (180 / Math.PI);
        }

        
        /**
         * Maps a value from one range to another.
         * 
         * @param {number} value - The value to map.
         * @param {number} start1
         * @param {number} stop1
         * @parm {number} start2
         * @param {number} stop2
         * @returns {number} The mapped value.
        **/
        static map(value, start1, stop1, start2, stop2) {
            let mappedValue = start2 + ((value - start1) * (stop2 - start2)) / (stop1 - start1);

            if (start2 < stop2) {
                mappedValue = Math.max(start2, Math.min(stop2, mappedValue));
            } else {
                mappedValue = Math.max(stop2, Math.min(start2, mappedValue));
            }

            return mappedValue;
        }

        /**
         * Linearly interpolates between 2 values given a range of 0-1
         * @param {number} start
         * @param {number} stop
         * @param {number} amount - A value between zero and one.
         * @returns {number} The lerped value.
        **/
        static lerp(start, stop, amt) {
            return start + (stop - start) * amt;
        }

        /**
         * Returns the position of a value in a range, represented as a 0-1 value.
         * 
         * @param {number} start
         * @param {number} stop
         * @param {number} value - A number between start and stop.
         * @returns {number} A 0-1 value.
        **/
        static inverseLerp(start, stop, value) {
            return (value - start) / (stop - start);
        }

        /**
         * Returns the value of sine given an angle in degrees
         * 
         * @param {number} degrees
         * @returns {number}
        **/
        static sin(degrees) {
            return Math.sin(this.radians(degrees));
        }

        /**
         * Returns the value of cosine given an angle in degrees
         * 
         * @param {number} degrees
         * @returns {number}
        **/
        static cos(degrees) {
            return Math.cos(this.radians(degrees));
        }

        /**
         * Returns the value of tangent given an angle in degrees
         * 
         * @param {number} degrees
         * @returns {number}
        **/
        static tan(degrees) {
            return Math.tan(this.radians(degrees));
        }

        /**
         * Returns the value of arctangent given an angle in degrees
         * 
         * @param {number} degrees
         * @returns {number}
        **/
        static atan(degrees) {
            return Math.atan(this.radians(degrees));
        }

        /**
         * Returns the value of atan2 given an angle in degrees
         * 
         * @param {number} degrees
         * @returns {number}
        **/
        static atan2(degrees) {
            return Math.atan2(this.radians(degrees));
        }

        /**
         * Returns the value of arccosine given an angle in degrees
         * 
         * @param {number} degrees
         * @returns {number}
        **/
        static acos(degrees) {
            return Math.acos(this.radians(degrees));
        }

        /**
         * Returns the value of arcsine given an angle in degrees
         * 
         * @param {number} degrees
         * @returns {number}
        **/
        static asin(degrees) {
            return Math.asin(this.radians(degrees));
        }

        /**
         * Returns the distance between 2 points.
         * 
         * @param {number} x1
         * @param {number} y1
         * @param {number} x2
         * @param {number} y2
         * @returns {number}
        **/
        static dist(x1, y1, x2, y2) {
            return Math.hypot(x1 - x2, y1 - y2);
        }

        /**
         * Returns the squared distance between 2 points. (More efficient)
         * 
         * @param {number} x1
         * @param {number} y1
         * @param {number} x2
         * @param {number} y2
         * @returns {number}
        **/
        static sqDist(x1, y1, x2, y2) {
            return this.sq(x1 - x2) + this.sq(y1 - y2);
        }

        /**
         * Returns a given number multiplied by itself.
         * 
         * @param {number} value
         * @returns {number}
        **/
        static sq(value) {
            return value * value;
        }
    }
    
    /**
     * Controls how the canvas fits within its parent element.
    **/
    class CanvasFit {
        
        /**
         * Whether to center the canvas within its parent.
         * @type {bool}
        **/
        get center() {
            return JSON.parse(this.render.canvas.dataset.center ?? true);
        }
        set center(value) {
            this.render.canvas.dataset.center = value;
        }
        
        /** 
         * Whether to resize the canvas to fit its parent. Disabling this disables centering.
         * @type {bool}
        **/
        get resize() {
            return JSON.parse(this.render.canvas.dataset.resize ?? true);
        }
        set resize(value) {
            this.render.canvas.dataset.resize = value;
        }
        
        /**
         * The scale of the canvas that was used to fit its parent (for rendering and input purposes)
         * @type {number}
        **/
        scale = 1;
        
        /**
         * @private
        **/
        render;
        
        /**
         * @private
        **/
        constructor(render) {
            this.render = render;
        }
        
        /**
         * @private
        **/
        push() {
            const render = this.render;
            render.pushMatrix();
            if (this.resize === false) return;
            const canvas = render.canvas;
            const canvasParent = canvas.parentElement;
            const parentBounds = canvasParent.getBoundingClientRect();
            const canvasBounds = canvas.getBoundingClientRect();
            const canvasAR = render.width / render.height;
            const parentAR = parentBounds.width / parentBounds.height;
            if (canvasAR < parentAR) {
                canvas.width = parentBounds.height * canvasAR;
                canvas.height = parentBounds.height;
                if (this.center !== false) {
                    canvas.style.marginLeft = (parentBounds.width - canvas.width) / 2 + "px";
                    canvas.style.marginTop = "0px";
                }
            } else {
                canvas.width = parentBounds.width;
                canvas.height = parentBounds.width / canvasAR;
                if (this.center !== false) {
                    canvas.style.marginLeft = "0px";
                    canvas.style.marginTop = (parentBounds.height - canvas.height) / 2 + "px";
                }
            }
            this.scale = Math.min(canvas.width / render.width, canvas.height / render.height);
            render.scale(this.scale, this.scale);
        }
        
        /**
         * @private
        **/
        pop() {
            this.render.popMatrix();
        }
        
    }

    /**
     * Mimics P5.js but with better performance.
    **/
    class Renderer {
        /**
         * The canvas rendering context on this renderer.
         * @type {CanvasRenderingContext2D}
        **/
        ctx = null;
        
        /**
         * The canvas attached to this renderer.
         * @type {Canvas}
        **/
        canvas = null;
                
        /**
         * @private
        **/
        scene = null;

        /**
         * @private
        **/
        textSettings = {};
        
        /**
         * @private
        **/
        fit = null;

        /**
         * The width of the renderer.
         * @type {number}
        **/
        get width() {
            return this.canvas.dataset.actualWidth;
        }
        
        /**
         * The height of the renderer.
         * @type {number}
        **/
        get height() {
            return this.canvas.dataset.actualHeight;
        }

        /**
         * @private
        **/
        constructor(scene, canvas) {
            this.scene = scene;
            this.canvas = canvas;
            if (!this.canvas.dataset.actualWidth) {
                this.canvas.dataset.actualWidth = 600;
                this.canvas.width = 600;
            }
            if (!this.canvas.dataset.actualHeight) {
                this.canvas.dataset.actualHeight = 600;
                this.canvas.height = 600;
            }
            this.fit = new CanvasFit(this);
        }
        
        /**
         * Resizes the canvas. Will not reflect actual size if renderer.fit.resize is enabled.
         * 
         * @param {number} width
         * @param {number} height
        **/
        size(width, height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.dataset.actualWidth = width;
            this.canvas.dataset.actualHeight = height;
        }
        
        /**
         * Fills the canvas with a solid RGB value. Optionally 1 argument can be supplied for all 3 rgb values.
         * @param {number} r
         * @param {number} g
         * @param {number} b
        **/
        background(r, g, b) {
            if (arguments.length === 1) {
                g = b = r;
            }
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        /**
         * Sets the fill style to a solid RGB value. Optionally 1 argument can be supplied for all 3 rgb values.
         * @param {number} r
         * @param {number} g
         * @param {number} b
        **/
        fill(r, g, b) {
            if (arguments.length === 1) {
                g = b = r;
            }
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        }

        /**
         * Sets the stroke style to a solid RGB value. Optionally 1 argument can be supplied for all 3 rgb values.
         * @param {number} r
         * @param {number} g
         * @param {number} b
        **/
        stroke(r, g, b) {
            if (arguments.length === 1) {
                g = b = r;
            }
            this.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        }

        /**
         * Sets the line thickness.
        **/
        strokeWeight(weight) {
            this.ctx.lineWidth = weight;
        }

        /**
         * Sets the style for the end of lines and paths.
        **/
        strokeCap(cap) {
            this.ctx.lineCap = cap;
        }

        /**
         * Renders a rectangle on the canvas with fill and stroke.
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
        **/
        rect(x, y, w, h) {
            this.ctx.fillRect(x, y, w, h);
            this.ctx.strokeRect(x, y, w, h);
        }

        /**
         * Renders an ellipse on the canvas with fill and stroke.
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
        **/
        ellipse(x, y, w, h) {
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }

        /**
         * Renders a line on the canvas.
         * @param {number} x1
         * @param {number} y1
         * @param {number} x2
         * @param {number} y2
        **/
        line(x1, y1, x2, y2) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        /**
         * Renders a triangle on the canvas with fill and stroke.
         * @param {number} x1
         * @param {number} y1
         * @param {number} x2
         * @param {number} y2
         * @param {number} x3
         * @param {numbeR} y3
        **/
        triangle(x1, y1, x2, y2, x3, y3) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineTo(x3, y3);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }
    
        /**
         * Renders a quadrilateral on the canvas with fill and stroke.
         * @param {number} x1
         * @param {number} y1
         * @param {number} x2
         * @param {number} y2
         * @param {number} x3
         * @param {numbeR} y3
         * @param {number} x4
         * @param {numbeR} y4
        **/
        quad(x1, y1, x2, y2, x3, y3, x4, y4) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineTo(x3, y3);
            this.ctx.lineTo(x4, y4);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }

        /**
         * Renders text on the canvas with alignment and outline.
         * 
         * @param {string} txt
         * @param {number} x
         * @param {number} y
         * @param {number} [maxWidth] - The maximum width the text can fill.
         * @param {number} [maxHeight] - The maximum height the text can fill.
        **/
        text(txt, x, y, maxWidth, maxHeight) {
            this.ctx.textAlign = this.textSettings.alignX;
            this.ctx.textBaseline = this.textSettings.alignY;
            this.ctx.font = `${this.textSettings.style} ${this.textSettings.size}px ${this.textSettings.font}`;
            if (maxWidth && maxHeight) {
                const words = txt.split(' ');
                let line = '';
                let lines = [];
                let offsetX = 0;
                for (let word of words) {
                    let testLine = line + word + ' ';
                    let metrics = this.ctx.measureText(testLine);
                    if (this.textSettings.alignX !== "left") {
                        offsetX = Math.max(offsetX, metrics.width);
                    }
                    if (metrics.width > maxWidth) {
                        lines.push(line);
                        line = word + ' ';
                    } else {
                        line = testLine;
                    }
                }
                lines.push(line);
                let lineHeight = this.textSettings.size;
                let totalHeight = maxHeight;
                let startY = y;
                if (this.textSettings.alignY === "middle") startY = y + totalHeight / 2;
                else if (this.textSettings.alignY === "bottom") startY = y + totalHeight;
                if (this.textSettings.alignX === "right") {
                    this.ctx.textAlign = "left";
                }
                for (let i = 0; i < lines.length; i++) {
                    this.ctx.fillText(lines[i], x + offsetX, startY + i * lineHeight);
                    this.ctx.strokeText(lines[i], x + offsetX, startY + i * lineHeight);
                }
            } else {
                this.ctx.fillText(txt, x, y);
                this.ctx.strokeText(txt, x, y);
            }
        }

        /**
         * Sets the font of the text.
         * 
         * @param {string} font
        **/
        textFont(font) {
            this.textSettings.font = font;
        }

        /** 
         * Sets the style of the text (e.g. italic, bold)
         * 
         * @param {string} style
        **/
        textStyle(style) {
            this.textSettings.style = style;
        }

        /** 
         * Sets the size of the text in pixels.
         * 
         * @param {number} size
        **/
        textSize(size) {
            this.textSettings.size = size;
        }

        /**
         * Sets the alignment of the text.
         * 
         * @param {"left"|"center"|"right"} horizontal
         * @param {"left"|"center"|"right"} vertical
        **/
        textAlign(horizontal, vertical) {
            if (vertical === "center") {
                vertical = "middle";
            }
            this.textSettings.alignX = horizontal;
            this.textSettings.alignY = vertical;
        }

        /**
         * Removes fill from the shape.
        **/
        noFill() {
            this.ctx.fillStyle = "transparent";
        }

        /**
         * Removes stroke from the shape.
        **/
        noStroke() {
            this.ctx.strokeStyle = "transparent";
        }

        /**
         * Begins a new shape.
        **/
        beginShape() {
            this.path = new Path2D();
        }

        /**
         * Ends the shape.
         * 
         * @param {bool} [close=false] - Whether to close the path.
        **/
        endShape(close = false) {
            if (close) this.path.closePath();
            this.ctx.fill(this.path);
            this.ctx.stroke(this.path);
            this.path = null;
        }

        /**
         * Adds a vertex to the current shape.
         * 
         * @param {number} x
         * @param {number} y
        **/
        vertex(x, y) {
            if (this.path) {
                this.path.lineTo(x, y);
            }
        }

        /**
         * Renders an arc.
         * 
         * @param {number} x
         * @param {number} y
         * @param {number} w
         * @param {number} h
         * @param {number} start - The start rotation
         * @param {number} end - The end rotation
        **/
        arc(x, y, w, h, start, end) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, w / 2, Mathf.radians(start), Mathf.radians(end));
            this.ctx.fill();
            this.ctx.stroke();
        }

        /**
         * Adds a curve to the current shape.
         * 
         * @param {number} x
         * @param {number} y
        **/
        curveVertex(x, y) {
            if (this.path) {
                this.path.lineTo(x, y);
            }
        }

        /** 
         * Adds a bezier to the current shape.
         * 
         * @param {number} cx1
         * @param {number} cy1
         * @param {number} cx2
         * @param {number} cy2
         * @param {number} x
         * @param {number} y
        **/
        bezierVertex(cx1, cy1, cx2, cy2, x, y) {
            if (this.path) {
                this.path.bezierCurveTo(cx1, cy1, cx2, cy2, x, y);
            }
        }

        /**
         * Renders a bezier.
         * 
         * @param {number} x1
         * @param {number} y1
         * @param {number} cx1
         * @param {number} cy1
         * @param {number} cx2
         * @param {number} cy2
         * @param {number} x2
         * @param {number} y2
        **/
        bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
            this.ctx.stroke();
            this.ctx.fill();
        }

        /**
         * Saves the current transform matrix.
        **/
        pushMatrix() {
            this.ctx.save();
        }

        /**
         * Restores to the previous saved transform matrix.
        **/
        popMatrix() {
            this.ctx.restore();
        }

        /**
         * Translates the canvas.
         * 
         * @param {number} x
         * @param {number} y
        **/
        translate(x, y) {
            this.ctx.translate(x, y);
        }

        /**
         * Scales the canvas.
         * 
         * @param {number} sx
         * @param {number} sy
        **/
        scale(sx, sy) {
            this.ctx.scale(sx, sy);
        }

        /**
         * Rotates the canvas in degrees.
         * 
         * @param {number} angle
        **/
        rotate(angle) {
            this.ctx.rotate(Mathf.radians(angle));
        }

        /**
         * Captures a portion of the canvas.
         * 
         * @param {number} x
         * @param {number} y
         * @param {number} [w=1]
         * @param {number} [h=1]
         * @returns {ImageData} The data of the image captured.
        **/
        get(x, y, w = 1, h = 1) {
            return this.ctx.getImageData(x, y, w, h);
        }

        /**
         * Renders an image returned by Renderer.get().
         * 
         * @param {ImageData} img
         * @param {number} x
         * @param {number} y
         * @param {number} [w]
         * @param {number} [h]
         * 
        **/
        image(img, x, y, w = img.width, h = img.height) {
            this.ctx.drawImage(img, x, y, w, h);
        }
        
        /**
         * @private
        **/
        load() {
            this.ctx = this.canvas.getContext("2d");
            this.path = null;
            this.textSettings = {
                size: 12,
                style: "normal",
                font: "sans-serif",
                alignX: "left",
                alignY: "top",
            };
        }
        
        /**
         * @private
        **/
        unload() {
            
        }
    }
    
    /**
     * Invokes given callbacks when certain events are triggered. Allows for passing arguments to callbacks 
    **/
    class EventSystem {
        
        /**
         * @private
        **/
        listeners = {};

        /**
         * Makes the given callback be invoked when the event is triggered.
         * 
         * @param {string} event - The event to listen for.
         * @param {function} callback - The callback to invoke when the event is triggered.
        **/
        on(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [callback];
                return;
            }
            this.listeners[event].push(callback);
        }

        /**
         * Makes all listener callbacks be triggered for the given event.
         * 
         * @param {string} event - The event to trigger.
         * @param {...*} args - Additional arguments to pass to the event callbacks.
        **/
        trigger(event, ...args) {
            if (!this.listeners[event]) {
                return;   
            }
            this.listeners[event].forEach(callback => callback.apply(null, args));
        }
    }

    /**
     * A class with methods for controlling the physics of a matter body.
    **/
    class MatterSprite extends EventSystem {

        /**
         * @private
        **/
        isDead = false;e
        
        /**
         * {object} A Matter.js physics body.
        **/
        body = null;
        
        /**
         * @param {object} matterBody - The matter body to attach to this sprite.
        **/
        constructor(matterBody) {
            super();
            matterBody.sprite = this;
            this.body = matterBody;
            this.body.collisionFilter.group = -1;
            this.body.collisionFilter.mask = 0;
            this.body.collisionFilter.category = 0;
        }

        /**
         * {number} The x position of the body.
         * @readonly
        **/
        get x() {
            return this.body.position.x;
        }
        
        /**
         * {number} The y position of the body.
         * @readonly
        **/
        get y() {
            return this.body.position.y;
        }

        /**
         * {number} The x velocity of the body.
         * @readonly
        **/
        get velocityX() {
            return this.body.velocity.x;
        }

        /**
         * {number} The y velocity of the body.
         * @readonly
        **/
        get velocityY() {
            return this.body.velocity.y;
        }
        
        /**
         * {number} The angular velocity of the body.
         * @readonly
        **/
        get angularVelocity() {
            return this.body.angularVelocity;
        }

        /**
         * {number} The angle of the body in degrees.
         * @readonly
        **/
        get angle() {
            return Mathf.degrees(this.body.angle);
        }

        /**
         * {number} The area of the body.
        **/
        get area() {
            return this.body.area;
        }

        /**
         * {object} The bounds of the body.
        **/
        get bounds() {
            return this.body.bounds;
        }

        /**
         * {number} The density of the body.
        **/
        get density() {
            return this.body.density;
        }

        /**
         * {number} The mass of the body.
        **/
        get mass() {
            return this.body.mass;
        }

        /**
         * Rotates the body by the given angle.
         * 
         * @param {number} angle - The angle in degrees.
         * @param {number} [x] - The x center to rotate by.
         * @param {number} [y] - The y center to rotate by.
        **/
        rotate(angle, x, y) {
            angle = Mathf.radians(angle);
            if (x !== void 0 && y !== void 0) {
                Matter.Body.rotate(this.body, angle, Matter.Vector.create(x, y));
            } else {
                Matter.Body.rotate(this.body, angle);
            }
        }
        
        /**
         * Scales the body.
         * 
         * @param {number} x - The x amount to scale by.
         * @param {number} y - The y amount to scale by.
         * @param {number} [positionX] - The x position to scale by.
         * @param {number} [positionY] - The y position to scale by.
        **/
        scale(x, y, positionX, positionY) {
            if (positionX !== void 0 && positionY !== void 0) {
                Matter.Body.scale(this.body, x, y, Matter.Vector.create(positionX, positionY));
            } else {
                Matter.Body.scale(this.body, x, y, Matter.Vector(this.x, this.y));
            }
        }

        /**
         * Sets the angle of the body.
         * 
         * @param {number} angle - The angle in degrees.
        **/
        setAngle(angle) {
            Matter.Body.setAngle(this.body, angle * (Math.PI / 180));
        }

        /**
         * Adds a force to the center of the body.
         * 
         * @param {number} forceX
         * @param {number} forceY
        **/
        addForce(forceX, forceY) {
            Matter.Body.applyForce(this.body, Matter.Vector.create(this.x, this.y), Matter.Vector.create(forceX, forceY));
        }

        /**
         * Adds a force a specfic position on the body.
         * 
         * @param {number} forceX
         * @param {number} forceY
         * @param {number} positionX
         * @param {number} positionY
        **/
        addForceAtPosition(forceX, forceY, positionX, positionY) {
            Matter.Body.applyForce(this.body, Matter.Vector.create(positionX, positionY), Matter.Vector.create(forceX, forceY));
        }

        /**
         * Sets the angular velocity of the body.
         * 
         * @param {number} velocity
        **/
        setAngularVelocity(velocity) {
            Matter.Body.setAngularVelocity(this.body, velocity);
        }

        /**
         * Sets the center of the body.
         * 
         * @param {number} x
         * @param {number} y
         * @param {bool} [relative=false]
        **/
        setCenter(x, y, relative = false) {
            Matter.Body.setCentre(this.body, Matter.Vector.create(x, y), relative);
        }

        /**
         * Sets the density of the body.
         * 
         * @param {number} value
        **/
        setDensity(value) {
            Matter.Body.setDensity(this.body, value);
        }

        /**
         * Sets the inertia of the body.
         * Set to infinity to allow for no turning.
         * 
         * @param {number} value
        **/
        setInertia(value) {
            Matter.Body.setInertia(this.body, value);
        }

        /**
         * Sets the position of the body.
         * 
         * @param {number} x
         * @param {number} y
        **/
        setPosition(x, y) {
            Matter.Body.setPosition(this.body, Matter.Vector.create(x, y));
        }

        /**
         * Sets the velocity of the body.
         * 
         * @param {number} x
         * @param {number} y
        **/
        setVelocity(x, y) {
            Matter.Body.setVelocity(this.body, Matter.Vector.create(x, y));
        }

        /**
         * Sets whether the body is static or not.
         * If true, the body cannot move.
         * 
         * @param {bool} value
        **/
        setStatic(value) {
            Matter.Body.setStatic(this.body, value);
        }

        /**
         * Translates the body.
         * 
         * @param {number} x
         * @param {number} y
         * @param {bool} [updateVelocity=false] - Whether to update the body's velocity.
        **/
        translate(x, y, updateVelocity = false) {
            Matter.Body.translate(this.body, Matter.Vector.create(x, y), updateVelocity);
        }

        /**
         * Sets the friction of the body.
         * 
         * @param {number} value
        **/
        setFriction(value) {
            this.body.friction = value;
        }
        
        /**
         * Sets the air friction of the body.
         * 
         * @param {number} value
        **/
        setFrictionAir(value) {
            this.body.frictionAir = value;
        }

        /**
         * Sets the static friction of the body.
         * Static friciton is how much force it takes to get the body to speed up when stationary.
         * 
         * @param {number} value
        **/
        setFrictionStatic(value) {
            this.body.frictionStatic = value;
        }

        /**
         * Sets whether the body is a sensor or not.
         * A sensor will not collide with other bodies.
         * 
         * @param {bool} value
        **/
        setSensor(value) {
            this.body.isSensor = value;
        }
        
        /**
         * Sets the bounciness of the body.
         * 
         * @param {number} value
        **/
        setBounce(value) {
            this.body.restitution = value;
        }

    }

    /**
     * A collection of matter sprites.
    **/
    class Group extends EventSystem {
        
        /**
         * @private
        **/
        items = [];
        
        /**
         * @private
        **/
        constructor(items = []) {
            super();
            items.forEach(this.add.bind(this));
        }

        /**
         * Adds a matter sprite to the group.
         * 
         * @param {MatterSprite} item
        **/
        add(item) {
            this.items.push(item);
            this.trigger("add", item);
        }

        /**
         * Removes a matter sprite from the group.
         * 
         * @param {MatterSprite} item
        **/
        remove(item) {
            const index = this.items.indexOf(item);
            if (index > -1) {
                this.trigger("remove", item);
                this.items.splice(index, 1);
            }
        }

        /**
         * Invokes the given callback on each item in the group, passing a MatterSprite to it.
         * 
         * @param {function} callback
        **/
        each(callback) {
            this.items.forEach(item => callback(item));
        }
    }
    
    /**
     * Controls callbacks for when objects collide
    **/
    class CollisionListenManager {
        
        /**
         * @private
        **/
        listenPairs = new Map();
        
        /**
         * @private
        **/
        constructor(physics) {
            Matter.Events.on(physics.engine, "collisionActive", pairsList => {
                pairsList.pairs.forEach(pair => {
                    this.processCollision(pair.collision);
                });
            });
        }
        
        /**
         * @private
        **/
        internalAddSingle(a, b, callback) {
            if (!this.listenPairs.has(a)) {
                this.listenPairs.set(a, new Map());
            }
            this.listenPairs.get(a).set(b, callback);
        }
        
        /**
         * Listens for 2 objects colliding and invokes the callback. The callback recieves a, b, and the collision data, which is a Matter.js collision object.
         * 
         * @param {MatterSprite|Group} a
         * @param {MatterSprite|Group} b
         * @param {function} callback
        **/
        add(a, b, callback) {
            if (a instanceof Group) {
                if (b instanceof Group) {
                    // Both are groups
                    a.each(a => {
                        b.each(b => {
                            this.internalAddSingle(a, b, callback);
                        });
                    });
                    a.on("add", item => {
                        b.each(b => {
                            this.internalAddSingle(item, b, callback);
                        });
                    });
                    b.on("add", item => {
                        b.each(b => {
                            this.internalAddSingle(item, b, callback);
                        });
                    });
                } else {
                    // a is a group, b is a sprite
                    a.each(a => {
                        this.internalAddSingle(a, b, callback);
                    });
                    a.on("add", item => {
                        this.internalAddSingle(item, b, callback);
                    });
                }
            } else {
                if (b instanceof Group) {
                    // a is a sprite, b is a group
                    b.each(b => {
                        this.internalAddSingle(a, b, callback);
                    });
                    b.on("add", item => {
                        this.internalAddSingle(a, item, callback);
                    });
                } else {
                    // Both are sprites
                    this.internalAddSingle(a, b, callback);
                }
            }
        }
        
        /**
         * @private
        **/
        getCollisionCallback(a, b) {
            return this.listenPairs.has(a) && this.listenPairs.get(a).has(b)
                ? this.listenPairs.get(a).get(b)
                : null;
        }
        
        /**
         * @private
        **/
        hasPair(a, b) {
            return this.listenPairs.has(a) && this.listenPairs.get(a).has(b);
        }
        
        /**
         * @private
        **/
        processCollision(collision) {
            let a = collision.bodyA.sprite;
            let b = collision.bodyB.sprite;
            let callback = this.getCollisionCallback(a, b);
            if (callback) {
                callback(a, b, collision);
            }
            callback = this.getCollisionCallback(b, a);
            if (callback) {
                callback(b, a, Matter.Collision.create(b.body, a.body));
            }
        }
        
    }

    /**
     * Controls what collides with what.
    **/
    class CollisionManager {
        
        /**
         * @private
        **/
        currentCategory = 1;
        
        /**
         * @private
        **/
        callbacks = new Map();

        /**
         * @private
        **/
        constructor(physics) {
            this.listener = new CollisionListenManager(physics);
        }

        /**
         * @private
        **/
        internalAddSingle(a, b, callback) {

            const bodyA = a.body;
            const bodyB = b.body;

            if (bodyA.collisionFilter.category === 0) {
                bodyA.collisionFilter.category = this.currentCategory;
                this.currentCategory <<= 1;
            }
            if (bodyB.collisionFilter.category === 0) {
                bodyB.collisionFilter.category = this.currentCategory;
                this.currentCategory <<= 1;
            }

            // Update the mask to allow collision
            bodyA.collisionFilter.mask |= bodyB.collisionFilter.category;
            bodyB.collisionFilter.mask |= bodyA.collisionFilter.category;

            // Set group to 0 so category & mask take effect
            bodyA.collisionFilter.group = 0;
            bodyB.collisionFilter.group = 0;
        }

        /**
         * Makes it so both objects collide with each other.
         * 
         * @param {MatterSprite|Group} a
         * @param {MatterSprite|Group} b
        **/
        add(a, b) {
            if (a instanceof Group) {
                if (b instanceof Group) {
                    // Both are groups
                    a.each(a => {
                        b.each(b => {
                            this.internalAddSingle(a, b);
                        });
                    });
                    a.on("add", item => {
                        b.each(b => {
                            this.internalAddSingle(item, b);
                        });
                    });
                    b.on("add", item => {
                        b.each(b => {
                            this.internalAddSingle(item, b);
                        });
                    });
                } else {
                    // a is a group, b is a sprite
                    a.each(a => {
                        this.internalAddSingle(a, b);
                    });
                    a.on("add", item => {
                        this.internalAddSingle(item, b);
                    });
                }
            } else {
                if (b instanceof Group) {
                    // a is a sprite, b is a group
                    b.each(b => {
                        this.internalAddSingle(a, b);
                    });
                    b.on("add", item => {
                        this.internalAddSingle(a, item);
                    });
                } else {
                    // Both are sprites
                    this.internalAddSingle(a, b);
                }
            }
        }
    }

    /**
     * Creates new bodies and manages gravity. 
    **/
    class Physics {

        /**
         * @private
        **/
        sprites = [];
        
        /**
         * @private
        **/
        gravityX = 0;
        
        /**
         * @private
        **/
        gravityY = 0.001;
        
        /**
         * A reference to the Matter physics engine.
         * @type {object}
        **/ 
        engine = Matter.Engine.create();

        /**
         * @private
        **/
        constructor(scene) {
            this.scene = scene;
            this.collision = new CollisionManager(this);
            this.engine.world.gravity.y = 0;
        }

        /**
         * Creates a new Matter.js body rectangle.
         * 
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
        **/
        rectangle(x, y, width, height) {
            return Matter.Bodies.rectangle(x, y, width, height);
        }

        /**
         * Creates a new Matter.js body circle.
         * 
         * @param {number} x
         * @param {number} y
         * @param {number} radius
        **/
        circle(x, y, radius) {
            return Matter.Bodies.circle(x, y, radius);
        }

        /**
         * Creates a new Matter.js body polygon.
         * 
         * @param {number} x
         * @param {number} y
         * @param {integer} sides
         * @param {number} radius
        **/
        polygon(x, y, sides, radius) {
            return Matter.Bodies.polygon(x, y, sides, radius);
        }

        /**
         * Creates a new Matter.js body trapezoid.
         * 
         * @param {number} x
         * @param {number} y
         * @param {number} width
         * @param {number} height
         * @param {number} slope - A value between 0 and 1.
        **/
        trapezoid(x, y, width, height, slope) {
            return Matter.Bodies.trapezoid(x, y, width, height, slope);
        }

        /**
         * Creates a custom Matter.js body shape.
         * 
         * @param {number} x
         * @param {number} y
         * @param {Array} vertices - An array of objects with an  x and y value.
        **/
        customShape(x, y, vertices) {
            return Matter.Bodies.fromVertices(x, y, vertices);
        }

        /**
         * @private
        **/
        applyGravity(matterSprite) {
            matterSprite.addForce(this.gravityX * matterSprite.mass, this.gravityY * matterSprite.mass);
        }

        /**
         * Adds the body to the physics engine.
         * 
         * @param {MatterSprite} matterSprite
        **/
        add(matterSprite) {
            matterSprite.isDead = false;
            Matter.Composite.add(this.engine.world, matterSprite.body);
        }

        /**
         * Removes the body from the physics engine.
         * 
         * @param {MatterSprite} matterSprite
        **/
        remove(matterSprite) {
            matterSprite.isDead = true;
            Matter.Composite.remove(this.engine.world, matterSprite.body);
            matterSprite.trigger("remove", this);
        }
        
        /**
         * Sets the gravity of the physics.
         * 
         * @param {number} x
         * @param {number} y
        **/
        setGravity(x, y) {
            this.gravityX = x;
            this.gravityY = y;
        }
        
        /**
         * @private
        **/
        update(deltaTime) {
            Matter.Engine.update(this.engine, deltaTime);
        }
        
        /**
         * @private
        **/
        load() {
            
        }
        
        /**
         * @private
        **/
        unload() {
            Matter.Engine.clear(this.engine);
        }

    }

    /**
     * Manages the main processing loop in a scene
    **/
    class Loop {
        
        /**
         * {number} The number of milliseconds between this frame and the last one
        **/
        deltaTime = 1000 / 60;
        
        /** 
         * {number} The minimum FPS for delta time values (too low of fps will cause issues with physics calculations)
        **/
        minFPS = 30;
        
        /**
         * @private
        **/
        isRunning = false;
        
        /**
         * @private
        **/
        lastFrame = performance.now();

        /**
         * @private
        **/
        constructor(scene) {
            this.scene = scene;
        }
        
        /**
         * @private
        **/
        draw() {
            this.deltaTime = Math.min(performance.now() - this.lastFrame, 1000 / this.minFPS);
            this.lastFrame = performance.now();
            this.scene.internalDraw(this.deltaTime);
        }
        
        /**
         * Starts the loop.
        **/
        start() {
            this.isRunning = true;
            this.loop();
        }
        
        /**
         * Stops the loop.
        **/
        stop() {
            this.isRunning = false;
        }
        
        /**
         * @private
        **/
        loop() {
            window.requestAnimationFrame(() => {
                this.draw();
                if (this.isRunning) {
                    this.loop();
                }
            });
        }
        
        /**
         * @private
        **/
        load() {
            this.start();
        }
        
        /**
         * @private
        **/
        unload() {
            this.stop();
        }

    }

    /**
     * Manages key input.
    **/
    class KeyInput {

        /**
         * Array<string> The keys that are currently pressed.
        **/
        pressed = [];
        
        /**
         * Array<string> The keys that were just pressed this frame.
        **/
        down = [];
        
        /**
         * Array<string> The keys that were just released this frame.
        **/
        up = [];

        /**
         * @private
        **/
        constructor(scene) {
            this.scene = scene;
        }
        
        /**
         * @private
        **/
        load() {
            this.keyDownCallback = event => {
                if (document.activeElement !== this.scene.render.canvas) {
                    return;                    
                }
                if(["ArrowUp","ArrowDown"].indexOf(event.code) > -1) {
                    event.preventDefault();
                }
                if (event.repeat) {
                    return;
                }
                this.pressed[event.code] = true;
                this.down[event.code] = true;
            };
            
            this.keyUpCallback = event => {
                this.pressed[event.code] = false;
                this.up[event.code] = true;
            };
            
            document.addEventListener("keydown", this.keyDownCallback);
            document.addEventListener("keyup", this.keyUpCallback);
        }
        
        /**
         * @private
        **/
        unload() {
            document.removeEventListener("keyup", this.keyUpCallback);
            document.removeEventListener("keydown", this.keyDownCallback);
        }

        /**
         * @private
        **/
        update() {
            this.down = [];
            this.up = [];
        }
    }

    /**
     * Manages mouse input.
    **/
    class MouseInput {
        
        /**
         * {number} x position of the mouse relative to the canvas.
        **/
        x = 0;
        
        /**
         * {number} y position of the mouse relative to the canvas.
        **/
        y = 0;

        /**
         * {bool} Returns true every frame the left mouse button is pressed
        **/
        left = false;
        
        /**
         * {bool} Returns true the frame the left mouse button is released
        **/
        leftUp = false;
        
        /**
         * {bool} Returns true the frame the left mouse button is pressed
        **/
        leftDown = false;
        
        /**
         * {bool} Returns true every frame the right mouse button is pressed
        **/
        right = false;
        
        /**
         * {bool} Returns true the frame the right mouse button is pressed
        **/
        rightUp = false;
        
        /**
         * {bool} Returns true the frame the right mouse button is released
        **/
        rightDown = false;

        /**
         * {bool} Whether to enable the right click menu.
        **/
        contextMenu = false;

        /**
         * @private
        **/
        constructor(scene) {
            this.scene = scene;
        }
        
        /**
         * @private
        **/
        load() {
            this.mouseDownCallback = event => {
                if (event.button === 0) {
                    this.left = true;
                    this.leftDown = true;
                } else if (event.button === 2) {
                    this.right = true;
                    this.rightDown = true;
                }
            };
            
            this.mouseUpCallback = event => {
                if (event.button === 0) {
                    this.left = false;
                    this.leftUp = true;
                } else if (event.button === 2) {
                    this.right = false;
                    this.rightUp = true;
                }  
            };
            
            this.contextMenuCallback = event => {
                if (!this.contextMenu) {
                    event.preventDefault();
                }  
            };
            
            this.mouseMoveCallback = event => {
                this.x = event.offsetX / this.scene.render.fit.scale;
                this.y = event.offsetY / this.scene.render.fit.scale;
            };
            
            this.scene.render.canvas.addEventListener("mousedown", this.mouseDownCallback);

            this.scene.render.canvas.addEventListener("mouseup", this.mouseUpCallback);
            this.scene.render.canvas.addEventListener("contextmenu", this.contextMenuCallback);
            this.scene.render.canvas.addEventListener("mousemove", this.mouseMoveCallback);
        }
        
        /**
         * @private
        **/
        unload() {
            this.scene.render.canvas.removeEventListener("mousedown", this.mouseDownCallback);
            this.scene.render.canvas.removeEventListener("mouseup", this.mouseUpCallback);
            this.scene.render.canvas.removeEventListener("contextmenu", this.contextMenuCallback);
            this.scene.render.canvas.removeEventListener("mousemove", this.mouseMoveCallback);
        }

        /**
         * @private
        **/
        update() {
            this.leftUp = false;
            this.rightUp = false;
            this.leftDown = false;
            this.rightDown = false;
        }
    }

    /**
     * Manages mouse/keyboard input.
    **/
    class Input {
        
        /**
         * @private
        **/
        constructor(scene) {
            this.mouse = new MouseInput(scene);
            this.keys = new KeyInput(scene);
        }
        
        /**
         * @private
        **/
        load() {
            this.mouse.load();
            this.keys.load();
        }
        
        /**
         * @private
        **/
        unload() {
            this.mouse.unload();
            this.keys.unload();
        }

        /**
         * @private
        **/
        update() {
            this.mouse.update();
            this.keys.update();
        }
    }

    /**
     * Manages the defining and execution of commands.
    **/
    class CommandLine {
        
        /**
         * @private
        **/
        constructor(console) {
            this.console = console;
            this.commands = {};
        }
    
        /**
         * Sets a command for the command line. The callback can receive arguments.
         * 
         * @param {string} name - The name of the command.
         * @param {function} callback
        **/
        set(name, callback) {
            this.commands[name] = callback;
        }
        
        /**
         * Clears all commands from the command line.
        **/
        clear() {
            this.commands = {};
        }
    
        /**
         * @private
        **/
        exec(string) {
            const parts = string.split(" ");
            const commandName = parts[0];
            const argStrings = parts.slice(1);
            let args = [];
            
            try {
                args = argStrings.map(arg => JSON.parse(arg));
            } catch (e) {
                this.console.log("Error in argument: " + e);
                return;
            }
    
            if (this.commands[commandName]) {
                try {
                    this.commands[commandName].apply(null, args);
                } catch (e) {
                    this.console.log("Error in command: " + e);
                }
            } else {
                this.console.log(`Unknown command: ${commandName}`);
            }
        }
    }
    
    /**
     * Manages logging to the console and HTML styling for it.
    **/
    class Console {
        
        /**
         * @private
        **/
        static isOpen = false;
        
        /**
         * {CommandLine}
        **/
        static commands = new CommandLine(this);
        
        static {
            this.container = document.createElement("div");
            this.container.style.position = "absolute";
            this.container.style.top = "0px";
            this.container.style.left = "0px";
            this.container.style.right = "0px";
            this.container.style.bottom = "0px";
            this.container.style.overflowY = "auto";
            this.container.style.border = "1px solid black";
            this.container.style.padding = "10px";
            this.container.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            this.container.style.color = "#0f0";
            this.container.style.fontFamily = "monospace";
            this.container.style.paddingBottom = "100px";
            document.body.appendChild(this.container);
    
            this.form = document.createElement("form");
            this.input = document.createElement("input");
            
            this.input.style.position = "absolute";
            this.input.style.height = "50px";
            this.input.style.left = "0px";
            this.input.style.right = "0px";
            this.input.style.bottom = "0px";
            this.input.style.color = "#000";
            this.input.style.backgroundColor = "#0f0";
            this.input.style.fontFamily = "monospace";
            this.input.type = "text";
            this.input.style.marginTop = "10px";
            this.form.appendChild(this.input);
            document.body.appendChild(this.form);
    
            this.form.addEventListener("submit", (e) => {
                e.preventDefault();
                const command = this.input.value;
                this.input.value = "";
                this.log(`> ${command}`);
                this.commands.exec(command);
            });
    
            document.addEventListener("commandOutput", (e) => {
                const message = document.createElement("div");
                message.textContent = e.detail;
                this.container.appendChild(message);
                this.container.scrollTop = this.container.scrollHeight;
            });
            
            document.addEventListener("keydown", e => {
                if (e.code === "Slash" && !e.repeat) {
                    if (this.isOpen) {
                        this.close();
                    } else {
                        this.open();
                    }
                } 
            });
            
            this.form.style.display = "none";
            this.container.style.display = "none";
            this.log("Welcome to the developer console. Press / to close.");
        }
    
        /**
         * @private
        **/
        static open() {
            this.isOpen = true;
            this.container.style.display = "block";
            this.form.style.display = "block";
            this.input.focus();
            setTimeout(() => {
                this.input.value = "";
            }, 1);
        }
    
        /**
         * @private
        **/
        static close() {
            this.isOpen = false;
            this.container.style.display = "none";
            this.form.style.display = "none";
            this.input.blur();
        }
        
        /**
         * Logs a message to the console.
         * 
         * @param {string} message
        **/
        static log(message) {
            const event = new CustomEvent("commandOutput", { detail: message });
            document.dispatchEvent(event);
        }
    }

    /**
     * A composite class that contains all the components of a scene.
    **/
    class Scene {

        /**
         * {object} The data passed to the scene on load.
        **/
        data = {};
    
        /**
         * {Renderer} The renderer in the scene.
        **/
        render = null;
        
        /**
         * {Physics} The physics in the scene.
        **/
        physics = null;
        
        /**
         * {Input} The input in the scene.
        **/
        input = null;
        
        /**
         * {Loop} The loop in the scene.
        **/
        loop = null;

        /**
         * @private
        **/
        constructor(canvas = document.createElement("canvas")) {
            canvas.tabIndex = 0;

            this.render = new Renderer(this, canvas);
            this.physics = new Physics(this);
            this.input = new Input(this);
            this.loop = new Loop(this);
        }
        
        /**
         * Creates a group of matter sprites.
         * 
         * @param {Array<MatterSprite} items
         * @returns {Group}
        **/
        group(items) {
            return new Group(items);
        }

        /**
         * @private
        **/
        internalDraw(deltaTime) {
            this.physics.update(deltaTime);
            this.render.fit.push();
            this.draw();
            this.render.fit.pop();
            this.input.update();
        }
        
        /**
         * @private
        **/
        internalLoad(data) {
            this.data = data;
            this.loop.load();
            this.input.load();
            this.physics.load();
            this.render.load();
            this.load();
        }
        
        /**
         * @private
        **/
        internalUnload() {
            this.input.unload();
            this.loop.unload();
            this.physics.unload();
            this.render.unload();
            this.unload();
        }
        
        /**
         * Override this in child classes to call when the scene is unloaded.
        **/
        unload() {
            
        }
        
        /**
         * Override this in child classes to call when the scene is loaded.
        **/
        load() {
            
        }
        
        /**
         * Override this in child classes to call when the scene is drawn.
        **/
        draw() {
            
        }
    }
    
    /**
     * Controls the loading of multiple scenes.
    **/
    class SceneManager {
        
        scenes = {};
        currentScene = null;
        
        /**
         * @param {object} scenes - A set of key/value pairs. Each key is a string identifying the scene and each value is a class that inherits from Scene.
        **/
        constructor(scenes) {
            for (const [key, value] of Object.entries(scenes)) {
                this.scenes[key] = new value();
            }
        }
        
        /**
         * Loads a scene and unloads the previous one.
         * 
         * @param {string} id - The id of the scene to load.
         * @param {object} [data={}] - The data to pass to the scene's load() method.
        **/
        load(id, data = {}) {
            if (this.scenes[this.currentScene]) {
                this.scenes[this.currentScene].internalUnload();
            }
            this.currentScene = id;
            if (this.scenes[this.currentScene]) {
                this.scenes[this.currentScene].internalLoad(data);
            }    
        }
        
    }
    
    return {
        Scene,
        Console,
        SceneManager,
        Math: Mathf,
        Matter, // A refernce to the Matter.js instance.
        MatterSprite,
        
        /**
         * {bool} Returns true if the scene has been opened in fullscreen
        **/
        get isFullscreen() {
            return !!window.opener;
        },
        
        /**
         * {bool} Returns true if the game is located within the Khan Academy environment
        **/
        get isKhanAcademy() {
            return window.location.href.includes("kasandbox");
        },
        
        /**
         * Opens the game in fullscreen (for Khan Academy)
        **/
        fullscreen() {
            const w = window.open();
    		w.document.open();
    		w.document.write(`<!DOCTYPE html>${originalHTML}`);
    		w.document.close();
        },
    };

})();

export default Mushy;
