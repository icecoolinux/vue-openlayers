/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

import olMap from "./ol-map";
import olMarker from "./ol-marker";
import olBalloon from "./ol-balloon";

export default {
  install: function (Vue, options) {
    // wiring project components
    Vue.component("ol-map", olMap);
    Vue.component("ol-marker", olMarker);
    Vue.component("ol-balloon", olBalloon);
  }
};
