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
import {fromLonLat, toLonLat, transformExtent} from 'ol/proj';

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
		bound: {
			type: Array,
			default: null
		},
		nodrag: Boolean,
		isVisible: {
			type: Boolean,
			default: true
		},
		wrap: {
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
		var maxExtent = undefined;
		if(!this.wrap)
			maxExtent = transformExtent([-180,-90,180,90], 'EPSG:4326', 'EPSG:3857');
		this.olmap = new Map({
			target: this.$el,
			loadTilesWhileAnimating: true,
			layers: [
				new Tile({
					source: new OSM({wrapX: this.wrap}),
					extent: maxExtent
				})
			],
			view: new View({
				center: fromLonLat(this.center),
				zoom: this.zoom,
				extent: maxExtent
			})
		});

		// http://openlayers.org/en/latest/apidoc/ol.Map.html#on
		this.olmap.on("moveend", ev => {
			var extent = this.olmap.getView().calculateExtent(this.olmap.getSize());
			extent = transformExtent(extent,'EPSG:3857','EPSG:4326');
			// floating openlayer event to inside the vue's ViewModel
			const center = ev.map.getView().getCenter();
			const zoom = ev.map.getView().getZoom();
			const lonlat = toLonLat(center);
			this.$emit("moveend", ev, lonlat, zoom, extent);
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
		
		this.$on("addoverlay", o => this.olmap.addOverlay(o.overlay));

		this.$on("removeoverlay", o => this.olmap.removeOverlay(o.overlay));
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
		bound(val) {
			if(val != null)
				this.olmap.getView().fit(transformExtent(val, 'EPSG:4326', 'EPSG:3857'), this.olmap.getSize());
		},
		nodrag(val) {
			this.enabledisabledragzoom();
		},
		isVisible(val) {
			if(val)
			{
				const vm = this;
				
				setTimeout(updateSize, 0);
				
				// Realiza un updateSize si es necesario.
				function updateSize()
				{
					var mapDom = document.getElementById('idMapa');
					
					// Obtengo los divs.
					var divs = mapDom.getElementsByTagName("DIV");
					
					// Para cada div.
					for(var i=0; i<divs.length; i++)
					{
						// Obtengo canvas.
						var canvas = divs[i].getElementsByTagName("CANVAS");

						// Si es display none hago updateSize.
						if(canvas.length > 0 && canvas[0].style.display == "none")
						{
							vm.olmap.updateSize();
							setTimeout(updateSize, 150);
						}
					}
				}
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
