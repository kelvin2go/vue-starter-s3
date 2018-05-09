<template>
  <div class="nav">
    <v-toolbar class="header" dark fixed app height="55" >
      <v-toolbar-title><img class="brand-logo" src="@/assets/img/logo.png"/></v-toolbar-title>
      <v-spacer></v-spacer>
      <div> Vuetify &amp; S3 starter </div>
    </v-toolbar>
  </div>
</template>

<style lang="scss">
  .nav {
    height: 55px;
    font-family: Roboto;
    font-size: 14px;
    font-weight: 500;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.71;
    letter-spacing: normal;
    text-align: right;
    color: #ffffff;
    nav{
      box-shadow: none !important;
    }
  }

  .header{
    background-color: #0088bf;
  }

  .brand-logo{
    height: 38px;
  }
</style>
