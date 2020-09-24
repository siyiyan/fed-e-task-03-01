// ##### Vue
// >   - 功能
// >       - 负责接收初始化的参数(选项)
// >       - 负责把 data 中的属性注入到 Vue 实例，转换成 getter/setter
// >       - 负责调用 observer[观察者] 监听 data 中所有属性的变化
// >       - 负责调用 compiler[编译者] 解析指令/插值表达式
class Vue {
  constructor (options) { //是一种用于创建和初始化class创建的对象的特殊方法。
    // 1. 通过属性保存选项的数据
    this.$options = options || {}   //如果为空，空对象
    this.$data = options.data || {}
    this.$el = typeof options.el === 'string' ? document.querySelector(options.el) : options.el //如果是string
    //他就是一个选择器，用document.querySelector获得对象，如果是options对象就直接返回

    // 2. 把data中的成员转换成getter和setter，注入到vue实例中
    this._proxyData(this.$data)
    // 3. 调用observer[观察者]对象，监听数据的变化
    new Observer(this.$data)
    // 4. 调用compiler[编译者]对象，解析指令和差值表达式
    new Compiler(this)
  }
  _proxyData (data) { //vue带你data中的属性
    // 遍历data中的所有属性
    Object.keys(data).forEach(key => {  //this指向vue的实例
      // 把data的属性注入到vue实例中
      Object.defineProperty(this, key, {
        enumerable: true, // 可枚举（可遍历）
        configurable: true, // 可配置（可以使用 delete 删除，可以通过 defineProperty 重新定义）
        get () {  // 当获取值的时候执行
          return data[key]
        },
        set (newValue) {  // 当设置值的时候执行
          if (newValue === data[key]) {
            return
          }
          data[key] = newValue
        }
      })
    })
  }
}