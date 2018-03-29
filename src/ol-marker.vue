<!-- ol-marker.vue -->
<template>
  <div>
    <slot></slot>
  </div>
</template>
<script>
const ol = require("openlayers");
	module.exports = {
		name: "OLMarker",
		props: {
			coords: {
				type: Array,
				default: _ => [-38.5431, -3.71722]
			},
			markerradius: {
				type: [Number, String],
				default: 12
			},
			markerData: [Object, String, Number, Function],
			src: String,
			label: {
				type: [String, Number],
				default: ""
			},
			labelx: Number,
			labely: Number,
			anchor: {
				type: Array,
				default: _ => [0.5, 1]
			},
			scale: Number
		},
		data() {
			return {
				feature: null,
				style: null,
				vectorSource: null,
				vectorLayer: null
			};
		},
		watch: {
			coords(val) {
				this.feature.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(val)));
				this.$emit("newcoords", val);
			},
			src(val) {
				this.style.setImage(new ol.style.Icon({
					src: this.src,
					anchor: this.anchor,
					scale: this.scale
				}));
				this.feature.setStyle(this.style);
				this.$emit("newmarker");
				// console.log()
				// this.style.image.src = val;
			},
			label(val) {
				this.style.setText(this.getTextStyle());
				this.feature.setStyle(this.style);
				this.$emit("newmarker");
			}
		},
		mounted() {
			// http://openlayers.org/en/latest/examples/icon-color.html?q=feature
			this.feature = new ol.Feature({
				geometry: new ol.geom.Point(ol.proj.fromLonLat(this.coords))
			});
			this.feature.vueComponent = this;
			if (this.src) {
				this.style = new ol.style.Style({
					image: new ol.style.Icon({
							src: this.src,
							anchor: this.anchor,
							scale: this.scale
						}),
					text: this.getTextStyle()
				});
			}
			else {
				this.style = new ol.style.Style({
					image: new ol.style.Circle({
							radius: this.markerradius,
							snapToPixel: false,
							fill: new ol.style.Fill({ color: 'blue' }),
							stroke: new ol.style.Stroke({
								color: 'white', width: 2
							})
						}),
					text: this.getTextStyle()
				});
			}
			this.feature.setStyle(this.style);
			this.vectorSource = new ol.source.Vector({
				features: [this.feature]
			});
			this.vectorLayer = new ol.layer.Vector({
				source: this.vectorSource
			});
			// tell papa to create me
			this.$nextTick(t => this.$parent.$emit("addmarker", this));
		},
		beforeDestroy() {
			// ask for destruction
			this.$nextTick(t => this.$parent.$emit("removemarker", this));
		},
		methods: {
			getTextStyle: function() {
				return new ol.style.Text({
						font: '16px Calibri,sans-serif',
						fill: new ol.style.Fill({ color: '#000' }),
						stroke: new ol.style.Stroke({
							color: '#fff', width: 2
						}),
						text: this.label,
						offsetX: this.labelx,
						offsetY: this.labely
					});
			}
		}
	};
</script>
<style>
/* TODO vale expor a complexidade das 'features' do openlayer aqui? */
</style>
