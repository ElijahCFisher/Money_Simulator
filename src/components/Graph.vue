<template>
  <div id="graph"></div>
</template>

<script lang="ts">
// import { Vue, Component } from 'vue-property-decorator'
import { Vue } from 'vue-class-component'
import functionPlot from 'function-plot'
import { FunctionPlotDatumScope } from 'function-plot/dist/types'
import * as d3 from 'd3'

// @Component
export default class Home extends Vue {
  accs: {[name: string]: number[]} = {}

  rerun(financials: Record<string, Record<string, Object>>) {
    // console.log('yoo')
    this.accs = { checking: [60000], houses: [], netWorth: [60000] }
    var runList: ((tis: object, day: number) => void)[] = []
    runList = [
      // this.salary(2000, 14),
      this.collectRent(),
      this.payMortgage(),
      this.payRent(1200),
      this.buyFood(7),
      this.payInsurance(200),
      this.payBills(200),
      this.repairCar(1000, 364/2),
      this.stocks(0.06),
      this.buyHouse(200000, 0.1, 100, 0.0057, 100, 0.04125, 30, 1995, 90)
    ]
    if ('salary' in financials) {
      runList.push(this.salary(Number((financials.salary.details as Record<string, string>).money), Number((financials.salary.details as Record<string, string>).time)))
    }
    this.simulation(runList, 15)

    var sc1: (scope: FunctionPlotDatumScope) => number = this.makeScenario('checking', this.accs)
    var sc2: (scope: FunctionPlotDatumScope) => number = this.makeScenario('netWorth', this.accs)

    var plot = functionPlot({
      // width: (document.getElementById('graph')!).clientWidth,
      // height: (document.getElementById('graph')!).clientHeight,
      width: 400,
      height: 400,
      target: '#graph',
      yAxis: { domain: [-100000, 1000000], label: 'money (dollars)' },
      xAxis: { domain: [2021, 2035], label: 'time (year)' },
      grid: true,
      tip: {
        xLine: true,    // dashed line parallel to y = 0
        yLine: true,    // dashed line parallel to x = 0
        renderer: function (x, y, index) {
          // the returning value will be shown in the tip
          return `[${23 + Math.floor(x - 2021)}] ${xToDateStr(x)}: $${d3.format(',')(Math.round(y))}`
          // return 'x'
        }
      },
      data: [
        {
          graphType: 'polyline',
          fn: sc1
        },
        {
          graphType: 'polyline',
          fn: sc2
        }
      ]
    })
    // console.log('what the fuck bro', document.getElementById('graph'), plot)

    // plot.meta.xAxis.tickFormat(t => t)
    function decimalDateToJsDate(time: number) { // thanks https://stackoverflow.com/a/29400701
      var year = Math.floor(time)
      var thisYear = new Date(year, 0, 1)
      var nextYear = new Date(year + 1, 0, 1)
      var millisecondsInYear = nextYear.getTime() - thisYear.getTime()
      var deltaTime = Math.ceil((time - year) * millisecondsInYear)
      thisYear.setMilliseconds(deltaTime)
      return thisYear
    }
    function xToDateStr(e: number) { return d3.timeFormat('%b %d, %Y')(decimalDateToJsDate(e)) } // todo eventually do better axis at different resolutions with https://stackoverflow.com/a/35050898
    // plot.meta.xAxis!.tickFormat((x: number) => `[${23 + Math.floor(x - 2021)}] ${xToDateStr(x)}`)
    plot.meta.xAxis!.tickFormat((x: number) => `${x}`)
    plot.draw()
    // console.log('plotted', runList, this.accs)
  }

  simulation(funcs: ((tis: object, day: number) => void)[], time: number): void {
    // console.log(111, this.accs)
    for (var i = 0; i < 365*time; i++) {
      for (var acc in this.accs) {
        if (acc === 'houses') continue
        this.accs[acc].push(this.accs[acc][this.accs[acc].length - 1])
      }
      // console.log(222, funcs)
      for (var func of funcs) {
        // console.log(333, this.accs)
        // console.log(this)
        // console.log('eyyyy', this)
        func(this, i)
      }
    }
  }

