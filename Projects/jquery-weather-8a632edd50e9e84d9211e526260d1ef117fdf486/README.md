# Weather

Get weather from zipcode or woeid using yahoo's weather api

## Getting Started

Use [bower](http://bower.io)

```
bower install weather --save
```

#### or

Download the [production version][min] or the [development version][max].

[min]: https://raw.github.com/danheberden/jquery-weather/master/dist/weather.min.js
[max]: https://raw.github.com/danheberden/jquery-weather/master/dist/weather.js

### Using in your web page

```html
<script src="jquery.js"></script>
<script src="dist/weather.min.js"></script>
<script>
jQuery(document).ready(function($) {
  weather('02210', function(err, result) {
    if (err) {
      alert('uh oh: ' + err);
      return;
    }
    alert(result.condition.temp);
  });
});
</script>
```

### Using as an amd module

```javascript
require(["components/weather/weather"], function(result) {
  weather('02210', function(err, result) {
    if (err) {
      alert('uh oh: ' + err);
      return;
    }
    alert(result.condition.temp);
  });
});
```

## Documentation

In addition to the yahoo provided information in the returned weather object, 
the `weather.condition` object has a `symbols` array and `symbolLevel` string.
The `symbols` array is one or more unicode characters to represent the weather.
The `symbolLevel` string is either 'light', 'normal', or 'heavy' to represent
the weather symbol severity.

## Examples
_(Coming soon)_

## Release History
_(Nothing yet)_
