// Generated by CoffeeScript 1.9.1
(function() {
  var Bird, Heap, Vector, World, acosd, toDeg,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  toDeg = 180 / Math.PI;

  acosd = function(rad) {
    return Math.acos(rad) * toDeg;
  };

  Heap = require('./maxheap.js');

  Vector = (function() {
    function Vector(x1, y1) {
      this.x = x1;
      this.y = y1;
    }

    Vector.prototype.mult = function(k) {
      return new Vector(k * this.x, k * this.y);
    };

    Vector.prototype.dot = function(vec) {
      return new Vector(vec.x * this.x, vec.y * this.y);
    };

    Vector.prototype.plus = function(vec) {
      return new Vector(this.x + vec.x, this.y + vec.y);
    };

    Vector.prototype.minus = function(vec) {
      return new Vector(this.x - vec.x, this.y - vec.y);
    };

    Vector.prototype.distance = function(vec) {
      return this.minus(vec).norm();
    };

    Vector.prototype.norm = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    Vector.prototype.scale = function(k) {
      if (k == null) {
        k = 1;
      }
      return new Vector((this.x / this.norm() * k) || 0, (this.y / this.norm() * k) || 0);
    };

    Vector.prototype.angleTo = function(vec) {
      return acosd(this.dot(vec) / this.norm() / vec.norm());
    };

    Vector.prototype.toString = function() {
      return "(" + this.x + ", " + this.y + ")";
    };

    Vector.prototype.round = function() {
      return new Vector(Math.round(this.x), Math.round(this.y));
    };

    return Vector;

  })();

  Bird = (function() {
    function Bird(x, y, velocity) {
      this.velocity = velocity != null ? velocity : new Vector(0, 0);
      this.pos = new Vector(x, y);
    }

    Bird.prototype.separate = function(world) {
      var out, p, separable, shouldSeparateFrom;
      if (world.birds.length === 1) {
        return new Vector(0, 0);
      }
      p = world.params;
      shouldSeparateFrom = (function(_this) {
        return function(bird) {
          var ref;
          if (bird === _this) {
            return false;
          }
          return bird.pos.distance(_this.pos) <= p.separation_dist && (p.front_angle < (ref = _this.pos.angleTo(bird.pos)) && ref < 180 - p.back_angle);
        };
      })(this);
      separable = world.birds.filter(shouldSeparateFrom);
      if (separable.length === 0) {
        return new Vector(0, 0);
      }
      out = separable.map(function(b) {
        return b.pos;
      }).reduce(((function(_this) {
        return function(v1, v2) {
          return v1.plus(_this.pos.minus(v2).scale());
        };
      })(this)), new Vector(0, 0)).scale();
      return out;
    };

    Bird.prototype.align = function(world) {
      var aligns, couldAlignWith, len, p;
      if (world.birds.length === 1) {
        return new Vector(0, 0);
      }
      p = world.params;
      couldAlignWith = (function(_this) {
        return function(bird) {
          var ref;
          if (bird === _this) {
            return false;
          }
          return bird.pos.distance(_this.pos) <= world.params.separation_dist && (p.front_angle < (ref = _this.pos.angleTo(bird.pos)) && ref < 180 - p.back_angle);
        };
      })(this);
      aligns = world.birds.filter(couldAlignWith);
      len = aligns.length;
      if (aligns.length === 0) {
        return new Vector(0, 0);
      }
      return aligns.map(function(b) {
        return b.velocity;
      }).reduce((function(v1, v2) {
        return v1.plus(v2.mult(1 / len));
      }), new Vector(0, 0)).scale();
    };

    Bird.prototype.cohese = function(world) {
      var cohesions, heap, i, len;
      if (world.birds.length === 1) {
        return new Vector(0, 0);
      }
      heap = new Heap(world.birds.slice(0), ((function(_this) {
        return function(a, b) {
          return _this.pos.distance(a.pos) > _this.pos.distance(b.pos);
        };
      })(this)));
      cohesions = (function() {
        var j, ref, results;
        results = [];
        for (i = j = 0, ref = Math.min(heap.tree.length, world.params.cohesion_num); 0 <= ref ? j < ref : j > ref; i = 0 <= ref ? ++j : --j) {
          results.push(heap.pop());
        }
        return results;
      })();
      len = cohesions.length;
      return cohesions.map(function(b) {
        return b.pos;
      }).reduce(function(v1, v2) {
        return v1.plus(v2.mult(1 / len));
      }).minus(this.pos).scale();
    };

    Bird.prototype.flipAtWall = function(vec) {
      var x, y;
      x = vec.x * (this.pos.x <= 5 || this.pos.x >= 595 ? -1 : 1);
      y = vec.y * (this.pos.y <= 5 || this.pos.y >= 595 ? -1 : 1);
      return new Vector(x, y);
    };

    Bird.prototype.loop = function(vec) {
      return new Vector(vec.x % 600, vec.y % 600);
    };

    Bird.prototype.nextPos = function(world) {
      var changes, p;
      p = world.params;
      changes = [this.separate(world).mult(p.separation_str), this.align(world).mult(p.alignment_str), this.cohese(world).mult(p.cohesion_str)];
      this.velocity = changes.reduce((function(v1, v2) {
        return v1.plus(v2);
      }), this.velocity).scale(p.speed);
      this.velocity = this.flipAtWall(this.velocity);
      return this.loop(this.pos.plus(this.velocity));
    };

    Bird.prototype.toString = function() {
      return "[(x:" + this.pos.x + ", y:" + this.pos.y + "), v:(" + this.velocity + ")]";
    };

    return Bird;

  })();

  World = (function() {
    function World(canvas, birds) {
      this.canvas = canvas;
      this.birds = birds != null ? birds : [];
      this.draw = bind(this.draw, this);
      this.params = {
        speed: 2,
        front_angle: 0,
        back_angle: 0,
        separation_dist: 100,
        alignment_dist: 100,
        cohesion_num: 7,
        separation_str: 1,
        alignment_str: 1 / 500,
        cohesion_str: 1 / 50,
        fear_str: 1
      };
    }

    World.prototype.step = function() {
      return this.birds = this.birds.map(((function(_this) {
        return function(bird) {
          var next;
          next = bird.nextPos(_this);
          return new Bird(next.x, next.y, bird.velocity);
        };
      })(this)));
    };

    World.prototype.addBird = function(x, y) {
      return this.birds.push(new Bird(x, y));
    };

    World.prototype.draw = function() {
      var ctx;
      this.step();
      ctx = this.canvas.getContext('2d');
      ctx.clearRect(0, 0, 600, 600);
      this.birds.forEach((function(bird) {
        var angle, cos, sin, x, x0, y, y0;
        angle = 10 * Math.PI / 180;
        x = bird.velocity.mult(-1).scale(15).x;
        y = bird.velocity.mult(-1).scale(15).y;
        x0 = bird.pos.x;
        y0 = bird.pos.y;
        cos = Math.cos(angle);
        sin = Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(Math.round(x0), Math.round(y0));
        ctx.lineTo(Math.round(x0 + x * cos - y * sin), Math.round(y0 + x * sin + y * cos));
        ctx.lineTo(Math.round(x0 + x * cos + y * sin), Math.round(y0 + y * cos - x * sin));
        return ctx.fill();
      }));
      return window.requestAnimationFrame(this.draw);
    };

    return World;

  })();

  module.exports.World = World;

}).call(this);