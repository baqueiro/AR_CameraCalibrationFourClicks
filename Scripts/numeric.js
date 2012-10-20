

/**
 * @fileOverview 
 * @author <a href="http://www.ma.hw.ac.uk/~loisel/">Sébastien Loisel</a>
 *
 * @description
 * The <tt>numeric.js</tt> file contains the {@link numeric} module and the Tensor
 * class.<br><br>
 */

/*
<pre>
> numeric.t([1,2,3,4])(2)
t(3)
> numeric.t([10,11,12,13,14,15,16,17,18,19])([3,4,3,5,3,3,1])
t([13,14,13,15,13,13,11])
> numeric.t([1,2,3])(null)
t([1,2,3])
> numeric.t([[1,2,3],[4,5,6]],[[7,8,9],[10,11,12]])(1,2);
t(6,12)
> numeric.t([[[1,2],[3,4]],[[5,6],[7,8]]])(1,0,1);
t(6)
> numeric.t([[1,2],[3,4]])(null,1)
t([2,4])
</pre>
 */

/*
<pre>
> z = numeric.t([5,6,7,8,9]);
t([5,6,7,8,9])
> numeric.set(z,2,14);
t([5,6,14,8,9])
> numeric.set(z,[1,2,4],[0,0,0]);
t([5,0,0,8,0])
> numeric.set(z,[1,2,3],numeric.t([1,2,3],[4,5,6]));
t([5,1,2,3,0],[0,4,5,6,0])
> numeric.set(z,[0,1],[12,13]);
t([12,13,2,3,0],[0,0,5,6,0])
> z = numeric.t(3);
t(3)
> numeric.set(z,8)
t(8)
> numeric.set(z,numeric.t(1,2))
t(1,2)
> numeric.set(z,3)
t(3)
> z = numeric.t([[1,2,3,4],[5,6,7,8],[9,10,11,12]])
t([[1,2,3,4],[5,6,7,8],[9,10,11,12]])
> numeric.set(z,1,1,-12)
t([[1,2,3,4],[5,-12,7,8],[9,10,11,12]])
> numeric.set(z,[0,1],[2,3],[[20,21],[22,23]])
t([[1,2,20,21],[5,-12,22,23],[9,10,11,12]])
> z = numeric.t([[[1,2],[3,4]],[[5,6],[7,8]]])
t([[[1,2],[3,4]],[[5,6],[7,8]]])
> numeric.set(z,1,([0,1]),0,([11,12]))
t([[[1,2],[3,4]],[[11,6],[12,8]]])
</pre>
 */

/** @name numeric 
 *  @namespace Numerical analysis in javascript.
 *  @author <a href="http://www.ma.hw.ac.uk/~loisel/">Sébastien Loisel</a>
 *  @description The <tt>numeric.js</tt> file contains the {@link numeric} module and the Tensor
 * ``class'' for numerical analysis in javascript.<br><br>
 *
 * <b>Setting up.</b> In order to use {@link numeric} and the Tensor object, you have to 
 * set up your Javascript environment. If you are writing a script that will run on the web in a browser,
 * you need to include
 * the <tt>numeric.js</tt> file by adding something like <tt>&lt;script src="/path/to/numeric.js"&gt;&lt;/script&gt;</tt>
 * to the head of your HTML document.<br><br>
 * 
 * <b>Minimal complete example.</b> This is the ``Hello, world!'' of <tt>numeric.js</tt> in the browser.
 * Proceed as follows:
 * <ol>
 * <li> Create a directory to hold the html page. I will use the directory <tt>~/example</tt>. In Windows,
 * you might use <tt>c:\example</tt>.
 * <li> Put the file <tt>numeric.js</tt> into the <tt>~/example</tt> directory, you now have the file
 * <tt>~/example/numeric.js</tt>.
 * <li> Create a new text file <tt>~/example/index.html</tt> and paste the following into it:<br>
<div style="margin-left: 50px"><tt>
      &lt;html&gt;<br>
      &lt;head&gt;<br>
      &lt;script src="numeric.js"&gt;&lt;/script&gt;<br>
      &lt;body&gt;<br>
      Here is a matrix:&lt;br&gt;<br>
      &lt;pre&gt;<br>
      &lt;script&gt;<br>
      x = [[1,2],[3,4]];<br>
      y = [[0,1],[1,0]];<br>
      z = numeric.add(1,numeric.mul(0.5,x,numeric.exp(y)));<br>
      document.write(numeric.prettyPrint(z));<br>
      &lt;/script&gt;<br>
      &lt;/pre&gt;<br>
</tt></div>
 * <li> Using your browser, open the file <tt>~/example/index.html</tt>. You will see a short message
 * and a 2x2 matrix.
 * </ol>
 * 
 * <b>Using <tt>numeric.js</tt> outside the browser.</b> The numeric module can also be used outside
 * of the browser. I use <a href="http://www.nodejs.org">node.js</a> to run browserless javascript,
 * there are other methods as well. In this way I can use javascript as a general purpose programming
 * language (no web programming at all). For example, I have written a node.js script that runs a
 * unit testing suite on all my code whenever I save my code to disk.
 * The other situation where you may want to run javascript outside
 * the browser is if you are running web server (or some other kind of server) which can be scripted
 * on the server using javascript.<br><br>
 * 
 * In order to use <tt>numeric.js</tt> from node.js, I need to do
 * <tt>numeric = require('/path/to/numeric.js')</tt> at the beginning of my script.<br><br>
 * 
 * <i>Remark: node.js currently has <a href="https://groups.google.com/group/nodejs-dev/browse_thread/thread/c4a9c68fac75088f">a known feature/bug</a> that prevents the numeric module from working correctly from the
 * REPL. However, <tt>numeric.js</tt> works normally from regular scripts.</i><br><br>
 * 
 * <b>Tensors.</b> Tensor objects contain three fields: the size <tt>s</tt>,
 * the real part <tt>x</tt> and the optional imaginary part <tt>y</tt>. In many cases, you will not access
 * or manipulate the <tt>s</tt>, <tt>x</tt>, <tt>y</tt> fields directly but instead you should write
 * ``vectorized'' programs that operate on entire tensors at once without
 * writing explicit loops.<br><br>
 * 
 * <b>Constructing tensors.</b> The normal way of constructing a tensor is to use the
 * {@link numeric.t}() function, as follows:
 * <pre>
> numeric.t([[1,2],[3,4]],[[5,6],[7,8]])
t([[1,2],
   [3,4]],
  [[5,6],
   [7,8]])
</pre>
 *
 * The above example creates an order-2 tensor (a matrix) whose entries are the complex numbers
 * 1+5i, 2+6i, 3+7i and 4+8i in entries (0,0), (0,1), (1,0) and (1,1) respectively. Note
 * that indexing of tensor starts at 0 whereas in typical mathematics, indexing of vectors, matrices,
 * etc... starts at 1. This makes the Tensor object consistent with the usual notions of Arrays
 * in Javascript.<br><br>
 * 
 * <b>Implicit construction of tensors.</b> Most functions in the {@link numeric} module will
 * automatically construct tensors from Array and Number parameters. For example:
<pre>
> numeric.add(1,[2,3])
t([3,4])
> numeric.add(numeric.t(1),numeric.t([2,3]))
t([3,4])
</pre>
 * The first of the two commands does not use the {@link numeric.t}() constructor explicitly, but the
 * {@link numeric.add}() method automatically builds the tensors on its own. The second command is
 * equivalent with explicit calls to {@link numeric.t}().<br><br>
 * 
 * <b>Complex numbers.</b> Complex numbers are fully supported.
 * You may want to use the constructor {@link numeric.t}() to build complex tensors, but you can also
 * use the imaginary unit <tt>numeric.i</tt>:
<pre>
> numeric.i
t(0,1)
> numeric.mul(numeric.i,numeric.i)
t(-1,0)
</pre>
 * It is slightly more efficient to explicitly use the {@link numeric.t}() constructor instead of using
 * <tt>numeric.i</tt> and arithmetic operations. Therefore, the first of the following two lines is
 * slightly more efficient:
<pre>
> numeric.t([1,2,3],[4,5,6])
t([1,2,3],[4,5,6])
> numeric.add([1,2,3],numeric.mul(numeric.i,[4,5,6]))
t([1,2,3],[4,5,6])
</pre>
 * The two commands give equivalent results, but the former is slightly more efficient.<br><br>
 * 
 * <b>"Shortcuts".</b> You can also create "shortcuts" to avoid typing very long things.
<pre>
> num = numeric; num.t([1,2])
t([1,2])
> t = num.t; t([3,4])
t([3,4])
</pre>
 * 
 * <b>Manipulating tensors.</b> The Tensor object can be manipulated in ``vectorized'' style.
 * The following example shows
 * how to perform arithmetic on vectors.
<pre>
> x = numeric.t([1,2,3,4,5]);
t( [1         , 2         , 3         , 4         , 5          ])
> y = numeric.t([3,1,4,1,5]);
t( [3         , 1         , 4         , 1         , 5          ])
> z = numeric.t([1,-1,1,-1,1]);
t( [1         , -1        , 1         , -1        , 1          ])
> w = numeric.add(1,x,numeric.exp(numeric.mul(0.5,y,z)));
t( [6.482     , 3.607     , 11.39     , 5.607     , 18.18      ])
</pre>
 *
 * <b>Accessing entries of vectors.</b> Tensor objects are actually Function objects and you can call
 * this function to read entries of the tensor, as follows:
<pre>
> numeric.t([3,1,4,1,5])(2)
t(4)
</pre>
 * 
 * <b>Accessing entries of matrices and tensors.</b> Matrices can be accessed in a similar manner. If
 * <tt>x</tt> is a matrix then its entries are given by <tt>x(i,j)</tt>. Higher order tensors are
 * similar.<br><br>
 * 
 * <b>Accessing a block of a tensor.</b> You can also extract a block from a tensor as follows:
<pre>
> x = numeric.t([[1,2,3,4,5],[6,7,8,9,10],[11,12,13,14,15],[16,17,18,19,20]]);
t( [ [1         , 2         , 3         , 4         , 5          ], 
     [6         , 7         , 8         , 9         , 10         ], 
     [11        , 12        , 13        , 14        , 15         ], 
     [16        , 17        , 18        , 19        , 20         ] ])
> x([1,2],[0,2,3]);
t( [ [6         , 8         , 9          ], 
     [11        , 13        , 14         ] ])
</pre>
 * In this case, we took a 2x3 submatrix of the 4x5 matrix x. Note that the rows and columns
 * that are extracted need not be consecutive.<br><br>
 * 
 * <b>Pretty printing.</b> The function {@link numeric.prettyPrint}() returns a pretty-printed
 * version of any input tensor. The pretty-printed version is easier to read and more concise
 *  than the ``raw'' version
 * that one gets from a javascript console. For example, the tensor <tt>numeric.t(3)</tt> would
 * print as <tt>{ [Function: $0] s: [], x: [ 3 ] }</tt> at the console, but {@link numeric.prettyPrint}
 * returns <tt>t(3)</tt> instead. The prettyPrint function can also print with a varying number of
 * digits, using the {@link numeric.digits}() function. By default, {@link numeric.prettyPrint}()
 * prints using 4 digits.<br><br>
 * 
 * <b>Accessing <tt>T.s, T.x, T.y</tt>.</b> Although many tasks can be accomplished without accessing
 * the fields of the tensor objects, some tasks are best accomplished by reading and writing directly from the
 * fields of T. For example, to get the size of a tensor, simply read the <tt>T.s</tt> field.<br><br>
 * 
 * A common reason for accessing the individual entries is if you are implementing a ``pointwise'' function,
 * like the {@link numeric.exp}() function which computes the exponential of all of the entries of a
 * tensor. In this situation, you do not need to know the exact shape of the tensors; it suffices to loop
 * sequenctially through the <tt>x</tt> (and <tt>y</tt> if present) member(s) Arrays of the Tensor
 * object.<br><br>
 * 
 * <b>Error checking.</b> The {@link numeric} module has several safety check to ensure that tensors are always well-formed,
 * etc... For example:
 <pre>
> numeric.t([[1,2],[3,4,5]])
Error: Malformed tensor
 </pre>
 * Because javascript is a highly dynamic language, these sanity checks are not guaranteed to catch
 * all possible problems. You should be particularly careful if you access the <tt>T.s</tt>, <tt>T.x</tt>
 * and <tt>T.y</tt> fields directly that you do not create such malformed tensors. This is because all
 * the error checking is done when the tensor object is initially constructed.<br><br>
 * 
 * When an error is detected, an exception is thrown. If your script is able to handle such
 * problems, you can catch the exception and attempt to recover. If you do not catch the exception
 * but you have some sort of javascript debugging console open, the console will probably tell
 * you that there was an uncaught exception and even give you a traceback to help you find the
 * error. If you run a script in a plain browser without opening a javascript debugging
 * console, any errors will still trigger an exception but any uncaught exception will be silently
 * ignored by the browser. The only symptom you will observe is that your script doesn't work.<br><br>
 * 
 * <b>Tensor types.</b> Tensor objects are callable because they are actually functions and
 * not objects. In order to check that an object x is actually a Tensor, you can use the 
 * {@link isT}() function. The isT(x) function simply checks that 
 * <tt>(x.name === "Tensor")</tt>. Therefore, you could make
 * an object that masquerades as a Tensor by wrapping it in a Function named "Tensor".<br><br>
 * 
 * <b>Mutability</b>. Tensor objects are mutable:
<pre>
> z = numeric.t([1,2])
t([1,2])
> w = z
t([1,2])
> w(0,9)      // Sets w(0) to 9
t([9,2])
> z           // also changed since w = z
t([9,2])
</pre>
 * The fields <tt>s</tt>, <tt>x</tt>, <tt>y</tt> can likewise be ``shared'' between multiple tensors.
 * This is particularly likely for the <tt>s</tt> field:
<pre>
> z = numeric.t([0,1])
t([0,1])
> w = numeric.exp(z)
t([1,2.718])
> z.s[0] = 2; z.s[1] = 1; z
t([[0],[1]])
> w
t([[1],[2.718]])
</pre>
 * In the example above, the shape of <tt>t</tt> was modified by directly modifying the <tt>z.s</tt>
 * field. However, the <tt>w.s</tt> field ``points'' to the same underlying memory, and hence the shape
 * of w has also changed.<br><br>
 * 
 * Changing the field <tt>s</tt> directly is discouraged. The length of <tt>x</tt> and/or <tt>y</tt>
 * must stay synchronized with the size <tt>s</tt>. Moreover, changing the length of the s field
 * will break the tensor since the Tensor() function is optimized for vectors and matrices differently.<br><br>
 * 
 * The deprecated function <tt>set()</tt> can also be used to mutate tensors.<br><br>
 * 
 * <b>Purity.</b> In order to avoid inadvertently modifying unrelated tensors, most of the functions
 * in the {@link numeric} module are ``pure'': they do not modify the fields of their inputs in any
 * way and they do not have other side-effects.<br><br>
 * 
 * A few functions are not pure. The Tensor() function can be used to mutate entries of the Tensor.
 * The {@link numeric.digits}() function alters the way in which {@link prettyPrint}() works.
 *
 * @property {T} i The imaginary unit.
 * @property {Number} epsilon The smallest number such that 1+epsilon > 1.
 */

/*
<pre>
> delete global.num; delete global.t; delete global.z; delete global.w;
true
</pre>
 */

/**
 * @name workshop
 * @namespace The workshop namespace contains some extra functions that can be used
 * when {@link numeric} is being used within the Javascript Workshop REPL.
 */

/**
 * @memberOf workshop
 * @name print
 * @function
 * @description Print to the REPL.
 * @param {String} [html] The optional string to print. If this optional parameter is present,
 * it is printed to the REPL output field. If the REPL output field already contains something,
 * it is overwritten with the new output. If the optional <tt>html</tt> parameter is omitted,
 * the current output field is left as-is.
 * @returns {String} The contents of the output field in the REPL.
 */

