<template>
  <div>
    <Financial v-for="financial in financials" :key="financial.id" :financial_prop="financial" @re-run="$emit('re-run')" />
  </div>
</template>

<script lang="ts">
import Financial from '@/components/Financial.vue'
// import { Vue, Component } from 'vue-property-decorator'
// import { Vue } from 'vue-class-component'

export default {
  name: 'Financials',
  components: { Financial },
  props: {
    financials: Object as () => Record<string, Record<string, Object>>
  },
  emits: ['re-run']
}
</script>

<style>
</style>
