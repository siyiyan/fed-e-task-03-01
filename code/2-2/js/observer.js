// ##### Observer
// >   - 功能
// >       - 负责把 data 选项中的属性转换成响应式数据
// >       - data 中的某个属性也是对象，把该属性转换成响应式数据
// >       - 数据变化发送通知
// 负责数据劫持
// 把 $data 中的成员转换成 getter/setter 
class Observer {
  constructor (data) {
    this.walk(data)
  }
  walk (data) {
    // 1. 判断data是否是对象
    if (!data || typeof data !== 'object') {
      return
    }
    // 2. 遍历data对象的所有属性
    Object.keys(data).forEach(key => {
      this.defineReactive(data, key, data[key])
    })
  }
  defineReactive (obj, key, val) { //对象，属性，属性对应的值
    let that = this
    // 负责收集依赖，并发送通知
    let dep = new Dep()
    // 如果val是对象，把val内部的属性转换成响应式数据
    this.walk(val)
    Object.defineProperty(obj, key, {
      enumerable: true, //可枚举
      configurable: true, //可配置
      get () {
        // 收集依赖
        Dep.target && dep.addSub(Dep.target)
        return val  //是一个闭包//不能用obj[val],会发生死递归
      },
      set (newValue) {
        if (newValue === val) { //没有发生变化
          return
        }
        val = newValue
        that.walk(newValue)
        // 发送通知
        dep.notify()
      }
    })
  }
}