/** @exports numeric */
( function(exports) {
    "use strict";

/**#@+
 * @memberOf numeric
 */
function expo(f) { exports[f.name] = f; }

/**
     * Adds tensors
     * 
     * @example
> numeric.add(1,2)
t(3)
> numeric.add(1,[2,3])
t([3,4])
> numeric.add([1,2],3)
t([4,5])
> numeric.add([1,2],[3,4])
t([4,6])
> numeric.add(numeric.t(1,2),numeric.t(3,4))
t(4,6)
> numeric.add(1,numeric.t(2,3))
t(3,3)
> numeric.add(numeric.t(2,3),1)
t(3,3)
> numeric.add(numeric.t([1,2],[3,4]),numeric.t([5,6],[7,8]))
t([6,8],
  [10,12])
> numeric.add(1,2,3,4,5,6,7,8,9)
t(45)
     */
function add() {
    function adder(x,y) { var i; for(i=0;i<x.length;i++) { x[i] += y(i); } }
    var ret = copy(t(arguments[0])),foo;
    var i,j,foo,bar;
    for(i=1;i<arguments.length;i++) {
        foo = t(arguments[i]);
        if(ret.s.length === 0 && foo.s.length >0) {
            bar = ret;
            ret = copy(foo);
            foo = bar;
        }
        adder(ret.x,mkf(foo.x));
        if(typeof ret.y === "undefined") {
            if(typeof foo.y !== "undefined") {
                ret.y = foo.y.slice(0);
            }
        } else {
            if(typeof foo.y !== "undefined") {
                adder(ret.y,mkf(foo.y));
            }
        }
    }
    return ret;
}
expo(add);

/**
     * Subtracts tensors.
     * 
     * @example
> numeric.sub(1,2)
t(-1)
> numeric.sub(1,[2,3])
t([-1,-2])
> numeric.sub(numeric.t(1,2),([3,4]))
t([-2,-3],[2,2])
> numeric.sub([1,2],numeric.t(3,4))
t([-2,-1],[-4,-4])
> numeric.sub(numeric.t([1,2],[3,4]),numeric.t([5,6],[7,8]))
t([-4,-4],[-4,-4])
     */
function sub() {
    function subber(x,y) { var i; for(i=0;i<x.length;i++) { x[i] -= y(i); } }
    var ret = copy(t(arguments[0])),foo;
    var i,j,foo,bar;
    for(i=1;i<arguments.length;i++) {
        foo = t(arguments[i]);
        if(ret.s.length === 0 && foo.s.length >0) {
            if(typeof ret.y === "undefined") {
                ret = mkT(foo.s,mka(foo.x.length,ret.x[0]));
            } else {
                ret = mkT(foo.s,mka(foo.x.length,ret.x[0]),
                                  mka(foo.x.length,ret.y[0]));
            }
        }
        subber(ret.x,mkf(foo.x));
        if(typeof foo.y !== "undefined") {
            if(typeof ret.y === "undefined") {
                ret.y = mka(ret.x.length,0);
            }
            subber(ret.y,mkf(foo.y));
        }
    }
    return ret;
}
expo(sub);

/**
     * Multiplies tensors pointwise.
     * 
     * For matrix products, etc... see dot() and tensor().
     * 
     * @example
> numeric.mul(1,2)
t(2)
> numeric.mul([1,2],[3,4])
t([3,8])
> numeric.mul(numeric.t(1,2),numeric.t(3,4))
t(-5,10)
> numeric.mul(numeric.t([1,2],[3,4]),numeric.t([5,6],[7,8]))
t([-16,-20],[22,40])
     */
function mul() {
    function muler(x,y) { var i; for(i=0;i<x.length;i++) { x[i] *= y(i); } }
    var ret = copy(t(arguments[0])),foo;
    var i,j,foo,bar,x1,y1,x2,y2,z1,z2;
    for(i=1;i<arguments.length;i++) {
        foo = t(arguments[i]);
        if(typeof ret.y !== "undefined" || typeof foo.y !== "undefined") {
            x1 = real(ret);
            y1 = imag(ret);
            x2 = real(foo);
            y2 = imag(foo);
            z1 = sub(mul(x1,x2),mul(y1,y2));
            z2 = add(mul(x1,y2),mul(y1,x2));
            ret = mkT(z1.s,z1.x,z2.x);
        } else {
            if(ret.s.length === 0 && foo.s.length > 0) {
                bar = ret;
                ret = copy(foo);
                foo = bar;
            }
            muler(ret.x,mkf(foo.x));
        }
    }
    return ret;
}
expo(mul);

/**
 * Pointwise division of tensor.
 * 
 * @example
> numeric.div(1,2)
t(0.5)
> numeric.div([1,2],4)
t([0.25,0.5])
> numeric.div(4,[1,2])
t([4,2])
> numeric.div([1,2],[4,8])
t([0.25,0.25])
> numeric.div(numeric.t(1,2),numeric.t(3,4))
t(0.44,0.08)
> numeric.div(1,numeric.t(3,4))
t(0.12,-0.16)
> numeric.div(numeric.t(3,4),5)
t(0.6,0.8)
 */
function div() {
function diver(x,y) { var i; for(i=0;i<x.length;i++) { x[i] /= y(i); } }
var ret = copy(t(arguments[0])),foo;
var i,j,foo,bar,x1,y1,x2,y2,z1,z2,r;
for(i=1;i<arguments.length;i++) {
    foo = t(arguments[i]);
    if(typeof ret.y !== "undefined" || typeof foo.y !== "undefined") {
        x1 = real(ret);
        y1 = imag(ret);
        x2 = real(foo);
        y2 = imag(foo);
        r = add(mul(x2,x2),mul(y2,y2));
        z1 = div(add(mul(x1,x2),mul(y1,y2)),r);
        z2 = div(sub(mul(y1,x2),mul(x1,y2)),r);
        ret = mkT(z1.s,z1.x,z2.x);
    } else {
        if(ret.s.length === 0 && foo.s.length > 0) {
            ret = mkT(foo.s,mka(foo.x.length,ret.x[0]));
        }
        diver(ret.x,mkf(foo.x));
    }
}
return ret;
}
expo(div);
var maxit = 10000;
function qrit0(x) {
    var qs = [], q, n = x.s[0],i,k, foo, idx, i0 = [0], i1 = [n];
    x = copy(x);
    for(i=n;i>1;i--) {
        q = diag(rep(i,1));
        for(k=0;k<maxit;k++) {
            foo = qrstep(x,q);
            x = foo[0];
            q = foo[1];
            if(abs(x(i-1,i-2)).x[0] <= epsilon * (abs(x(i-1,i-1)).x[0]+abs(x(i-2,i-2)).x[0]))
            { 
                i0[n-i+1] = i0[n-i];
                i1[n-i+1] = i1[n-i]-1;
                idx = run(i-1);
                x = x(idx,idx);
                break;
            }
            if(abs(x(1,0)).x[0] <= epsilon * (abs(x(0,0)).x[0]+abs(x(1,1)).x[0]))
            { 
                i0[n-i+1] = i0[n-i]+1;
                i1[n-i+1] = i1[n-i];
                idx = run(1,i);
                x = x(idx,idx);
                break;
            }
        }
        if(k === maxit) { throw new Error("eig: reached maximum iteration count"); }
        qs[n-i] = q;
    }
    q = qs[0];
    for(i=1;i<qs.length;i++) {
        var idx = run(i0[i],i1[i]);
        set(q,idx,null,dot(qs[i],q(idx,null)));
    }
    return q;
}
function qrit(x) {
    var qs = [], q, n = x.s[0],i,k, foo,q1,q2,i1,i2;
    q = diag(rep(n,1));
    if(n === 1) { return q; }
    x = copy(x);
    for(k=0;k<maxit;k++) {
        for(i=0;i<n-1;i++) {
            if(abs(x(i+1,i)).x[0] <= epsilon * (abs(x(i,i)).x[0]+abs(x(i+1,i+1)).x[0])) { 
                i1 = run(i+1);
                i2 = run(i+1,n);
                q1 = qrit(x(i1,i1));
                q2 = qrit(x(i2,i2));
                set(q,i1,null,dot(q1,q(i1,null)));
                set(q,i2,null,dot(q2,q(i2,null)));
                return q;
            }
        }
        foo = qrstep(x,q);
        x = foo[0];
        q = foo[1];
    }
    if(k === maxit) { throw new Error("eig: reached maximum iteration count"); }
    qs[n-i] = q;
    return q;
}
function ev(U) {
    var n = U.s[0], i, U0, idx, ret = diag(rep(n,1)),b,v,nv;
    for(i=1;i<n;i++) {
        idx = run(i);
        U0 = sub(U(idx,idx),diag(rep(i,U(i,i))));
        b = neg(U(idx,i));
        v = Usolve(U0,b);
        nv = sqrt(add(dot(v,conj(v)),1));
        set(ret,idx,i,div(v,nv));
        set(ret,i,i,div(1,nv));
    }
    return ret;
}
/**
     * Eigenvalues and eigenvectors of a matrix.
     * 
     *  @example
> A = numeric.t([[1,2,3],[4,5,6],[7,8,7]]); foo = numeric.eig(A); 
{d:t([15.02,-0.2217,-1.802]),
 v:t([[0.2488,  0.5956, -0.5718],
      [0.5686, -0.7589, -0.3273],
      [0.7841,  0.2634,  0.7523]])}
     */
function eig(x) {
    x = M(t(x));
    if(x.s[0]!==x.s[1]){ throw new Error("eig: matrix must be square"); }
    var y = copy(x);
    var foo = qrstep(y,diag(rep(x.s[0],1)));
    var q = qrit(foo[0]);
    q = dot(q,foo[1]);
    var d = dot(dot(q,x),conj(transpose(q)));
    return {d:getDiag(d),v:dot(conj(transpose(q)),ev(d))};
}
expo(eig);

/**
     * Dot or matrix product between scalars, vectors and matrices.
     * 
     * @example
> numeric.dot(2,3)
t(6)
> numeric.dot([2,3],4)
t([8,12])
> numeric.dot([1,2],[3,4])
t(11)
> numeric.dot([1,2],[[3,4],[5,6]])
t([13,16])
> numeric.dot([[3,4],[5,6]],[1,2])
t([11,17])
> numeric.dot(numeric.t([[1,2],[3,4]],[[5,6],[7,8]]),[[9,10],[11,12]])
t([[31,34],[71,78]],[[111,122],[151,166]])
     */
function dot(a,b) {
    a = t(a); b = t(b);
    if(isS(a) || isS(b)) return mul(a,b);
    var i,j,m=a.s[0],x,y, ia, ib, ax, ay, bx, by;
    if(isV(a)) {
        if(isV(b)) {
            ax = a.x;
            bx = b.x;
            x=0;
            if(typeof a.y  !== "undefined" || typeof b.y !== "undefined") {
                if(typeof a.y === "undefined") { /** @ignore */ ia = function(i) { return 0; } }
                else { ay = a.y; ia = function(i) { return ay[i]; } }
                if(typeof b.y === "undefined") { /** @ignore */ ib = function(i) { return 0; } }
                else { by = b.y; ib = function(i) { return by[i]; } }
                y=0;
                for(i=0;i<m;i++) {
                    x += a.x[i]*bx[i]-ia(i)*ib(i);
                    y += ia(i)*bx[i]+ax[i]*ib(i);
                }
                return t(x,y);
            }
            for(i=0;i<m;i++) { x+=a.x[i]*b.x[i]; }
            return t(x);
        }
        M(b);
        if(m !== b.s[0]) { throw new Error("Sizes of vector a and matrix b have to match"); }
        var foo, n = b.s[1];
        x = [];
        if(typeof(b.y) === "undefined" && typeof a.y === "undefined") {
            for(i=0;i<n;i++) {
                foo = dot(a,b(null,i));
                x[i] = foo.x[0];
            }
            return mkT([n],x);
        }
        y = [];
        for(i=0;i<n;i++) {
            foo = dot(a,b(null,i));
            x[i] = foo.x[0];
            y[i] = foo.y[0];
        }
        return mkT([n],x,y);
    }
    M(a);
    var n;
    if(isV(b)) {
        n = b.s[0];
        if(n !== a.s[1]) { throw new Error("Sizes of matrix a and vector b have to match"); }
        var foo;
        x = [];
        if(typeof(b.y) === "undefined" && typeof a.y === "undefined") {
            for(i=0;i<m;i++) {
                foo = dot(a(i,null),b);
                x[i] = foo.x[0];
            }
            return mkT([m],x);
        }
        y = [];
        for(i=0;i<m;i++) {
            foo = dot(a(i,null),b);
            x[i] = foo.x[0];
            y[i] = foo.y[0];
        }
        return mkT([m],x,y);        
    }
    M(b);
    var o = a.s[1];
    if(o !== b.s[0]) { throw new Error("Sizes of matrices a and b have to match"); }
    n = b.s[1];
    x = [];
    if(typeof a.y === "undefined" && typeof b.y === "undefined") {
        for(i=0;i<m;i++) {
            for(j=0;j<n;j++) { x.push(dot(a(i,null),b(null,j)).x[0]); }
        }
        return mkT([m,n],x);
    }
    y = [];
    for(i=0;i<m;i++) {
        for(j=0;j<n;j++) { 
            foo = dot(a(i,null),b(null,j));
            x.push(foo.x[0]);
            y.push(foo.y[0]);
        }
    }
    return mkT([m,n],x,y);
}
expo(dot);

//jsdoc bug above here

/**
     * Solve a lower triangular system.
     * 
     * @example
> numeric.Lsolve([[2,0],[3,4]],[2,11])
t([1,2])
> numeric.Lsolve(numeric.t([[1]],[[2]]),[3])
t([0.6],[-1.2])
     */
function Lsolve(L,b) {
    L = M(t(L)); b = V(t(b));
    var n = L.s[0];
    if(n !== L.s[1]) { throw new Error("Lsolve: L must be square"); }
    if(n !== b.s[0]) { throw new Error("Lsolve: L and b must have matching sizes"); }
    var i,j,ret = copy(b),foo;
    for(i=0;i<n;i++) { set(ret,i,div(sub(ret(i),dot(L(i,run(0,i)),ret(run(0,i)))),L(i,i))); }
    return ret;
}
expo(Lsolve);
/**
     * Solve an upper triangular system.
     * 
     * @example
> numeric.Usolve([[2,3],[0,4]],[8,8])
t([1,2])
     */
function Usolve(U,b) {
    U = M(t(U)); b = V(t(b));
    var n = U.s[0];
    if(n !== U.s[1]) { throw new Error("Usolve: U must be square"); }
    if(n !== b.s[0]) { throw new Error("Usolve: U and b must have matching sizes"); }
    var i,j,ret = copy(b),foo;
    for(i=n-1;i>=0;i--) { set(ret,i,div(sub(ret(i),dot(U(i,run(i+1,n)),ret(run(i+1,n)))),U(i,i))); }
    return ret;
}
expo(Usolve);

/**
     * Computes the LUP decomposition of a matrix.
     * 
     * @example
> numeric.LUP([[1,2],[3,4]])
{L:t([[1,0],[0.3333,1]]),U:t([[3,4],[0,0.6667]]),P:t([1,0])}
> A=numeric.t([[2,4,4,4,2,3],[1,3,2,5,1,1],[1,3,3,1,4,3],[3,5,0,3,2,3],[2,1,0,2,3,4],[2,4,3,0,1,2,]]); Z=numeric.LUP(A); numeric.sub(A(Z.P,null),numeric.dot(Z.L,Z.U));
t([[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,1.110e-16,0]])
> numeric.LUP(numeric.t([[1,2],[3,4]],[[5,6],[7,8]]))
{L:t([[1,0],[0.6552,1]],[[0,0],[0.1379,0]]),U:t([[3,4],[0,0.4828]],[[7,8],[0,0.2069]]),P:t([1,0])}
> numeric.LUP([[1,2,3],[0,4,5],[0,0,6]]);
{L:t([[1,0,0],[0,1,0],[0,0,1]]),U:t([[1,2,3],[0,4,5],[0,0,6]]),P:t([0,1,2])}
     */
function LUP(A) {
    var U = copy(M(t(A)));
    var n = U.s[0], i, j, k, nk, nj;
    if(n!==U.s[1]) { throw new Error("LUP only works on square matrices"); }
    var L = rep(n,n,0), P = run(n), foo,idx;
    for(i=0;i<n;i++) {
        k = i;
        nk = abs(U(k,k)).x[0];
        for(j=k+1;j<n;j++) {
            nj = abs(U(j,i)).x[0];
            if(nj > nk) { k=j; nk = nj; }
        }
        foo = U(k,null); set(U,k,null,U(i,null)); set(U,i,null,foo);
        foo = L(k,null); set(L,k,null,L(i,null)); set(L,i,null,foo);
        foo = P(k); set(P,k,P(i)); set(P,i,foo);
        set(L,i,i,1);
        for(j=i+1;j<n;j++) {
            foo = div(U(j,i),U(i,i));
            set(L,j,i,foo);
            set(U,j,i,0);
            idx = run(i+1,n);
            set(U,j,idx,sub(U(j,idx),mul(foo,U(i,idx))));
        }
    }
    return {L:L, U:U, P:P};
}
expo(LUP);

/**
     * Determinant of a matrix.
     * 
     * @example
> numeric.det([[1,2],[3,4]])
t(-2)
     */
function det(A) {
    var Z = LUP(A), U = Z.U, P = Z.P.x, n = P.length, i,j,k ,d = 1, flags = [];
    for(i=0;i<n;i++) {
        if(flags[i] === undefined) {
            flags[i] = 1;
            j = i;
            k = P[j];
            while(k !== j) { flags[k] = 1; k = P[k]; d *= -1; }
        }
    }
    d = t(d);
    for(i=0;i<n;i++) { d = mul(d,U(i,i)); }
    return d;
}
expo(det);
/**
     * The transpose of a matrix.
     * 
     * @example
> numeric.transpose([[1,2,3],[4,5,6]])
t([[1,4],[2,5],[3,6]])
> numeric.transpose(numeric.t([[1,2,3]],[[4,5,6]]))
t([[1],[2],[3]],[[4],[5],[6]])
     */
function transpose(A) {
    A = (M(t(A)));
    var i,j,m = A.s[0],n = A.s[1],x2=[],y2,c1,c2, x1 = A.x, y1 = A.y;
    if(typeof y1 === "undefined") {
        for(i=0;i<m;i++) {
            c1 = i*n;
            c2 = i;
            for(j=0;j<n;j++) {
                x2[c2] = x1[c1];
                c1++;
                c2+=m;
            }
        }
        return mkT([n,m],x2);
    }
    y2 = [];
    for(i=0;i<m;i++) {
        c1 = i*n;
        c2 = i;
        for(j=0;j<n;j++) {
            x2[c2] = x1[c1];
            y2[c2] = y1[c1];
            c1++;
            c2+=m;
        }
    }
    return mkT([n,m],x2,y2);
}
expo(transpose);
/**
     * The inverse of a matrix
     * 
     * @example
> A=[[2,4,4,4,2,3],[1,3,2,5,1,1],[1,3,3,1,4,3],[3,5,0,3,2,3],[2,1,0,2,3,4],[2,4,3,0,1,2,]]; numeric.dot(numeric.inv(A),A);
t([[1.000     ,-1.066e-14 ,-7.105e-15,-8.882e-15,-2.665e-15,-1.776e-15],
   [-4.441e-16,1.000      ,8.882e-16 ,8.882e-16 ,-2.220e-16,4.441e-16 ],
   [2.220e-16 ,-4.441e-16 ,1.000     ,4.441e-16 ,3.331e-16 ,2.220e-16 ],
   [9.714e-17 ,1.110e-16  ,1.943e-16 ,1.000     ,2.567e-16 ,2.082e-16 ],
   [8.882e-16 ,-3.553e-15 ,0         ,4.441e-16 ,1.000     ,0         ],
   [-8.882e-16,1.776e-15  ,0         ,-8.882e-16,0         ,1.000     ]])
     */
function inv(A) {
    var Z = LUP(A), P = Z.P, n = P.x.length, i;
    var ret = diag(rep(n,1))(P,null);
    for(i=0;i<n;i++) { set(ret,null,i,Usolve(Z.U,Lsolve(Z.L,ret(null,i)))); }
    return ret;
}
expo(inv);
/**
     * Solve a linear system.
     * 
     * @example
> numeric.solve([[3,1,2],[5,2,2],[1,6,5]],[11,15,28])
t([1,2.000,3.000])
     */
function solve(A,b) {
    var Z = LUP(A);
    b = V(t(b));
    return Usolve(Z.U,Lsolve(Z.L,b(Z.P)));
}
expo(solve);
/**
     * Computes the tensor product of two tensors.
     * 
     * @example
> numeric.tensor([1,2],[3,4])
t([[3,4],[6,8]])
> numeric.tensor(numeric.t(1,2),numeric.t(3,4))
t(-5,10)
     */
function tensor(a,b) {
    a = t(a); b = t(b);
    var s = a.s.concat(b.s), sa = a.s, sb = b.s;
    var ret;
    if(typeof a.y === "undefined" && typeof b.y === "undefined") {
        return (function () {
            var ca = 0, cb = 0, cr = 0, ax = a.x, bx = b.x, rx = [];
            function f1(k) {
                function f2(k) {
                    if(k===sb.length) {
                        rx[cr] = ax[ca]*bx[cb];
                        cb++;
                        cr++;
                        return;
                    }
                    var i;
                    for(i=0;i<sb[k];i++) { f2(k+1); }
                }
                if(k===sa.length) {
                    cb = 0;
                    f2(0);
                    ca++;
                } else {
                    var i;
                    for(i=0;i<sa[k];i++) { f1(k+1); }
                }
            }
            f1(0);
            return mkT(s,rx);
        }());
    }
    var ra = real(a), ia = imag(a), rb = real(b), ib = imag(b), rr, ir;
    rr = sub(tensor(ra,rb),tensor(ia,ib));
    ir = add(tensor(ra,ib),tensor(ia,rb));
    return mkT(rr.s,rr.x,ir.x);
}
expo(tensor);

/**
 * QR decomposition.
 * 
 * @example
> A = [[1,2,3],[4,5,6],[7,8,3]]; qr = numeric.QR(A); numeric.round(numeric.mul(1e6,numeric.sub(numeric.dot(qr.Q,qr.R),A)));
t([[0,0,0],[0,0,0],[0,0,0]])
> A = numeric.random(10,10); qr = numeric.QR(A); numeric.round(numeric.mul(1e6,numeric.sub(numeric.dot(qr.Q,qr.R),A)));
t([[0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0],
   [0,0,0,0,0,0,0,0,0,0]])
 * @param A
 * @returns
 */
function QR(A) {
    var Q = M(copy(A)), m = Q.s[0], n = Q.s[1], R = rep(n,Q.s[1],0);
    var i,j,foo,bar;
    for(i=0;i<n;i++) {
        foo = Q(null,i);
        for(j=0;j<i;j++) {
            bar = dot(foo,conj(Q(null,j)));
            R(j,i,bar);
            foo = sub(foo,mul(bar,Q(null,j)));
        }
        bar = norm2(foo);
        R(i,i,bar);
        Q(null,i,div(foo,bar));
    }
    return {Q:Q, R:R};
}
expo(QR);
function samev(a,b) {
    var i;
    if(!(a instanceof Array) || !(b instanceof Array)) { return false; }
    if(a.length !== b.length) { return false; }
    for(i=0;i<a.length;i++) {
        if(typeof a[i] !== "number" || typeof b[i] !== "number") { return false; }
        if(a[i] !== b[i]) { return false; }
    }
    return true;
}

/**
 * Checks whether x and y are equivalent tensors.
 * 
 * @example
> z = numeric.t([1,2,3]); numeric.same(z,z)
true
> w = numeric.t([1,2,3]); numeric.same(z,w)
true
> numeric.set(w,2,2); numeric.same(z,w)
false
> numeric.same(numeric.t(1,1),1)
false
> numeric.same(1,numeric.t(1,1))
false
> numeric.same(numeric.t(1,1),numeric.t(1,1))
true
 */
function same(x,y) {
    x = t(x); y = t(y);
    var i;
    if(x === y) { return true; }
    if(!samev(x.s,y.s)) { return false; }
    if(!samev(x.x,y.x)) { return false; }
    if(typeof x.y === "undefined") {
        if(typeof y.y === "undefined") { return true; }
        for(i=0;i<y.y.length;i++) { if(y.y[i] !== 0) { return false; } }
        return true;
    }
    if(typeof y.y === "undefined") {
        for(i=0;i<x.y.length;i++) { if(x.y[i] !== 0) { return false; } }            
    }
    return true;
}
expo(same);

/**
 * Entrywise comparison for equality
 * 
 * @example
> numeric.equal([1,2,3],[2,2,3])
t([0,1,1])
> numeric.equal(numeric.t([0,1],[0,2]),[0,1])
t([1,0])
> numeric.equal([0,1],numeric.t([0,1],[0,2]))
t([1,0])
> numeric.equal(numeric.t([0,1],[2,2]),numeric.t([0,1],[0,2]))
t([0,1])
 * @param x
 * @param y
 * @returns
 */
function equal(x,y) {
    x = t(x); y = t(y);
    if(!samev(x.s,y.s)) { throw new Error("equal: x and y must have the same shape"); }
    var xx = x.x, xy = x.y, yx = y.x, yy = y.y;
    var i, n = xx.length, ret = [];
    if(typeof xy === "undefined") {
        if(typeof yy === "undefined") {
            for(i=0;i<n;i++) { ret[i] = (xx[i] === yx[i])?1:0; }
            return mkT([ret.length],ret);
        }
        for(i=0;i<n;i++) { ret[i] = (xx[i] === yx[i] && yy[i] === 0)?1:0; }
        return mkT([ret.length],ret);
    }
    if(typeof yy === "undefined") {
        for(i=0;i<n;i++) { ret[i] = (xx[i] === yx[i] && xy[i] === 0)?1:0; }
        return mkT([ret.length],ret);
    }
    for(i=0;i<n;i++) { ret[i] = (xx[i] === yx[i] && xy[i] === yy[i])?1:0; }
    return mkT([ret.length],ret);
}
expo(equal);

function zipbool(x,y,f) {
    x = R(t(x)); y = R(t(y));
    if(!samev(x.s,y.s)) { throw new Error("x and y must have the same shape"); }
    var i, a = x.x, b = y.x, n = a.length, ret = [];
    for(i=0;i<n;i++) { ret[i] = f(a[i],b[i])?1:0; }
    return mkT(x.s,ret);
}

/**
 * Entrywise x > y
 * 
 * @example
> numeric.gt([1,3,4,1],[2,1,5,1]);
t([0,1,0,0])
 * @param x
 * @param y
 * @returns
 */
function gt(x,y) { return zipbool(x,y,function(a,b) { return a>b; }); }
expo(gt);

/**
 * Entrywise x < y
 * 
 * @example
> numeric.lt([1,3,4,1],[2,1,5,1]);
t([1,0,1,0])
 * @param x
 * @param y
 * @returns
 */
function lt(x,y) { return zipbool(x,y,function(a,b) { return a<b; }); }
expo(lt);

/**
 * Entrywise x >= y
 * 
 * @example
> numeric.geq([1,3,4,1],[2,1,5,1]);
t([0,1,0,1])
 * @param x
 * @param y
 * @returns
 */
function geq(x,y) { return zipbool(x,y,function(a,b) { return a>=b; }); }
expo(geq);

/**
 * Entrywise x <= y
 * 
 * @example
> numeric.leq([1,3,4,1],[2,1,5,1]);
t([1,0,1,1])
 * @param x
 * @param y
 * @returns
 */
function leq(x,y) { return zipbool(x,y,function(a,b) { return a<=b; }); }
expo(leq);

/**
 * Entrywise negation.
 * 
 * @example
> numeric.not([1,0,3,0]);
t([0,1,0,1])
 * @param x
 * @returns
 */
function not(x) {
    x = R(t(x));
    return map(function(a) { return (a === 0)?1:0; },null,null,x);
}
expo(not);

/**
 * Entrywise x && y
 * 
 * @example
> numeric.and([0,0,1,1],[0,1,0,1]);
t([0,0,0,1])
 * @param x
 * @param y
 * @returns
 */
function and(x,y) { return zipbool(x,y,function(a,b) { return a&&b; }); }
expo(and);

/**
 * Entrywise x || y
 * 
 * @example
> numeric.or([0,0,1,1],[0,1,0,1]);
t([0,1,1,1])
 * @param x
 * @param y
 * @returns
 */
function or(x,y) { return zipbool(x,y,function(a,b) { return a||b; }); }
expo(or);

/** 
 * Finds nonzero entries
 * 
 * @example
> numeric.find([0,1,0,3])
t([1,3])
 * @param x
 * @returns
 */
function find(x) {
    x = V(t(x));
    var i,n = x.x.length, a = x.x, b = x.y, ret = [];
    if(typeof b === "undefined") {
        for(i=0;i<n;i++) { if(a[i] !== 0) { ret.push(i); } }
        return mkT([ret.length],ret);
    }
    for(i=0;i<n;i++) { if(a[i] !== 0 || b[i] !== 0) { ret.push(i); } }
    return mkT([ret.length],ret);
}
expo(find);

/**
 * Returns true if any entries are nonzero.
 * 
 * @example
> numeric.any([0,0,3,0])
true
> numeric.any([0,0,0])
false
 * @param x
 * @returns {Boolean}
 */
function any(x) {
    x = t(x);
    var i,n = x.x.length, a = x.x, b = x.y;
    if(typeof b === "undefined") {
        for(i=0;i<n;i++) { if(a[i] !== 0) return true; }
        return false;
    }
    for(i=0;i<n;i++) { if(a[i] !== 0 || b[i] !== 0) return true; }
    return false;
}
expo(any);

/**
 * Returns true if all entries are nonzero.
 * 
 * @example
> numeric.all([0,0,3,0])
false
> numeric.all([1,3,4])
true
 * @param x
 * @returns {Boolean}
 */
function all(x) {
    x = t(x);
    var i,n = x.x.length, a = x.x, b = x.y;
    if(typeof b === "undefined") {
        for(i=0;i<n;i++) { if(a[i] === 0) return false; }
        return true;
    }
    for(i=0;i<n;i++) { if(a[i] === 0 && b[i] === 0) return false; }
    return true;
}
expo(all);
function map(f,fr,fi,x) {
    var i,p = [],q,a = x.x,b = x.y;
    if(typeof b === "undefined") {
        for(i=0;i<a.length;i++) p[i] = f(a[i]);
        return mkT(x.s,p);
    }
    b = x.y;
    q = [];
    for(i=0;i<a.length;i++) {
        p[i] = fr(a[i],b[i]);
        q[i] = fi(a[i],b[i]);
    }
    return mkT(x.s,p,q);
}

/**
     * Pointwise exponential of a tensor.
     * 
     * @example
> numeric.exp(0)
t(1)
> numeric.exp([0,1])
t([1,2.718])
> numeric.exp(numeric.t(1,1))
t(1.469,2.287)
     */
function exp(x) {
    x = t(x);
    var e = Math.exp, c = Math.cos, s = Math.sin;
    return map(e,function (a,b) { return e(a)*c(b); },
                 function (a,b) { return e(a)*s(b); },x);
}
expo(exp);
/**
     * The pointwise modulus of a tensor.
     * @example
> numeric.abs(-1)
t(1)
> numeric.abs(numeric.t(1,1))
t(1.414)
     */
function abs(z) {
    z = t(z);
    var i, x = z.x, y = z.y, n = x.length, ret=[];
    if(typeof y === "undefined") {
        for(i=0;i<n;i++) { ret[i] = Math.abs(x[i]); }
    } else {
        for(i=0;i<n;i++) {
            ret[i] = Math.sqrt(x[i]*x[i]+y[i]*y[i]);
        }
    }
    return mkT(z.s,ret);
}
expo(abs);
/** 
     * Pointwise complex conjugate of a tensor.
     * 
     * @example
> numeric.conj(3)
t(3)
> numeric.conj(numeric.t([1,2],[3,4]))
t([1,2],[-3,-4])
     */
function conj(z) {
    z = t(z);
    if(typeof z.y === "undefined") { return z; }
    var i = neg(imag(z));
    return mkT(z.s,z.x,i.x);
}
expo(conj)
/**
     * Pointwise negation of a tensor
     * 
     * @example
> numeric.neg(1)
t(-1)
> numeric.neg(numeric.t(1,2))
t(-1,-2)
> numeric.neg([1,2])
t([-1,-2])
     */
function neg(z) {
    z = t(z);
    return map(function(x) { return -x; },
               function(x,y) { return -x; },
               function(x,y) { return -y; },z)
}
expo(neg);

/**
     * Pointwise cosine of a tensor.
     * 
     * @param {numeric.T} z A tensor.
     * @example
> numeric.cos(1)
t(0.5403)
> numeric.cos(numeric.t(1,1))
t(0.8337,-0.9889)
     */
function cos(z) {
    var e = Math.exp, c = Math.cos, s = Math.sin;
    z = t(z);
    return map(c,
               function (x,y) { return 0.5*c(x)*(e(-y)+e(y)); },
               function (x,y) { return 0.5*s(x)*(e(-y)-e(y)); }, z)
}
expo(cos);
/**
     * Pointwise sine of a tensor.
     * 
     * @param {numeric.T} z A tensor.
     * @example
> numeric.sin(1)
t(0.8415)
> numeric.sin(numeric.t(1,1))
t(1.298,0.6350)
     */
function sin(z) {
    var e = Math.exp, c = Math.cos, s = Math.sin;
    z = t(z);
    return map(s,
               function (x,y) { return 0.5*s(x)*(e(-y)+e(y)); },
               function (x,y) { return 0.5*c(x)*(e(y)-e(-y)); }, z)
}
expo(sin);

/**
     * Pointwise logarithm of tensor.
     * 
     * @example
> numeric.log(1)
t(0)
> numeric.log(numeric.t(1,1))
t(0.3466,0.7854)
     */
function log(z) {
    var a = Math.abs, a2 = Math.atan2, l = Math.log, s = Math.sqrt;
    z = t(z);
    return map(l,
               function (x,y) { return l(s(x*x+y*y));},
               function (x,y) { return a2(y,x);}, z);
}
expo(log);

/**
     * Pointwise atan of tensor.
     * 
     * @example
> numeric.atan(1)
t(0.7854)
> numeric.atan(numeric.t(1,1))
t(1.017,0.4024)
> numeric.atan(numeric.tan(numeric.t(0.9,0.8)))
t(0.9000,0.8000)
     */
function atan(z) {
    var a = Math.abs, a2 = Math.atan2, l = Math.log, s = Math.sqrt;
    z = t(z);
    return map(Math.atan,
            function (x,y) { return -0.5*(a2(-x,1+y)-a2(x,1-y));},
            function (x,y) { return 0.5*(l(s((1+y)*(1+y)+x*x))-l(s((1-y)*(1-y)+x*x)));},
            z);
}
expo(atan);
/**
     * Pointwise atan2 of a real tensor.
     * 
     * @example
> numeric.atan2(1,1)
t(0.7854)
> numeric.atan2(numeric.t(1,1),3)
Error: atan2 is defined for real tensors only
> numeric.atan2(3,numeric.t(1,1))
Error: atan2 is defined for real tensors only
     */
/**
     * Pointwise square root
     * 
     * @example
> numeric.sqrt(2);
t(1.414)
> numeric.sqrt(numeric.t([1,3],[1,4]));
t([1.099,2],[0.4551,1])
> numeric.sqrt(-1)
t(0,1)
> numeric.sqrt(numeric.t(-1,0))
t(6.123e-17,1)
     */
function sqrt(z) {
    var a = Math.atan2, p = Math.pow, s = Math.sin, c = Math.cos, sq = Math.sqrt;
    z = t(z);
    var flag = false, i, j, n = z.x.length, x = [], y = [],r,th;
    var zx = z.x, zy = z.y;
    if(typeof zy === "undefined") {
        for(i=0;i<n;i++) {
            if(zx[i] < 0) break;
            x[i] = sq(zx[i]);
        }
        if(i<n) {
            for(j=0;j<i;j++) { y[i] = 0; }
            for(;i<n;i++) {
                if(zx[i]<0) { y[i] = sq(-zx[i]); x[i] = 0; }
                else { x[i] = sq(zx[i]); y[i] = 0; }
            }
            return mkT(z.s,x,y);
        }
        return mkT(z.s,x);
    }
    for(i=0;i<n;i++) {
        th = a(zy[i],zx[i])/2;
        r = p(zy[i]*zy[i]+zx[i]*zx[i],0.25);
        x[i] = r*c(th);
        y[i] = r*s(th);
    }
    return mkT(z.s,x,y);
}
expo(sqrt);

/**
     * Raises a to the bth power. Actual formula is exp(mul(log(a),b)).
     * 
     * @example
> numeric.pow(3,2);
t(9.000)
> numeric.pow(numeric.t([1,2],[0,1]),numeric.t([2,3],[0,-1]))
t([1,14.81],[0,9.834])
     */
function pow(a,b) { return exp(mul(log(a),b)); }
expo(pow);

function iz(z) {
    var i,foo;
    if(typeof z.y === "undefined") {
        z.y = [];
        for(i=0;i<z.x.length;i++) { z.y[i] = 0; }
    } else {
        for(i=0;i<z.x.length;i++) { z.y[i] = -z.y[i]; }
    }
    foo = z.x;
    z.x = z.y;
    z.y = foo;
}
/**
     * The pointwise acos of a tensor. In the complex case, actual formula is
     * add(mul(i,log(add(mul(i,z),sqrt(sub(1,mul(z,z)))))),Math.PI*0.5),
     * where i=t(0,1).
     * 
     * @example
> numeric.acos(0.9)
t(0.4510)
> numeric.acos(numeric.t([0.3,-0.5],[0,0.2]))
t([1.266,2.080],[0,-0.2271])
     */
function acos(z) {
    z = t(z);
    if(typeof z.y === "undefined") {
        return map(Math.acos,0,0,z);
    }
    var foo = copy(z);
    iz(foo);
    foo = log(add(foo,sqrt(sub(1,mul(z,z)))));
    iz(foo);
    return add(foo,Math.PI*0.5);
}
expo(acos);
/**
     * The pointwise asin of a tensor. In the complex case, actual formula is
     * neg(mul(i,log(add(mul(i,z),sqrt(sub(1,mul(z,z))))))),
     * where i=t(0,1).
     * 
     * @example
> numeric.asin(0.9)
t(1.120)
> numeric.asin(numeric.t([0.3,-0.5],[0,0.2]))
t([0.3047,-0.5091],[0,0.2271])
     */
function asin(z) {
    z = t(z);
    if(typeof z.y === "undefined") {
        return map(Math.asin,0,0,z);
    }
    var foo = copy(z);
    iz(foo);
    foo = log(add(foo,sqrt(sub(1,mul(z,z)))));
    iz(foo);
    return neg(foo);
}
expo(asin);

/**
     * Pointwise atan2 of real tensors.
     * 
     * @example
> numeric.atan2(1,1)
t(0.7854)
> numeric.atan2(numeric.i,3)
Error: atan2 is defined for real tensors only
     */
function atan2(z,w) {
    z = t(z); w = t(w);
    if(typeof z.y !== "undefined" || typeof w.y !== "undefined") { throw new Error("atan2 is defined for real tensors only")}
    if(!samev(z.s,w.s)) { throw new Error("atan2: z and w must have the same size"); }
    var ret = [], i, x = z.x, n = x.length, y = w.x;
    for(i=0;i<n;i++) ret[i] = Math.atan2(y[i],x[i]);
    return mkT(z.s,ret);
}
expo(atan2);
/**
     * Pointwise tangent of a tensor
     * 
     * @example
> numeric.tan(1)
t(1.557)
> numeric.tan(numeric.t(1,1))
t(0.2718,1.084)     
     */
function tan(z) {
    z = t(z);
    var a = sin(z), b = cos(z), c = div(a,b);
    return div(sin(z),cos(z));
    }
expo(tan);
/**
     * Pointwise rounding of a tensor.
     * 
     * @example
> numeric.round(numeric.t([1.1,1.7],[-5.2,-9.9]))
t([1,2],[-5,-10])
     */
function round(z) {
    var r = Math.round;
    return map(r,
               function (x,y) { return r(x); },
               function (x,y) { return r(y); },
               t(z));
}
expo(round);
/**
     * Pointwise ceil of a tensor.
     * 
     * @example
> numeric.ceil(numeric.t([1.1,1.7],[-5.2,-9.9]))
t([2,2],[-5,-9])
> numeric.ceil("what?")
Error: Malformed tensor
     */
function ceil(z) {
    var r = Math.ceil;
    return map(r,
               function (x,y) { return r(x); },
               function (x,y) { return r(y); },
               t(z));
}
expo(ceil);
/**
     * Pointwise floor of a tensor.
     * 
     * @example
> numeric.floor(numeric.t([1.1,1.7],[-5.2,-9.9]))
t([1,1],[-6,-10])
     */
function floor(z) {
    var r = Math.floor;
    return map(r,
               function (x,y) { return r(x); },
               function (x,y) { return r(y); },
               t(z));
}
expo(floor);

/**
 * Computes the supremum of a tensor.
 * 
 * @example
> numeric.sup([1,3,7,2])
t(7)
 * @param z
 * @returns
 */
function sup(z) {
    z = R(t(z));
    var foo = -Infinity;
    var i, x = z.x, n = x.length, M = Math.max;
    for(i=0;i<n;i++) { foo = M(foo,x[i]); }
    return t(foo);
}
expo(sup);

/**
 * Computes the supremum of a tensor.
 * 
 * @example
> numeric.inf([1,3,7,2])
t(1)
 * @param z
 * @returns
 */
function inf(z) {
    z = R(t(z));
    var foo = Infinity;
    var i, x = z.x, n = x.length, M = Math.min;
    for(i=0;i<n;i++) { foo = M(foo,x[i]); }
    return t(foo);
}
expo(inf);

/**
     * The real part of x.
     * 
     * @example
> numeric.real(1)
t(1)
> numeric.real(numeric.t(2,3))
t(2)
> numeric.real(numeric.t([2,3],[4,5]))
t([2,3])
     */
function real(x) { x = t(x); return mkT(x.s,x.x); }
expo(real);

/*
 * Some stress tests
<pre>
> Math.seedrandom("stress"); numeric.digits(18); n = numeric; trunc = function(z) { return n.mul(1e-10,n.round(n.mul(1e10,z))); }; m = 12;
12
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); trunc(n.dot(V,n.inv(V)));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); trunc(n.abs(n.dot(V,n.inv(V))));
t([[1,0,0,0,0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,0,0,0,0,0],[0,0,1,0,0,0,0,0,0,0,0,0],[0,0,0,1,0,0,0,0,0,0,0,0],[0,0,0,0,1,0,0,0,0,0,0,0],[0,0,0,0,0,1,0,0,0,0,0,0],[0,0,0,0,0,0,1,0,0,0,0,0],[0,0,0,0,0,0,0,1,0,0,0,0],[0,0,0,0,0,0,0,0,1,0,0,0],[0,0,0,0,0,0,0,0,0,1,0,0],[0,0,0,0,0,0,0,0,0,0,1,0],[0,0,0,0,0,0,0,0,0,0,0,1]])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.sub(n.random(m,m),0.5); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> V = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); D = n.random(m); A = n.dot(V,n.dot(n.diag(D),n.inv(V))); E = n.eig(A); trunc(n.abs(n.sub(n.sortVector(D),n.sortVector(E.d))));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
> A = n.add(n.sub(n.random(m,m),0.5),n.mul(n.i,n.sub(n.random(m,m),0.5))); E = n.eig(A); trunc(n.norm2(n.sub(n.dot(A,E.v),n.dot(E.v,n.diag(E.d)))));
t(0)
</pre>
 */

/*
 * QP tests
<pre >
> A = [[62,-67,29,-87,-15,16,69,12,36,97,26,56,],[80,58,-24,36,-80,8,12,70,-73,-65,-29,38,],[-74,-37,62,-91,20,73,85,-30,44,-48,98,-97,],[82,6,6,-85,-6,-47,39,-11,-77,-20,-55,68,],[26,-66,-30,4,39,-36,16,-88,-76,-84,30,84,],[-80,20,87,-80,40,-75,62,-64,28,36,21,54,],[-44,-47,74,63,27,87,75,32,-34,-19,-22,-91,],[9,31,10,63,-92,29,97,-33,30,96,-71,-24,],[91,37,24,44,-85,-4,-99,79,49,-19,-94,40,],[92,49,17,-69,-36,28,72,-76,16,24,-16,45,],[-68,-10,-58,32,6,9,22,97,48,-68,-63,-55,],[93,-82,-39,4,31,29,97,8,-53,-23,45,-46,],[91,-54,-6,94,-18,9,5,41,47,-67,-26,34,],[-3,82,-53,30,63,44,-4,99,93,51,68,-4,],[59,-69,68,59,43,4,60,-42,73,73,46,24,],[-71,65,-60,-9,93,98,-54,-17,-82,-30,14,-52,],[-15,8,-54,-13,6,-56,0,-7,-26,37,-64,-64,],[82,98,-65,64,-35,-78,79,52,-26,-41,91,65,],[58,-84,-54,-82,-78,-77,15,63,37,6,-46,53,],[91,-11,-13,-73,22,-86,68,-79,19,66,84,86,],[31,-78,-37,-65,55,-19,47,-64,57,19,-55,-78,],[-92,91,84,-22,-15,-10,17,-28,-26,-33,-25,-63,],[69,-98,-14,66,-81,-27,-50,-88,-58,-40,-82,-79,],[86,54,-62,60,-46,52,33,4,-82,-9,28,-2,],[35,63,80,-87,-69,25,-82,-33,54,-15,-63,-61,],[51,73,95,-20,-43,54,25,-64,-58,-28,-90,78,],[48,-82,-12,5,-12,86,32,-58,-22,12,44,-79,],[-21,-20,-77,-16,5,94,45,80,10,48,-30,-90,],[31,-48,-48,31,-8,-61,77,35,-54,-15,32,11,],[-65,59,-18,25,74,-72,95,-6,28,-14,-23,54,],[41,-14,19,-41,4,39,53,82,-3,-74,25,-37,],[-93,81,-47,-14,88,-80,16,-78,-69,-94,-95,-64,],[-44,-63,20,-96,27,5,85,49,56,-42,81,-32,],[-90,-47,42,96,91,6,16,47,-79,-36,60,-57,],[-80,-70,-55,-66,-51,72,-96,12,-41,30,49,2,],[64,-72,-76,-78,35,-3,-75,-63,-52,90,62,80,],[39,73,-40,-25,-42,-21,72,19,6,86,-23,26,],[-36,16,-36,-60,34,34,-3,-40,-81,-8,23,-79,],[89,10,-15,-2,39,48,68,-72,-19,-51,15,-22,],[-92,-70,2,-32,-86,4,-58,-57,-78,52,6,-88,],[-12,70,-82,89,-49,-30,10,78,-77,51,-45,0,],[-23,24,-47,83,-55,-69,26,-85,56,48,-50,-14,],[53,-30,60,-89,33,17,-93,-51,-41,48,-10,99,],[58,3,-93,47,68,-47,23,-88,20,-78,-54,62,],[-62,-19,85,-46,-31,-90,-27,-12,92,36,60,-3,],[-2,-84,46,-15,56,50,-89,-96,-13,-7,96,78,],[-11,-51,-2,9,35,-51,-2,79,39,-57,-93,-72,],[29,-75,16,88,-98,-11,-61,-60,51,-79,7,-22,],[41,-63,-52,-16,20,37,-75,-81,-13,64,-82,85,],[50,-51,-8,96,-22,-28,-58,-38,31,-64,60,83,],[-44,-16,92,-39,82,47,-70,-9,-77,-67,97,42,],[36,-89,9,40,-99,-21,-62,-79,86,33,-86,23,],[31,80,4,33,-7,36,-91,98,-62,78,87,-31,],[-67,88,-53,8,-15,40,27,-33,-46,3,-95,86,],[-75,-2,-2,39,-8,-11,-43,-40,59,40,36,-74,],[0,-2,25,33,53,-95,8,-87,-2,-69,56,46,],[91,-32,35,-64,-35,-33,39,-40,53,90,7,29,],[-32,79,-21,-74,56,-15,0,-90,-21,8,76,66,],[17,-26,-26,99,-6,-45,7,1,-45,36,79,-20,],[-55,-77,97,-65,-92,-60,-11,52,-92,-92,25,49,],[50,55,-92,-93,-64,64,-74,26,34,61,-72,66,],[-48,-22,76,12,44,-14,-2,-81,-14,49,-56,-35,],[1,-51,82,76,-5,77,70,-83,-10,-75,-63,10,],[39,-19,59,33,-69,-22,74,55,22,5,-91,95,],[77,-80,-79,-61,-31,53,-45,80,-87,-34,-78,10,],[91,-73,-47,-26,21,-20,-58,7,-36,9,23,-34,],[9,88,-33,-8,-61,61,13,-77,54,-20,87,24,],[-72,90,36,95,47,51,28,65,39,-17,-29,-28,],[-69,15,-72,-68,-51,-24,-16,-32,-74,-63,-18,51,],[-48,-87,44,70,83,-56,-58,-41,-73,-48,96,-17,],[67,-53,-78,29,-46,58,89,49,-81,-95,88,-2,],[-49,-29,30,-24,53,89,-83,-97,-97,84,35,39,],[62,64,-1,-61,-62,-34,-78,-89,-15,30,97,94,],[-51,-96,55,-14,-42,34,-71,33,31,86,53,-34,],[85,-90,43,-4,-81,-12,-66,20,44,-67,-32,67,],[-30,-66,80,-75,15,66,24,5,6,83,32,47,],[-60,30,77,18,36,53,15,45,-77,58,-51,90,],[-49,46,-33,-54,9,-66,-89,41,26,15,-40,-93,],[23,29,39,-23,-15,72,85,56,-74,-12,36,-28,],[-5,-10,-60,16,29,97,45,-42,-72,-48,6,32,],[-29,9,-93,-49,29,3,47,38,-79,50,-18,-43,],[66,-40,48,-41,35,76,-86,11,-71,-54,20,-53,],[17,48,0,23,27,17,71,-20,-66,-86,50,42,],[10,-62,-4,-46,88,-68,86,-87,-60,53,17,25,],[83,37,80,64,-58,-59,96,55,-36,34,10,18,],[-42,-63,22,96,41,-18,71,-32,-36,43,17,32,],[51,-26,23,46,-52,49,57,21,-56,28,2,-90,],[50,25,71,-31,-75,64,3,48,-49,-16,-83,-30,],[-24,55,60,17,21,57,-64,-78,78,-22,43,-10,],[13,-83,15,-78,-10,-36,-20,-74,40,63,98,-51,],[-84,85,-63,80,-8,7,-72,10,11,-36,-29,43,],[-88,55,-51,75,32,-81,-93,-3,-62,62,93,71,],[6,-3,77,63,54,-77,87,77,-57,57,-30,-43,],[55,-13,-93,-47,-30,-72,-39,59,-84,70,77,46,],[86,-11,-2,19,32,35,-40,46,82,1,-9,-72,],[-73,-38,-66,-95,-17,-1,-33,-89,41,27,-17,67,],[14,2,95,-15,68,-61,-7,-85,11,89,-56,-72,],[-6,2,42,-37,66,-1,29,-81,-37,-11,-74,17,],[-97,63,0,-67,-48,-70,-94,59,-66,-87,-38,-27,],[-32,58,-6,-64,22,-88,68,88,24,73,45,61,],]; b=[-232,4322,26594,6648,-1865,3976,14438,7518,-1904,15203,2018,-192,-8053,-17689,-12175,7271,-2540,-18499,-4034,-12125,4873,23135,8746,36,28813,26042,10490,5381,-10424,-9599,12058,9420,9092,-8852,7613,-13731,-2531,13460,9381,14609,-13500,-7225,3265,-9873,-944,-2260,-2554,5211,-4677,-13429,8221,1461,-11393,10136,-2394,-7897,470,1519,-18747,16976,5781,5377,20234,1731,6888,-7938,12793,483,12709,-13787,5077,5406,285,-807,4774,6839,1427,-250,16075,9758,-1160,13711,5269,-6929,-4605,-12499,8466,24555,9063,819,-5033,-28742,-13302,-19868,-5035,7679,-40,10485,14555,-14146,]; c=[1,-2,75,-29,-10,92,-91,94,-62,33,17,35,]; x=[-26.6041,22.3615,54.9466,-98.2823,-80.9933,90.3914,30.0649,-59.0631,-15.3516,-76.2830,-42.8881,-51.6813,]; x1=numeric.LP(A,b,c); numeric.round(numeric.mul(100,numeric.sub(x,x1)));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> A = [[76,46,87,-88,60,90,-92,-12,91,-69,-18,46,],[-43,-14,-55,95,-10,8,76,87,8,69,87,-12,],[34,38,-3,-43,-23,8,-18,-98,-93,56,-48,-24,],[33,88,-25,19,57,-37,-92,22,39,-45,7,95,],[-75,56,5,92,-27,-85,49,60,4,-54,90,-20,],[-18,41,-47,-62,6,-63,-68,-53,-87,-35,-46,-12,],[-44,-77,-85,-61,42,-81,-71,86,77,65,-49,-68,],[43,-22,-13,-31,74,-7,21,52,-34,64,85,-34,],[-43,18,-65,86,-34,-97,-49,65,-54,14,-85,-37,],[78,-8,-94,-22,30,82,-35,15,-76,14,-40,78,],[65,-89,90,-45,94,28,-19,58,-37,-42,18,-50,],[-22,-54,-14,-69,-84,-99,-19,-34,-54,39,-59,-37,],[0,66,91,-20,17,-93,-23,-55,30,59,27,-18,],[39,-96,52,-25,-17,-58,22,-37,-86,-12,59,41,],[66,72,-98,-73,-38,-9,-66,17,-44,-11,0,-71,],[22,-84,36,-13,-47,-74,-62,65,-43,-7,30,74,],[15,33,41,-81,51,-97,-80,-41,75,-44,59,-83,],[-34,0,29,23,98,45,-35,-19,-11,35,-53,-8,],[-9,-56,10,-97,-62,-29,53,72,51,80,20,-93,],[42,14,-56,15,56,56,-53,23,20,81,-77,50,],[76,-75,54,57,-60,-13,48,97,56,49,3,40,],[44,34,-54,-52,97,-13,38,-59,-76,-47,67,-57,],[-95,20,-26,-10,60,-89,64,65,95,38,83,36,],[35,-88,77,14,-15,-89,65,35,69,-73,0,11,],[-12,-88,71,-87,45,-81,-41,-50,-89,-75,-44,69,],[-12,-69,-19,-1,0,19,-38,-5,-7,-61,30,12,],[-76,-95,-36,28,61,-51,5,-20,-35,-70,83,80,],[62,-13,22,-55,-28,68,-35,20,26,17,2,-16,],[-35,66,81,67,-84,71,66,60,-53,-84,94,-28,],[-50,23,81,93,18,92,61,-78,16,64,-60,-2,],[-31,4,18,69,81,-2,11,64,20,44,-77,-48,],[-25,72,-33,1,-61,-55,-47,68,20,84,-40,85,],[9,-80,70,-44,-13,-54,36,-29,-10,-1,-21,-7,],[12,81,-11,49,49,7,-53,-14,-92,31,-16,-49,],[-21,-78,80,-52,-91,52,-9,14,3,77,-37,-14,],[-20,3,-92,91,88,-30,-23,40,-18,8,38,40,],[3,-71,6,24,52,-8,8,48,-78,-43,-81,-19,],[31,12,43,20,12,28,97,51,-8,94,-19,-63,],[89,-98,-63,-65,-63,83,51,-22,-10,-92,-41,71,],[44,53,-32,-81,0,-67,95,-14,10,-34,-38,17,],[-20,69,-62,-48,4,43,-53,90,60,94,-78,-25,],[66,83,-35,71,98,15,6,14,40,-27,19,-55,],[-72,96,-19,81,70,-13,-89,69,74,-38,-43,-56,],[-87,1,10,40,92,76,51,-44,-89,-75,-68,4,],[-82,-45,-89,45,35,-21,20,24,-56,82,-99,-13,],[-67,-79,10,-53,-19,-64,71,17,-8,-72,-43,48,],[-35,2,-45,15,86,26,97,92,91,-33,10,-85,],[-39,17,-51,62,-4,25,85,-82,57,79,73,69,],[-97,52,-51,-19,-53,-34,-18,0,-10,0,-91,36,],[8,-83,-68,97,-21,60,-99,4,-33,23,80,-72,],[-80,32,90,-81,41,99,8,-81,-87,16,-73,71,],[-70,3,86,-35,12,95,-58,80,48,39,66,-59,],[26,-65,63,2,51,-74,-56,76,1,-93,59,21,],[71,87,45,-87,98,-53,-34,-12,-59,6,83,9,],[94,18,-64,45,92,-94,-80,56,-14,-93,-72,-67,],[14,-12,-28,11,7,21,49,-70,-66,65,1,-98,],[98,87,-62,6,92,-77,49,24,50,-32,-19,54,],[11,31,-99,65,-76,-18,9,-47,-26,69,-65,52,],[3,-10,-36,71,-89,76,-32,-11,87,-50,15,-16,],[-34,67,40,57,-39,10,66,68,-96,16,21,-88,],[-14,6,25,-36,16,-26,10,-60,65,87,-57,17,],[-2,11,9,-9,6,-58,91,-39,25,-90,4,-65,],[-85,36,-12,50,79,-12,78,-3,8,-88,97,45,],[77,-26,-42,-77,8,90,-28,-32,30,-95,-2,7,],[-86,-52,0,-77,-13,-74,9,59,45,36,39,-49,],[-13,16,52,-46,8,-6,-30,97,-80,20,-18,83,],[65,73,52,5,42,71,24,-68,75,-76,-92,51,],[-21,-18,15,94,-96,-90,59,-52,-96,59,-41,77,],[22,-77,49,42,60,38,49,40,-41,23,60,-85,],[63,-11,29,-37,-71,95,-74,-25,-63,-85,-30,-63,],[76,-40,-75,-41,-4,-43,64,94,84,-85,-83,47,],[85,-20,1,69,-48,-73,-94,94,-86,-72,2,39,],[-61,66,-30,82,-26,37,-17,28,16,57,-26,55,],[-48,-19,-81,28,32,81,46,71,27,-81,47,0,],[79,-22,-70,-48,-65,22,56,-19,30,-52,5,-15,],[18,-28,-60,-81,-44,79,-26,26,72,-51,60,22,],[1,-71,34,67,-60,-61,48,96,-88,-78,63,70,],[22,-47,-14,17,-60,50,78,12,63,71,-61,34,],[63,-82,38,89,-34,-30,-51,86,6,39,-75,5,],[6,-14,-48,-87,75,-16,-73,44,38,46,64,-40,],[-59,-48,-97,17,-6,-68,-54,-3,-57,30,27,40,],[-9,-40,6,-43,-19,63,-30,28,9,3,-96,-23,],[-14,-15,-44,65,-64,25,-42,77,40,-34,78,13,],[92,-75,88,-61,93,47,85,-60,90,32,3,77,],[24,-1,80,-11,-18,60,-89,-21,-11,-76,9,68,],[39,41,-21,-21,68,-86,18,97,-82,-70,21,79,],[44,-51,-94,65,23,89,-67,-19,-88,-95,52,87,],[-30,56,34,35,-24,0,67,31,26,92,70,62,],[3,-84,67,-58,75,51,-66,79,59,93,-23,-99,],[11,-21,93,-36,56,48,0,98,38,-74,-82,-98,],[-68,-98,-88,-73,-7,66,99,30,-31,-6,46,-82,],[12,-55,-10,34,62,-68,-29,-78,88,31,-33,-47,],[39,-99,16,14,79,-8,-90,-92,4,-42,67,-94,],[-15,-62,37,-65,-14,23,-57,23,90,50,-25,-15,],[67,-71,43,-70,-33,86,-20,13,-84,12,65,-31,],[46,-46,30,-5,19,66,-33,91,-58,-14,-64,8,],[-28,-64,45,81,80,78,-54,49,54,-46,-73,84,],[-9,-72,-25,10,40,16,86,32,82,50,75,-40,],[-22,20,16,-92,-24,16,36,5,56,79,-90,-32,],[55,79,-76,-88,47,70,91,-48,-40,45,37,71,],]; b=[7588,2243,-2111,-6045,4283,-5978,229,4377,-1151,-5731,14081,-3674,1995,-4245,-532,580,471,3894,10626,-1908,6952,-5617,-3679,1544,-6324,-1117,-10751,7281,17247,6594,7823,-2331,1358,2768,12423,-8654,3835,11834,-6456,-5857,8261,1676,7405,2593,-4957,-2811,8739,-12737,-2374,829,5703,22315,3701,1003,-1184,-594,-9250,-12015,2719,16445,-4609,-1425,-3338,-1312,5326,8917,524,-9648,10671,11392,-4536,2883,460,3715,-5319,1748,3703,270,5744,602,-11126,8667,2905,-2240,6325,-2394,-8557,2678,16860,22128,3617,-8949,-2374,6631,9600,10855,5022,885,5753,-8607,]; c=[-32,-72,2,71,-23,39,25,-10,-5,89,-82,-44,]; x=[-9.0091,20.9603,75.1991,-6.3952,-10.1281,46.1814,-3.6512,70.9091,-6.0576,-1.6772,-2.1331,-52.8939,]; x1=numeric.LP(A,b,c); numeric.round(numeric.mul(100,numeric.sub(x,x1)));
t([0,0,0,0,0,0,0,0,0,0,0,0])
> A = [[-65,-52,95,-51,-91,59,-96,-58,86,-71,-24,68,],[-20,19,3,76,90,56,40,-32,-20,1,1,3,],[39,-4,98,42,48,-29,1,15,-89,22,52,-69,],[-59,79,-9,-24,87,-88,-24,-3,14,40,-89,-24,],[33,86,-15,-50,3,41,-86,-47,49,-23,45,64,],[-11,63,-57,-49,-51,98,-28,16,-36,45,40,-65,],[-13,41,-61,53,-48,-67,-53,75,-1,77,-8,-34,],[-64,48,66,-89,51,-77,-59,-87,-55,-88,16,92,],[-61,79,45,37,98,82,62,-12,87,-72,-32,61,],[23,-86,6,24,-28,-4,-21,-82,-4,72,-65,-55,],[-46,-32,65,49,50,70,-88,13,8,-15,-20,99,],[12,-98,2,94,-77,61,-25,8,-55,-18,83,-86,],[88,65,10,-23,19,-62,54,53,-80,91,-54,-15,],[42,1,-57,-47,-14,-50,-66,-53,-87,50,-28,-19,],[35,-26,17,75,46,-88,82,17,63,95,-35,-20,],[91,-54,-71,61,-47,22,-36,-8,54,-53,-82,-77,],[55,7,-89,-8,-80,55,-34,71,-60,-80,3,-15,],[21,-42,36,-81,-10,2,-59,32,78,-23,66,22,],[89,-85,21,13,28,-94,53,-29,36,0,80,97,],[-87,-82,-56,-62,-73,97,-85,-30,31,14,44,-55,],[-46,-85,-19,6,-9,0,89,-49,97,94,-23,-29,],[96,-18,26,-29,30,-33,-68,90,-92,-1,-40,-46,],[54,-75,11,-37,65,-65,-42,-40,-15,-20,38,-41,],[-5,-11,-74,45,-38,25,37,-68,-2,98,75,-62,],[36,79,-65,3,-19,15,-71,-27,17,-47,84,-94,],[-16,-29,-99,58,76,50,2,48,-83,33,-83,-10,],[-24,-75,-16,-59,40,-69,44,41,32,92,-3,-51,],[-57,14,-2,35,-51,-28,85,40,-89,34,-74,73,],[-23,74,-67,-89,51,-70,46,-98,11,-40,-49,6,],[-93,-30,33,60,-41,69,49,-25,42,6,76,82,],[-5,-91,-95,35,-44,-32,-18,79,-2,-99,-60,94,],[-33,-71,-75,88,-98,-45,-52,-36,23,76,-75,17,],[94,-84,90,-81,-25,-98,4,19,-57,-19,9,-75,],[11,48,94,81,-12,60,-56,-40,29,-39,-37,84,],[69,-9,-93,2,-39,-1,68,-74,-24,89,-23,19,],[-18,33,-1,23,-41,7,32,-22,-78,-8,58,76,],[-8,39,72,-36,-51,73,63,63,-24,-42,67,-15,],[65,14,-51,-84,86,44,58,95,-47,-82,36,21,],[97,25,66,69,71,33,-6,72,-51,16,-16,-85,],[5,75,62,-70,-20,-64,-38,-82,24,-69,28,84,],[84,32,26,-26,-4,10,37,-32,5,-85,-57,28,],[47,74,-99,24,13,91,96,-52,-17,16,23,-78,],[13,-6,-24,99,-2,19,53,-36,-56,-42,35,40,],[93,-71,80,3,-46,61,65,96,71,-27,20,-21,],[64,-86,36,97,97,96,41,10,71,45,-30,-82,],[91,42,-24,-54,-63,76,19,49,-43,71,-27,-57,],[29,-38,26,-20,72,-57,50,68,23,-30,-65,-50,],[-24,34,-51,39,-93,-92,-1,-66,55,91,58,-54,],[-5,30,14,-86,-33,-10,72,80,90,90,-1,40,],[82,6,95,49,49,-96,-86,-78,83,-58,-29,50,],[-96,43,69,-16,29,-5,93,49,-23,53,54,9,],[-68,1,-43,62,-65,89,-79,45,-67,23,-52,11,],[-6,-2,36,-24,90,-50,9,43,59,83,68,26,],[9,0,-28,-36,9,-22,-19,-73,-76,20,63,96,],[-87,86,96,96,-49,-14,-78,-11,-68,40,69,27,],[31,-22,-82,43,16,66,44,2,-29,48,-26,20,],[77,-76,-49,-17,82,64,23,6,69,-23,-23,81,],[-77,-51,62,-79,78,-9,56,71,16,-49,72,14,],[-12,37,-82,46,-3,-24,13,35,17,-92,-7,-33,],[-44,67,6,27,-11,84,62,61,84,-6,14,91,],[96,93,60,-84,-37,48,15,6,15,29,39,-12,],[22,-56,47,-75,-88,47,88,90,-97,-44,91,20,],[-49,52,-71,95,50,88,74,-86,61,4,9,44,],[-73,17,-12,-1,-73,2,2,8,22,-50,27,35,],[9,-19,-30,-95,-29,58,57,-43,-4,-40,14,-57,],[65,2,-4,-88,-21,-9,-5,-4,-46,30,85,-83,],[67,-1,17,-71,76,69,65,37,-48,77,72,-45,],[66,30,-70,78,-95,-22,-35,-58,-4,71,-65,73,],[-59,48,80,-7,68,47,94,21,-54,-57,-64,12,],[9,-39,28,12,-42,94,-44,-34,-89,-20,-51,-7,],[74,-81,-67,-1,-49,5,-85,75,-65,77,50,-14,],[-75,65,13,-86,-2,-14,50,-73,-48,-48,-60,54,],[71,-22,85,79,45,-58,66,-79,-60,92,96,30,],[79,55,56,-42,-59,-35,84,91,21,24,42,31,],[-56,-63,37,-46,-56,-77,-34,-69,64,-66,-64,-67,],[-84,-77,-7,19,94,-25,60,-69,62,65,71,-13,],[-5,80,-47,-5,18,-34,8,-68,60,31,81,1,],[66,75,14,-26,-39,-31,-7,-81,41,9,91,-25,],[-6,99,-50,31,93,63,64,-9,71,-49,14,-4,],[-17,72,-36,87,78,6,89,33,56,-91,12,-31,],[1,-92,81,24,-61,4,-84,66,-59,-53,-64,55,],[-74,9,76,-43,-99,54,41,57,98,-27,3,-23,],[-73,99,58,-58,42,-75,-52,42,-80,26,10,42,],[73,2,84,-12,73,25,-20,-5,30,96,-66,-4,],[20,74,-64,-94,-76,-30,-46,41,-56,-58,-1,45,],[-46,-85,3,74,-91,-33,66,91,-51,51,7,87,],[72,97,25,22,19,15,98,1,-32,76,-60,3,],[-87,84,82,-59,21,72,30,-39,-60,-5,24,80,],[-8,13,32,4,3,-60,40,57,1,-68,-94,-56,],[44,-14,-22,-88,-98,34,86,-52,89,62,-36,74,],[-32,-32,48,72,37,80,37,-53,-21,-5,7,-83,],[-20,44,63,-11,88,-60,14,-7,17,-76,-34,-7,],[5,-96,20,10,74,-40,-24,24,21,74,20,-95,],[78,-25,-82,13,-77,-1,27,23,42,27,-27,61,],[55,84,84,36,-29,77,-27,-75,-19,-80,-72,-64,],[-85,9,-88,-25,-51,0,-18,-74,71,81,82,-66,],[-44,-5,5,-84,12,-44,-26,-43,83,-92,28,-63,],[-24,-1,-75,-9,22,7,-6,47,50,-91,31,38,],[72,-38,-24,-90,-39,15,1,-18,-42,97,35,-57,],[-16,89,62,47,59,-17,81,65,59,37,48,-40,],]; b=[-6192,-7339,-13374,-9114,11448,7499,6202,-8467,-1862,-9151,-11580,-7690,8684,-881,2703,-1216,10201,3985,11394,-3902,2803,-7327,-10907,9735,3143,-5574,-486,7077,5889,7378,6531,2207,-6431,-3613,16770,9553,7822,9565,-11916,5807,5555,13335,2766,7584,-11969,13837,-6524,12685,21710,-10289,2303,-4632,4307,9118,-7740,8954,7584,-4495,3598,17684,15248,12650,8333,8284,4490,5027,5710,16223,-8612,-10470,6055,364,615,22978,-14029,-4975,12847,11321,7675,3321,-11899,6258,-4822,-6114,16953,11327,9783,-364,-7472,25911,-16168,-9947,-13994,23220,-11449,8254,-5073,8602,8096,3006,]; c=[53,0,81,-88,-13,14,13,64,-74,-40,-99,89,]; x=[49.9756,48.7780,-74.2369,-27.2954,-67.5916,-2.7061,58.7826,26.5670,40.0556,29.5784,47.2052,72.9986,]; x1=numeric.LP(A,b,c); numeric.round(numeric.mul(100,numeric.sub(x,x1)));
t([0,0,0,0,0,0,0,0,0,0,0,0])
</pre>
 */

/**
     * Pretty prints the expression x.
     * 
     * @example
> numeric.prettyPrint(1)
"1"
> numeric.prettyPrint([1,2])
"[1,2]"
> numeric.prettyPrint({x:1})
"{x:1}"
     */
function prettyPrint(x) {
    var ret = [], stops = [], names = [];
    function mksvg(s,fig) {
        var i,n,x,y,x0 = fig.x0,
            dx = (fig.width-fig.marginLeft-fig.marginRight)/(fig.x1 - fig.x0),
            y1 = fig.y1,
            dy=-(fig.height-fig.marginTop-fig.marginBottom)/(fig.y1-fig.y0);
        switch(s.type) {
        case "plot":
            ret.push('<polyline points="');
            x = s.x.x;
            y = s.y.x;
            n = y.length;
            for(i=0;i<n;i++) {
                ret.push(((x[i]-x0)*dx+fig.marginLeft) + "," + ((y[i]-y1)*dy+fig.marginTop)+" ");
            }
            ret.push('" style="fill:none;stroke:'+s.color+';stroke-width:'+s.lineWidth.x[0]+';" />');
            break;
        case "points":
            x = s.x.x;
            y = s.y.x;
            n = y.length;
            for(i=0;i<n;i++) {
                ret.push('<circle cx="'+((x[i]-x0)*dx+fig.marginLeft)
                         +'" cy="'+((y[i]-y1)*dy+fig.marginTop)
                         +'" r="'+s.radius.x[0]
                         +'" fill="'+s.fill+'" stroke="none" />');
            }
            break;
        default:
            throw new Error("prettyPrint: unknown plot type '"+s.type+"'");
        }
    }
    function mkticks(fig) {
        var i,x0 = fig.x0,
            dx = (fig.width-fig.marginLeft-fig.marginRight)/(fig.x1 - fig.x0),
            y0 = fig.y0,
            dy=-(fig.height-fig.marginTop-fig.marginBottom)/(fig.y1-fig.y0),
            y1 = fig.y1;
        var x = fig.xticks, y= fig.yticks, foo;
        for(i=0;i<x.length;i++) {
            foo = ((x[i]-x0)*dx+fig.marginLeft);
            ret.push('<text text-anchor="middle" x="'+foo +
                     '" y="' + (fig.height-fig.marginBottom+20)+'">'+fmtnum(x[i])+'</text>');
            ret.push('<polyline points="'+foo+','+(fig.marginTop)+' '
                          +foo+','+(fig.height-fig.marginBottom)
                +'" style="fill:none;stroke:#d0d0d0;stroke-width:1;" />');
        }
        for(i=0;i<y.length;i++) {
            foo = ((y[i]-y1)*dy+fig.marginTop);
            ret.push('<text text-anchor="end" x="'+((x0-x0)*dx+fig.marginLeft-10) +
                     '" y="' + foo +'">'+fmtnum(y[i])+'</text>');
            ret.push('<polyline points="'+(fig.marginLeft)+','+foo+' '
                    +(fig.width - fig.marginRight)+','+foo
          +'" style="fill:none;stroke:#d0d0d0;stroke-width:1;" />');
        }
    }
    function f(name,x,depth) {
            var y,foo;
            if(x === null) { ret.push("null"); }
            else if(typeof(x) === "number") { ret.push(fmtnum(x)); }
            else if(typeof(x) === "boolean")
            { ret.push(x.toString()); }
            else if(typeof(x) === "string") {
                    ret.push('"'+x.replace(/"/g,"\"")+'"');
            }
            else if(typeof(x) === "object" || (typeof(x) === "function" && isT(x))) {
                    if(typeof x.nodeType !== "undefined" && x.nodeType>0) { ret.push('"DOM object"'); return; }
                    y = stops.indexOf(x);
                    if(y>=0) { ret.push(names[y]); return; }
                    stops.push(x);
                    names.push(name);
                    if(isT(x)) {
                        if(x.s.length === 0) {
                            if(typeof x.y === "undefined") {
                                ret.push("t("+fmtnum(x.x[0])+")");
                            } else {
                                ret.push("t("+fmtnum(x.x[0])+","+fmtnum(x.y[0])+")");
                            }
                        } else {
                            if(x.s.length>1) { ret.push("\n"); }
                            ret.push("t(");
                            var f0 = function(z) {
                                var c=0;
                                function f(i) {
                                    if(i === x.s.length) { ret.push(fmtnum(z[c])); c++; return; }
                                    var j,k;
                                    ret.push(" [");
                                    for(j=0;j<x.s[i];j++) {
                                        if(j>0) {
                                            ret.push(", ");
                                            if(x.s.length>1 && i<x.s.length-1) {
                                                ret.push("\n");
                                                for(k=0;k<i+2;k++) { ret.push("  "); }
                                            }
                                        }
                                        f(i+1);
                                    }
                                    ret.push(" ]");
                                }
                                f(0);
                            };
                            f0(x.x);
                            if(typeof x.y !== "undefined") {
                                ret.push(",");
                                if(x.s.length>1) { ret.push("\n  "); }
                                f0(x.y);
                            }
                            ret.push(")");
                        }
                        
                    } else if (x instanceof P) {
                        x.findBoundingBox();
                        ret.push('<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="'+x.width+'" height="'+x.height+'">');
                        mkticks(x);
                        for(y=0;y<x.v.length;y++) { mksvg(x.v[y],x); }
                        ret.push('</svg>');
                    }else if(x instanceof Array) {
                        ret.push("\n");
                        for(y=0;y<depth;y++) { ret.push("  "); }
                        ret.push("[ ");
                        for(y=0;y<x.length;y++) {
                                if(y>0) { ret.push(", "); }
                                f(name+"["+y+"]",x[y],depth+1);
                        }
                        ret.push(" ]");
                        return;
                    } else {
                        ret.push('{');
                        foo = false;
                        for(y in x) {
                                if(x.hasOwnProperty(y)) {
                                        if(foo) { ret.push(","); }
                                        foo = true;
                                        ret.push(escape(y)+': ');
                                        f(name+"."+y,x[y],depth);
                                }
                        }
                        ret.push('}');
                    }
            }
            else if(typeof x === "function") { ret.push(x.toString().replace(/&/g,'&amp;').replace(/>/g,'&gt;').replace(/</g,'&lt;').replace(/"/g,'&quot;')); }
    }
    f("ans",x,0);
    return ret.join("");
}
expo(prettyPrint);

/**
 * Plots
 * 
 * @example
> x = numeric.run(0,0.05,6.28); foo = numeric.plot({x:x, y:numeric.sin(x)},{x:x, y:numeric.cos(x),lineWidth:3,color:"red"})
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="600" height="400"><text text-anchor="middle" x="150" y="390">0         </text><polyline points="150,10 150,370" style="fill:none;stroke:#d0d0d0;stroke-width:1;" /><text text-anchor="middle" x="233.8656000000002" y="390">1.248     </text><polyline points="233.8656000000002,10 233.8656000000002,370" style="fill:none;stroke:#d0d0d0;stroke-width:1;" /><text text-anchor="middle" x="317.7312000000004" y="390">2.496     </text><polyline points="317.7312000000004,10 317.7312000000004,370" style="fill:none;stroke:#d0d0d0;stroke-width:1;" /><text text-anchor="middle" x="401.5968000000006" y="390">3.744     </text><polyline points="401.5968000000006,10 401.5968000000006,370" style="fill:none;stroke:#d0d0d0;stroke-width:1;" /><text text-anchor="middle" x="485.46240000000086" y="390">4.992     </text><polyline points="485.46240000000086,10 485.46240000000086,370" style="fill:none;stroke:#d0d0d0;stroke-width:1;" /><text text-anchor="middle" x="569.328000000001" y="390">6.24      </text><polyline points="569.328000000001,10 569.328000000001,370" style="fill:none;stroke:#d0d0d0;stroke-width:1;" /><text text-anchor="end" x="140" y="368.2063297796347">-0.99     </text><polyline points="150,368.2063297796347 570,368.2063297796347" style="fill:none;stroke:#d0d0d0;stroke-width:1;" /><text text-anchor="end" x="140" y="278.654747334726">-0.4925   </text><polyline points="150,278.654747334726 570,278.654747334726" style="fill:none;stroke:#d0d0d0;stroke-width:1;" /><text text-anchor="end" x="140" y="189.10316488981735">0.005000  </text><polyline points="150,189.10316488981735 570,189.10316488981735" style="fill:none;stroke:#d0d0d0;stroke-width:1;" /><text text-anchor="end" x="140" y="99.55158244490868">0.5025    </text><polyline points="150,99.55158244490868 570,99.55158244490868" style="fill:none;stroke:#d0d0d0;stroke-width:1;" /><text text-anchor="end" x="140" y="10">1         </text><polyline points="150,10 570,10" style="fill:none;stroke:#d0d0d0;stroke-width:1;" /><polyline points="150,190.00318079378627 153.36,181.00677135163312 156.72000000000003,172.03284824784586 160.08,163.1038416166552 163.44000000000003,154.24206932450232 166.80000000000004,145.46968118699584 170.16000000000005,136.80860360590808 173.52000000000004,128.28048476458974 176.88000000000005,119.90664051878571 180.24000000000007,111.70800111809669 183.60000000000008,103.70505889125556 186.9600000000001,95.91781702597768 190.3200000000001,88.36573957140907 193.68000000000012,81.06770278814025 197.0400000000001,74.0419479673853 200.40000000000012,67.30603583725375 203.76000000000013,60.87680267007567 207.12000000000015,54.77031820048914 210.48000000000016,49.00184545947248 213.84000000000017,43.58580262471567 217.20000000000016,38.53572698268508 220.56000000000017,33.86424109245716 223.9200000000002,29.583021235894712 227.2800000000002,25.70276823302294 230.6400000000002,22.233180695552292 234.00000000000023,19.182930785400224 237.36000000000024,16.559642538802635 240.72000000000025,14.369872810193922 244.08000000000027,12.619094883485594 247.44000000000028,11.311684791706883 250.8000000000003,10.450910379201245 254.1600000000003,10.038923133717264 257.5200000000003,10.076752808809877 260.88000000000034,10.564304849992634 264.24000000000035,11.500360631074798 267.60000000000036,12.88258050009207 270.9600000000004,14.707509627218112 274.3200000000004,16.970586640039812 277.6800000000004,19.666155024612863 281.0400000000004,22.787477263800696 284.4000000000004,26.326751677558505 287.76000000000033,30.275131923070425 291.12000000000035,34.622749105999354 294.48000000000036,39.35873644758321 297.8400000000004,44.47125644592256 301.2000000000004,49.94753046357053 304.56000000000034,55.77387066747134 307.92000000000036,61.93571424141457 311.2800000000003,68.41765978549148 314.6400000000003,75.20350581157385 318.00000000000034,82.27629123859676 321.36000000000035,89.61833778642809 324.72000000000037,97.21129416236222 328.0800000000003,105.03618192979452 331.4400000000003,113.0734429444292 334.8000000000003,121.3029882394543 338.1600000000003,129.70424823749656 341.5200000000003,138.25622416385255 344.88000000000034,146.93754053248932 348.2400000000003,155.72649857362745 351.6000000000003,164.60113046936496 354.96000000000026,173.53925426178142 358.3200000000003,182.51852929628072 361.6800000000003,191.51651206159264 365.0400000000003,200.51071228686277 368.4000000000003,209.47864915561678 371.7600000000003,218.39790749609406 375.12000000000023,227.24619380750337 378.48000000000025,236.00139198216468 381.84000000000026,244.6416185842603 385.2000000000003,253.14527754702806 388.5600000000003,261.491114151681 391.92000000000024,269.6582681531352 395.28000000000026,277.6263259197587 398.6400000000002,285.375371456819 402.0000000000002,292.88603618609847 405.36000000000024,300.1395473572525 408.72000000000025,307.1177749699088 412.0800000000002,313.8032770892263 415.4400000000002,320.17934344164905 418.80000000000024,326.23003718188716 422.1600000000002,331.9402347267303 425.5200000000002,337.2956635561298 428.8800000000002,342.28293788706566 432.2400000000002,346.88959213103266 435.6000000000002,351.1041120515202 438.9600000000002,354.91596354360644 442.32000000000016,358.3156189637352 445.6800000000002,361.29458094386234 449.0400000000002,363.8454036304511 452.4000000000002,365.9617112952276 455.76000000000016,367.63821427118177 459.1200000000002,368.8707221739795 462.4800000000002,369.6561543757416 465.84000000000015,369.9925477050088 469.20000000000016,369.87906135364824 472.5600000000002,369.3159789784356 475.92000000000013,368.3047079920615 479.28000000000014,366.84777604533195 482.64000000000016,364.94882470935846 486.0000000000001,362.61260037352605 489.3600000000001,359.84494238199227 492.72000000000014,356.65276843836756 496.08000000000015,353.0440573150589 499.4400000000001,349.0278289104941 502.8000000000001,344.61412170407334 506.16000000000014,339.8139676651983 509.5200000000001,334.63936467909434 512.8800000000001,329.1032465583455 516.2400000000001,323.2194507150992 519.6000000000001,317.0026835747418 522.96,310.46848381749453 526.3200000000002,303.63318353980503 529.6800000000001,296.5138674326119 533.0400000000001,289.128330078515 536.4000000000001,281.49503147458614 539.76,273.63305089198997 543.1200000000001,265.5620391877427 546.48,257.30216968780326 549.8400000000001,248.87408776426474 553.2,240.2988592326757 556.5600000000001,231.5979176984724 559.9200000000001,222.79301098412756 563.28,213.90614677092037 566.6400000000001,204.95953759119436 570,195.9755453085949 " style="fill:none;stroke:black;stroke-width:1;" /><polyline points="150,10 153.36,10.22495710407004 156.72000000000003,10.899266140675394 160.08,12.021241688397923 163.44000000000003,13.588079392681848 166.80000000000004,15.595862975259802 170.16000000000005,18.039574022808786 173.52000000000004,20.913104530370056 176.88000000000005,24.20927216818045 180.24000000000007,27.9198382337564 183.60000000000008,32.03552824435937 186.9600000000001,36.54605511837282 190.3200000000001,41.44014488764868 193.68000000000012,46.70556487655644 197.0400000000001,52.32915427730157 200.40000000000012,58.29685704509093 203.76000000000013,64.59375703092458 207.12000000000015,71.20411526420004 210.48000000000016,78.11140929194214 213.84000000000017,85.29837447633074 217.20000000000016,92.74704714730395 220.56000000000017,100.43880950237809 223.9200000000002,108.3544361414579 227.2800000000002,116.47414212032427 230.6400000000002,124.77763240269125 234.00000000000023,133.244152587227 237.36000000000024,141.8525407827487 240.72000000000025,150.58128050192943 244.08000000000027,159.408554441311 247.44000000000028,168.31229901320037 250.8000000000003,177.27025949314833 254.1600000000003,186.2600456451707 257.5200000000003,195.2591876856775 260.88000000000034,204.24519244623 264.24000000000035,213.19559959474773 267.60000000000036,222.08803777464124 270.9600000000004,230.90028052155313 274.3200000000004,239.6103018179434 277.6800000000004,248.19633114666252 281.0400000000004,256.63690790590624 284.4000000000004,264.9109350495439 287.76000000000033,272.99773181874644 291.12000000000035,280.8770854331132 294.48000000000036,288.52930161209633 297.8400000000004,295.9352538004455 301.2000000000004,303.0764309746352 304.56000000000034,309.93498391078305 307.92000000000036,316.49376979841406 311.2800000000003,322.7363950885588 314.6400000000003,328.64725646908835 318.00000000000034,334.2115798648685 321.36000000000035,339.4154573652533 324.72000000000037,344.2458819866189 328.0800000000003,348.69078018304833 331.4400000000003,352.73904202390884 334.8000000000003,356.3805489628922 338.1600000000003,359.6061991291111 341.5200000000003,362.4079300770362 344.88000000000034,364.7787389384109 348.2400000000003,366.71269992577515 351.6000000000003,368.20497914384805 354.96000000000026,369.25184667174824 358.3200000000003,369.8506858858542 361.6800000000003,370 365.0400000000003,369.6994158066616 368.4000000000003,368.9496846097811 371.7600000000003,367.7526803468983 375.12000000000023,366.1113949052825 378.48000000000025,364.02993064377296 381.84000000000026,361.5134901390178 385.2000000000003,358.5683631817419 388.5600000000003,355.20191105554613 391.92000000000024,351.4225481375316 395.28000000000026,347.23972086673905 398.6400000000002,342.6638841329712 402.0000000000002,337.70647514501286 405.36000000000024,332.3798848435651 408.72000000000025,326.6974269303469 412.0800000000002,320.6733045907747 415.4400000000002,314.3225749933948 418.80000000000024,307.661111654805 422.1600000000002,300.7055647641283 425.5200000000002,293.473319566213 428.8800000000002,285.98245290757313 432.2400000000002,278.2516880536875 435.6000000000002,270.3003478905862 438.9600000000002,262.1483066276991 442.32000000000016,253.8159401226825 445.6800000000002,245.32407495238627 449.0400000000002,236.69393635725828 452.4000000000002,227.94709518929702 455.76000000000016,219.10541399615565 459.1200000000002,210.19099237615836 462.4800000000002,201.2261117408142 465.84000000000015,192.23317962289192 469.20000000000016,183.23467366925783 472.5600000000002,174.25308545846468 475.92000000000013,165.31086428351875 479.28000000000014,156.43036104033865 482.64000000000016,147.6337723621556 486.0000000000001,138.9430851394903 489.3600000000001,130.380021564377 492.72000000000014,121.9659848361961 496.08000000000015,113.72200566482249 499.4400000000001,105.66868970480326 502.8000000000001,97.82616605195255 506.16000000000014,90.21403693109515 509.5200000000001,82.85132870071297 512.8800000000001,75.75644429695765 516.2400000000001,68.94711723589421 519.6000000000001,62.44036728894635 522.96,56.252457942331546 526.3200000000002,50.39885574681545 529.6800000000001,44.894191659389755 533.0400000000001,39.75222447349941 536.4000000000001,34.98580642922437 539.76,30.606851089372796 543.1200000000001,26.626303561778467 546.48,23.054113142231294 549.8400000000001,19.899208446419344 553.2,17.169475093039516 556.5600000000001,14.871735993857627 559.9200000000001,13.011734299982248 563.28,11.594119046977907 566.6400000000001,10.622433534697372 570,10.09910647087728 " style="fill:none;stroke:red;stroke-width:3;" /></svg>
 */
function plot() {
var ret;
var color = ["black","blue","red","green","orange","purple","brown","yellow"];
if(this.__proto__ !== P.prototype) { ret = new P; } 
else { ret = this; }
var n = arguments.length, i, z, type, w;
for(i=0;i<n;i++) {
    z = arguments[i];
    if(typeof z.type === "undefined") { type = "plot"; }
    else { type = z.type; }
    switch(type) {
    case "plot":
        w = process(z,[["x",function(r,z) { return R(V(t(z))); },
                            function(r) { return run(r.y.x.length); }],
                       ["y",function(r,z) { return R(V(t(z))); },
                            function(r) { throw new Error("plot: field y is required.");}],
                       ["lineWidth",
                            function(r,z) { return R(S(t(z))); },
                            t(1)],
                       ["color",
                            function(r,z) { return z; },
                            function(r,z) { return color[ret.v.length%color.length]; }]]);
        break;
    case "points":
        w = process(z,[["x",function(r,z) { return R(V(t(z))); },
                        function(r) { return run(r.y.x.length); }],
                       ["y",function(r,z) { return R(V(t(z))); },
                             function(r) { throw new Error("plot: field y is required.");}],
                       ["radius",
                            function(r,z) { return R(V(t(z))); },
                            t(5)],
                       ["fill",
                            function(r,z) { return z; },
                            function(r,z) { return color[ret.v.length%color.length]; }]]);
        break;
    default:
        throw new Error("Unknown plot type "+type);
    }
    w.type = type;
    ret.v.push(w);
}
return ret;
}
expo(plot);

function R(z) { if(typeof z.y==="undefined") { return z; } throw new Error("tensor must be real"); }
function P() {
    this.v = []; 
    this.axis = "auto"; 
    this.x0 = 0; 
    this.x1 = 1; 
    this.y0 = 0; 
    this.y1 = 1;
    this.width = 600;
    this.height = 400;
    this.marginLeft = 150;
    this.marginRight = 30;
    this.marginTop = 10;
    this.marginBottom = 30;
    this.xticks = [0,1,2,3,4,5];
    this.yticks = [0,1,2,3,4];
}
function process(z,r) {
    var i,n = r.length, k, r0 = [], check = [],foo, ret = {};
    for(i=0;i<n;i++) { r0.push(r[i][0]); check.push(false); }
    for(k in z) {
        if(z.hasOwnProperty(k) && k!=="type") {
            foo = r0.indexOf(k);
            if(foo<0) { throw new Error("plot: unrecognized field "+k); }
            check[foo] = true;
            ret[k] = r[foo][1](ret,z[k]);
        }
    }
    for(i=0;i<n;i++) {
        if(check[i] === false) { 
            if(typeof r[i][2] === "function" && !isT(r[i][2])) { ret[r[i][0]] = r[i][2](ret); }
            else { ret[r[i][0]] = r[i][2]; }
        }
    }
    return ret;
}

P.prototype = { plot:plot,
findBoundingBox: function () {
    function mkticks(z0,z1,n) {
        var dz = z1-z0, zmax = Math.max(Math.abs(z0),Math.abs(z1)),
            zmin = Math.min(Math.abs(z0),Math.abs(z1));
        var log10 = function(z) { return Math.log(z)/Math.log(10); }
        var d0 = Math.floor(log10(Math.abs(dz))-2);
        var d = Math.pow(10,d0);
        z0 = Math.ceil(z0/d)*d;
        z1 = Math.floor(z1/d)*d;
        var ret = [];
        for(i=0;i<n;i++) { ret[i] = (i/(n-1))*(z1-z0)+z0; }
        return ret;
    }
    var i,j,m,n = this.v.length,x,y,x0=+Infinity,x1=-Infinity,y0=+Infinity,y1=-Infinity;
    for(i=0;i<n;i++) {
        switch(this.v[i].type) {
        case "plot":
        case "points":
            x = this.v[i].x.x;
            y = this.v[i].y.x;
            m = y.length;
            for(j=0;j<m;j++) {
                x0 = Math.min(x0,x[j]);
                x1 = Math.max(x1,x[j]);
                y0 = Math.min(y0,y[j]);
                y1 = Math.max(y1,y[j]);
            }
            break;
        }
    }
    this.x0 = x0;
    this.x1 = x1;
    this.y0 = y0;
    this.y1 = y1;
    this.xticks = mkticks(x0,x1,this.xticks.length);
    this.yticks = mkticks(y0,y1,this.yticks.length);
}
};
/*
 * Some more correctness tests
<pre>
> Q = [[22,19,0,],[19,66,42,],[0,42,54,],]; A = [[119,185,7,],[191,37,133,],[86,53,85,],[138,158,89,],[150,97,121,],[86,152,12,],[130,78,63,],[22,54,153,],]; c = [-1765,-2757,-1302,]; b = [-11025,-15883,-8037,-13207,-13673,-8328,-11137,-4591,]; x = [-70.0000,-14.0000,-15.0000,]; x1 = numeric.QP(Q,c,A,b); numeric.round(numeric.mul(1000,numeric.sub(x,x1)));
t([0,0,0])
> Q = [[87,-11,61,54,],[-11,44,3,-7,],[61,3,111,74,],[54,-7,74,53,],]; A = [[43,33,31,59,],[50,123,76,90,],[177,196,32,84,],[139,34,150,71,],[110,51,172,111,],[37,79,69,147,],[42,15,136,84,],[15,135,58,85,],[181,80,105,25,],[140,195,165,5,],[110,80,118,57,],[62,123,66,63,],]; c = [-12767,-3422,-17977,-12165,]; b = [-11693,-26482,-37454,-29875,-33541,-23421,-20944,-23397,-30671,-43705,-28711,-25065,]; x = [-55.4631,-130.8364,-103.9239,-29.9804,]; x1 = numeric.QP(Q,c,A,b); numeric.round(numeric.mul(1000,numeric.sub(x,x1)));
t([0,0,0,0])
</pre>
 */
/**
 * Minimizes 0.5*x'Qx + c'x subject to Ax <= b.
 * 
 * @example
> numeric.QP([[1,0],[0,2]],[-1,-2],[[1,1]],[2])
t([1,1])
 */
function QP(Q,c,A,b,maxit) {

    function simplex(A,b,c,basis,maxiter,pairs) {
        A = M(R(t(A))); b = V(R(t(b))); c = V(R(t(c))); basis = V(R(t(basis)));
        var count,i,j,k,m=A.s[0],n=A.s[1],foo, all = run(m), idx, z = rep(m-1,0);
        if(m!== b.s[0] || n !== c.s[0]) { throw new Error("simplex: internal error"); }
        // Pricing out
        for(k=0;k<basis.x.length;k++) {
            j = basis.x[k];
            c = sub(c,mul(c(j),A(k,null)));
            c(j,0);
        }
        for(count=0;count<maxiter;count++) {
            for(j=0;j<n;j++) { if(c(j).x[0]>0 && basis.x.indexOf(pairs.x[j]) === -1) break; }
            if(j === n) {
                return {A:A, b:b, c:c, basis:basis}; 
            }
            k = -1;
            foo = Infinity;
            for(i=0;i<m;i++) {
                if(A(i,j).x[0] > 0 && b(i).x[0]/A(i,j).x[0] < foo) {
                    k = i;
                    foo = b(i).x[0]/A(i,j).x[0];
                }
            }
            if(foo === Infinity) { throw new Error("simplex: minimum is -Infinity"); }
            i = k;
            basis(i,j);
            b(i,div(b(i),A(i,j)));
            A(i,null,div(A(i,null),A(i,j)));
            idx = setDiff(all,[i]);
            b(idx,sub(b(idx),mul(A(idx,j),b(i))));
            for(k=0;k<m;k++) {
                if(k===i) { continue; }
                A(k,null,sub(A(k,null),mul(A(i,null),A(k,j))));
                A(k,j,0);
            }
            c = sub(c,mul(c(j),A(i,null)));
            c(j,0);
        }
        throw new Error("simplex: maximum iteration count reached");
    }

    function solution(sol) {
        var b = sol.b, basis = sol.basis;
        var n = sol.A.s[1], ret = rep(n,0),i;
        ret(basis,b);
        return ret;
    }

    function phase1(Q,A,b,c,maxit) {
        var m = A.s[0], n = Q.s[0], i;
        var X = block([2,4],Q,transpose(A),diag(rep(n,-1)),rep(n,m,0),
                            A,rep(m,m,0)  ,rep(m,n,0)     ,diag(rep(m,1)));
        var b1 = block([2],neg(c),b);
        var p = X.s[0], q = X.s[1];
        var c1 = block([2],rep(q,0),rep(n+m,-1));
        for(i=0;i<m+n;i++) {
            if(b1(i).x[0]<0) {
                b1(i,neg(b1(i)));
                X(i,null,neg(X(i,null)));
            }
        }
        var X1 = block([1,2],X,diag(rep(n+m,1)));
        var pairs = block([5],run(n+m,2*n+m),run(2*n+m,2*n+2*m),run(0,n),run(n,n+m),rep(n+m,-1));
        var foo = simplex(X1,b1,c1,run(X.s[1],X.s[1]+n+m),maxit,pairs);
        return solution(foo);
    }

    Q = M(R(t(Q))); A = M(R(t(A))); b = V(R(t(b))); c = V(R(t(c)));
    var m = A.s[0], n = Q.s[0];
    if(m!==b.s[0] || n!==A.s[1] || n!==Q.s[1] || n!==c.s[0])
    { throw new Error("QP: Q, A, b, c must have matching sizes"); }
    if(typeof maxit === "undefined") { maxit = 10000; }
    var I = diag(rep(n,1));
    var Q1 = block([2,2],Q,neg(Q),neg(Q),Q);
    var c1 = block([2],c,neg(c));
    var A1 = block([1,2],A,neg(A));
    var p = Q1.s[0];
    var Q2 = block([2,2],Q1,rep(p,m,0),rep(m,p,0),rep(m,m,0));
    var c2 = block([2],c1,rep(m,0));
    var A2 = block([1,2],A1,diag(rep(m,1)));
    var bar = phase1(Q2,A2,b,c2,maxit);
    return sub(bar(run(n)),bar(run(n,2*n)));
}
expo(QP);


// seedrandom.js version 2.0.
// Author: David Bau 4/2/2011
//
// Defines a method Math.seedrandom() that, when called, substitutes
// an explicitly seeded RC4-based algorithm for Math.random().  Also
// supports automatic seeding from local or network sources of entropy.
//
// Usage:
//
//   <script src=http://davidbau.com/encode/seedrandom-min.js></script>
//
//   Math.seedrandom('yipee'); Sets Math.random to a function that is
//                             initialized using the given explicit seed.
//
//   Math.seedrandom();        Sets Math.random to a function that is
//                             seeded using the current time, dom state,
//                             and other accumulated local entropy.
//                             The generated seed string is returned.
//
//   Math.seedrandom('yowza', true);
//                             Seeds using the given explicit seed mixed
//                             together with accumulated entropy.
//
//   <script src="http://bit.ly/srandom-512"></script>
//                             Seeds using physical random bits downloaded
//                             from random.org.
//
//   <script src="https://jsonlib.appspot.com/urandom?callback=Math.seedrandom">
//   </script>                 Seeds using urandom bits from call.jsonlib.com,
//                             which is faster than random.org.
//
// Examples:
//
//   Math.seedrandom("hello");            // Use "hello" as the seed.
//   document.write(Math.random());       // Always 0.5463663768140734
//   document.write(Math.random());       // Always 0.43973793770592234
//   var rng1 = Math.random;              // Remember the current prng.
//
//   var autoseed = Math.seedrandom();    // New prng with an automatic seed.
//   document.write(Math.random());       // Pretty much unpredictable.
//
//   Math.random = rng1;                  // Continue "hello" prng sequence.
//   document.write(Math.random());       // Always 0.554769432473455
//
//   Math.seedrandom(autoseed);           // Restart at the previous seed.
//   document.write(Math.random());       // Repeat the 'unpredictable' value.
//
// Notes:
//
// Each time seedrandom('arg') is called, entropy from the passed seed
// is accumulated in a pool to help generate future seeds for the
// zero-argument form of Math.seedrandom, so entropy can be injected over
// time by calling seedrandom with explicit data repeatedly.
//
// On speed - This javascript implementation of Math.random() is about
// 3-10x slower than the built-in Math.random() because it is not native
// code, but this is typically fast enough anyway.  Seeding is more expensive,
// especially if you use auto-seeding.  Some details (timings on Chrome 4):
//
// Our Math.random()            - avg less than 0.002 milliseconds per call
// seedrandom('explicit')       - avg less than 0.5 milliseconds per call
// seedrandom('explicit', true) - avg less than 2 milliseconds per call
// seedrandom()                 - avg about 38 milliseconds per call
//
// LICENSE (BSD):
//
// Copyright 2010 David Bau, all rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
// 
//   1. Redistributions of source code must retain the above copyright
//      notice, this list of conditions and the following disclaimer.
//
//   2. Redistributions in binary form must reproduce the above copyright
//      notice, this list of conditions and the following disclaimer in the
//      documentation and/or other materials provided with the distribution.
// 
//   3. Neither the name of this module nor the names of its contributors may
//      be used to endorse or promote products derived from this software
//      without specific prior written permission.
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
/**
 * All code is in an anonymous closure to keep the global namespace clean.
 *
 * @param {number=} overflow 
 * @param {number=} startdenom
 */
(function (pool, math, width, chunks, significance, overflow, startdenom) {


//
// seedrandom()
// This is the seedrandom function described above.
//
math['seedrandom'] = function seedrandom(seed, use_entropy) {
  var key = [];
  var arc4;

  // Flatten the seed string or build one from local entropy if needed.
  seed = mixkey(flatten(
    use_entropy ? [seed, pool] :
    arguments.length ? seed :
    [new Date().getTime(), pool, window], 3), key);

  // Use the seed to initialize an ARC4 generator.
  arc4 = new ARC4(key);

  // Mix the randomness into accumulated entropy.
  mixkey(arc4.S, pool);

  // Override Math.random

  // This function returns a random double in [0, 1) that contains
  // randomness in every bit of the mantissa of the IEEE 754 value.

  math['random'] = function random() {  // Closure to return a random double:
    var n = arc4.g(chunks);             // Start with a numerator n < 2 ^ 48
    var d = startdenom;                 //   and denominator d = 2 ^ 48.
    var x = 0;                          //   and no 'extra last byte'.
    while (n < significance) {          // Fill up all significant digits by
      n = (n + x) * width;              //   shifting numerator and
      d *= width;                       //   denominator and generating a
      x = arc4.g(1);                    //   new least-significant-byte.
    }
    while (n >= overflow) {             // To avoid rounding up, before adding
      n /= 2;                           //   last byte, shift everything
      d /= 2;                           //   right using integer math until
      x >>>= 1;                         //   we have exactly the desired bits.
    }
    return (n + x) / d;                 // Form the number within [0, 1).
  };

  // Return the seed that was used
  return seed;
};

//
// ARC4
//
// An ARC4 implementation.  The constructor takes a key in the form of
// an array of at most (width) integers that should be 0 <= x < (width).
//
// The g(count) method returns a pseudorandom integer that concatenates
// the next (count) outputs from ARC4.  Its return value is a number x
// that is in the range 0 <= x < (width ^ count).
//
/** @constructor */
function ARC4(key) {
  var t, u, me = this, keylen = key.length;
  var i = 0, j = me.i = me.j = me.m = 0;
  me.S = [];
  me.c = [];

  // The empty key [] is treated as [0].
  if (!keylen) { key = [keylen++]; }

  // Set up S using the standard key scheduling algorithm.
  while (i < width) { me.S[i] = i++; }
  for (i = 0; i < width; i++) {
    t = me.S[i];
    j = lowbits(j + t + key[i % keylen]);
    u = me.S[j];
    me.S[i] = u;
    me.S[j] = t;
  }

  // The "g" method returns the next (count) outputs as one number.
  me.g = function getnext(count) {
    var s = me.S;
    var i = lowbits(me.i + 1); var t = s[i];
    var j = lowbits(me.j + t); var u = s[j];
    s[i] = u;
    s[j] = t;
    var r = s[lowbits(t + u)];
    while (--count) {
      i = lowbits(i + 1); t = s[i];
      j = lowbits(j + t); u = s[j];
      s[i] = u;
      s[j] = t;
      r = r * width + s[lowbits(t + u)];
    }
    me.i = i;
    me.j = j;
    return r;
  };
  // For robust unpredictability discard an initial batch of values.
  // See http://www.rsa.com/rsalabs/node.asp?id=2009
  me.g(width);
}

//
// flatten()
// Converts an object tree to nested arrays of strings.
//
/** @param {Object=} result 
  * @param {string=} prop
  * @param {string=} typ */
function flatten(obj, depth, result, prop, typ) {
  result = [];
  typ = typeof(obj);
  if (depth && typ == 'object') {
    for (prop in obj) {
      if (prop.indexOf('S') < 5) {    // Avoid FF3 bug (local/sessionStorage)
        try { result.push(flatten(obj[prop], depth - 1)); } catch (e) {}
      }
    }
  }
  return (result.length ? result : obj + (typ != 'string' ? '\0' : ''));
}

//
// mixkey()
// Mixes a string seed into a key that is an array of integers, and
// returns a shortened string seed that is equivalent to the result key.
//
/** @param {number=} smear 
  * @param {number=} j */
function mixkey(seed, key, smear, j) {
  seed += '';                         // Ensure the seed is a string
  smear = 0;
  for (j = 0; j < seed.length; j++) {
    key[lowbits(j)] =
      lowbits((smear ^= key[lowbits(j)] * 19) + seed.charCodeAt(j));
  }
  seed = '';
  for (j in key) { seed += String.fromCharCode(key[j]); }
  return seed;
}

//
// lowbits()
// A quick "n mod width" for width a power of 2.
//
function lowbits(n) { return n & (width - 1); }

//
// The following constants are related to IEEE 754 limits.
//
startdenom = math.pow(width, chunks);
significance = math.pow(2, significance);
overflow = significance * 2;

//
// When seedrandom.js is loaded, we immediately mix a few bits
// from the built-in RNG into the entropy pool.  Because we do
// not want to intefere with determinstic PRNG state later,
// seedrandom will not call math.random on its own again after
// initialization.
//
mixkey(math.random(), pool);

// End anonymous scope, and pass initial values.
})(
  [],   // pool: entropy pool starts empty
  Math, // math: package containing random, pow, and seedrandom
  256,  // width: each RC4 output is 0 <= x < 256
  6,    // chunks: at least six RC4 outputs for each double
  52    // significance: there are 52 significant digits in a double
);
/**
 * Computes a set union
 * 
 * @example
> numeric.union([1,2,3],[2,3,4],[4,4,1,9]);
t([1,2,3,4,9])
 */
function union() {
    var foo = {}, bar;
    var n = arguments.length, i,j,m,x;
    for(i=0;i<n;i++) {
        bar = R(V(t(arguments[i])));
        x = bar.x;
        m = x.length;
        for(j=0;j<m;j++) { foo[x[j]] = x[j]; }
    }
    var ret = [];
    for(i in foo) { if(foo.hasOwnProperty(i)) { ret.push(foo[i]); } }
    return t(ret);
}
expo(union);

/**
 * Computes a set difference.
 * 
 * @example
> numeric.setDiff([1,4,4,2,7,9,2],[3,6,2]);
t([1,4,4,7,9])
 * @param x
 * @param y
 * @returns
 */
function setDiff(x,y) {
    if(arguments.length !== 2) { throw new Error("setDiff: exactly two arguments must be given"); }
    x = R(V(t(x))); y = R(V(t(y)));
    var ret = [], yx = y.x;
    var foo = x.x.filter(function(i) { return yx.indexOf(i) === -1; });
    var i;
    for(i in foo) { if(foo.hasOwnProperty(i)) { ret.push(foo[i]); } }
    return t(ret);
}
expo(setDiff);

/**
 * Computes a set intersection
 * 
 * @example
> numeric.intersect([1,2,4,6,7,9],[1,2,3,4,5,5,6,7],[3,4,5,7]);
t([4,7])
 * @returns
 */
function intersect() {
    var i, n = arguments.length;
    var foo, ret = R(V(copy(arguments[0]))).x, z=[];
    for(i=1;i<n;i++) {
        foo = R(V(t(arguments[i]))).x;
        ret = ret.filter(function(i) { return foo.indexOf(i) !== -1; });
    }
    for(i in ret) { if(ret.hasOwnProperty(i)) { z.push(ret[i]); } }
    return t(z);
}
expo(intersect);
/*
 * Some additional tests. 
<pre>
> A = [[62,41,50,-84,-78,-16,9,],[80,-93,-48,-88,91,-89,-40,],[-74,-44,1,6,-98,80,48,],[82,-90,39,55,54,88,-62,],[26,-80,77,86,63,-2,37,],[-80,64,91,-73,73,-2,-63,],[-44,39,9,14,-82,-32,-26,],[9,-36,-72,-6,-20,79,25,],[91,89,-69,-97,-48,-26,55,],[92,-92,-48,-32,59,-77,-83,],[-68,-12,67,-67,-14,55,85,],[93,-23,-49,58,81,-22,55,],[91,53,62,-37,-63,-51,-3,],[-3,58,-51,6,-47,-19,-13,],[59,-62,85,-66,-70,-80,-11,],[-71,-2,-30,20,-72,-73,-38,],[-15,-11,-60,-47,73,88,2,],[82,29,-49,31,16,90,2,],[58,41,23,37,10,15,63,],[91,50,-5,49,-70,-87,58,],[31,-44,-29,-10,70,-53,29,],[-92,36,66,-82,24,-29,-24,],[69,31,17,-54,-30,64,62,],[86,-67,10,82,3,-96,6,],[35,-75,83,-69,-19,-90,-30,],[51,0,-42,65,-84,-66,87,],[48,91,51,8,-51,30,74,],[-21,-32,50,98,-75,46,10,],[31,17,-24,-84,-63,29,24,],[-65,-55,13,-11,-51,-10,17,],]; b=[-8835,16996,-4487,4353,1933,14225,-3503,-1313,-12129,13369,-65,-2474,-11998,-4741,-2353,2722,9041,-6953,-9383,-18625,7725,11641,-10668,-2839,5280,-15872,-16386,-7671,-5638,2711,]; c=[-58,-39,-6,-53,68,-60,-54,]; x=[-67.7169,-43.2446,-7.6815,-34.4453,77.0432,-6.1834,-65.4491,]; x1=numeric.LP(A,b,c); numeric.round(numeric.mul(100,numeric.sub(x,x1)));
t( [0         , 0         , 0         , 0         , 0         , 0         , 0          ])
> A = [[-2,80,59,-46,-4,39,-51,],[25,22,-9,-15,-75,40,35,],[35,23,-13,9,18,27,-42,],[-21,71,64,88,-54,-92,34,],[-26,60,-82,-16,-23,-85,39,],[97,15,-73,96,16,-36,-86,],[-92,-63,-65,-39,-49,6,-49,],[76,-51,-22,40,-41,31,-55,],[82,77,66,33,23,-18,33,],[59,-93,60,8,-46,63,68,],[-79,-2,-87,39,64,43,-31,],[-47,-66,-20,33,96,93,56,],[-33,95,5,-64,46,6,35,],[36,42,-16,-74,-31,-35,-98,],[-72,0,31,99,17,-78,20,],[44,-6,25,-65,-78,22,-22,],[-78,-87,-41,-93,80,55,82,],[30,36,-14,12,75,-15,-99,],[-1,-91,-96,76,63,-81,-7,],[55,-85,96,33,-47,-46,-15,],[43,4,-66,-61,19,-69,-8,],[80,-80,-78,-26,-95,-43,53,],[77,63,-25,-8,-15,-12,-35,],[-33,63,-60,95,-37,5,56,],[39,44,-2,-68,-67,-8,-6,],[-60,-69,-32,70,-64,74,-92,],[-93,32,89,29,-15,4,-64,],[48,4,83,-24,-80,88,44,],[0,94,-89,-61,20,27,-5,],[-4,30,47,-14,-6,91,-69,],]; b=[-2067,3471,2388,-17794,-2134,-513,4380,6231,-5418,8120,-83,6001,-476,4636,-13969,7006,15789,-526,3056,552,7945,13233,2032,-9574,5293,-1824,-12995,3358,5986,952,]; c=[-31,21,-61,47,-51,83,-46,]; x=[47.6473,-67.7310,-28.2061,-88.8288,21.5071,20.1191,16.6860,]; x1=numeric.LP(A,b,c); numeric.round(numeric.mul(100,numeric.sub(x,x1)));
t( [0         , 0         , 0         , 0         , 0         , 0         , 0          ])
</pre>
 */
/**
 * Minimizes dot(c,x) subject to dot(A,x) <= b.
 * 
 * @example
> numeric.LP([[1,0],[-1,0],[0,1],[0,-1]],[1,1,1,1],[1,2],10);
t([-1,-1])
> numeric.LP([[1]],[1],[1])
Error: simplex: minimum is -Infinity
> numeric.LP([[1],[-1]],[1,-2],[1])
Error: simplex: no feasible solution
 */
function LP(A,b,c,maxit) {

    function simplex(A,b,c,basis,maxiter) {
        A = M(R(t(A))); b = V(R(t(b))); c = V(R(t(c))); basis = V(R(t(basis)));
        var count,i,j,k,m=A.s[0],n=A.s[1],foo, all = run(m), idx, z = rep(m-1,0);
        if(m!== b.s[0] || n !== c.s[0]) { throw new Error("simplex: internal error"); }
        // Pricing out
        for(k=0;k<basis.x.length;k++) {
            j = basis.x[k];
            c = sub(c,mul(c(j),A(k,null)));
            c(j,0);
        }
        for(count=0;count<maxiter;count++) {
            for(j=0;j<n;j++) { if(c(j).x[0]>0) break; }
            if(j === n) {
                return {A:A, b:b, c:c, basis:basis}; 
            }
            k = -1;
            foo = Infinity;
            for(i=0;i<m;i++) {
                if(A(i,j).x[0] > 0 && b(i).x[0]/A(i,j).x[0] < foo) {
                    k = i;
                    foo = b(i).x[0]/A(i,j).x[0];
                }
            }
            if(foo === Infinity) { throw new Error("simplex: minimum is -Infinity"); }
            i = k;
            basis(i,j);
            b(i,div(b(i),A(i,j)));
            A(i,null,div(A(i,null),A(i,j)));
            idx = setDiff(all,[i]);
            b(idx,sub(b(idx),mul(A(idx,j),b(i))));
            for(k=0;k<m;k++) {
                if(k===i) { continue; }
                A(k,null,sub(A(k,null),mul(A(i,null),A(k,j))));
                A(k,j,0);
            }
            c = sub(c,mul(c(j),A(i,null)));
            c(j,0);
        }
        throw new Error("simplex: maximum iteration count reached");
    }

    function solution(sol) {
        var b = sol.b, basis = sol.basis;
        var n = sol.A.s[1], ret = rep(n,0);
        ret(basis,b);
        return ret;
    }

    function phase1(A,b,maxiter) {
        A = M(R(t(A))); b = V(R(t(b)));
        var i,m = A.s[0],n=A.s[1];
        for(i=0;i<m;i++) {
            if(b(i).x[0] < 0) { A(i,null,neg(A(i,null))); b(i,neg(b(i))); }
        }
        var A0 = block([1,2],A,diag(rep(A.s[0],1)));
        var c = block([2],rep(n,0),rep(m,-1));
        var foo = simplex(A0,b,c,run(n,n+m),maxiter,run(n,m+n));
        return {A:foo.A(null,run(n)), b:foo.b, basis:foo.basis};
    }

    function simplex1(A,b,c,maxiter) {
        A = M(R(t(A))); b = V(R(t(b))); c = V(R(t(c)));
        var foo = phase1(A,b,maxiter);
        if(sup(foo.basis).x[0] >= A.s[1]) { throw new Error("simplex: no feasible solution"); }
        foo = simplex(foo.A,foo.b,c,foo.basis,maxiter);
        return solution(foo);
    }

    A = M(R(t(A))); b = V(R(t(b))); c = V(R(t(c)));
    if(typeof maxit === "undefined") { maxit = 10000; }
    var m = A.s[0], n = A.s[1], i;
    if(m!==b.s[0] || n!==c.s[0]) { throw new Error("LP: A,b,c must have matching sizes"); }
    var A0 = block([1,3],A,neg(A),diag(rep(m,1)));
    var c0 = block([3],neg(c),c,rep(m,0));
    var foo = simplex1(A0,b,c0,maxit);
    return sub(foo(run(0,n)),foo(run(n,2*n)));
}
expo(LP);


var epsilon;
function mkeps() {
    epsilon = 1;
    while(1+epsilon>1) { epsilon *= 0.5; }
    epsilon *=2;
    exports.epsilon = epsilon;
}
mkeps();

function size(x) {
    var ret = [];
    while(typeof x !== "number") {
        if(x instanceof Array) {
            ret.push(x.length);
            if(x.length === 0) { return ret; }
            x = x[0];
        }
        else throw new Error("Malformed tensor");
    }
    return ret;
}
function checkTensor(x,s) {
    function z(x,k) {
        var i;
        if(k === s.length) {
            if(typeof x === "number") { return }
            else throw new Error("Malformed tensor");
        }
        if(!(x instanceof Array) || x.length !== s[k]) { throw new Error("Malformed tensor"); }
        for(i=0;i<x.length;i++) {
            z(x[i],k+1);
        }
    }
    z(x,0);
}
function mkv(x) {
    var ret = [];
    function f(x) {
        if(typeof x === "number") { ret.push(x); return; }
        var i;
        for(i=0;i<x.length;i++) {
            f(x[i]);
        }
    }
    f(x);
    return ret;
}
var _digits=4, dig0 = 10000;
/**
     * Read and set the number of significant digits used by {@link numeric.prettyPrint}().
     *
     * If the optional parameter d is provided,
     * the new number of significant digits is set to d. If the optional
     * parameter d is omitted, the number
     * of significant digits is left unchanged.
     * 
     * @param {Number} [d] The optional number of digits
     * @returns The current number of significant digits.
     * @example
> numeric.digits(4)
4
> x = 3.14159265459
3.142
> numeric.digits(10)
10
> x
3.141592655
> numeric.digits(4)
4
> x
3.142
> numeric.digits()
4
     */
function digits(d) {
    if(typeof d === "number") { 
        if(d<1 || Math.round(d)!=d || d>100) { throw new Error("Number of digits must be an integer between 1 and 100."); }
        _digits = d; dig0 = Math.pow(10,d);
    }
    return _digits;
}
expo(digits);
function fmtnum(x) {
    var ret = x.toPrecision(_digits);
    if(x === Number(ret)) {
        ret = x.toString();
    }
    while(ret.length < _digits+6) { ret = ret+" "; }
    return ret;
}
function S(z) { if(!isS(z)) { throw new Error("Parameter must be scalar."); } return z;}
/**
     * Creates a vector of consecutive values
     * 
     * @example
> numeric.run(3)
t([0,1,2])
> numeric.run(1,3)
t([1,2])
> numeric.run(1,1)
t([])
> numeric.run(1,2,9)
t([1,3,5,7])
     */
function run() {
    var a,by,b;
    if(arguments.length === 1) { a=0; by=1; b=S(t(arguments[0])).x[0]; }
    else if(arguments.length === 2) { a=S(t(arguments[0])).x[0]; by=1; b=S(t(arguments[1])).x[0]; }
    else if(arguments.length === 3) { a=S(t(arguments[0])).x[0]; by=S(t(arguments[1])).x[0]; b=S(t(arguments[2])).x[0]; }
    else { throw new Error("Incorrect number of arguments"); }
    var foo = _run(a,by,b);
    return mkT([foo.length],foo);
}
expo(run);

/**
     * Repeats a given number to create a tensor.
     *
     * @example
> numeric.rep(5)
t(5)
> numeric.rep(3,2)
t([2,2,2])
> numeric.rep(3,numeric.t(5,4))
t([5,5,5],[4,4,4])
> numeric.rep(3,3,1)
t([[1,1,1],[1,1,1],[1,1,1]])
     */
function rep() {
    var s = [], i, n=arguments.length-1, sz = 1, x=[],y;
    for(i=0;i<n;i++) { s[i] = S(t(arguments[i])).x[0]; sz*=s[i]; }
    var foo = S(t(arguments[n]));
    var bar = foo.x[0];
    for(i=0;i<sz;i++) { x[i] = bar; }
    if(typeof foo.y === "undefined") { return mkT(s,x); }
    y = [];
    bar = foo.y[0];
    for(i=0;i<sz;i++) { y[i] = bar; }
    return mkT(s,x,y);
}
expo(rep);

function V(z) { if(!isV) { throw new Error("Parameter must be a vector"); } return z; }
/**
     * Creates a diagonal matrix
     * 
     * @example
> numeric.diag([1,2,3])
t([[1,0,0],
   [0,2,0],
   [0,0,3]])
> numeric.diag([[1,2,3,4],[5,6,7,8]],[0,2],5,8)
t([[1,0,5,0,0,0,0,0],
   [0,2,0,6,0,0,0,0],
   [0,0,3,0,7,0,0,0],
   [0,0,0,4,0,8,0,0],
   [0,0,0,0,0,0,0,0]])
     */
function diag(v,o,m,n) {
    v = t(v);
    if(!isM(v)) {
        if(!isV(v)) { throw new Error("v must be a vector or a matrix"); }
        if(typeof v.y === "undefined") { v = mkT([1,v.s[0]],v.x.slice(0)); }
        else { v = mkT([1,v.s[0]],v.x.slice(0),v.y.slice(0)); }
    }
    var p = v.s[0], q = v.s[1];
    if(typeof o === "undefined") {
        o = run(p);
    } else {
        o = t(o);
        if(isS(o)) { o = mkT([1],o.x); }
        if(!isV(o)) { throw new Error("o must be a vector"); }
    }
    if(o.s[0] !== p) { throw new Error("v and o must have matching dimensions"); }
    if(typeof m === "undefined") { m = q; } else { m = S(t(m)).x[0]; }
    if(typeof n === "undefined") { n = q; } else { n = S(t(n)).x[0]; }
    var i,j,k,o1,o2,i0,j0,x = v.x,y = v.y, ret;
    if(typeof y === "undefined") { ret = rep(m,n,0); }
    else { ret = rep(m,n,t(0,0)); }
    for(i=0;i<p;i++) {
        if(o.x[i]<0) { i0 = -o.x[i]; j0 = 0; }
        else { i0 = 0; j0 = o.x[i]; }
        k = Math.min(m - i0, n - j0, q);
        o1 = i0*n+j0;
        o2 = i*q;
        for(j=0;j<k;j++) {
            ret.x[o1] = x[o2];
            if(typeof y !== "undefined") { ret.y[o1] = y[o2]; }
            o1 += n+1;
            o2++;
        }
    }
    return ret;
}
expo(diag);

/*
 * FIXME: The functions T0$, T0set, T1$, ..., Tnset have evolved organically. They were
 * meant to be high performance, special-case optimized functions that would quickly access
 * entries of tensors but because of all the "indirections", they are now fairly slow. They should
 * be rewritten for efficiency.
 */
function _run(a,by,b) {
    var k,ret=[];
    for(k=a;k<b;k+=by) { ret.push(k); }
    return ret;
}

var T1set = function() {
    if(arguments.length !== 2) { throw new Error("Vectors need exactly one index"); }
    var bar = t(arguments[1]);
    var x0 = bar.x, i,j, y0 = bar.y, x1 = this.x, y1 = this.y, n = x1.length ;
    var foo = (arguments[0] === null)?run(n):t(arguments[0]), k=foo.x;
    if(foo.s[0] === 0) { return this; }
    if(!samev(foo.s,bar.s)) { throw new Error("set: indexing and value tensors must be of the same size"); }
    for(i=0;i<k.length;i++) {
        j = k[i];
        if(j<0 || j>=n) { throw new Error("Index out of bounds"); }
        x1[j] = x0[i];
    }
    if(typeof y0 === "undefined") {
        if(typeof y1 !== "undefined") {
            for(i=0;i<k.length;i++) {
                j = k[i];
                if(j<0 || j>=n) { throw new Error("Index out of bounds"); }
                y1[j] = 0;
            }
        }
    } else {
        if(typeof y1 === "undefined") {
            this.y = [];
            y1 = this.y;
            for(i=0;i<n;i++) { y1[i] = 0; }
        }
        for(i=0;i<k.length;i++) {
            j = k[i];
            if(j<0 || j>=n) { throw new Error("Index out of bounds"); }
            y1[j] = y0[i];
        }
    }
    return this;
}
var T2$ = function(z,args) {
    if(args.length === 3) { return T2set.call(z,args[0],args[1],args[2]); }
    if(args.length !== 2) { throw new Error("Matrices need exactly two indexes"); }
    var m = z.s[0], n = z.s[1], j, k, foo, s=[];
    if(args[0] === null) { j = _run(0,1,m); s.push(m); }
    else { 
        foo = t(args[0]);
        j = foo.x;
        if(!isS(foo)) { 
            s.push(j.length);
        }
    }
    if(args[1] === null) { k = _run(0,1,n); s.push(n); }
    else { 
        foo = t(args[1]);
        k = foo.x;
        if(!isS(foo)) { 
            s.push(k.length);
        }
    }
    function f(z) {
        var p,q,a,b,ret=[],offset;
        for(p=0;p<j.length;p++) {
            a = j[p];
            if(a<0 || a>= m) { throw new Error("Index out of bounds"); }
            offset = a*n;
            for(q=0;q<k.length;q++) {
                b = k[q];
                if(b<0 || b>= n) { throw new Error("Index out of bounds"); }
                ret.push(z[offset+b]);
            }
        }
        return ret;
    }
    if(typeof z.y === "undefined") { return mkT(s,f(z.x)); }
    return mkT(s,f(z.x),f(z.y));
}
var T2set = function() {
    if(arguments.length!==3) { throw new Error("Matrices need exactly two indexes"); }        
    var m = this.s[0], n = this.s[1];
    var is0 = (arguments[0]===null)?run(m):t(arguments[0]),
        js0 = (arguments[1]===null)?run(n):t(arguments[1]),
        vs = t(arguments[2]);
    var is = is0.x;
    var js = js0.x;
    var p = is.length, q = js.length, s=[];

    if(!isS(is0)) { 
        if(is0.s[0] === 0) { return this; }
        if(!isV(is0)) { throw new Error("set: index must be scalar or vector"); } 
        s.push(p);
    }
    if(!isS(js0)) { 
        if(js0.s[0] === 0) { return this; }
        if(!isV(js0)) { throw new Error("set: index must be scalar or vector"); }
        s.push(q);
    }
    if(!samev(s,vs.s)) { throw new Error("set: indexing and value tensors must be of matching sizes"); }
    var vx = vs.x, x = this.x;
    var i,j, off1, off2, count;
    count = 0;
    for(i=0;i<p;i++) {
        off1 = is[i]*n;
        for(j=0;j<q;j++) {
            x[off1+js[j]] = vx[count];
            count++;
        }
    }
    count=0;
    if(typeof vs.y !== "undefined") {
        if(typeof this.y === "undefined") { this.y = mka(x.length,0); }
        var y = this.y, vy = vs.y;
        for(i=0;i<p;i++) {
            off1 = is[i]*n;
            for(j=0;j<q;j++) {
                y[off1+js[j]] = vy[count];
                count++;
            }
        }
    } else if(typeof this.y !== "undefined") {
        var y = this.y;
        for(i=0;i<p;i++) {
            off1 = is[i]*n;
            off2 = i*q;
            for(j=0;j<q;j++) {
                y[off1+js[j]] = 0;
            }
        }
    }
    return this;
}
var Tn$ = function(z,args) {
    if(args.length === z.s.length+1) { return Tnset.apply(z,args); }
    if(args.length!==z.s.length) { throw new Error("Incorrect number of indices"); }
    var s=[],k=[],i,muls=[],m0=1,s0 = z.s, foo;
    for(i=args.length-1;i>=0;i--) {
        if(args[i] === "null") { k[i] = _run(0,1,s0[i]); s.push(k[i].length); }
        else { 
            foo = t(args[i]);
            k[i] = foo.x;
            if(!isS(foo)) { s.push(k[i].length); }
        }
        muls[i] = m0;
        m0 *= z.s[i];
    }
    function f(z) {
        var ret=[];
        function g(i,offset) {
            if(i === k.length) {
                ret.push(z[offset]);
                return;
            }
            var foo = k[i],j,l;
            for(j=0;j<foo.length;j++) {
                l = foo[j];
                if(l<0 || l>= s0[i]) { throw new Error("Index out of bounds"); }
                g(i+1,offset+l*muls[i]);
            }
        }
        g(0,0);
        return ret;
    }
    if(typeof z.y === "undefined") { return mkT(s,f(z.x)); }
    return mkT(s,f(z.x),f(z.y));
}
var Tnset = function() {
    var is = [], k, s=[], s0 = this.s, n=s0.length, muls=[], mul=1, foo, an;
    if(arguments.length !== n+1) { throw new Error("set: Incorrect number of indices"); }
    for(k=0;k<n;k++) {
        if(arguments[k] === null) {
            is[k] = _run(0,1,s0[k]);
        } else {
            foo = t(arguments[k]);
            is[k] = foo.x;
            if(!isS(foo)) {
                if(!isV(foo)) { throw new Error("set: Index must be a vector or a scalar"); }
                s.push(foo.x.length);
            }
        }
    }
    an = t(arguments[n]);
    if(!samev(s,an.s)) { throw new Error("set: indexing and size of values has to match"); }
    for(k=n-1;k>=0;k--) {
        muls[k] = mul;
        mul *= s0[k];            
    }
    function g(z,h) {
        var count = 0;
        function f(k,offset) {
            if(k===n) {
                z[offset] = h(count);
                count++;
                return;
            }
            var i,foo = is[k], bar;
            for(i=0;i<is[k].length;i++) {
                bar = foo[i];
                if(bar < 0 || bar > s0[k]) {
                    throw new Error("set: Index out of bounds");
                }
                f(k+1,offset+muls[k]*is[k][i]);
            }
        }
        f(0,0);
    }
    foo = an.x;
    g(this.x,function (i) { return foo[i]; });
    if(typeof an.y === "undefined") {
        if(typeof this.y !== "undefined") {
            g(this.x,function (i) { return 0; });
        }
    } else {
        if(typeof this.y === "undefined") { this.y = mka(this.x.length); }
        foo = an.y;
        g(this.y,function(i) { return foo[i]; });
    }
    return this;
}
function mkT(s,x,y) {
    var ret;
    function mk$($) { 
        function Tensor() { return $(Tensor,arguments); }
        return Tensor;
    }
    if(s.length === 0) { 
        return (function () {
            function Tensor(z) {
                if(typeof z === "undefined") { return Tensor; }
                if(typeof z === "number") { z = [z]; }
                if(z instanceof Array) {
                    Tensor.x = z;
                    if(typeof Tensor.y !== "undefined") { delete Tensor.y; }
                    return Tensor;
                }
                Tensor.x = z.x;
                if(typeof Tensor.y === "undefined") {
                    if(typeof z.y === "undefined") { return Tensor; }
                    Tensor.y = z.y;
                    return Tensor;
                }
                if(typeof z.y === "undefined") { delete Tensor.y; }
                Tensor.y = z.y;
                return Tensor;
            }
            Tensor.s = s;
            Tensor.x = x;
            if(typeof y !== "undefined") { Tensor.y = y; }
            return Tensor;
        }());
    }
    else if(s.length === 1) { 
        return (function () {
            function Tensor(z,w) {
                if(typeof w !== "undefined") { return T1set.call(Tensor,z,w); }
                var s,k,n = Tensor.s[0], foo;
                if(z === null) { k = _run(0,1,n); s = [n]; }
                else {
                    foo = t(z);
                    k = foo.x;
                    if(!isS(foo)) { s=[k.length]; }
                    else { s = []; }
                }
                function f(z) {
                    var i,j,ret=[];
                    for(i=0;i<k.length;i++) {
                        j = k[i];
                        if(j<0 || j>= n) { throw new Error("Index out of bounds"); }
                        ret.push(z[j]);
                    }
                    return ret;
                }
                if(typeof Tensor.y === "undefined") { return mkT(s,f(Tensor.x)); }
                return mkT(s,f(Tensor.x),f(Tensor.y));
            }
            Tensor.s = s;
            Tensor.x = x;
            if(typeof y !== "undefined") { Tensor.y = y; }
            return Tensor;
        }());
    }
    else if(s.length === 2) { ret = mk$(T2$); }
    else { ret = mk$(Tn$); }
    ret.s = s;
    ret.x = x;
    if(typeof y !== "undefined") { ret.y = y; }
    return ret;
}

/**
 * Converts a tensor into arrays.
 * 
 * @example
> numeric.toArray(numeric.rep(2,3,5))
[ [ 5,5,5 ],
  [ 5,5,5 ] ]
 * @param v
 * @returns
 */
function toArray(v) {
    v = R(t(v));
    if(isS(v)) { return v.x[0]; }
    var count = 0;
    function f(k) {
        if(k === v.s.length) { return v.x[count++]; }
        var i,ret = [];
        for(i=0;i<v.s[k];i++) {
            ret[i] = f(k+1);
        }
        return ret;
    }
    return f(0);
}
expo(toArray);

function set() {
    var x = t(arguments[0]);
    if(x.s.length + 2 !== arguments.length) { throw new Error("set: incorrect number of indices"); }
    if(x.s.length === 0) { return x(arguments[1]); }
    else if(x.s.length === 1) { return x(arguments[1],arguments[2]); }
    else if(x.s.length === 2) { return T2set.call(x,arguments[1],arguments[2],arguments[3]); }
    else { return Tnset.apply(x,Array.prototype.slice.call(arguments,1)); }
}
expo(set);

/**
     * Checks whether x is a tensor.
     * @example
> numeric.isT(1)
false
> numeric.isT(numeric.t(0))
true
     */
function isT(x) { return x.name === "Tensor"; } //return (Ts.indexOf(x.__proto__)>=0); }
expo(isT);
/**
     * Checks whether x is an order 0 tensor (a scalar).
     * @example
> numeric.isS(1)
false
> numeric.isS(numeric.t(1))
true
> numeric.isS(numeric.t([1,2]))
false
> foo = numeric.t(1); numeric.set(foo,numeric.t(2,1)); foo
t(2,1)
     */
function isS(x) { return (x.name === "Tensor" && x.s.length === 0); } //return x.__proto__ === T0; }
expo(isS);
/**
     * Checks whether x is an order 1 tensor (a vector)
     * @example
> numeric.isV(numeric.t(1))
false
> numeric.isV(numeric.t([1,2]))
true
     */
function isV(x) { return x.name === "Tensor" && x.s.length === 1; } //return x.__proto__ === T1; }
expo(isV);
/**
     * Checks whether x is an order 2 tensor (a matrix)
     * @example
> numeric.isM(numeric.t(1))
false
> numeric.isM(numeric.t([1,2]))
false
> numeric.isM(numeric.t([[1,2],[3,4]]))
true
     */
function isM(x) { return x.name === "Tensor" && x.s.length === 2; } //return x.__proto__ === T2; }
expo(isM);

/**
     * Create a real or complex tensor.
     * 
     * @example
> numeric.t(0)
t(0)
> numeric.t([0,1])
t([0,1])
> numeric.t([[0,1],[2,3]])
t([[0,1],
   [2,3]])
> numeric.t(0,1)
t(0,1)
> numeric.t("hello")
Error: Malformed tensor
> numeric.t([[1,2],[3,4]],[3,4])
Error: The real and imaginary parts must be tensors of the same dimensions
> numeric.t(1)()
t(1)
> numeric.t(1,2)()
t(1,2)
> numeric.t([3,4])(0)
t(3)
> numeric.t([3,4],[5,6])(1)
t(4,6)
> numeric.t([[1,2],[3,4]])(0,1)
t(2)
> numeric.t([[1,2,3],[4,5,6],[7,8,9]])([0,1],[1,2])
t([[2,3],[5,6]])
> numeric.t([[[1,2],[3,4]],[[5,6],[7,8]]])(1,1,1)
t(8)
     */
function t(x,y) {
    if(typeof t.__proto__ !== "undefined" && isT(x)) { return x; }
    var sx = size(x), sy = (typeof y === "undefined")?undefined:size(y),i;
    checkTensor(x,sx);
    if(typeof y !== "undefined") {
        checkTensor(y,sy);
        if(!samev(sx,sy)) { throw new Error("The real and imaginary parts must be tensors of the same dimensions");} 
    }
    if(typeof y !== "undefined") { return mkT(sx,mkv(x),mkv(y)); }
    else { return mkT(sx,mkv(x)); }
}
expo(t);

var i = t(0,1);
exports.i = i;

/**
     * Deep copy of a tensor
     * 
     * @example
> numeric.copy(numeric.t(0))
t(0)
> var foo = numeric.t([1,2],[3,4]), bar = numeric.copy(foo); bar.s[0]=0; bar.x[0]=0; bar.y[0]=0; foo
t([1,2],
  [3,4])
     */
function copy(x) {
    x = t(x);
    if(typeof x.y === "undefined") { return mkT(x.s.slice(0),x.x.slice(0)); }
    return mkT(x.s.slice(0),x.x.slice(0),x.y.slice(0));
}
expo(copy);

function mkf(x) {
    var foo;
    if(x.length === 1) {
        foo = x[0];
        return function(i) { return foo; }
    }
    return function(i) { return x[i]; }
}
function mka(n,v) {
    var ret = [],i;
    for(i=0;i<n;i++) { ret[i] = v; }
    return ret;
}

/**
 * The vec function returns a vector representation of a tensor.
 * 
 * @example
> numeric.vec([[1,2],[3,4]])
t([1,2,3,4])
 */
function vec(v) {
    v = t(v);
    if(typeof v.y === "undefined") { return mkT([v.x.length],v.x); }
    return mkT([v.x.length],v.x,v.y);
}
expo(vec);

/**
     * Reshapes a tensor.
     * 
     * @example
> numeric.reshape([[1,2],[3,4]],[4])
t([1,2,3,4])
> numeric.reshape(numeric.t([1,2],[3,4]),[2,1])
t([[1],[2]],[[3],[4]])
     */
function reshape(v,s) {
    v = t(v);
    s = V(t(s));
    var m = 1, i;
    for(i=0;i<s.x.length;i++) { m *= s.x[i]; }
    if(m !== v.x.length) { throw new Error("reshaped tensor must have the same number of entries as the input tensor"); }
    if(typeof v.y === "undefined") { return mkT(s.x,v.x); }
    return mkT(s.x,v.x,v.y);
}
expo(reshape);

function M(z) { if(!isM(z)) { throw new Error("Parameter must be a matrix"); } return z;}

/**
 * Sums all the entries
 * 
 * @example
> numeric.sum([1,2,3]);
t(6)
> numeric.sum(numeric.t([1,2],[3,4]))
t(3,7)
 * @param v
 * @returns
 */
function sum(v) {
    v = t(v);
    var i, x0=v.x, x1=0, n=v.s[0];
    for(i=0;i<n;i++) x1 += x0[i];
    if(typeof v.y === "undefined") { return mkT([],[x1]); }
    var y0=v.y, y1=0;
    for(i=0;i<n;i++) y1 += y0[i];
    return mkT([],[x1],[y1]);
}
expo(sum);

/**
 * Multiplies all the entries
 * 
 * @example
> numeric.prod([1,2,3]);
t(6)
> numeric.prod(numeric.t([1,2],[3,4]))
t(-10,10)
 * @param v
 * @returns
 */
function prod(v) {
    v = t(v);
    var i, x0=v.x, x1=1, n=v.s[0];
    if(typeof v.y === "undefined") { 
        for(i=0;i<n;i++) x1 *= x0[i];
        return mkT([],[x1]);
    }
    var y0=v.y, y1=0, foo;
    for(i=0;i<n;i++) {
        foo = x1*x0[i] - y1*y0[i];
        y1 = x1*y0[i] + y1*x0[i];
        x1 = foo;
    }
    return mkT([],[x1],[y1]);
}
expo(prod);

/**
     * The imaginary part of x.
     * 
     * @example
> numeric.imag(1) 
t(0)
> numeric.imag(numeric.t(2,3))
t(3)
> numeric.imag(numeric.t([2,3],[4,5]))
t([4,5])
     */
function imag(x) {
    x = t(x);
    if(typeof x.y === "undefined") {
        return mkT(x.s,mka(x.x.length,0));
    }
    return mkT(x.s,x.y);
}
expo(imag);

/**
     * The root-mean-square norm of v.
     * 
     * @example
> numeric.norm2([3,4])
t(5)
> numeric.norm2(numeric.t(3,4))
t(5)
> numeric.norm2([[1,2],[3,4]])
t(5.477)
     */
function norm2(v) {
    v = t(v);
    var ret=0;
    var i, n=v.x.length, foo = v.x;
    for(i=0;i<n;i++) { ret += foo[i]*foo[i]; }
    if(typeof v.y === "undefined") { return t(Math.sqrt(ret)); }
    foo = v.y;
    for(i=0;i<n;i++) { ret += foo[i]*foo[i]; }
    return t(Math.sqrt(ret));
}
expo(norm2);

function house(x) {
    x = t(x);
    var foo = abs(x(0)), alpha;
    if(foo.x[0] === 0) { alpha = 1; }
    else { alpha = mul(div(conj(x(0)),foo),norm2(x)); }
    var v = copy(x);
    set(v,0,add(v(0),alpha));
    foo = norm2(v);
    if(foo.x[0] === 0) { foo = 1; }
    v = div(v,foo);
    var w = dot(conj(x),v);
    if(abs(w).x[0] === 0) { w = t(0); }
    else { w = add(div(w,conj(w)),1); }
    return [v,w];
}


function shift(a,b,c,d) {
    var disc = mul(sqrt(add(mul(sub(a,d),sub(a,d)),mul(b,c,4))),0.5),
        rp = mul(add(a,d),0.5),
        z1 = add(rp,disc), z2 = sub(rp,disc);
    if(abs(sub(z1,d)) < abs(sub(z2,d))) { return z1; }
    return z2;
}

function qrstep(x,q) {
    var i,j, m=x.s[0], n=x.s[1], s, foo;
    var idx;
    i = 0;
    idx = run(i,n);
    foo = x(idx,i);
    set(foo,i,sub(foo(i),shift(x(m-2,n-2),x(m-2,n-1),x(m-1,n-2),x(m-1,n-1))));
    foo = house(foo);
    var v = foo[0], w = foo[1];
    set(x,idx,null,sub(x(idx,null),mul(w,tensor(v,dot(conj(v),x(idx,null))))));
    set(x,null,idx,sub(x(null,idx),mul(conj(w),tensor(dot(x(null,idx),v),conj(v)))));
    set(q,idx,null,sub(q(idx,null),mul(w,tensor(v,dot(conj(v),q(idx,null))))));
    for(i=0;i<n-2;i++) {
        for(s=m;s>0;s--) { if(!same(x(s-1,i),t(0))) { break; } }
        idx = run(i+1,s);
        
        foo = house(x(idx,i));
        v = foo[0]; w = foo[1];
        if(w!==0) {
            set(x,idx,null,sub(x(idx,null),mul(w,tensor(v,dot(conj(v),x(idx,null))))));
            set(x,null,idx,sub(x(null,idx),mul(conj(w),tensor(dot(x(null,idx),v),conj(v)))));
            set(q,idx,null,sub(q(idx,null),mul(w,tensor(v,dot(conj(v),q(idx,null))))));
            idx = run(i+2,m);
            set(x,idx,i,rep(m-i-2,0));
        }
    }
    return [x,q];
}
/**
     * Concatenate vectors
     * 
     * @example
> numeric.cat([1,2],[3,4])
t([1,2,3,4])
> numeric.cat(numeric.t([1,2],[3,4]),numeric.t([5,6],[7,8]))
t([1,2,5,6],[3,4,7,8])
     */
function cat() {
    var i, j, x = [], y, foo, fx,fy,count;

    count = 0;
    for(i=0;i<arguments.length;i++) {
        foo = V(t(arguments[i]));
        fx = foo.x;
        if(typeof foo.y === "undefined") {
            if(typeof y === "undefined") {
                for(j=0;j<fx.length;j++) {
                    x[count] = fx[j];
                    count++;
                } 
            } else {
                for(j=0;j<fx.length;j++) {
                    x[count] = fx[j];
                    y[count] = 0;
                    count++;
                }
            }
        } else {
            if(typeof y === "undefined") {
                y = [];
                for(j=0;j<x.length;j++) { y[j] = 0; }
            }
            fy = foo.y;
            for(j=0;j<fx.length;j++) {
                x[count] = fx[j];
                y[count] = fy[j];
                count++;
            }
        }
    }
    if(typeof y === "undefined") { return mkT([count],x); }
    return mkT([count],x,y);
}
expo(cat);

function getDiag(z) {
    z = M(t(z));
    var m = z.s[0], n = z.s[1], p = Math.min(m,n), i, cursor=0, x = [], y, zx = z.x, zy = z.y;
    if(typeof zy === "undefined") {
        for(i=0;i<p;i++) {
            x[i] = zx[cursor];
            cursor += n+1;
        }
        return mkT([p],x);
    }
    y = [];
    for(i=0;i<p;i++) {
        x[i] = zx[cursor];
        y[i] = zy[cursor];
        cursor += n+1;
    }
    return mkT([p],x,y);
}
expo(getDiag);

/**
     * Returns a random tensor of the given size
     * 
<pre >
> numeric.random(3)
t([0.4634,0.5045,0.9151])
> numeric.random(2,3)
t([[0.1842,0.6654,0.2150],[0.7031,0.5135,0.6912]])
> numeric.random()
t(0.8617)
</pre>
     */
function random() {
    var s = Array.prototype.slice.apply(arguments,[0]);
    var i,n = 1;
    for(i=0;i<s.length;i++) { n*=s[i]; }
    var x = [];
    for(i=0;i<n;i++) { x[i] = Math.random(); }
    return mkT(s,x);
}
expo(random);

/**
     * Returns the lower triangular portion of a matrix.
     * 
     * @example
> numeric.lower([[1,2,3,4],[4,5,6,7],[7,8,9,3]])
t([[1,0,0,0],
   [4,5,0,0],
   [7,8,9,0]])
> numeric.lower([[1,2,3,4],[4,5,6,7],[7,8,9,3]],-1)
t([[0,0,0,0],
   [4,0,0,0],
   [7,8,0,0]])
     */
function lower(A,k) {
    A = M(t(A));
    var i,j, m = A.s[0], n = A.s[1], ret = rep(m,n,0);
    if(typeof k === "undefined") { k = 0; }
    for(i=0;i<m;i++) {
        for(j=0;j<=Math.min(i+k,n-1);j++) {
            set(ret,i,j,A(i,j));
        }
    }
    return ret;
}
expo(lower);
/**
     * Returns the lower triangular portion of a matrix.
     * 
     * @example
> numeric.upper([[1,2,3,4],[4,5,6,7],[7,8,9,3]])
t([[1,2,3,4],
   [0,5,6,7],
   [0,0,9,3]])
> numeric.upper([[1,2,3,4],[4,5,6,7],[7,8,9,3]],-1)
t([[1,2,3,4],
   [4,5,6,7],
   [0,8,9,3]])
     */
function upper(A,k) {
    A = M(t(A));
    var i,j, m = A.s[0], n = A.s[1], ret = rep(m,n,0);
    if(typeof k === "undefined") { k = 0; }
    for(i=0;i<m;i++) {
        for(j=Math.max(i+k,0);j<n;j++) {
            set(ret,i,j,A(i,j));
        }
    }
    return ret;
}
expo(upper);

/**
     * Sorts a vector.
     * 
     * @example
> numeric.sortVector([3,1,4,2,7])
t([1,2,3,4,7])
     */
function sortVector(z) {
    z = V(t(z));
    var o = [], i, x = z.x, y = z.y;
    for(i=0;i<z.x.length;i++) { o[i] = i; }
    o.sort(typeof z.y === "undefined"?
            function (a,b) { return x[a] - x[b]; }:
            function (a,b) { if(x[a] > x[b]) return 1; if(x[a] < x[b]) return -1; return y[a]-y[b]; });
    return z(o);
}
expo(sortVector);

/**
 * Assembles a block tensor
 * 
 * @example
> numeric.block([2,3],[[1,2],[3,4]],[[5],[5.5]],[[6,7,8],[9,10,11]],[[12,13]],[[14]],[[15,16,17]])
t([[1, 2, 5,  6, 7, 8 ],
   [3, 4, 5.5,9, 10,11],
   [12,13,14, 15,16,17]])
 * @returns {Array}
 */
function block() {
    var z = arguments;
    var n = z.length;
    var s = V(R(t(z[0])));
    var params = [];
    var count = 1;
    var sx = s.x;
    var sizes = [],idx = [], total = [];
    var muls = [];
    var i,j, foo, ret, count = 1;
    function f(k) {
        if(k === sx.length) {
            params[k] = z[count];
            ret.apply(this,params);
            count++;
            return;
        }
        var i;
        for(i=0;i<sx[k];i++) {
            params[k] = idx[k][i];
            f(k+1);
        }
    }
    if(prod(s).x[0] !== n-1) { throw new Error("block: number of blocks must match the size"); }
    for(i=1;i<z.length;i++) { 
        z[i] = t(z[i]);
        if(z[i].s.length !== z[1].s.length) {
            throw new Error("block: all blocks must have the same tensor order");
        }
    }
    muls[sx.length-1] = 1; 
    for(i=sx.length-1;i>0;i--) {
        muls[i-1] = muls[i] * sx[i];
    }
    for(i=0;i<sx.length;i++) {
        sizes[i] = [];
        idx[i] = [];
        foo = 0;
        for(j=0;j<sx[i];j++) {
            sizes[i][j] = z[1+j*muls[i]].s[i];
            idx[i][j] = run(foo,foo+sizes[i][j]);
            foo += sizes[i][j];
        }
        total[i] = foo;
    }
    total[i] = 0;
    ret = rep.apply(this,total);
    f(0);
    return ret;
}
expo(block);
}( typeof exports === 'undefined' ? this.numeric = {} : exports));

