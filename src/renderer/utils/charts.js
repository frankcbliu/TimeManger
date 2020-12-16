var echarts = require('echarts')

function getVirtulData (year) {
  year = year || '2017'
  var date = +echarts.number.parseDate(year + '-01-01')
  var end = +echarts.number.parseDate((+year + 1) + '-01-01')
  var dayTime = 3600 * 24 * 1000
  var data = []
  for (var time = date; time < end; time += dayTime) {
    data.push([
      echarts.format.formatTime('yyyy-MM-dd', time),
      Math.floor(Math.random() * 500)
    ])
  }
  return data
}

var data = getVirtulData(2016)

var option = {
  backgroundColor: '#f2f1f2',

  title: {
    top: 30,
    text: '每天的学习时间分钟数',
    left: 'center',
    textStyle: {
      color: '#AE4F00'
    }
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    top: '30',
    left: '100',
    data: ['番茄时间', 'Top 12'],
    textStyle: {
      color: '#AE4F00'
    }
  },
  calendar: [{
    top: 100,
    left: 'center',
    range: ['2016-01-01', '2016-06-30'],
    splitLine: {
      show: true,
      lineStyle: {
        color: '#AE4F00',
        width: 3,
        type: 'solid'
      }
    },
    yearLabel: {
      formatter: '{start}  1st',
      textStyle: {
        color: '#AE4F00'
      }
    },
    itemStyle: {
      color: '#f2f1f2',
      borderWidth: 1,
      borderColor: '#AE4F00'
    }
  }, {
    top: 340,
    left: 'center',
    range: ['2016-07-01', '2016-12-31'],
    splitLine: {
      show: true,
      lineStyle: {
        color: '#AE4F00',
        width: 3,
        type: 'solid'
      }
    },
    yearLabel: {
      formatter: '{start}  2nd',
      textStyle: {
        color: '#AE4F00'
      }
    },
    itemStyle: {
      color: '#f2f1f2',
      borderWidth: 1,
      borderColor: '#AE4F00'
    }
  }],
  series: [
    {
      name: '番茄时间',
      type: 'scatter',
      coordinateSystem: 'calendar',
      data: data,
      symbolSize: function (val) {
        return Math.log(val[1]) * 2.2
      },
      itemStyle: {
        color: '#ff8800'
      }
    },
    {
      name: '番茄时间',
      type: 'scatter',
      coordinateSystem: 'calendar',
      calendarIndex: 1,
      data: data,
      symbolSize: function (val) {
        return Math.log(val[1]) * 2.2
      },
      itemStyle: {
        color: '#ff8800'
      }
    },
    {
      name: 'Top 12',
      type: 'effectScatter',
      coordinateSystem: 'calendar',
      calendarIndex: 1,
      data: data.sort(function (a, b) {
        return b[1] - a[1]
      }).slice(0, 12),
      symbolSize: function (val) {
        return Math.log(val[1]) * 2.2
      },
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke'
      },
      hoverAnimation: true,
      itemStyle: {
        color: '#ff7300',
        shadowBlur: 10,
        shadowColor: 'red'
      },
      zlevel: 1
    },
    {
      name: 'Top 12',
      type: 'effectScatter',
      coordinateSystem: 'calendar',
      data: data.sort(function (a, b) {
        return b[1] - a[1]
      }).slice(0, 12),
      symbolSize: function (val) {
        return Math.log(val[1]) * 2.2
      },
      showEffectOn: 'render',
      rippleEffect: {
        brushType: 'stroke'
      },
      hoverAnimation: true,
      itemStyle: {
        color: 'ff7300',
        shadowBlur: 10,
        shadowColor: 'red'
      },
      zlevel: 1
    }
  ]
}

const install = function (Vue) {
  Object.defineProperties(Vue.prototype, {
    $chart: {
      get () {
        return {
          // 画一条简单的线
          line1: function (id) {
            this.chart = echarts.init(document.getElementById(id))
            this.chart.clear()

            const optionData = {
              xAxis: {
                type: 'category',
                data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
              },
              yAxis: [{
                type: 'value'
              },
              {
                type: 'value'
              }],
              series: [{
                data: [20, 13, 32, 2, 42, 0, 15],
                type: 'bar',
                yAxisIndex: 0
              }, {
                data: [2, 1, 3, 0, 4, 0, 1],
                type: 'bar',
                yAxisIndex: 1

              }]
            }
            console.log(optionData)
            this.chart.setOption(option)
          }
        }
      }
    }
  })
}

export default {
  install
}
