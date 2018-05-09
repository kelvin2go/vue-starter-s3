<template>
  <div class="gmap">
    <GmapMap
      ref="mapRef"
      style="min-width: 360px; min-height: 361px; width: 100%; height: 100%;"
      :center="center"
      :options="{gestureHandling: gesture}"
      >
    >
      <GmapMarker
        :key="index"
        v-for="(m, index) in markers"
        :position="m.position"
        :draggable="false"
        :icon="m.icon"
      />
    </GmapMap>
  </div>
</template>

<script>
export default {
  props: ['markers'],
  data: () => {
    return {
      gesture: 'greedy',
      bounds: null,
      changed: false,
      timer: null
    }
  },
  mounted () {
    // console.log(this.$refs.mapRef.$el.offsetWidth)
    if (this.$refs.mapRef && this.$refs.mapRef.$el.offsetWidth >= 960) {
      this.gesture = 'cooperative'
    }

    this.$refs.mapRef.$mapPromise.then(() => {
      let bounds = new window.google.maps.LatLngBounds()
      this.markers.forEach(function (marker) {
        bounds.extend({
          lat: marker.position.lat,
          lng: marker.position.lng
        })
      })
      this.bounds = bounds
      this.$refs.mapRef.fitBounds(bounds)
      this.$refs.mapRef.panToBounds(bounds)
    })
  },
  computed: {
    center: function () {
      // console.log(this.markers)
      let { lat, lng } = { lat: 22.0, lng: 114 }
      if (this.markers.length > 0) {
        lat = this.markers.reduce((sum, elem) => {
          return sum + elem.position.lat
        }, 0) / this.markers.length
        lng = this.markers.reduce((sum, elem) => {
          return sum + elem.position.lng
        }, 0) / this.markers.length
      }
      lat += 0.0004
      // console.log({lat, lng})
      return { lat, lng }
    }
  },
  methods: {
    setOrigin: function (e) {
      if (this.changed) {
        if (this.timer) {
          clearTimeout(this.timer)
        }
        let that = this
        this.timer = setTimeout((bounds) => {
          this.$refs.mapRef.fitBounds(bounds)
          this.$refs.mapRef.panToBounds(bounds)
          that.changed = false
          that.timer = null
        }, 2000, this.bounds)
      }
    }
  }
}
</script>

<style lang="scss">
.gmap {
  position: fixed;
  width: 100%;
  height: 361px;

  a[href^="http://maps.google.com/maps"]{display:none !important}
  a[href^="https://maps.google.com/maps"]{display:none !important}

  .gmnoprint a, .gmnoprint span, .gm-style-cc {
    display:none;
  }

  .gmnoprint div {
    background:none !important;
    display: none;
  }

  button[title^="Toggle fullscreen view"]{
    display: none;
  }
  .gm-svpc{
    display: none !important;
  }

  @media (min-width: 960px) {
    .vue-map-container {
      min-width: 960px;
      min-height: 600px !important;
      max-width: 960px;

      .gmnoprint.gm-bundled-control div {
        background: rgba(255,255,255,1) !important;
        display: block;
      }
    }
  }
}
</style>
