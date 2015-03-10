toDeg = 180/Math.PI
acosd = (rad) -> Math.acos(rad) * toDeg
Heap = require('./maxheap.js')

class Vector
    constructor: (@x,@y) ->
    mult: (k) -> new Vector(k * @x, k * @y)
    dot: (vec) -> new Vector(vec.x * @x, vec.y * @y)
    plus: (vec) -> new Vector(@x + vec.x, @y + vec.y)
    minus: (vec) -> new Vector(@x - vec.x, @y - vec.y)
    distance: (vec) -> this.minus(vec).norm()
    norm:  () -> Math.sqrt(@x * @x + @y * @y)
    scale: (k = 1) -> new Vector((@x / this.norm() * k) or 0, (@y / this.norm() * k) or 0)
    angleTo: (vec) -> acosd(this.dot(vec) / this.norm() / vec.norm())
    toString: () -> "("+@x+", "+@y+")"
    round: -> new Vector(Math.round(@x), Math.round(@y))
class Bird
    constructor: (x, y, @velocity = new Vector(0, 0)) ->
        @pos = new Vector(x, y)
    separate: (world) ->
        return new Vector(0,0) if world.birds.length == 1
        p = world.params
        shouldSeparateFrom = (bird) =>
            return false if bird == this
            return bird.pos.distance(@pos) <= p.separation_dist and
                p.front_angle < @pos.angleTo(bird.pos) < 180 - p.back_angle
        separable = world.birds.filter(shouldSeparateFrom)
        return new Vector(0,0) if separable.length == 0
        out = separable.map((b) -> b.pos).reduce( ((v1, v2) =>
            v1.plus(@pos.minus(v2).scale())), new Vector(0, 0)).scale()
        return out
    align: (world) ->
        return new Vector(0,0) if world.birds.length == 1
        p = world.params
        couldAlignWith = (bird) =>
            return false if bird == this
            return bird.pos.distance(@pos) <= world.params.separation_dist and
                p.front_angle < @pos.angleTo(bird.pos) < 180 - p.back_angle
        aligns = world.birds.filter(couldAlignWith)
        len = aligns.length
        return new Vector(0,0) if aligns.length == 0
        return aligns.map((b) -> b.velocity).reduce(((v1, v2) ->
            v1.plus(v2.mult(1/len))), new Vector(0, 0)).scale()
    cohese: (world) ->
        return new Vector(0,0) if world.birds.length == 1
        heap = new Heap(world.birds.slice(0), ((a,b)=> @pos.distance(a.pos) > @pos.distance(b.pos)))
        cohesions = (heap.pop() for i in [0...Math.min(heap.tree.length, world.params.cohesion_num)])
        len = cohesions.length
        return cohesions.map((b) -> b.pos).reduce((v1, v2) ->
            v1.plus(v2.mult(1/len))).minus(@pos).scale()
    flipAtWall: (vec) ->
        x = vec.x * (if @pos.x <= 5 or @pos.x >= 595 then -1 else 1)
        y = vec.y * (if @pos.y <= 5 or @pos.y >= 595 then -1 else 1)
        return new Vector(x, y)
    loop: (vec) ->
        return new Vector(vec.x % 600, vec.y % 600)
    nextPos: (world) ->
        p = world.params
        changes = [
            this.separate(world).mult(p.separation_str),
            this.align(world).mult(p.alignment_str),
            this.cohese(world).mult(p.cohesion_str)]
        @velocity = changes.reduce(((v1, v2) -> v1.plus(v2)), @velocity).scale(p.speed)
        @velocity = this.flipAtWall(@velocity)
        return this.loop(@pos.plus(@velocity))
    toString: ->
        "[(x:#{@pos.x}, y:#{@pos.y}), v:(#{@velocity})]"

class World
    constructor: (@canvas, @birds = []) ->
        @params =
            speed: 2
            front_angle: 0
            back_angle: 0
            separation_dist: 100 # pixels
            alignment_dist: 100 # pixels
            cohesion_num: 7 # neighbors considered
            separation_str: 1 # mult
            alignment_str: 1/500 # mult
            cohesion_str: 1/50 # mult
            fear_str: 1 # mult
    step: ->
        @birds = @birds.map ((bird) =>
            next = bird.nextPos(this)
            new Bird(next.x, next.y, bird.velocity))
    addBird: (x, y) ->
        @birds.push(new Bird(x, y))
    draw: =>
        this.step()
        ctx = @canvas.getContext('2d')
        ctx.clearRect(0,0,600,600)
        @birds.forEach(((bird) ->
            angle = 10 * Math.PI / 180
            x = bird.velocity.mult(-1).scale(15).x
            y = bird.velocity.mult(-1).scale(15).y
            x0 = bird.pos.x
            y0 = bird.pos.y
            cos = Math.cos(angle)
            sin = Math.sin(angle)
            ctx.beginPath()
            ctx.moveTo(Math.round(x0), Math.round(y0))
            ctx.lineTo(Math.round(x0 + x * cos - y * sin), Math.round(y0 + x * sin + y * cos))
            ctx.lineTo(Math.round(x0 + x * cos + y * sin), Math.round(y0 + y * cos - x * sin))
            ctx.fill()))
        window.requestAnimationFrame(this.draw)

module.exports.World = World
