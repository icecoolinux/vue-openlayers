<template>
  <div>
    <slot></slot>
  </div>
</template>
<script>

import {Overlay} from 'ol';
import {fromLonLat} from 'ol/proj';

export default {
	name: "OLOverlay",
	props: {
		coords: {
			type: Array,
			default: _ => [-38.5431, -3.71722]
		},
		balloonData: Object,
		idelement: String,
		positioning: {
			type: String,
			default: "bottom-center"
		}
	},
	data() {
		return {
			overlay: null
		};
	},
	watch: {
		coords(val) {
			this.overlay.setPosition(fromLonLat(val));
		}
	},
	mounted() {

		this.overlay = new Overlay({
			element: document.getElementById(this.idelement),
			positioning: this.positioning
			//stopEvent: false
		});
		this.overlay.setPosition(fromLonLat(this.coords));

		this.$nextTick(t => this.getParent().$emit("addoverlay", this));
	},
	beforeDestroy() {
		// ask for destruction
		this.$nextTick(t => this.getParent().$emit("removeoverlay", this));
	},
	methods: {
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
