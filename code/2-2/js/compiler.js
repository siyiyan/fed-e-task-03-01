// ###### Compile
// >   - 功能
// >       - 负责编译模板，解析指令/插值表达式
// >       - 负责页面的首次渲染
// >       - 当数据变化后重新渲染视图

class Compiler {
  constructor (vm) {
    this.el = vm.$el  //模板
    this.vm = vm      //实例
    this.compile(this.el) //传过去的
  }
  // 编译模板，处理文本节点和元素节点
  compile (el) {
    let childNodes = el.childNodes
    Array.from(childNodes).forEach(node => {  //遍历所有的子节点
      // 处理文本节点
      if (this.isTextNode(node)) {
        this.compileText(node)
      } else if (this.isElementNode(node)) {
        // 处理元素节点
        this.compileElement(node)
      }

      // 判断node节点，是否有子节点，如果有子节点，要递归调用compile
      if (node.childNodes && node.childNodes.length) {
        this.compile(node)
      }
    })
  }
  // 编译元素节点，处理指令
  compileElement (node) {
    // console.log(node.attributes)
    // 遍历所有的属性节点
    Array.from(node.attributes).forEach(attr => {
      // 判断是否是指令
      let attrName = attr.name  //获得属性的name
      if (this.isDirective(attrName)) { //调用下面的方法，判断元素属性是否是指令
        // v-text --> text
        attrName = attrName.substr(2)   //去掉以“v-”去掉
        let key = attr.value    //获得属性的值
        this.update(node, key, attrName)
      }
    })
  }

  //节点，属性的值，属性指令
  update (node, key, attrName) {
    // 其他指令的value值
    let value = this.vm[key]
    if(attrName.startsWith('on')) {
      // 提取on指令的事件名称
      value  = attrName.replace('on:', '')
      attrName = 'on'
    }

    let updateFn = this[attrName + 'Updater'] //方法的前缀+固定的后缀
    // 因为在 textUpdater等中要使用 this
    updateFn && updateFn.call(this, node, value, key) //this Compiler对象
  }

  // 处理 v-text 指令
  textUpdater (node, value, key) {
    node.textContent = value
    // 每一个指令中创建一个 watcher，观察数据的变化
    new Watcher(this.vm, key, (newValue) => {
      node.textContent = newValue
    })
  }
  // v-model
  modelUpdater (node, value, key) { //node表单元素
    node.value = value
    // 每一个指令中创建一个 watcher，观察数据的变化
    new Watcher(this.vm, key, (newValue) => {
      node.value = newValue
    })
    // 双向绑定,监听视图的变化
    node.addEventListener('input', () => {
      this.vm[key] = node.value
    })
  }

  // v-html
  htmlUpdater (node, value, key) {
    node.innerHTML = value;
    new Watcher(this.vm, key, (newValue) => {
      node.innerHTML = newValue
    })
  }

  // v-on
  /**
   * 
   * @param node: this.vm 
   * @param { string } event: 事件名称  
   * @param { string } method: 事件处理方法 
   */ 
  onUpdater (node, event, method) {
    let argument = ''
    let reg = /(.+?)\((.+?)\)/;   // 提取小括号前的内容当作方法名称，提取小括号内的内容作为参数
    if (reg.test(method)) {
      argument = RegExp.$2.trim()
      method = RegExp.$1.trim()
    }
    argument = argument.split(',')
    // 判断传入是否函数名称
    if(/^[^\d]\w+$/.test(method)) {
      node.addEventListener(event, () => {
        // 绑定this对象是vue实例
        this.vm.$methods[method].apply(this.vm, argument)
      })
    } else {
      let index = method.indexOf('=')
      if (index >= 0) {
        // 简单处理赋值语句
        const key = method.substr(0, index).trim()
        const value = method.substr(index+1).trim()
        node.addEventListener(event, () => {
          this.vm[key] = value
        })
      } else {
        node.addEventListener(event, () => {
          // 使用eval简单执行 
          eval(key)
        })
      }
    }    
  }

  // 编译文本节点，处理差值表达式
  compileText (node) {
    //console.log(node)
    //console.dir(node) //把后面的变量打印成对象的形式,
    // {{  msg }}
    let reg = /\{\{(.+?)\}\}/   //"\"转义符放在花括号里，“.”任意的单个字符不包括换行，“+”匹配前面的出现多次，“？”非贪婪模式，尽可能早的结束，“（）”某个位置的内容，分组。
    let value = node.textContent
    if (reg.test(value)) {  //判断
      let key = RegExp.$1.trim()    //RegExp正则函数，“$1”匹配第一个，“trim()去掉空格”
      node.textContent = value.replace(reg, this.vm[key]) //正则的对象    变量对应的值

      // 创建watcher对象，当数据改变更新视图
      new Watcher(this.vm, key, (newValue) => {
        node.textContent = newValue
      })
    }
  }
  // 判断元素属性是否是指令，以v-开头
  isDirective (attrName) {
    return attrName.startsWith('v-')
  }
  // 判断节点是否是文本节点
  isTextNode (node) {
    return node.nodeType === 3
  }
  // 判断节点是否是元素节点
  isElementNode (node) {
    return node.nodeType === 1
  }
}

/**
 * string.startsWith(searchvalue, start) 方法用于检测字符串是否以指定的子字符串开始。
 * nodeObject.nodeType 属性返回节点的节点类型。text->3 	Element->1. https://www.runoob.com/dom/prop-element-nodetype.html
 * console.dir(object); 打印出该对象的所有属性和属性值.
 * 设置节点文本内容:node.textContent=text   返回节点文本内容:node.textContent
 * node.attributes  attributes 属性返回指定节点的属性集合，即 NamedNodeMap。
 * call() 方法是预定义的 JavaScript 方法。 它可以用来调用所有者对象作为参数的方法。 通过 call()，您能够使用属于另一个对象的方法。
 * 
 */