  salary(money: number, time: number): (tis: any, day: number) => void {
    // console.log(this)
    return function salary2(tis: any, day: number): void { // no idea if this works or if I'm fucking everything lol
      // console.log(444, day, time)
      if (day % time === 0) {
        // console.log(555)
        // console.log(tis)
        // console.log(tis.accs)
        tis.accs.checking[tis.accs.checking.length - 1] += money
        tis.accs.netWorth[tis.accs.netWorth.length - 1] += money
        // console.log(day, time, tis, tis.accs.checking[tis.accs.checking.length - 1], money)
      }
    }
  }

  stocks(interest: number): (tis: any, day: number) => void {
    return function stocks2(tis: any, day: number): void {
      tis.accs.checking[tis.accs.checking.length - 1] *= Math.E**(interest/365)
      tis.accs.netWorth[tis.accs.netWorth.length - 1] += tis.accs.checking[tis.accs.checking.length - 1]*(1 - Math.E**(interest/365))
    }
  }

  buyHouse(price: number, downPayment: number, PMI: number, propertyTax: number, HOA: number, interest: number, years: number, insurance: number, rentDowntime: number): (tis: any, day: number) => void {
    return function buyHouse2(tis: any, day: number): void {
      var sm: number = 0
      for (var house of tis.accs.houses) {
        sm += house[8]
      }
      if (tis.accs.checking[tis.accs.checking.length - 1] > price*downPayment + 4*sm) {
        var monthlyPayment = (price-price*downPayment) * (interest/12 * (1+interest/12)**(30*12)) / ((1+interest/12)**(years*12) - 1)
        tis.accs.checking[tis.accs.checking.length - 1] -= price*downPayment
        tis.accs.houses.push([price, downPayment, PMI, propertyTax, HOA, interest, years, insurance, monthlyPayment, price*downPayment, monthlyPayment*1.4, rentDowntime])
      }
    }
  }

  payRent(rent: number): (tis: any, day: number) => void {
    return function payRent2(tis: any, day: number): void {
      var dy: number = day % 365
      if (dy === 0 || dy === 31 || dy === 31 + 28 || dy === 31*2 + 28 || dy === 31*2 + 28 + 30 || dy === 31*3 + 28 + 30 || dy === 31*3 + 28 + 30*2 || dy === 31*4 + 28 + 30*2 ||
                  dy === 31*5 + 28 + 30*2 || dy === 31*5 + 28 + 30*3 || dy === 31*6 + 28 + 30*3 || dy === 31*6 + 28 + 30*4) {
        tis.accs.checking[tis.accs.checking.length - 1] -= rent
        tis.accs.netWorth[tis.accs.netWorth.length - 1] -= rent
      }
    }
  }

  payInsurance(cost: number): (tis: any, day: number) => void {
    return function payInsurance2(tis: any, day: number): void {
      var dy: number = day % 365
      if (dy === 0 || dy === 31 || dy === 31 + 28 || dy === 31*2 + 28 || dy === 31*2 + 28 + 30 || dy === 31*3 + 28 + 30 || dy === 31*3 + 28 + 30*2 || dy === 31*4 + 28 + 30*2 ||
                  dy === 31*5 + 28 + 30*2 || dy === 31*5 + 28 + 30*3 || dy === 31*6 + 28 + 30*3 || dy === 31*6 + 28 + 30*4) {
        tis.accs.checking[tis.accs.checking.length - 1] -= cost
        tis.accs.netWorth[tis.accs.netWorth.length - 1] -= cost
      }
    }
  }

