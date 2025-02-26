import Matter from 'https://cdn.jsdelivr.net/npm/matter-js@0.20.0/+esm'

var Game = (function() {
    console.clear();
    
    const originalHTML = document.querySelector("html").outerHTML;

    // Clear junk animation frames (for refreshes on Khan Academy)
    for (let i = window.requestAnimationFrame(function() {}); i > 0; i--) {
        window.cancelAnimationFrame(i);
    }

    // Math class with added methods (that use degrees)
    class Mathf {

        // Constrains a value between a min and a max
        constrain(value, min, max) {
            return Math.min(max, Math.max(value, min));
        }

        // Converts degrees to radians
        radians(degrees) {
            return degrees * (Math.PI / 180);
        }

        // Converts radians to degrees
        degrees(radians) {
            return radians * (180 / Math.PI);
        }

        // Maps a value from one range to another
        map(value, start1, stop1, start2, stop2) {
            let mappedValue = start2 + ((value - start1) * (stop2 - start2)) / (stop1 - start1);

            if (start2 < stop2) {
                mappedValue = Math.max(start2, Math.min(stop2, mappedValue));
            } else {
                mappedValue = Math.max(stop2, Math.min(start2, mappedValue));
            }

            return mappedValue;
        }

        lerp(start, stop, amt) {
            return start + (stop - start) * amt;
        }

        // Returns the position of a value in a range, represented as a 0-1 value
        inverseLerp(a, b, value) {
            return (value - a) / (b - a);
        }

        // Sine in degrees
        sin(degrees) {
            return Math.sin(this.radians(degrees));
        }

        // Cosine in degrees
        cos(degrees) {
            return Math.cos(this.radians(degrees));
        }

        // Tangent in degrees
        tan(degrees) {
            return Math.tan(this.radians(degrees));
        }

        // Arctangent in degrees
        atan(degrees) {
            return Math.atan(this.radians(degrees));
        }

        // atan2 in degrees
        atan2(degrees) {
            return Math.atan2(this.radians(degrees));
        }

        // Arccosine in degrees
        acos(degrees) {
            return Math.acos(this.radians(degrees));
        }

        // Arcsine in degrees
        asin(degrees) {
            return Math.asin(this.radians(degrees));
        }

        // Distance between 2 points
        dist(x1, y1, x2, y2) {
            return Math.hypot(x1 - x2, y1 - y2);
        }

        // Squared distance between 2 points (more efficient)
        sqDist(x1, y1, x2, y2) {
            return this.sq(x1 - x2) + this.sq(y1 - y2);
        }

        // Squares a value
        sq(value) {
            return value * value;
        }
    }
    
    // Controls how the canvas fits within its parent element.
    class CanvasFit {
        
        // Whether to center the canvas within its parent
        center = true;
        
        // Whether to resize the canvas to fit its parent (disabling this disables centering)
        resize = true;
        
        scale = 1;
        
        constructor(render) {
            this.render = render;
        }
        
        push() {
            const render = this.render;
            render.pushMatrix();
            if (!this.resize) return;
            const canvas = render.canvas;
            const canvasParent = canvas.parentElement;
            const parentBounds = canvasParent.getBoundingClientRect();
            const canvasBounds = canvas.getBoundingClientRect();
            const canvasAR = canvasBounds.width / canvasBounds.height;
            const parentAR = parentBounds.width / parentBounds.height;
            
            if (canvasAR < parentAR) {
                canvas.width = parentBounds.height * canvasAR;
                canvas.height = parentBounds.height;
                if (this.center) {
                    canvas.style.marginLeft = (parentBounds.width - canvas.width) / 2 + "px";
                    canvas.style.marginTop = "0px";
                }
            } else {
                canvas.width = parentBounds.width;
                canvas.height = parentBounds.width / canvasAR;
                if (this.center) {
                    canvas.style.marginLeft = "0px";
                    canvas.style.marginTop = (parentBounds.height - canvas.height) / 2 + "px";
                }
            }
            this.scale = canvas.width / render.width;
            render.scale(this.scale, this.scale);
        }
        
        pop() {
            this.render.popMatrix();
        }
        
    }

    // Mimics P5.js but with better performance
    class Renderer {
        ctx = null;
        canvas = null;
        game = null;

        // Text settings
        textSettings = {
            size: 12,
            style: "normal",
            font: "sans-serif",
            alignX: "left",
            alignY: "top",
        };

        constructor(game, canvas) {
            this.game = game;
            this.canvas = canvas;
            this.ctx = this.canvas.getContext("2d");
            this.path = null;
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.fit = new CanvasFit(this);
        }

        background(r, g, b) {
            if (arguments.length === 1) {
                g = b = r;
            }
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        fill(r, g, b) {
            if (arguments.length === 1) {
                g = b = r;
            }
            this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        }

        stroke(r, g, b) {
            if (arguments.length === 1) {
                g = b = r;
            }
            this.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
        }

        strokeWeight(weight) {
            this.ctx.lineWidth = weight;
        }

        strokeCap(cap) {
            this.ctx.lineCap = cap;
        }

        rect(x, y, w, h) {
            this.ctx.fillRect(x, y, w, h);
            this.ctx.strokeRect(x, y, w, h);
        }

        ellipse(x, y, w, h) {
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }

        line(x1, y1, x2, y2) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        }

        triangle(x1, y1, x2, y2, x3, y3) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineTo(x3, y3);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }

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

        // Draws text with alignment and outline
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

        textFont(font) {
            this.textSettings.font = font;
        }

        // Sets the style of the text (e.g. italic, bold)
        textStyle(style) {
            this.textSettings.style = style;
        }

        textSize(size) {
            this.textSettings.size = size;
        }

        // Sets the alignment of text. Uses a string (e.g. "center")
        textAlign(horizontal, vertical) {
            if (vertical === "center") {
                vertical = "middle";
            }
            this.textSettings.alignX = horizontal;
            this.textSettings.alignY = vertical;
        }

        noFill() {
            this.ctx.fillStyle = "transparent";
        }

        noStroke() {
            this.ctx.strokeStyle = "transparent";
        }

        beginShape() {
            this.path = new Path2D();
        }

        endShape(close = false) {
            if (close) this.path.closePath();
            this.ctx.fill(this.path);
            this.ctx.stroke(this.path);
            this.path = null;
        }

        vertex(x, y) {
            if (this.path) {
                this.path.lineTo(x, y);
            }
        }

        arc(x, y, w, h, start, end) {
            this.ctx.beginPath();
            this.ctx.arc(x, y, w / 2, this.game.math.radians(start), this.game.math.radians(end));
            this.ctx.fill();
            this.ctx.stroke();
        }

        curveVertex(x, y) {
            if (this.path) {
                this.path.lineTo(x, y);
            }
        }

        bezierVertex(cx1, cy1, cx2, cy2, x, y) {
            if (this.path) {
                this.path.bezierCurveTo(cx1, cy1, cx2, cy2, x, y);
            }
        }

        bezier(x1, y1, cx1, cy1, cx2, cy2, x2, y2) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
            this.ctx.stroke();
        }

        pushMatrix() {
            this.ctx.save();
        }

        popMatrix() {
            this.ctx.restore();
        }

        translate(x, y) {
            this.ctx.translate(x, y);
        }

        scale(sx, sy) {
            this.ctx.scale(sx, sy);
        }

        rotate(angle) {
            this.ctx.rotate(this.game.math.radians(angle));
        }

        // Gets a portion of the canvas
        get(x, y, w = 1, h = 1) {
            return this.ctx.getImageData(x, y, w, h);
        }

        // Renders an image returned by get()
        image(img, x, y, w = img.width, h = img.height) {
            this.ctx.drawImage(img, x, y, w, h);
        }
    }
    
    // Invokes given callbacks when certain events are triggered. Allows for passing arguments to callbacks 
    class EventSystem {
        listeners = {};

        on(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [callback];
                return;
            }
            this.listeners[event].push(callback);
        }

        trigger(event) {
            if (!this.listeners[event]) {
                return;   
            }
            this.listeners[event].forEach(callback => callback.apply(null, Array.prototype.slice.call(arguments, -1)));
        }
    }

    // A class to inherit from that adds methods for controlling matter bodies. By default collides with nothing
    class MatterSprite extends EventSystem {

        isDead = false;
        isGravity = true;

        constructor(matterBody) {
            super();
            matterBody.sprite = this;
            this.body = matterBody;
            this.body.collisionFilter.group = -1;
            this.body.collisionFilter.mask = 0;
            this.body.collisionFilter.category = 0;
        }

        get x() {
            return this.body.position.x;
        }

        get y() {
            return this.body.position.y;
        }

        get velocityX() {
            return this.body.velocity.x;
        }

        get velocityY() {
            return this.body.velocity.y;
        }

        get angularVelocity() {
            return this.body.angularVelocity;
        }

        // Returns the angle of the body (in degrees)
        get angle() {
            return this.body.angle * (180 / Math.PI);
        }

        get area() {
            return this.body.area;
        }

        get bounds() {
            return this.body.bounds;
        }

        get density() {
            return this.body.density;
        }

        get mass() {
            return this.body.mass;
        }

        rotate(angle, x, y) {
            angle *= Math.PI / 180;
            if (x !== void 0 && y !== void 0) {
                Matter.Body.rotate(this.body, angle, Matter.Vector.create(x, y));
            } else {
                Matter.Body.rotate(this.body, angle);
            }
        }

        scale(x, y, positionX, positionY) {
            if (x !== void 0 && y !== void 0) {
                Matter.Body.scale(this.body, Matter.Vector.create(x, y), Matter.Vector.create(positionX, positionY));
            } else {
                Matter.Body.scale(this.body, Matter.Vector(x, y));
            }
        }

        // Sets the angle of the body (in degrees)
        setAngle(angle) {
            Matter.Body.setAngle(this.body, angle * (Math.PI / 180));
        }

        // Adds a force to the center of the body
        addForce(forceX, forceY) {
            Matter.Body.applyForce(this.body, Matter.Vector.create(this.x, this.y), Matter.Vector.create(forceX, forceY));
        }

        // Adds a force on the body at a specific position
        addForceAtPosition(positionX, positionY, forceX, forceY) {
            Matter.Body.applyForce(this.body, Matter.Vector.create(positionX, positionY), Matter.Vector.create(forceX, forceY));
        }

        setAngularVelocity(velocity) {
            Matter.Body.setAngularVelocity(this.body, velocity);
        }

        setCenter(x, y, relative = false) {
            Matter.Body.setCentre(this.body, Matter.Vector.create(x, y), relative);
        }

        setDensity(value) {
            Matter.Body.setDensity(this.body, value);
        }

        setInertia(value) {
            Matter.Body.setInertia(this.body, value);
        }

        setPosition(x, y) {
            Matter.Body.setPosition(this.body, Matter.Vector.create(x, y));
        }

        setVelocity(x, y) {
            Matter.Body.setVelocity(this.body, Matter.Vector.create(x, y));
        }

        setStatic(value) {
            Matter.Body.setStatic(this.body, value);
        }

        translate(x, y, updateVelocity = false) {
            Matter.Body.translate(this.body, Matter.Vector.create(x, y), updateVelocity);
        }

        setFriction(value) {
            this.body.friction = value;
        }

        setFrictionAir(value) {
            this.body.frictionAir = value;
        }

        setFrictionStatic(value) {
            this.body.frictionStatic = value;
        }

        // Sets the body to be a sensor or not
        setSensor(value) {
            this.body.isSensor = value;
        }

        setBounce(value) {
            this.body.restitution = value;
        }

        setGravity(value) {
            this.isGravity = value;
        }

        static collides(a, b) {
            return Matter.Collision.collides(a.body, b.body);
        }

    }

    // A collection of matter sprites
    class Group extends EventSystem {
        items = [];
        
        constructor(items = []) {
            super();
            items.forEach(this.add.bind(this));
        }

        add(item) {
            this.items.push(item);
            this.trigger("add", item);
        }

        remove(item) {
            const index = this.items.indexOf(item);
            if (index > -1) {
                this.trigger("remove", item);
                this.items.splice(index, 1);
            }
        }

        each(callback) {
            this.items.forEach(callback);
        }
    }
    
    // Controls callbacks for when objects collide
    class CollisionListenManager {
        
        listenPairs = new Map();
        
        constructor(physics) {
            Matter.Events.on(physics.engine, "collisionActive", pairsList => {
                pairsList.pairs.forEach(pair => {
                    this.processCollision(pair.collision);
                });
            });
        }
        
        internalAddSingle(a, b, callback) {
            if (!this.listenPairs.has(a)) {
                this.listenPairs.set(a, new Map());
            }
            this.listenPairs.get(a).set(b, callback);
        }
        
        // Listens for 2 objects colliding and invokes the callback
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
        
        getCollisionCallback(a, b) {
            return this.listenPairs.has(a) && this.listenPairs.get(a).has(b)
                ? this.listenPairs.get(a).get(b)
                : null;
        }
        
        hasPair(a, b) {
            return this.listenPairs.has(a) && this.listenPairs.get(a).has(b);
        }
        
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

    // Controls what collides with what
    class CollisionManager {

        currentCategory = 1;
        callbacks = new Map();

        constructor(physics) {
            this.listener = new CollisionListenManager(physics);
        }

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

        // Makes it so both objects collide with each other
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

    // Creates new bodies and manages gravity 
    class Physics {

        sprites = [];
        gravityX = 0;
        gravityY = 0.001;
        engine = Matter.Engine.create();

        constructor(game) {
            this.game = game;
            this.collision = new CollisionManager(this);
        }

        rectangle(x, y, width, height) {
            return Matter.Bodies.rectangle(x, y, width, height);
        }

        circle(x, y, radius) {
            return Matter.Bodies.circle(x, y, radius);
        }

        polygon(x, y, sides, radius) {
            return Matter.Bodies.polygon(x, y, sides, radius);
        }

        trapezoid(x, y, width, height, slope) {
            return Matter.Bodies.trapezoid(x, y, width, height, slope);
        }

        customShape(x, y, vertices) {
            return Matter.Bodies.fromVertices(x, y, vertices);
        }

        applyGravity(matterSprite) {
            matterSprite.addForce(this.gravityX * matterSprite.mass, this.gravityY * matterSprite.mass);
        }

        // Adds the body to the physics engine
        add(matterSprite) {
            matterSprite.isDead = false;
            Matter.Composite.add(this.engine.world, matterSprite.body);
        }

        // Removes the body from the physics engine
        remove(matterSprite) {
            matterSprite.isDead = true;
            Matter.Composite.remove(this.engine.world, matterSprite.body);
            matterSprite.trigger("remove", this);
        }

        update(deltaTime) {
            Matter.Engine.update(this.engine, deltaTime);
        }

        setGravity(x, y) {
            this.gravityX = x;
            this.gravityY = y;
        }

    }

    // Manages the main processing loop
    class Loop {
        frame = -1;
        // The number of milliseconds between this frame and the last one
        deltaTime = 1000 / 60;
        lastFrame = performance.now();

        constructor(game) {
            this.game = game;
        }

        draw(callback) {
            this.frame = window.requestAnimationFrame(() => {
                this.deltaTime = Math.min(performance.now() - this.lastFrame, 1000 / 10 /* minimum is 10 fps */ );
                this.lastFrame = performance.now();
                this.game.physics.update(this.deltaTime);
                this.game.render.fit.push();
                if (callback) {
                    callback();
                }
                this.game.render.fit.pop();
                this.game.input.update();
                this.draw(callback);
            });
        }

        // Starts the loop with the specified callback for every frame
        start(callback) {
            this.draw(callback);
        }

        // Stops the loop  
        stop() {
            window.cancelAnimationFrame(this.frame);
        }
    }

    // Manages key input
    class KeyInput {

        // The keys that are pressed
        pressed = [];
        // The keys that were just pressed
        down = [];
        // The keys that were just released
        up = [];

        constructor(game) {
            document.addEventListener("keydown", event => {
                if (document.activeElement !== game.render.canvas) {
                    return;                    
                }
                if (event.repeat) {
                    return;
                }
                this.pressed[event.code] = true;
                this.down[event.code] = true;
            });
            document.addEventListener("keyup", event => {
                this.pressed[event.code] = false;
                this.up[event.code] = true;
            });
            document.addEventListener("keydown", e => {
                if (document.activeElement !== game.render.canvas) {
                    return;                    
                }
                if(["ArrowUp","ArrowDown"].indexOf(e.code) > -1) {
                    e.preventDefault();
                }
            }, false);
        }

        update() {
            this.down = [];
            this.up = [];
        }
    }

    // Manages mouse input
    class MouseInput {
        // Position of the mouse relative to the canvas
        x = 0;
        y = 0;

        // Returns true every frame the left mouse button is pressed
        left = false;
        // Returns true the frame the left mouse button is released
        leftUp = false;
        // Returns true the frame the left mouse button is pressed
        leftDown = false;
        // Returns true every frame the right mouse button is pressed
        right = false;
        // Returns true the frame the right mouse button is released
        rightUp = false;
        // Returns true the frame the right mouse button is pressed
        rightDown = false;

        // Whether to enable the right click menu
        contextMenu = false;

        constructor(game) {
            this.game = game;
            game.render.canvas.addEventListener("mousedown", event => {
                if (event.button === 0) {
                    this.left = true;
                    this.leftDown = true;
                } else if (event.button === 2) {
                    this.right = true;
                    this.rightDown = true;
                }
            });

            game.render.canvas.addEventListener("mouseup", event => {
                if (event.button === 0) {
                    this.left = false;
                    this.leftUp = true;
                } else if (event.button === 2) {
                    this.right = false;
                    this.rightUp = true;
                }
            });
            game.render.canvas.addEventListener("contextmenu", event => {
                if (!this.contextMenu) {
                    event.preventDefault();
                }
            });
            game.render.canvas.addEventListener("mousemove", event => {
                this.x = event.offsetX / this.game.render.fit.scale;
                this.y = event.offsetY / this.game.render.fit.scale;
            });
        }

        update() {
            this.leftUp = false;
            this.rightUp = false;
            this.leftDown = false;
            this.rightDown = false;
        }
    }

    // Manages mouse/keyboard input
    class Input {
        constructor(game) {
            this.mouse = new MouseInput(game);
            this.keys = new KeyInput(game);
        }

        update() {
            this.mouse.update();
            this.keys.update();
        }
    }

    // Manages the defining and execution of commands.
    class CommandLine {
        constructor(console) {
            this.console = console;
            this.commands = {};
        }
    
        // Adds a command to the command line. Can have arguments
        add(name, callback) {
            this.commands[name] = callback;
        }
        
        // Clears all commands from the command line
        clear() {
            this.commands = {};
        }
    
        // Executes a string as a command.
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
    
    // Manages logging to the console and HTML styling
    class Console {
        constructor(game) {
            this.isOpen = false;
            this.game = game;
            this.commands = new CommandLine(this);
            this.createHTML();
            this.log("Welcome to the developer console. Press / to close.");
        }
    
        createHTML() {
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
        }
    
        open() {
            this.isOpen = true;
            this.container.style.display = "block";
            this.form.style.display = "block";
            this.input.focus();
            setTimeout(() => {
                this.input.value = "";
            }, 1);
        }
    
        close() {
            this.isOpen = false;
            this.container.style.display = "none";
            this.form.style.display = "none";
            this.input.blur();
            this.game.render.canvas.focus();
        }
        
        log(message) {
            const event = new CustomEvent("commandOutput", { detail: message });
            document.dispatchEvent(event);
        }
    }

    // A composite class that contains all the components of a game
    class Game {

        static MatterSprite = MatterSprite;

        constructor(canvas = document.createElement("canvas")) {
            canvas.tabIndex = 0;

            this.math = new Mathf(this);
            this.render = new Renderer(this, canvas);
            this.physics = new Physics(this);
            this.input = new Input(this);
            this.loop = new Loop(this);
            this.console = new Console(this);
        }

        group(items) {
            return new Group(items);
        }
        
        fullscreen() {
            const w = window.open();
    		w.document.open();
    		w.document.write(`<!DOCTYPE html>${originalHTML}`);
    		w.document.close();
        }
    }

    return Game;

})();

export default Game;
