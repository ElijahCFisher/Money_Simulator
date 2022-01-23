<template>
  <div>
    <h3> {{ financial.name }}: </h3>
    <div v-for="(detail, name) in financial.details" :key="name">
      <form class="{{name}}-form" @submit.prevent="onSubmit">
        <div class="form-control">
          <label> {{ name }}: </label>
          <input v-model="financial.details[name]" type="text" />
          <input type="submit" value="update" class="btn btn-block" />
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'Financials',
  props: {
    // eslint-disable-next-line vue/prop-name-casing
    financial_prop: Object as () => Record<string, Object>
  },
  emits: ['re-run'],
  data() {
    return {
      financial: this.financial_prop
    }
  },
  methods: {
    onSubmit() {
    //   e.preventDefault()
      console.log('pls')
      this.$emit('re-run')
      console.log('pls2')
    }
  }
})
</script>

<style>
    div {
        display: inline-block
    }
</style>