  payBills(cost: number): (tis: any, day: number) => void {
    return function payInsurance2(tis: any, day: number): void {
      var dy: number = day % 365
      if (dy === 0 || dy === 31 || dy === 31 + 28 || dy === 31*2 + 28 || dy === 31*2 + 28 + 30 || dy === 31*3 + 28 + 30 || dy === 31*3 + 28 + 30*2 || dy === 31*4 + 28 + 30*2 ||
                  dy === 31*5 + 28 + 30*2 || dy === 31*5 + 28 + 30*3 || dy === 31*6 + 28 + 30*3 || dy === 31*6 + 28 + 30*4) {
        tis.accs.checking[tis.accs.checking.length - 1] -= cost
        tis.accs.netWorth[tis.accs.netWorth.length - 1] -= cost
      }
    }
  }

  buyFood(cost: number): (tis: any, day: number) => void {
    return function payRent2(tis: any, day: number): void {
      tis.accs.checking[tis.accs.checking.length - 1] -= cost
      tis.accs.netWorth[tis.accs.netWorth.length - 1] -= cost
    }
  }

  repairCar(cost: number, frequency: number): (tis:any, day: number) => void {
    return function repairCar(tis: any, day: number): void {
      if (day%frequency === 0) {
        tis.accs.checking[tis.accs.checking.length - 1] -= cost
        tis.accs.netWorth[tis.accs.netWorth.length - 1] -= cost
      }
    }
  }

  payMortgage(): (tis: any, day: number) => void {
    return function payMortgage2(tis: any, day: number): void {
      var dy: number = day % 365
      if (dy === 0 || dy === 31 || dy === 31 + 28 || dy === 31*2 + 28 || dy === 31*2 + 28 + 30 || dy === 31*3 + 28 + 30 || dy === 31*3 + 28 + 30*2 || dy === 31*4 + 28 + 30*2 ||
                  dy === 31*5 + 28 + 30*2 || dy === 31*5 + 28 + 30*3 || dy === 31*6 + 28 + 30*3 || dy === 31*6 + 28 + 30*4) {
        for (var house of tis.accs.houses) {
          tis.accs.checking[tis.accs.checking.length - 1] -= house[8]
          // accs["netWorth"][accs["netWorth"].length-1] -= (house[0]-house[9])*house[5]
          house[9] += house[8] - ((house[0] - house[9]) * house[5])
        }
      }
    }
  }

  collectRent(): (tis: any, day: number) => void {
    return function collectRent2(tis: any, day: number): void {
      // The precision I added here no longer really makes sense, but I'm keeping it for convenience sake
      for (var house of tis.accs.houses) {
        var dy: number = day%(365 + house[11])
        if (dy === 0 || dy === 31 || dy === 31 + 28 || dy === 31*2 + 28 || dy === 31*2 + 28 + 30 || dy === 31*3 + 28 + 30 || dy === 31*3 + 28 + 30*2 || dy === 31*4 + 28 + 30*2 ||
                      dy === 31*5 + 28 + 30*2 || dy === 31*5 + 28 + 30*3 || dy === 31*6 + 28 + 30*3 || dy === 31*6 + 28 + 30*4) {
          tis.accs.checking[tis.accs.checking.length - 1] += house[10]
          tis.accs.netWorth[tis.accs.netWorth.length - 1] += house[10]
        }
      }
    }
  }

  makeScenario(key: string, inpAccs: {[name: string]: number[]}): (scope: FunctionPlotDatumScope) => number {
    return function (scope: FunctionPlotDatumScope): number {
      // scope.x = {lo: Number, hi: number}
      // simulate a line e.g. y = x
      // return (salary - monthlyPayment)*(scope.x-2021)
      // return monthlyPayment*(2.7)**((scope.x-2021) * interest)
      return inpAccs[key][Math.floor((scope.x - 2021)*365)]
    }
  }
}
</script>

<style>
/* #graph {
  min-width: 400px;
  min-height: 400px;
} */
</style>
