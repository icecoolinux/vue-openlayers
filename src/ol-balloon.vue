<template>
  <div>
    <slot></slot>
  </div>
</template>
<script>

import {Feature} from 'ol';
import {Point} from 'ol/geom';
import {fromLonLat} from 'ol/proj';
import {Vector} from 'ol/source';
import {Vector as VectorLayer} from 'ol/layer';
import {Fill, Circle as CircleStyle, Stroke, Style} from 'ol/style';

export default {
	name: "OLBalloon",
	props: {
		coords: {
			type: Array,
			default: _ => [-38.5431, -3.71722]
		},
		balloonData: Object,
		anchor: {
			type: Array,
			default: _ => [0, 0]
		}
	},
	data() {
		return {
			feature: null,
			vectorLayer: null
		};
	},
	watch: {
		coords(val) {
			this.feature.setGeometry(new Point(fromLonLat(val)));
			this.updatepos();
		}
	},
	mounted() {
		// this.$el.parentElement.removeChild(this.$el)
		// this.$el.style.display="none";
		this.$el.style.position = "absolute";
		this.$el.style.zIndex = "3000";
		this.feature = new Feature({
			geometry: new Point(fromLonLat(this.coords))
		});
		this.feature.setStyle(
			new Style({
				image: new CircleStyle({
					radius: 2,
					fill: new Fill({
						color: '#00000055'
					})
				})
			}));
		this.vectorSource = new Vector({
			features: [this.feature]
		});
		this.vectorLayer = new VectorLayer({
			source: this.vectorSource
		});

		this.$nextTick(t => this.getParent().$emit("addballoon", this));

		this.vectorLayer.on("render", this.updatepos);

	},
	beforeDestroy() {
		// ask for destruction
		this.$nextTick(t => this.getParent().$emit("removeballoon", this));
	},
	methods: {
		updatepos() {
			var par = this.getParent();
			
			var pixel = null;
			if(par.hasOwnProperty("olmap") && par.olmap != null)
			{
				const geometry = this.feature.getGeometry();
				const coordinate = geometry.getCoordinates();
				pixel = par.olmap.getPixelFromCoordinate(coordinate);
			}
			
			if (!pixel) {
				this.$el.style.display = "none";
			} 
			else 
			{
				// Si no es visible el mapa espero un poco hasta que se ponga visible.
				if(par.$el.offsetHeight == 0)
					setTimeout(this.updatepos, 200);
				else
				{
					//let a = par.$el.offsetLeft;
					//let b = par.$el.offsetTop;
					let a=0;
					let b = 0;
					let x = (pixel[0] + a);
					let y = (pixel[1] + b);
					let pw = par.$el.offsetWidth + a;
					let ph = par.$el.offsetHeight + b;
					let w = this.$el.offsetWidth;
					let h = this.$el.offsetHeight;
					x -= this.anchor[0] * w;
					y -= this.anchor[1] * h;
					if ( (x-a+w) < 0 || (y-b+h) < 0 || x > pw || y > ph) {
						this.$el.style.display = "none";
					} else {
						this.$el.style.display = "";
						this.$el.style.left = x + "px";
						this.$el.style.top = y + "px";
					}
				}
			}
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
