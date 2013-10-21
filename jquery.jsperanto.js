//jquery 1.4 dependencies  : $.each, $.extend, $.ajax, $.isFunction, $.isPlainObject

// Uses CommonJS, AMD or browser globals to create a jQuery extension.
(function (factory) {
    if (typeof exports === 'object') {
        // Node/CommonJS
        factory(require('jquery'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }
}(function($) {
   
    var o = {};
    var dictionary = false; //not yet loaded
    var fallbackDictionary = false;
    var currentLang = false;
    var count_of_replacement = 0;

    
    function init(callback,options){
        options = $.isPlainObject(options) ? options : callback;
        callback = $.isFunction(callback) ? callback : function(){}; 

        $.extend(o,{
            //defaults
            interpolationPrefix : '__',
            interpolationSuffix : '__',
            pluralSuffix : '_plural',
            getSuffixMethod : function(count){ return ( count > 1 || typeof(count) == "string" )  ? o.pluralSuffix : ""; },
            maxRecursion : 50, //used while applying reuse of strings to avoid infinite loop
            reusePrefix : "$t(",
            reuseSuffix : ")",
            fallbackLang : 'en-us', // see Language fallback section
            dicoPath : 'locales', // see Dictionary section
            async : true, // might be used to force initialization, dictionary loading to be syncronous
            keyseparator : ".", // keys passed to $.jsperanttranslate use this separator
            setDollarT : true, // $.t aliases $.jsperanttranslate, nice shortcut
            dictionary : false, // to supply the dictionary instead of loading it using $.ajax. A (big) javascript object containing your namespaced translations
            lang : false, //specify a language to use
            suffixNotFound : ["suffix_not_found_", Math.random()].join('') // used internally by translate
        },options);
        if(!o.lang){o.lang = detectLanguage();}
        return loadDictionary(o.lang,function(loadedLang){
            currentLang = loadedLang;
            if(o.setDollarT){$.t = $.t || translate;} //shortcut
            if(callback) callback(translate);
        });
    }

    function applyReplacement(string,replacementHash){
        $.each(replacementHash,function(key,value){
            string = string.split([o.interpolationPrefix,key,o.interpolationSuffix].join('')).join(value);
        });
        return string;
    }

    function applyReuse(translated,options){
        while (translated.indexOf(o.reusePrefix) != -1){
            count_of_replacement++;
            if(count_of_replacement > o.maxRecursion){break;} // safety net for too much recursion
            var index_of_opening = translated.indexOf(o.reusePrefix);
            var index_of_end_of_closing = translated.indexOf(o.reuseSuffix,index_of_opening) + o.reuseSuffix.length;
            var token = translated.substring(index_of_opening,index_of_end_of_closing);
            var token_sans_symbols = token.replace(o.reusePrefix,"").replace(o.reuseSuffix,"");
            var translated_token = _translate(token_sans_symbols,options);
            translated = translated.replace(token,translated_token);
        }
        return translated;
    }
    
    function detectLanguage(){
        if(navigator){
            return navigator.language && navigator.language.toLocaleLowerCase() || navigator.userLanguage && navigator.userLanguage.toLocaleLowerCase();
        }else{
            return o.fallbackLang;
        }
    }

    function containsCount(options){
       return (typeof options.count == 'number' || typeof options.count == 'string');
    }

    function getCountSuffix(options) {
       var suffix = o.getSuffixMethod(options.count);
       return ( typeof(suffix) == "string" ) ? suffix : '';
   }

    function translate(dottedkey,options){
        count_of_replacement = 0;
        return _translate(dottedkey,options);
    }

    /*
    options.defaultValue
    options.count
    */
    function _translate(dottedkey,options){
        options = options || {};
        var notfound = options.defaultValue || dottedkey;
        if(!dictionary){return notfound;} // No dictionary to translate from

        if(containsCount(options)){
            var optionsSansCount = $.extend({},options);
            delete optionsSansCount.count;
            optionsSansCount.defaultValue = o.suffixNotFound;
            var suffixKey = dottedkey + getCountSuffix(options);
            var translated = translate(suffixKey,optionsSansCount);
            if(translated != o.suffixNotFound){
                return applyReplacement(translated,{count:options.count});//apply replacement for count only
            }// else continue translation with original/singular key
        }
        
        var keys = dottedkey.split(o.keyseparator);
        var i = 0;
        var value = dictionary;
        while(keys[i]) {
            value = value && value[keys[i]];
            i++;
        }
        if(!value && fallbackDictionary) {
            // try to find in fallback dictionary
            value = fallbackDictionary;
            i = 0;
            while(keys[i]) {
                value = value && value[keys[i]];
                i++;
            }
        }
        if(value){
            value = applyReplacement(value,options);
            value = applyReuse(value,options);
            return value;
        }else{
            return notfound;
        }
    }
    
    function loadDictionary(lang,doneCallback){
        if(o.dictionary){
            dictionary = fallbackDictionary = o.dictionary;
            doneCallback(lang);
            return;
        }

        // seems complicated to have to define deferred manually rather than 
        // pass $.ajax's to $.when, but in that case, sometimes the when's 
        // fail will trigger before both ajax's have finished and will incorrectly 
        // report the fallback as being not found.
        var dictDef = $.Deferred()
        var fallbackDef = $.Deferred()
        $.when(dictDef, fallbackDef).done(function() {
            // error from both
            if(!(dictionary || fallbackDictionary))
                return doneCallback(false);

            // if lang couldn't be found, fallback
            if(!dictionary) {
                dictionary = fallbackDictionary;
                return doneCallback(o.fallbackLang);
            }

            // if fallback lang couldn't be found, whatever
            doneCallback(lang);
        });

        $.ajax({
            url: [o.dicoPath,"/", lang, '.json'].join(''),
            async : o.async,
            dataType: "json"
        }).done(function(data, status, xhr) {
            dictionary = data;
        }).always(function() {
            dictDef.resolve();
        });
        $.ajax({
            url: [o.dicoPath,"/", o.fallbackLang, '.json'].join(''),
            async : o.async,
            dataType: "json"
        }).done(function(data, status, xhr) {
            fallbackDictionary = data;
        }).always(function() {
            fallbackDef.resolve();
        });
    }
    
    function lang(){
        return currentLang;
    }

    $.jsperanto = $.jsperanto || {
        init:init,
        t:translate,
        translate:translate,
        detectLanguage : detectLanguage,
        lang : lang
    };
}));
