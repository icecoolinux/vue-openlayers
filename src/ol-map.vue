<!-- ol-map.vue -->
<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>

import {Map} from 'ol';
import {Tile} from 'ol/layer';
import {OSM} from 'ol/source';
import {View} from 'ol';
import {fromLonLat, toLonLat} from 'ol/proj';

export default {
  name: "OLMap",
  props: {
    autoCenter: Boolean,
    center: {
      type: Array,
      default: _ => [-38.5431, -3.71722]
    },
    zoom: {
      type: [Number, String],
      default: 13
    },
    nodrag: Boolean,
	isVisible: {
		type: Boolean,
		default: true
	}
  },
  data() {
    return {
      olmap: null
    };
  },
  mounted() {
    this.$el.style.overflow = "hidden";
    this.olmap = new Map({
      target: this.$el,
      loadTilesWhileAnimating: true,
      layers: [
        new Tile({
          source: new OSM()
        })
      ],
      view: new View({
        center: fromLonLat(this.center),
        zoom: this.zoom
      })
    });

    // http://openlayers.org/en/latest/apidoc/ol.Map.html#on
    this.olmap.on("moveend", ev => {
      // floating openlayer event to inside the vue's ViewModel
      const center = ev.map.getView().getCenter();
      const zoom = ev.map.getView().getZoom();
      const lonlat = toLonLat(center);
      this.$emit("moveend", ev, lonlat, zoom);
    });

    this.olmap.on("pointerdrag", ev => {
      const feature = this.olmap.forEachFeatureAtPixel(ev.pixel, feature => feature);
      const center = ev.map.getView().getCenter();
      const zoom = ev.map.getView().getZoom();
      const lonlat = toLonLat(center);
      this.$emit("pointerdrag", ev, lonlat, zoom, feature);
    });

    this.olmap.on("click", ev => {
      // console.log(ev.pixel)
      const feature = this.olmap.forEachFeatureAtPixel(ev.pixel, feature => feature);
      if (feature)
        this.$emit("selfeature", feature);
      this.$emit("click", ev, feature);

    });

    if (this.autoCenter)
      this.autocenter();

    if (this.nodrag)
      this.enabledisabledragzoom();

    this.$on("addmarker", function(m){ this.olmap.addLayer(m.vectorLayerAccuracy); this.olmap.addLayer(m.vectorLayer); });

    this.$on("removemarker", function(m){ this.olmap.removeLayer(m.vectorLayerAccuracy); this.olmap.removeLayer(m.vectorLayer); });

    this.$on("addballoon", b => this.olmap.addLayer(b.vectorLayer));

    this.$on("removeballoon", b => this.olmap.removeLayer(b.vectorLayer));
  },
  watch: {
    center(val) {
      this.olmap.getView().setCenter(fromLonLat(val));
    },
    autoCenter(val) {
      if (val)
        this.autocenter();
    },
    zoom(val) {
      this.olmap.getView().setZoom(val);
    },
    nodrag(val) {
      this.enabledisabledragzoom();
    },
	isVisible(val) {
		if(val)
		{
			const vm = this;
			setTimeout(function(){ vm.olmap.updateSize(); }, 300);
		}
	}
  },
  methods: {
    autocenter() {
      if ("geolocation" in navigator) {
        /* geolocation is available */
        navigator.geolocation.getCurrentPosition(pos => {
          if (this.autoCenter) {
            this.setcenter([pos.coords.longitude, pos.coords.latitude]);
          }
        }, (err) => {
          console.log(err);
        });
      }
    },
    setcenter(latlng) {
      this.center[0] = latlng[0];
      this.center[1] = latlng[1];
      this.olmap.getView().setCenter(fromLonLat(this.center));
    },
    enabledisabledragzoom() {
      this.olmap.getInteractions().forEach(e => {
        e.setActive(!this.nodrag);
      });
    }
  }
};
</script>

<style>

</style>
