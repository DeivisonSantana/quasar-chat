<template>
  <q-page class="flex flex-center">
    <img
      alt="Quasar logo"
      src="~assets/quasar-logo-vertical.svg"
      style="width: 200px; height: 200px"
    />

    <FCMNotifications />
  </q-page>
</template>

<script setup>
import FCMNotifications from 'src/components/FCMNotifications.vue'
</script>
