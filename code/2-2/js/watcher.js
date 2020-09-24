// >   - 功能
// >       - 当数据变化触发依赖， dep 通知所有的 Watcher 实例更新视图
// >       - 自身实例化的时候往 dep 对象中添加自己

class Watcher {
  constructor (vm, key, cb) {
    //vue实例
    this.vm = vm
    // data中的属性名称
    this.key = key
    // 回调函数负责更新视图
    this.cb = cb

    // 把watcher对象记录到Dep类的静态属性target
    Dep.target = this
    // 触发get方法，在get方法中会调用addSub
    this.oldValue = vm[key]
    Dep.target = null //预防重复添加
  }
  // 当数据发生变化的时候更新视图
  update () {
    let newValue = this.vm[this.key]  //根据属性获得对应的值
    if (this.oldValue === newValue) {
      return
    }
    this.cb(newValue)
  }
}