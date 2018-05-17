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
			accuracy: {
				type: Number,
				default: 1
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
			scale: Number,
			accuracyFillColor: {
				type: String,
				default: "rgba(255, 255, 255, 0.3)"
			},
			accuracyStrokeColor: {
				type: String,
				default: "rgba(0, 0, 255, 0.7)"
			}
		},
		data() {
			return {
				feature: null,
				featureAccuracy: null,
				style: null,
				styleAccuracy: null,
				vectorSource: null,
				vectorLayer: null
			};
		},
		watch: {
			coords(val) {
				this.update(val, this.accuracy);
			},
			accuracy(val) {
				this.update(this.coords, val);
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
			},
			accuracyFillColor(val) {
				this.styleAccuracy.setFill(new ol.style.Fill({
					color: val
				}));
				this.featureAccuracy.setStyle(this.styleAccuracy);
			},
			accuracyStrokeColor(val) {
				this.styleAccuracy.setStroke(new ol.style.Stroke({
					color: val,
					width: 1
				}));
				this.featureAccuracy.setStyle(this.styleAccuracy);
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
			
			this.featureAccuracy = new ol.Feature({
				geometry: new ol.geom.Circle(ol.proj.fromLonLat(this.coords), this.accuracy)
			});
			this.featureAccuracy.vueComponent = this;
			this.styleAccuracy = new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: this.accuracyStrokeColor,
					width: 1
				}),
				fill: new ol.style.Fill({
					color: this.accuracyFillColor
				})
			});
			this.featureAccuracy.setStyle(this.styleAccuracy);
			
			this.vectorSource = new ol.source.Vector({
				features: [this.feature, this.featureAccuracy]
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
			},
			update: function(position, radius) {
				this.featureAccuracy.setGeometry(new ol.geom.Circle(ol.proj.fromLonLat(position), radius));
				this.feature.setGeometry(new ol.geom.Point(ol.proj.fromLonLat(position)));
				this.$emit("newcoords", position);
			}
		}
	};
</script>
<style>
/* TODO vale expor a complexidade das 'features' do openlayer aqui? */
</style>
