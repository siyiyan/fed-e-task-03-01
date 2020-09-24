import { init, h } from 'snabbdom'
import classModule from 'snabbdom/modules/class'
import propsModule from 'snabbdom/modules/props'
import styleModule from 'snabbdom/modules/style'
import eventListenersModule from 'snabbdom/modules/eventlisteners'
import { func } from 'assert-plus'

// 初始化 模块
const patch = init([
    classModule,
    propsModule,
    styleModule,
    eventListenersModule
])

let vnode
// 初始数据
let nextKey = 11
let sortBy = 'rank'
let totalHeight = 0
// 每个row动画间隔距离
const margin = 8
const originalData = [
    { rank: 1, title: 'The Shawshank Redemption', desc: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', elmHeight: 0 },
    { rank: 2, title: 'The Godfather', desc: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', elmHeight: 0 },
    { rank: 3, title: 'The Godfather: Part II', desc: 'The early life and career of Vito Corleone in 1920s New York is portrayed while his son, Michael, expands and tightens his grip on his crime syndicate stretching from Lake Tahoe, Nevada to pre-revolution 1958 Cuba.', elmHeight: 0 },
    { rank: 4, title: 'The Dark Knight', desc: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, the caped crusader must come to terms with one of the greatest psychological tests of his ability to fight injustice.', elmHeight: 0 },
    { rank: 5, title: 'Pulp Fiction', desc: 'The lives of two mob hit men, a boxer, a gangster\'s wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', elmHeight: 0 },
    { rank: 6, title: 'Schindler\'s List', desc: 'In Poland during World War II, Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution by the Nazis.', elmHeight: 0 },
    { rank: 7, title: '12 Angry Men', desc: 'A dissenting juror in a murder trial slowly manages to convince the others that the case is not as obviously clear as it seemed in court.', elmHeight: 0 },
    { rank: 8, title: 'The Good, the Bad and the Ugly', desc: 'A bounty hunting scam joins two men in an uneasy alliance against a third in a race to find a fortune in gold buried in a remote cemetery.', elmHeight: 0 },
    { rank: 9, title: 'The Lord of the Rings: The Return of the King', desc: 'Gandalf and Aragorn lead the World of Men against Sauron\'s army to draw his gaze from Frodo and Sam as they approach Mount Doom with the One Ring.', elmHeight: 0 },
    { rank: 10, title: 'Fight Club', desc: 'An insomniac office worker looking for a way to change his life crosses paths with a devil-may-care soap maker and they form an underground fight club that evolves into something much, much more...', elmHeight: 0 },
]
let data = originalData.map(item => item)
// 处理排序
function handleSort(sort) {
    sortBy = sort
    data.sort((a, b) => {
        if (a[sort] > b[sort]) {
            return 1
        }
        if (a[sort] < b[sort]) {
            return -1
        }
        return 0
    })
    render(data)
}
// 处理添加
function handleAdd() {
    var n = originalData[Math.floor(Math.random() * 10)]
    data = [{ rank: nextKey++, title: n.title, desc: n.desc, elmHeight: 0 }].concat(data)
    render()
    // 再次执行render后才能正确计算新增元素高度
    render()
}
// 处理删除
function handleRemove(item) {
    data = data.filter(f => f.rank !== item.rank)
    render()
}
// 渲染列表
function listView(item) {
    return h('div.row', {
        key: item.rank,
        style: {
          opacity: '0',
          transform: 'translate(-200px)',
          delayed: { transform: `translateY(${item.offset}px)`, opacity: '1' },
          remove: { opacity: '0', transform: `translateY(${item.offset}px) translateX(200px)` }
        },
        hook: { insert: (vnode) => { item.elmHeight = vnode.elm.offsetHeight; console.log(item.rank ,vnode.elm.offsetHeight) } },
      },
      [
        h('div.col', { style: { width: '5%' } }, item.rank),
        h('div.col', { style: { width: '25%' } }, item.title),
        h('div.col', { style: { width: '70%' } }, item.desc),
        h('div.remove', { on: { click: [handleRemove, item] } }, 'x')
    ])
}
// 计算offset
function render() {
    data = data.reduce((a, b) => {
        const prev = a[a.length - 1]
        b.offset = prev ? prev.offset + prev.elmHeight + margin: margin
        return a.concat(b)
    }, [])
    totalHeight = data[data.length - 1].offset + data[data.length - 1].elmHeight
    vnode = patch(vnode, view(data))
}
// 渲染
function view(data) {
    return h('div#container', [
        h('div', [
            h('h1', 'Top 10 Movies'), // 标题
            h('div.header', [ // 操作
                '排序：',
                h('span.sort-wrap', [
                    h('a.sort', { class: { active: sortBy === 'rank' }, on: { click: [handleSort, 'rank'] } }, 'rank'),
                    h('a.sort', { class: { active: sortBy === 'title' }, on: { click: [handleSort, 'title'] } }, 'title'),
                    h('a.sort', { class: { active: sortBy === 'desc' }, on: { click: [handleSort, 'desc'] } }, 'desc'),
                ]),
                h('a.btn.add', { on: { click: [handleAdd] } }, 'add')
            ])
        ]),
        h('div.list', { style: { height: totalHeight + 'px' } }, data.map(listView)),
    ])
}
window.addEventListener('DOMContentLoaded', () => {
    const app = document.querySelector('#app')
    // 第一次渲染，调用view计算高度
    vnode = patch(app, view(data))
    // 执行渲染拿到offset
    render()
})