# vue-openlayers

- humble wrapper for the powerful openlayers map api
- demo/docs [here](https://sombriks.github.io/vue-openlayers)

# Get Started

## Install

npm install icecoolinux/vue-openlayers --save

## Usage

```javascript

// require the openlayers css
require("../node_modules/openlayers/css/ol.css");

// require vue and any other shiny library
const Vue = require('vue');
// ...
// at some point require vue-openlayers
const VueOpenLayers = require("vue-openlayers");
// ...
// then install the plugin
Vue.use(VueOpenLayers);

// done! now on your .vue documents you have the right to use <ol-map></ol-map> and <ol-marker></olmarker>
```

# Components

## ol-map

### Attributes
**zoom**: Set the zomm (1 to 19)  
**center**: Set the coordinates center array in latitude and longitude.  

      
## ol-marker

### Attributes
**coords**: The coordinates of the marker.  
**src**: The url icon image.  
**anchor**: An array with the position of the marker center, [0.5, 1] is default (center bottom).  
**scale**: Size of the marker image.  
**label**: Set text under the marker.  
**labelx**: Set the distance of label and marker in pixels.  
**labely**: Set the distance of label and marker in pixels.  
**zIndex**: Set the marker depth.  
**accuracy**: Display a circle around the marker with this radius in meters.  
**accuracyFillColor**: Accuracy circle fill color.  
**accuracyStrokeColor**: Accuracy circle stroke color.  

