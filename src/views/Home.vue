<template>
  <div class="home">
    <div class="spacer" style="order: 1" />
    <div id="center">
      <Graph ref="graf" />
      <Financials class="fins" :financials="financials" @re-run="rerun()" />
      <div v-show="false"> {{ financials }} </div>
    </div>
    <div class="spacer" style="order: 3" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Graph from '@/components/Graph.vue' // @ is an alias to /src
import Financials from '@/components/Financials.vue' // @ is an alias to /src

// interface home {
//   financials: Record<string, Record<string, Object>>
// }

// @Component
export default defineComponent({
  name: 'Home',
  components: { Graph, Financials },
  data() {
    return {
      financials: {
        salary: {
          name: 'salary',
          details: {
            money: 2000,
            time: 14
          }
        }
      }
    }
  },
  mounted() {
    console.log(this.financials);
    (this.$refs.graf as any).rerun(this.financials)
  },
  updated() {
    this.rerun()
  },
  methods: {
    rerun() {
      console.log(this.financials);
      (this.$refs.graf as any).rerun(this.financials)
    }
  }
})
</script>

<style>
#graf {
  /* min-height: 100%; */
  order: 1;
  flex: 1;
  /* background-color: blue; */
}

.fins {
  order: 2;
  flex: 1;
  /* background-color: blue; */
}

.home {
  display: flex;
  /* flex-direction: row; */
  min-width: 100%;
}

#center {
  display: flex;
  flex-direction: column;
  flex: 4;
  order: 2;
}

.spacer {
  flex: 1
}

</style>
