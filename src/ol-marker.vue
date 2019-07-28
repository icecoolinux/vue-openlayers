<!-- ol-marker.vue -->
<template>
  <div>
    <slot></slot>
  </div>
</template>
<script>
import {Feature} from 'ol';
import {Point, Circle} from 'ol/geom';
import {fromLonLat} from 'ol/proj.js';
import {Icon, Fill, Stroke, Style, Circle as CircleStyle, Text} from 'ol/style';
import {Vector} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';

export default {
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
			zIndex: {
				type: Number,
				default: 0
			},
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
			},
			wrap: {
				type: Boolean,
				default: true
			}
		},
		data() {
			return {
				feature: null,
				featureAccuracy: null,
				style: null,
				vectorSource: null,
				vectorLayer: null,
				styleAccuracy: null,
				vectorSourceAccuracy: null,
				vectorLayerAccuracy: null
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
				this.style.setImage(new Icon({
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
				this.styleAccuracy.setFill(new Fill({
					color: val
				}));
				this.featureAccuracy.setStyle(this.styleAccuracy);
			},
			accuracyStrokeColor(val) {
				this.styleAccuracy.setStroke(new Stroke({
					color: val,
					width: 1
				}));
				this.featureAccuracy.setStyle(this.styleAccuracy);
			}
		},
		mounted() {
			// http://openlayers.org/en/latest/examples/icon-color.html?q=feature
			
			// Marker
			this.feature = new Feature({
				geometry: new Point(fromLonLat(this.coords))
			});
			this.feature.vueComponent = this;
			if (this.src) {
				this.style = new Style({
					image: new Icon({
							src: this.src,
							anchor: this.anchor,
							scale: this.scale
						}),
					text: this.getTextStyle()
				});
			}
			else {
				this.style = new Style({
					image: new CircleStyle({
							radius: this.markerradius,
							snapToPixel: false,
							fill: new Fill({ color: 'blue' }),
							stroke: new Stroke({
								color: 'white', width: 2
							})
						}),
					text: this.getTextStyle()
				});
			}
			this.feature.setStyle(this.style);
			
			this.vectorSource = new Vector({
				features: [this.feature],
				wrapX: this.wrap
			});
			this.vectorLayer = new VectorLayer({
				source: this.vectorSource
			});
			this.vectorLayer.setZIndex(101+this.zIndex);
			
			
			// Accuracy
			this.featureAccuracy = new Feature({
				geometry: new Circle(fromLonLat(this.coords), this.accuracy)
			});
			this.featureAccuracy.vueComponent = this;
			this.styleAccuracy = new Style({
				stroke: new Stroke({
					color: this.accuracyStrokeColor,
					width: 1
				}),
				fill: new Fill({
					color: this.accuracyFillColor
				}),
				zIndex: 50
			});
			this.featureAccuracy.setStyle(this.styleAccuracy);
			
			this.vectorSourceAccuracy = new Vector({
				features: [this.featureAccuracy],
				wrapX: this.wrap
			});
			this.vectorLayerAccuracy = new VectorLayer({
				source: this.vectorSourceAccuracy
			});
			this.vectorLayerAccuracy.setZIndex(100);
			
			// tell papa to create me
			this.$nextTick(t => this.getParent().$emit("addmarker", this));
		},
		beforeDestroy() {
			// ask for destruction
			this.$nextTick(t => this.getParent().$emit("removemarker", this));
		},
		methods: {
			getTextStyle: function() {
				return new Text({
						font: '16px Calibri,sans-serif',
						fill: new Fill({ color: '#000' }),
						stroke: new Stroke({
							color: '#fff', width: 2
						}),
						text: this.label,
						offsetX: this.labelx,
						offsetY: this.labely
					});
			},
			update: function(position, radius) {
				this.featureAccuracy.setGeometry(new Circle(fromLonLat(position), radius));
				this.feature.setGeometry(new Point(fromLonLat(position)));
				this.$emit("newcoords", position);
			},
			getParent: function()
			{
				var par = this;
				while(par.$parent != null && !par.hasOwnProperty("olmap"))
					par = par.$parent;
				return par;
			}
		}
	};
</script>
<style>
/* TODO vale expor a complexidade das 'features' do openlayer aqui? */
</style>
