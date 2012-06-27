function resetDollarT(){
    $.t = null;
}
test("sync init", function() {
    var o = {
        lang : 'testlang',
        async:false
    };
    var arewesync = false;
    $.jsperanto.init(function(){
        arewesync = true;
    },o);
    ok(arewesync,"init is syncronous");
    equals($.t('product.name'),"jsperanto");
    resetDollarT();
});

test("async init", function() {
    var o = {
        lang : 'testlang'
    };
    var arewesync = false;
    $.jsperanto.init(function(){
        arewesync = true;
        resetDollarT();
    },o);
    ok(arewesync === false,"init is asyncronous");
    try{
        $.t('product.name');
    }catch(e){
        ok(true,"$.t does not exist");
    }
});

test("translation", function() {
    expect(28);
    var o = {
        lang : 'testlang'
    };
    stop();
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
        resetDollarT();
    },o);
    
    o = {
        lang : 'testlang',
        getSuffixMethod : function(count){
            if ( count == 0 ) {
                return "_zero";
            }
            if ( count != 1 ) {
                return "_plural";
            }
        }
    };
    $.jsperanto.init(function(t){
        equals(t('countCustomSuffix',{count:0}),"I have exactly zero. The count is 0");
        equals(t('countCustomSuffix',{count:0.5}),"I have many. The count is 0.5");
        equals(t('countCustomSuffix',{count:1}),"I have exactly one. The count is 1");
        equals(t('countCustomSuffix',{count:3}),"I have many. The count is 3");
        equals(t('countCustomSuffix',{count:-1}),"I have many. The count is -1");
        equals(t('countCustomSuffix',{count:"0"}),"I have exactly zero. The count is 0");
        equals(t('countCustomSuffix',{count:"string"}),"I have many. The count is string");
        equals(t('countCustomSuffix',{count:"1"}),"I have exactly one. The count is 1");
        equals(t('countCustomSuffix',{count:"01"}),"I have exactly one. The count is 01");
        start();
        resetDollarT();
    },o);
});


//TODO test more init options