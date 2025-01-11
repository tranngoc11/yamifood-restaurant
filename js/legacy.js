/*!
 * Legacy browser support
 */

// Map array support
if ( ![].map ) {
    Array.prototype.map = function ( callback, self ) {
        const array = this, len = array.length, newArray = new Array( len );
        for (let i = 0; i < len; i++ ) {
            if ( i in array ) {
                newArray[ i ] = callback.call( self, array[ i ], i, array );
            }
        }
        return newArray;
    }
}


// Filter array support
if ( ![].filter ) {
    Array.prototype.filter = function( callback ) {
        if ( this == null ) throw new TypeError();
        const t = Object( this ), len = t.length >>> 0;
        if ( typeof callback != 'function' ) throw new TypeError();
        const newArray = [], thisp = arguments[ 1 ];
        for (let i = 0; i < len; i++ ) {
            if ( i in t ) {
                const val = t[ i ];
                if ( callback.call( thisp, val, i, t ) ) newArray.push( val );
            }
        }
        return newArray;
    }
}


// Index of array support
if ( ![].indexOf ) {
    Array.prototype.indexOf = function( searchElement ) {
        if ( this == null ) throw new TypeError();
        const t = Object( this ), len = t.length >>> 0;
        if ( len === 0 ) return -1;
        let n = 0;
        if ( arguments.length > 1 ) {
            n = Number( arguments[ 1 ] );
            if ( n !== n ) {
                n = 0;
            }
            else if ( n !== 0 && n !== Infinity && n !== -Infinity ) {
                n = ( n > 0 || -1 ) * Math.floor( Math.abs( n ) );
            }
        }
        if ( n >= len ) return -1;
        let k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
        for ( ; k < len; k++ ) {
            if ( k in t && t[ k ] === searchElement ) return k;
        }
        return -1;
    }
}


/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * http://blog.stevenlevithan.com/archives/cross-browser-split
 */
/*!
 * Cross-Browser Split 1.1.1
 * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
 * Available under the MIT License
 * http://blog.stevenlevithan.com/archives/cross-browser-split
 */
const nativeSplit = String.prototype.split;

// Thay đổi cách kiểm tra compatibility
const compliantExecNpcg = (() => {
    const re = /^/g;
    re.exec("");
    return !re.lastIndex;
})();

String.prototype.split = function(separator, limit) {
    let str = this;

    // Sử dụng native split cho non-regex separators
    if (Object.prototype.toString.call(separator) !== '[object RegExp]') {
        return nativeSplit.call(str, separator, limit);
    }

    let output = [];
    let flags = (separator.ignoreCase ? 'i' : '') +
        (separator.multiline ? 'm' : '') +
        (separator.sticky ? 'y' : '');
    let lastLastIndex = 0;
    let separator2, match, lastIndex, lastLength;

    // Tạo một bản sao của separator với flag global
    separator = new RegExp(separator.source, flags + 'g');
    str += ''; // Chuyển đổi thành string

    // Xử lý trường hợp không compliant
    if (!compliantExecNpcg) {
        separator2 = new RegExp('^' + separator.source + '$(?!\\s)', flags);
    }

    // Chuyển đổi limit thành số nguyên không dấu
    limit = limit === undefined ?
        Math.pow(2, 32) - 1 >>> 0
        : limit >>> 0;

    // Thực hiện split
    while (match = separator.exec(str)) {
        lastIndex = match.index + match[0].length;

        if (lastIndex > lastLastIndex) {
            output.push(str.slice(lastLastIndex, match.index));

            // Xử lý capturing groups
            if (!compliantExecNpcg && match.length > 1) {
                match[0].replace(separator2, function() {
                    for (let i = 1; i < arguments.length - 2; i++) {
                        if (arguments[i] === undefined) {
                            match[i] = undefined;
                        }
                    }
                });
            }

            // Thêm capturing groups vào output
            if (match.length > 1 && match.index < str.length) {
                Array.prototype.push.apply(output, match.slice(1).filter(x => x !== undefined));
            }

            lastLength = match[0].length;
            lastLastIndex = lastIndex;

            if (output.length >= limit) {
                break;
            }
        }

        if (separator.lastIndex === match.index) {
            separator.lastIndex++;
        }
    }

    // Xử lý phần còn lại của string
    if (lastLastIndex === str.length) {
        if (lastLength || !separator.test('')) {
            output.push('');
        }
    } else {
        output.push(str.slice(lastLastIndex));
    }

    return output.length > limit ? output.slice(0, limit) : output;
};