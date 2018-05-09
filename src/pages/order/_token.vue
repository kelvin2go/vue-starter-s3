<template>
  <v-container class="content-container" fluid light v-scroll="onScroll" ref="container" >
    <v-layout row wrap :class="{ 'max-page': maxPage, moving: moving}" v-if="loading !== true && error === null">
      <div class="overlay"></div>
      <v-toolbar class="toolbar" fix-header>
        <v-toolbar-title @click="cancelMax"> <v-icon>chevron_left</v-icon> Back</v-toolbar-title>
      </v-toolbar>
      <v-flex xs12 sm12 style="height:361px">
        <GMAP :markers="markers" />
      </v-flex>
      <div class="card-layer" ref="cardLayer" :style="{ 'top': this.positionLayer.y+'px' }" >
        <v-flex xs12 sm12 >
          <Person :person="person.courier" :actions="{showDetails: !maxPage}" v-on:clickView="scrollMax"/>
        </v-flex>
        <v-divider></v-divider>
        <v-flex xs12 sm12>
          <v-list subheader class="status-container" >
            <v-subheader>Current Status <span>Order #{{order.id}}</span></v-subheader>
            <v-list-tile>
              <v-list-tile-content v-if="latestStatus">
                <v-list-tile-title>{{orderStatus[latestStatus].title}}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <ul class="status-list">
              <template v-for="(item,index) in displayStatus">
                <li class="item done" v-if="item.time" :key="index">
                  <div class="status-icon">
                    <img src="@/assets/img/icon/tick-circle.svg">
                  </div>
                  <div class="status"> {{item.title}} <span> {{ showTime(item.time) }} </span></div>
                </li>
                <li class="item waiting" v-else :key="index">
                  <div class="status-icon">
                    <img src="@/assets/img/icon/dot.svg">
                  </div>
                  <div class="status"> {{item.title}} </div>
                </li>
              </template>
            </ul>
          </v-list>
          <div class="info-container" style="min-height: 83px">
            <v-subheader>Package</v-subheader>
            <v-list-tile class="last">
              <v-list-tile-content v-if="order.package_info">
                <v-list-tile-title>{{order.package_info.key}}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </div>

          <div class="info-container" xs12 sm12 style="min-height: 109px">
            <v-subheader>Expected Shipment Times</v-subheader>
            <v-list-tile>
              <v-list-tile-content xs12 sm12>
                <v-list-tile-title>Pick-up: {{ estTime(order.expected_pickup_time) }} </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile class="last">
              <v-list-tile-content xs12 sm12 >
                <v-list-tile-title>Delivery: {{ estTime(order.expected_delivery_time) }} </v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </div>

          <div class="info-container" xs12 sm12 style="min-height: 109px">
            <v-subheader>Pick-up From</v-subheader>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>{{ person.shipper | personAddress }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-flex xs12 sm12>
              <Person :person="person.shipper" :actions="{phone_number: person.shipper.information.phone_number !== null }" />
            </v-flex>

            <v-subheader>Deliever To</v-subheader>
            <v-list-tile>
              <v-list-tile-content v-if="person.recipient.location">
                <v-list-tile-title>{{ person.recipient | personAddress }}</v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
            <v-list-tile>
              <v-list-tile-content>
                <v-list-tile-title>{{person.recipient.information.name}} <span>({{person.recipient.information.phone_number}})</span></v-list-tile-title>
              </v-list-tile-content>
            </v-list-tile>
          </div>
        </v-flex>
      </div>
    </v-layout>
    <v-layout v-else-if="loading === true">
      <div class="loading">
        <v-progress-circular :size="70" indeterminate color="primary"></v-progress-circular>
      </div>
    </v-layout>
    <v-layout v-else>
      <div style="width: 100%;" v-if="error.error">
        <v-alert outline color="error" icon="warning" :value="true">
          {{error.error.replace(/_/g, ' ') | capitalize }}!
        </v-alert>
      </div>
    </v-layout>
  </v-container>
</template>

<script>
import GMAP from '@/components/GMap.vue'
import Person from '@/components/person.vue'
import API from '@/lib/API'

const CONFIG_POSITION = { default: 393, scrollTop: 361 }

function scrollTo (fromTop, distance, duration) {
  let initialY = fromTop ? CONFIG_POSITION.scrollTop : document.body.scrollTop
  let y = initialY + distance
  let baseY = (initialY + y) * 0.5
  let difference = initialY - baseY
  if (fromTop) {
    baseY = distance * 0.5 - 32
  }
  let startTime = performance.now()
  function step () {
    let normalizedTime = (performance.now() - startTime) / duration
    if (normalizedTime > 1) normalizedTime = 1
    let stepDist = baseY + difference * Math.cos(normalizedTime * Math.PI)
    if (fromTop) {
      stepDist = baseY - difference * Math.cos(normalizedTime * Math.PI)
    }
    window.scrollTo(0, stepDist)
    if (normalizedTime < 1) window.requestAnimationFrame(step)
  }
  window.requestAnimationFrame(step)
}

export default {
  validate ({ params }) {
    return !isNaN(+params.id)
  },
  data: () => {
    return {
      loading: true,
      error: null,
      maxPage: false,
      moving: false,
      positionLayer: { x: 0, y: CONFIG_POSITION.default },
      offsetTop: 0,
      order: {},
      timer: '',
      person: {
        courier: {
          information: {
            name: '',
            company_name: ''
          },
          avatar: require('@/assets/img/icon/profile-courier.svg')
        },
        shipper: {
          information: {
            name: '',
            phone_number: '',
            org_name: ''
          },
          avatar: require('@/assets/img/icon/profile-business.svg')
        },
        recipient: {
          information: {
            name: '',
            phone_number: ''
          },
          avatar: require('@/assets/img/icon/profile-courier.svg')
        }
      },
      orderStatus: {
        accepted: {
          title: 'Order Confirmed',
          time: ''
        },
        picked: {
          title: 'Courier picked up package',
          time: ''
        },
        completed: {
          title: 'Delivered to your place',
          time: ''
        },
        cancelled: {
          title: 'Order cancelled',
          time: '',
          hide: true
        },
        return: {
          title: 'Order return',
          time: '',
          hide: true
        }
      },
      markers: [{
        position: {
        },
        icon: {
          url: require('@/assets/img/icon/marker/pick-up.svg')
        }
      }, {
        position: {
        },
        icon: {
          url: require('@/assets/img/icon/marker/drop-off.svg')
        }
      }, {
        position: {
        },
        icon: {
          url: require('@/assets/img/icon/marker/courier.svg')
        }
      }]
    }
  },
  created () {
    this.fetchOrder()
    if (process.env.NODE_ENV !== 'development') {
      setInterval(this.fetchOrder, 60 * 1000) // 1 min auto reload
    }
  },
  mounted () {
    if (this.$refs.container && this.$refs.container.offsetWidth >= 960) {
      CONFIG_POSITION.default = 632
      CONFIG_POSITION.scrollTop = 600
      this.positionLayer.y = 632
    }
  },
  watch: {
    '$route': 'fetchOrder'
  },
  computed: {
    displayStatus: function () {
      if (!this.order.status) return
      let newObj = {}
      for (let key in this.orderStatus) {
        if (!('hide' in this.orderStatus[key])) {
          newObj = {
            ...newObj,
            [key]: this.orderStatus[key]
          }
        }
      }
      return newObj
    },
    latestStatus: function () {
      if (Object.keys(this.order).length === 0) return
      const latestStatus = this.order.status[0].key
      // console.log(latestStatus)
      return Object.keys(this.orderStatus).indexOf(latestStatus) > -1 ? latestStatus : null
    }
  },
  filters: {
    personAddress: (person) => {
      return person.location ? person.location.details + ', ' + person.location.address : ''
    },
    capitalize: function (value) {
      if (!value) return ''
      value = value.toString()
      return value.charAt(0).toUpperCase() + value.slice(1)
    }
  },
  methods: {
    estTime (value) {
      let mEpoh = parseInt(value)
      if (mEpoh < 10000000000) {
        mEpoh *= 1000
      }
      const d = new Date(mEpoh)
      let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      let time = this.showTime(d)
      return `${monthNames[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}, before ${time}`
    },
    showTime (value) {
      if (!value) return ''
      let date = new Date(value * 1000)
      let hours = date.getHours()
      let minutes = date.getMinutes()
      let ampm = hours >= 12 ? 'pm' : 'am'
      hours = hours % 12
      hours = hours || 12 // the hour '0' should be '12'
      minutes = minutes < 10 ? '0' + minutes : minutes
      return hours + ':' + minutes + ' ' + ampm
    },
    onScroll () {
      this.offsetTop = window.pageYOffset || document.documentElement.scrollTop
      this.moving = true
      if (this.offsetTop >= CONFIG_POSITION.scrollTop) {
        this.moving = false
        this.maxPage = true
      } else {
        this.maxPage = false
      }

      let that = this
      const checkx = function (offsetTop) {
        if (offsetTop === that.offsetTop) {
          that.moving = false
        }
      }
      setTimeout(checkx, 700, this.offsetTop)
    },
    epochToTimestamp (value) {
      return value * 1000
    },
    fetchOrder () {
      this.error = null
      this.loading = true
      API.getOrder(this.$route.params.token).then((data) => {
        if (typeof data === 'undefined') return
        this.markers[0].position = data.shipper.location.position
        this.markers[1].position = data.recipient.location.position
        this.markers[2].position = data.courier.location.position

        this.person.courier = {
          ...this.person.courier,
          information: data.courier.information,
          location: data.courier.location
        }

        this.person.shipper = {
          ...this.person.shipper,
          information: data.shipper.information,
          location: data.shipper.location
        }

        this.person.recipient = {
          ...this.person.recipient,
          information: data.recipient.information,
          location: data.recipient.location
        }
        this.order = data

        for (let index in this.order.status) {
          const key = this.order.status[index].key
          if (key in this.orderStatus) {
            this.orderStatus[key].time = this.order.status[index].time
          }
        }
      }).then(() => {
        this.loading = false
        this.error = null
      }).catch((err) => {
        this.loading = false
        console.log(err)
        this.error = { error: null }
        if (err.status === 404) {
          if (typeof err.data.error === 'string') {
            this.error = err.data
          } else if (typeof err.data.message === 'string') {
            this.error.error = err.data.message
          } else {
            this.error.error = err.statusText
          }
        }
      })
    },
    scrollMax () {
      this.moving = true
      this.maxPage = true
      scrollTo(false, CONFIG_POSITION.scrollTop, 2000)
    },
    cancelMax () {
      this.maxPage = false
      this.moving = false
      this.positionLayer.y = CONFIG_POSITION.scrollTop + 32
      scrollTo(true, CONFIG_POSITION.default, 2000)
    }
  },
  components: {
    GMAP, Person
  }
}
</script>

<style lang="scss">
.container {
  min-height: 100%;

  &.content-container {
    padding: 0 0 32px;
  }

  .toolbar{
    display: none;
    height: 32px;
    background-color: #0088bf;
    top: 0;
    position: fixed;
    z-index: 200;

    .toolbar__content{
      height: 32px !important;
      margin-left: 8px;
    }

    .toolbar__title{
      font-size: 14px;
      color: white;
      line-height: 32px;
      .icon{
        font-size: 28px;
      }
    }
  }

  .loading{
    width: 100%;
    text-align: center;
    color: #0088bf;
  }

  .max-page{
    .toolbar{
      display: block;
      background-color: #0088bf;
    }
  }

  .moving {
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      height: 90vh;
      width: 100%;
      background-color: rgba(0,0,0,0.3);
      z-index: 10;
    }
  }

  .card-layer {
    width: 100%;
    top: 393px;
    background: white;
    z-index: 100;
    position: absolute;
    padding-bottom: 32px;
  }

  .divider {
    border: 0.5px solid #d2d2d2;
  }

  .subheader {
    color: rgba(0, 0, 0, 0.87);
    span {
      padding-left: 8px;
      color: rgba(0, 0, 0, 0.54);
    }
  }

  .list--subheader{
    padding-top:0;
    padding-bottom: 0;
  }
}

