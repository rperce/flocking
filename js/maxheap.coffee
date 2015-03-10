class Heap
    tree = []
    heapify: (i) ->
        left = 2 * (i + 1) - 1
        right = left + 1
        max = i
        if left < @tree.length and @fn(@tree[left], @tree[max])
            max = left
        if right < @tree.length and @fn(@tree[right], @tree[max])
            max = right
        if max != i
            t = @tree[i]
            @tree[i] = @tree[max]
            @tree[max] = t
            this.heapify(max)
    pop: () ->
        out = @tree[0]
        @tree[0] = @tree.splice(tree.length - 1, 1)[0]
        this.heapify(0)
        return out
    constructor: (@tree, @fn = (a,b)->a>b) ->
        this.heapify(i) for i in [Math.floor(@tree.length/2)-1..0]

module.exports = Heap
