jsperanto
=========

Simple translation for your javascripts, yummy with your favorite templates engine like EJS.

 * Pluralization, interpolation & "nested lookup" support for your translations
 * Uses XHR to get a JSON dictionary (or load it your own way & format)
 * JSLint-ed, QUnit-ed
 * similar to Rails's i18n but sans backend needed
 * No global pollution (hides under jQuery.jsperanto)
 * Works with : IE6+, Firefox 3+, Safari 3+, Chrome, Opera 9+

Depends on jQuery 1.3.2+ (uses $.ajax, $.each, $.extend)

Usage example
=============

	$.jsperanto.init(function(t){
	    t('project.name'); //-> "jsperanto"
		$.t('project.store'); //-> "JSON"
		
		$.t('can_speak',{count:1}); //-> "I can only speak one language"
		$.t('can_speak',{count:3}); //-> "I can speak 3 languages"
		$.t('can_speak',{count:'any'}); //-> "I can speak any languages"
		
		$.t('project.size.source',{value:4,unit:"kb"}); //-> "jsperanto is 4 kb"
		$.t('project.size.min',{value:1727,unit:"bytes"}) //-> "jsperanto is 1727 bytes when minified"
		$.t('project.size.gzip',{value:833,unit:"bytes"}) //-> "jsperanto is 833 bytes when minified and gzipped"
	});

	//given this dictionary
	{
		"project" : {
			"name" : "jsperanto",
			"store" : "JSON",
			"size" : {
				"source" : "$t(project.name) is __value__ __unit__",
				"min" : "$t(project.size.source) when minified",
				"gzip" : "$t(project.size.min) and gzipped"
			}
		},
		"can_speak" : "I can only speak one language",
	 	"can_speak_aboveOne" : "I can speak __count__ languages"
	}

API
===

**$.jsperanto.init(function(t),options)**

initialize jsperanto by loading the dictionary, calling back when ready

**function(t)** :  is called once jsperanto is ready, passing the translate method ($.jsperanto.translate)

**options** extends these defaults

	o.interpolationPrefix = '__';
	o.interpolationSuffix = '__';
   o.aboveOneSuffix = '_aboveOne';
   o.exactlyOneSuffix = '_exactlyOne';
   o.belowOneSuffix = '_belowOne';
	o.maxRecursion = 50; //used while applying reuse of strings to avoid infinite loop
	o.reusePrefix = "$t("; //nested lookup prefix
	o.reuseSuffix = ")"; //nested lookup suffix
	o.fallbackLang = 'en-US'; // see Language fallback section
	o.dicoPath = 'locales'; // see Dictionary section
	o.keyseparator = "."; // keys passed to $.jsperanto.translate use this separator
	o.setDollarT = true; // $.t aliases $.jsperanto.translate, nice shortcut
	o.dictionary = false; // to supply the dictionary instead of loading it using $.ajax. A (big) javascript object containing your namespaced translations
	o.lang = false; //specify a language to use i.e en-US

Use init to switch language too :  

	$.jsperanto.init(someMethod,{lang:"fr"})

**$.jsperanto.translate(key,options)**

looks up the key in the dictionary applying plural, interpolation & nested lookup.

**key** to lookup in the dictionary, for example "register.error.email"

**options** each prop name are are used for interpolation

**options.count** special prop that indicates to retrieve the counted version (**key**_aboveOne, _exactlyOne, _belowOne). Also used for interpolation

**options.defaultValue** specify default value if the key can't be resolved (the key itself will be sent back if no defaultValue is provided)

**aliases** : $.jsperanto.t , $.t if init option _setDollarT_ is left to true.

Dictionary loading
==================

Using defaults, jsperanto uses a basic browser language detection

	(navigator.language) ? navigator.language : navigator.userLanguage

to determine what dictionary file to load. You can also instruct jsperanto to load a specific language (via init option _lang_). 

Once the language is determined, jsperanto will use $.ajax to load the dictionary using _locales/**somelang**.json_ as url. For example _locales/fr-CA.json_ is used for a french canadian browser. If the json file can't be retrieved, it will try to get the fallback language, which is 'en-US' by default. (you can change this using init option _fallbacklang_). If no dictionary file can be retrieved at all, jsperanto translate method will simply return the provided key. 

You can bypass this loading mechanism completely by providing a dictionary object to init (_options.dictionary_)

Switching language
==================

Simply use init again and specify a language (or dictionary) to use.

	$.jsperanto.init(someMethod,{lang:"fr"})

Licence
=======

MIT License

Copyright (c) 2010 Jean-Philippe Joyal, <http://leastusedfeature.wordpress.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

Inspiration & similar projects
==============================

[Rails i18n](http://guides.rubyonrails.org/i18n.html)

[Babilu](http://tore.darell.no/posts/introducing_babilu_rails_i18n_for_your_javascript)

[l10n.js](http://github.com/eligrey/l10n.js)

[javascript_i18n](http://github.com/qoobaa/javascript_i18n)	


Thanks
======

Many thanks to Radialpoint for letting me open source this work

