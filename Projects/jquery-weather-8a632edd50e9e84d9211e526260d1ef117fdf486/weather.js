/*! another AMD compatible weather plugin - v0.2.2 - 2013-05-14
* Copyright (c) 2013 Dan Heberden; Licensed MIT */
(function(window) {
 
  // ends up symbols[code] === symbol
  //         levels[code] === heavy|light
  var symbols = [];
  var levels = [];

  var symbolMap = {
    ":(": [0,1,2],
    "☈": [3,4,37,38,39,45,47],
    "☀": [32,36],
    "☁": [26,27,28,29,30,44],
    "☂": [5,6,9,10,11,12,14,35,40,42,45,47],
    "❄": [5,6,7,8,13,14,15,16,17,18,35,41,42,43,46],
    "☼": [25,31,33,34],
    "≈": [20,21,22,23,24],
    ":::": [19],
    "☰": [15,24],
    "¯\\_(ツ)_/¯": [3200]
  };
  var levelMap = {
    light: [9,13,14,29,30,37,38,30,40,42,44],
    heavy: [0,2,3,11,12,15,16,24,26,36,41]
  };
  
  var codes, i;
  for (var symbol in symbolMap) {
    codes = symbolMap[symbol];
    for (i = 0; i < codes.length; i++ ) {
      var code = codes[i];
      if ( !symbols[code] ) {
        symbols[code] = [];
      }
      symbols[code].push(symbol);
    }
  }
  for (var level in levelMap) {
    codes = levelMap[level];
    for (i = 0; i < codes.length; i++ ) {
      levels[codes[i]] = level;
    }
  }

  function Weather($) {
    var weather = function(locale, hollaback) {

      var process = $.Deferred();
      var processPromise = process.promise();

      // latitude/longitude
      if ($.type(locale) === 'array') {
        processPromise = processPromise.then(function() {
          return $.ajax({
            url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng=' + locale.join(',') + '&sensor=false'
          }).then(function(geoData) {
            var results = geoData && geoData.results[0] && geoData.results[0].address_components;
            var zip;
            $.each(results, function(i, result) {
              if (result.types && result.types[0] === 'postal_code') {
                zip = result.short_name;
              }
            });
            if (zip) {
              return $.Deferred().resolve(zip);
            }
            return $.Deferred().reject('no zip found');
          });
        });
        process.resolve();
      } else {
        process.resolve(locale);
      }

      processPromise = processPromise.then(function(locale) {
        return $.ajax({
          url: 'http://query.yahooapis.com/v1/public/yql?q=select%20item%20from%20weather.forecast%20where%20location=' + locale + '&format=json'
        });
      }, function() {
        return $.Deferred.reject('error');
      });
      processPromise.done(function(data) {
        if (data && data.query && data.query.results && data.query.results.channel && data.query.results.channel.item) {
          var item = data.query.results.channel.item;
          item.condition.symbols = symbols[item.condition.code];
          item.condition.symbolLevel = levels[item.condition.code] || 'normal';
          hollaback(null, item);
        } else {
          hollaback('no results');
        }
      }).fail(function(err) {
        hollaback(err);
      });
      return processPromise;
    };
    return weather;
  }

  if ( typeof define === "function" && define.amd) {
    define(["jquery"], function (jQuery) { 
      return new Weather(jQuery); 
    });
  } 
  // assume that jQuery is already loaded since we aren't doing async magic 
  else {
    window.weather = new Weather(jQuery);
  }
}(this));
