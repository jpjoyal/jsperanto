asyncTest("translation", function() {
    var o = {
		lang : 'testlang'
	};
	$.jsperanto.init(function(t){
        equals(t('product.name'),"jsperanto");
        equals(t('withreuse'),"jsperanto and Home");
        equals(t('withreplacement',{year:2005}),"since 2005");
        equals(t('4.level.of.nesting'),"4 level of nesting");
        equals(t('not.existing.key',{defaultValue:"default"}),"default");
        equals(t('product.name'),"jsperanto");
        equals(t('pluralversionexist',{count:2}),"plural version of pluralversionexist");
        equals(t('pluralversionexist',{count:1}),"singular version of pluralversionexist");
        equals(t('pluralversionexist'),"singular version of pluralversionexist");
        equals(t('pluralversiondoesnotexist',{count:2}),"plural version does not exist");
        equals(t('withHTML'),"<b>this would be bold</b>");

        equals(t('count and replacement',{count:1}),"you have 1 friend");
        equals(t('count and replacement',{count:3}),"you have 3 friends");

        
		
		equals($.t('can_speak_plural',{count:'any'}),"I can speak any languages","count can be a string");
		
		equals($.t('project.size.source',{value:4,unit:"kb"}),"jsperanto is 4 kb","Interpolation variables can be a number");
		equals($.t('project.size.min',{value:1010,unit:"bytes"}),"jsperanto is 1010 bytes when minified","options are also used for nested lookup ");
		equals($.t('project.size.gzip',{value:505,unit:"bytes"}),"jsperanto is 505 bytes when minified and gzipped","options are also used for nested lookup");
		
        equals(t('not.existing.key'),"not.existing.key");
		
		t('infinite');
		equals(true,true,"recursive nested lookup should not crash");
        
		start();
    },o);
});

//TODO test options