<template>
  <v-list-tile avatar class="person-container" @mousedown="dragMe" @touchstart="dragMe">
    <v-list-tile-avatar>
      <img :src="person.avatar">
    </v-list-tile-avatar>
    <v-list-tile-content>
      <v-list-tile-title>{{person.information.name}} <span v-if="actions.phone_number">({{person.information.phone_number}})</span> </v-list-tile-title>
      <v-list-tile-sub-title v-if="person.information.company_name">{{person.information.company_name}}</v-list-tile-sub-title>
      <v-list-tile-sub-title v-if="person.information.org_name">{{person.information.org_name}}</v-list-tile-sub-title>
    </v-list-tile-content>
    <v-list-tile-action class="view-detail" v-if="actions.showDetails" @click="viewDetails">
      <span>View details</span>
    </v-list-tile-action>
    <v-list-tile-action v-if="actions.phone_number" class="phone-number">
      <a :href="'tel:'+person.information.phone_number"> <img src="@/assets/img/icon/phone-number.svg"> </a>
    </v-list-tile-action>

  </v-list-tile>
</template>

<script>
export default {
  data: () => {
    return {text: 'play'}
  },
  props: ['person', 'actions'],
  methods: {
    viewDetails () {
      this.$emit('clickView', 'hi')
    },
    dragMe (e) {
      this.$emit('dragLayer', e)
    }
  }
}
</script>

<style>
@media (min-width: 960px){
  .view-detail {
    display: none;
  }
  .phone-number{
    display: none;
  }
}
</style>
