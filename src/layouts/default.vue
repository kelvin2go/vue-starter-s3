<template>
  <div class="ggv-main">
    <Header/>
    <router-view/>
  </div>
</template>

<style lang="scss">
html {
  font-family: Roboto;
  font-size: 14px;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.71;
  letter-spacing: normal;
  background-color: #fafafa;

  body {
    margin: 0;
  }

  ul {
    list-style: none;
  }

  nav {
    box-shadow: none;
  }

  .error--text, .error-text{
    color: #ea5265;
    span {
      font-size: 16px;
      font-weight: normal;
      line-height: 1.5;
    }
  }

  .error{
    background-color: #ff5252 !important;
  }
}

</style>

<script>
import Header from './header.vue'

export default {
  components: {
    Header
  }
}
</script>