.info-container {
  min-height: 74px;
  .subheader {
    margin-top: 24px;
    margin-bottom: 8px;
    height: 20px;
  }

  .list__tile__title {
    font-size: 16px;
    font-weight: normal;
  }

  .list__tile {
    height: 24px;
    font-weight: normal;
  }

  .last .list__tile {
    .list__tile__content {
      border-bottom: 1px solid #d2d2d2;
      height: 88px;
    }
  }
}

.status-container {
  .list__tile {
    height: 24px;
    margin-top: 8px;

    .list__tile__title {
      font-size: 20px;
      font-weight: 500;
      line-height: 1.2;
    }
  }

  .subheader {
    margin-top: 24px;
    line-height: 24px;
    height: auto;
    font-weight: 500;
  }

  .status-list {
    border-bottom: 1px solid #d2d2d2;
    margin: 32px 16px 0;
    padding-bottom: 32px;

    .item {
      height: 24px;
      width: 100%;
      margin-bottom: 16px;

      > * {
        float: left;
      }

      .status {
        padding-left: 16px;
        font-size: 16px;
        font-weight: 500;
        span {
          font-weight: normal;
          line-height: 1.5;
          color: rgba(0, 0, 0, 0.54);
        }
      }

      &:last-child {
        .status-icon:after {
          border:none;
        }
      }
    }

    .waiting {
      .status-icon {
        img{
          height: 8px;
          width: 8px;
          margin: 4px;
        }
      }
      color: rgba(0, 0, 0, 0.16);
    }

    .status-icon {
      margin-top: 3px;
      margin-left: 4px;
      line-height: 24px;
      height: 16px;
      width: 16px;

      img {
        height: 16px;
        width: 16px;
      }

      &:after {
        display: block;
        content: '';
        border-left: 1px solid #d2d2d2;
        height: 31px;
        margin-top: -10px;
        margin-left: 7px;
      }
    }
  }
}

.person-container {
  .list__tile--avatar {
    height: 80px;
  }

  .list__tile__title {
    font-size: 16px;
    font-weight: 500;
    line-height: 1.5;
  }

  .list__tile__sub-title {
    font-size: 14px;
    line-height: 1.43;
    color: rgba(0, 0, 0, 0.54);
  }

  .list__tile__action {
    font-size: 14px;
    line-height: 1.71;
    color: #0088bf;
  }
}

@media (min-width: 960px){
  $maxwidth: 960px;

  .ggv-main{
    max-width: $maxwidth;
    margin: 0 auto;

    nav{
      max-width: $maxwidth;
    }

    .toolbar--fixed, .toolbar--absolute{
      left: auto;
    }

    .overlay {
      max-width: $maxwidth;
      margin: 0 auto;
    }

    .card-layer {
      max-width: $maxwidth;
    }
  }
}
</style>
