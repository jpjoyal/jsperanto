/*!
 * jQuery jsperanto
 *
 * Copyright 2010, Jean-Philippe Joyal (http://leastusedfeature.com)
 * MIT licensed.
 * https://github.com/jpjoyal/jsperanto/blob/master/MIT-LICENSE.txt
 *
 * 4/19/11 Rewrite by Sebastien P. (twitter.com/_sebastienp)
 */


//jquery 1.3.2 dependencies  : $.each, $.extend, $.ajax

(function ($, WINDOW, FALSE) {

	"use strict";

	if ($.fn.jquery && !$.jsperanto) {

		//defaults
		var count_of_replacement = 0,
			currentLang = FALSE,
			dictionary = FALSE, // Not yet loaded
			pluralNotFound = "plural_not_found_" + WINDOW.Math.random(), // Used internally by translate

			o = {
				interpolationPrefix: "__",
				interpolationSuffix: "__",
				pluralSuffix: "_plural",
				maxRecursion: 50, // Used while applying reuse of strings to avoid infinite loop
				reusePrefix: "$t(",
				reuseSuffix: ")",
				fallbackLang: "en-us", // See Language fallback section
				dicoPath: "locales", // See Dictionary section
				keyseparator: ".", // Keys passed to $.jsperanto.translate use this separator
				setDollarT: !FALSE, // $.t aliases $.jsperanto.translate, nice shortcut
				dictionary: FALSE, // To supply the dictionary instead of loading it using $.ajax. A (big) javascript object containing your namespaced translations
				lang: FALSE // Specify a language to use
			},

			lang = function () {

				return currentLang;

			},

			detectLanguage = function () {

				var navigator_object = WINDOW.navigator;

				return (navigator_object) ? (navigator_object.language || navigator_object.userLanguage).toLowerCase() : o.fallbackLang;

			},

			translate = function (dottedkey, options) {

				count_of_replacement = 0;

				/*
				options.defaultValue
				options.count
				*/
				function real_translate(dottedkey, options) {

					!options && (options = {});

					var applyReplacement,
						count,
						i,
						index_of,
						index_of_opening,
						index_of_end_of_closing,
						keys,
						notfound = options.defaultValue || dottedkey,
						optionsSansCount,
						pluralKey,
						replace,
						token,
						token_sans_symbols,
						translated,
						value,
						value_token;

					if (dictionary) {

						replace = "replace";

						applyReplacement = function (string, replacementHash) {

							$.each(replacementHash, function (key, value) {

								string = string[replace](o.interpolationPrefix + key + o.interpolationSuffix, value);

							});

							return string;

						};

						count = "count";

						if (options[count] && (typeof options[count] !== "string") && (options[count] > 1)) { // Needs plural

							optionsSansCount = $.extend({}, options);
							delete optionsSansCount[count];

							optionsSansCount.defaultValue = pluralNotFound;
							pluralKey = dottedkey + o.pluralSuffix;
							translated = translate(pluralKey, optionsSansCount);

							if (translated !== pluralNotFound) {

								return applyReplacement(translated, { count: options[count] }); // Apply replacement for count only

							} // Else continue translation with original/singular key

						}

						keys = dottedkey.split(o.keyseparator);
						i = 0;
						value = dictionary;

				        while (keys[i]) {

				            value = value && value[keys[i]];
							i += 1;

						}

						if (value) {

							value = applyReplacement(value, options);

							index_of = "indexOf";

							while ((index_of_opening = value[index_of](o.reusePrefix)) !== -1) {

								if ((count_of_replacement += 1) > o.maxRecursion) {

									// Safety net for too much recursion
									break;

								}

								//index_of_opening = value[index_of](o.reusePrefix);
								index_of_end_of_closing = value[index_of](o.reuseSuffix, index_of_opening) + o.reuseSuffix.length;
								token = value.substring(index_of_opening, index_of_end_of_closing);
								token_sans_symbols = token[replace](o.reusePrefix, "")[replace](o.reuseSuffix, "");
								value_token = real_translate(token_sans_symbols, options);
								value = value[replace](token, value_token);

							}

							//value = applyReuse(value, options);

							return value;

						}

					}

					return notfound; // No dictionary to translate from

				}

				return real_translate(dottedkey, options);

			},

			init = function (callback, options) {

				var lang = "lang";

				$.extend(o, options);
				!o[lang] && (o[lang] = detectLanguage());

				function loadDictionary(lang, doneCallback) {

					if (o.dictionary) {

						dictionary = o.dictionary;
						doneCallback(lang);

					} else {

						$.ajax({
							cache: !FALSE,
							dataType: "json",
							url: o.dicoPath + "/" + lang + ".json",
							success: function (data) {

								dictionary = data;
								doneCallback(lang);

							},
							error : function () {

								(lang !== o.fallbackLang) ? loadDictionary(o.fallbackLang, doneCallback) : doneCallback(FALSE);

							}
						});

					}

				}

				loadDictionary(o[lang], function (loadedLang) {

					currentLang = loadedLang;
					o.setDollarT && !$.t && ($.t = translate); // Shortcut
					callback(translate);

				});

			};

		// Expose
		$.jsperanto = {
			init: init,
			t: translate,
			translate: translate,
			detectLanguage: detectLanguage,
			lang: lang
		};

	}

}(this.jQuery, this, false));