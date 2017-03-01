//暂时将iteratee全部都当函数处理
(function() {

	var root = this;

	var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  	var
	    push             = ArrayProto.push,
	    slice            = ArrayProto.slice,
	    toString         = ObjProto.toString,
	    hasOwnProperty   = ObjProto.hasOwnProperty;

  	var
	    nativeIsArray      = Array.isArray,
	    nativeKeys         = Object.keys,
	    nativeBind         = FuncProto.bind,
	    nativeCreate       = Object.create;

	var _ = function(obj) {
		if(obj instanceof _) return obj;
		if(!(this instanceof _)) return _(obj);
		this._wrapped = obj;
	}

	if(typeof exports !== 'undefined') {//Node.js环境下
		if(typeof module !== 'undefined' && module.exports) {
			exports = module.exports = _;
		}
		exports._ = _;
	}else {
		root._ = _;
	}

	_.VERSION = '1.7.0';

	function optimizeCb(func, context, argCount) {
		if(context === void 0) return func;
		switch(argCount == null ? 3 : argCount) {
			case 1: return function(value) {
		        return func.call(context, value);
		    };
		    case 2: return function(value, other) {
		        return func.call(context, value, other);
		    };
		    case 3: return function(value, index, collection) {
		        return func.call(context, value, index, collection);
		    };
		    case 4: return function(accumulator, value, index, collection) {
		        return func.call(context, accumulator, value, index, collection);
		    };
		}
		return function() {
			return func.apply(context, arguments);
		}
	}

	function cb(value, context, argCount) {
		//对value进行判断
		if(value == null) return _.identity;
		if(_.isFunction(value)) return optimizeCb(value, context, argCount);
		if(_.isObject(value)) return _.matches(value);//判断输出是否与改对象相等
		return _.prototype(value);
	}

	/*
		*
		_.each测试实例 
		console.log(_.map({d: {a: 1},e: {b: 2},f:{c: 3}}, function(num) { return num}));
		console.log(_.each({d: {a: 1},e: {b: 2},f:{c: 3}}, function() {}));
		console.log(_.each([{a: 1}, {b: 2}, {c: 3}], function() {}));
		console.log(_.each({a: 1, b: 2, c: 3}, function() {}));
		console.log(_.each([1, 2, 3], function() {}));

		function abc() {
			console.log(_.each(arguments, function(num){ return num * 3; }));
		}
		abc([1, 2, 3, 4]);
		* 
	*/
	_.each = _.forEach = function(obj, iteratee, context) {
		if(obj == null) return obj;
		iteratee = optimizeCb(iteratee, context);
		//得到
		//iteratee = function(value, index, collection) {
	    //    return iteratee.call(context, value, index, collection);
	    //};
	    var i, length = obj.length;
	    //数组length，+length为number
	    //对象length为undefined，+length为NaN
	    if(length === + length) {//数组或伪数组
	    	for(i = 0; i < length; i++) {
	    		iteratee(obj[i], i, obj);
	    	}
	    }else {//对象
	    	var keys = _.keys(obj);
	    	for(i = 0, length = keys.length; i < length; i++) {
	    		iteratee(obj[keys[i]], keys[i], obj);
	    	}
	    }
	    return obj;
	}

	/*
		*
		_.map测试实例 
		console.log(_.map([1, 2, 3], function(num) { return num + 1}));
		console.log(_.map({a: 1, b: 2, c: 3}, function(num) { return num + 1}));
		console.log(_.map([1, 2, 3]));
		console.log(_.map({a: 1, b: 2, c: 3}));
		console.log(_.map([1, 2, 3], [1, 2, 3]));
		console.log(_.map({a: 1, b: 2, c: 3}, {a: 1, b: 2, c: 3}));
		* 
	*/
	_.map = _.collect = function(obj, iteratee, context) {
		if(obj == null) return obj;
		iteratee = cb(iteratee, context);
		//对obj为对象还是数组做判断
		var keys = obj.length !== +obj.length && _.keys(obj);
		var length = (keys || obj).length;
		var results = Array(length);
		var currentKey;
		for(var index = 0; index < length; index++) {
			currentKey = keys ? keys[index] : index;
			results[index] = iteratee(obj[currentKey], currentKey, obj);
		}
		return results;
	}
 
 	/*
		*
		_.reduce测试实例 
		console.log(_.reduce([1, 2, 3], function(memo, num){ return memo - num; }));//-4
		* 
	*/
 	_.reduce = _.foldl = _.inject = function(obj, iteratee, memo, context) {
 		if(obj == null) return null;
 		iteratee = optimizeCb(iteratee, context, 4);
 		var keys = obj.length !== +obj.length && _.keys(obj);
 		var length = (keys || obj).length;
 		var index = 0;
 		var currentKey;
 		//无mome则使用对象第一个值
 		if(arguments.length < 3) {
 			memo = obj[keys ? keys[index++] : index++];
 		}
 		for(; index < length; index++) {
 			currentKey = keys ? keys[index] : index;
 			memo = iteratee(memo, obj[currentKey], currentKey, obj);
 		}
 		return memo;
 	}
 	/*
		*
		_.reduce测试实例 
		console.log(_.reduceRight([1, 2, 3], function(memo, num){ return memo - num; }));//0
		* 
	*/
 	_.reduceRight = _foldr = function(obj, iteratee, memo, context) {
 		if(obj == null) return [];

 		iteratee = optimizeCb(iteratee, context, 4);
 		var currentKey;
 		var length = obj.length;
		var keys = length !== +length && _.keys(obj);
		var index = (keys || obj).length;
		if(arguments.length < 3) {
			memo = obj[keys ? keys[--index] : --index];
		}
		while(index-- > 0) {
			currentKey = keys ? keys[index] : index;
			memo = iteratee(memo, obj[currentKey], currentKey, obj);
		}		
		return memo;
 	}

 	_.identity = function(value) {
 		return value;
 	}

 	//判断attrs中的值是否与传入的obj的值相等
 	_.matches = function(attrs) {
 		var pairs = _.pairs(attrs), length = pairs.length;
 		return function(value, index, obj) {
 			if(obj == null) return !length;
 			obj = new Object(obj);
 			for(var i = 0; i < length; i++) {
 				var pair = pairs[i], key = pair[0];
 				if(pair[1] !== obj[key] || !(key in obj)) return false;
 			}
 			return true;
 		}
 	}

 	//将对象{key: value, key: value}转化为[[key, value], [key, value]]的形式
 	_.pairs = function(obj) {
 		var keys = _.keys(obj);
 		var length = keys.length;
 		var pairs = Array(length);
 		for(var i = 0; i < length; i++) {
 			pairs[i] = [keys[i], obj[keys[i]]];
 		}
 		return pairs;
 	}

 	// Optimize `isFunction` if appropriate. Work around an IE 11 bug (#1621).
	// Work around a Safari 8 bug (#1929)
	// isFunction在IE11及safari 8 下的bug解决
	if (typeof /./ != 'function' && typeof Int8Array != 'object') {
	 	_.isFunction = function(obj) {
	      	return typeof obj == 'function' || false;
	    };
	}

	//对象中的属性名转化为数组返回
	_.keys = function(obj) {
		if(!_.isObject(obj)) return [];
		if(nativeKeys) return nativeKeys(obj);
		var keys = [];
		for(var key in obj) if(_.has(obj, key)) keys.push(key);

		if(hasEnumBug) collectNonEnumProps(obj, keys);
		return keys;
	}
	
	//判断对象obj中是否含有key
	_.has = function(obj, key) {
		return obj != null && hasOwnProperty.call(obj, key);
	}

	//判断是否为对象包括空对象
	//type === 'object'包括null
	//!!null排除null
	_.isObject = function(obj) {
		var type = typeof obj;
		return type === 'function' || type === 'object' && !!obj;
	}

	//AMD环境下，例require.js
	if(typeof define === 'function' && define.amd) {
		define('underscore', [], function() {
			return _;
		})
	}
	
}.call(this))