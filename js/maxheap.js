// Generated by CoffeeScript 1.9.1
(function() {
  var Heap;

  Heap = (function() {
    var tree;

    tree = [];

    Heap.prototype.heapify = function(i) {
      var left, max, right, t;
      left = 2 * (i + 1) - 1;
      right = left + 1;
      max = i;
      if (left < this.tree.length && this.fn(this.tree[left], this.tree[max])) {
        max = left;
      }
      if (right < this.tree.length && this.fn(this.tree[right], this.tree[max])) {
        max = right;
      }
      if (max !== i) {
        t = this.tree[i];
        this.tree[i] = this.tree[max];
        this.tree[max] = t;
        return this.heapify(max);
      }
    };

    Heap.prototype.pop = function() {
      var out;
      out = this.tree[0];
      this.tree[0] = this.tree.splice(tree.length - 1, 1)[0];
      this.heapify(0);
      return out;
    };

    function Heap(tree1, fn) {
      var i, j, ref;
      this.tree = tree1;
      this.fn = fn != null ? fn : function(a, b) {
        return a > b;
      };
      for (i = j = ref = Math.floor(this.tree.length / 2) - 1; ref <= 0 ? j <= 0 : j >= 0; i = ref <= 0 ? ++j : --j) {
        this.heapify(i);
      }
    }

    return Heap;

  })();

  module.exports = Heap;

}).call(this);