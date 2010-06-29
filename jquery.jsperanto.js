//jquery 1.3.2 dependencies  : $.each, $.extend, $.ajax

(function($) {
	//defaults
	var o = {};
    o.interpolationPrefix = '__';
    o.interpolationSuffix = '__';
    o.pluralSuffix = "_plural";
    o.maxRecursion = 50; //used while applying reuse of strings to avoid infinite loop
    o.reusePrefix = "$t(";
    o.reuseSuffix = ")";
    o.fallbackLang = 'en-US'; // see Language fallback section
    o.dicoPath = 'locales'; // see Dictionary section
    o.keyseparator = "."; // keys passed to $.jsperanto.translate use this separator
    o.setDollarT = true; // $.t aliases $.jsperanto.translate, nice shortcut
    o.dictionary = false; // to supply the dictionary instead of loading it using $.ajax. A (big) javascript object containing your namespaced translations
	o.lang = false; //specify a language to use
	o.pluralNotFound = ["plural_not_found_", Math.random()].join(''); // used internally by translate
	
	var dictionary = false; //not yet loaded
	var currentLang = false;
	var count_of_replacement = 0;
	
	function init(callback,options){
		$.extend(o,options);
		if(!o.lang){o.lang = detectLanguage();}
		loadDictionary(o.lang,function(loadedLang){
			currentLang = loadedLang;
			if(o.setDollarT){$.t = $.t || translate;} //shortcut
			callback(translate);
		});
	}
	
	function applyReplacement(string,replacementHash){
		$.each(replacementHash,function(key,value){
			string = string.replace([o.interpolationPrefix,key,o.interpolationSuffix].join(''),value);
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
			return (navigator.language) ? navigator.language : navigator.userLanguage;
		}else{
			return o.fallbackLang;
		}
	}
	
	function needsPlural(options){
		return (options.count && typeof options.count != 'string' && options.count > 1);
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
		
		if(needsPlural(options)){
			var optionsSansCount = $.extend({},options);
			delete optionsSansCount.count;
			optionsSansCount.defaultValue = o.pluralNotFound;
			var pluralKey = dottedkey + o.pluralSuffix;
			var translated = translate(pluralKey,optionsSansCount);
			if(translated != o.pluralNotFound){
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
			dictionary = o.dictionary;
			doneCallback(lang);
			return;
		}
		$.ajax({
			url: [o.dicoPath,"/", lang, '.json'].join(''),
			success: function(data,status,xhr){
				dictionary = data;
				doneCallback(lang);
			},
			error : function(xhr,status,error){
				if(lang != o.fallbackLang){
					loadDictionary(o.fallbackLang,doneCallback);
				}else{
					doneCallback(false);
				}
			},
			dataType: "json"
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
})(jQuery);