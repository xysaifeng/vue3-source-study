

const queue = []

let isFlushing = false // 是否在刷新中

const resolvePromise = Promise.resolve()

export function queueJob(job) {
  // 处理逻辑：多次调用只触发一次，而且任务有重复的也不要再调用了 =》so应该用任务队列把任务存起来，每次先看一下有没有已存在的任务，已存在了就不存这个任务了，最后执行完任务队列的任务后将队列清空
  // 1.类似于浏览器的事件环，将任务放到队列中并去重 之后异步调用任务

  if (!queue.includes(job)) {
    queue.push(job)
  }

  // 2.开一个定时器，批量处理。需要一个控制开关，因为定时器只需要开一个，不需要开多个，只有当第一次调queueJob时开启，后面异步执行完了再还原开关
  if (!isFlushing) {
    isFlushing = true // 多次调queueJob，只有第一次进来了 后面的被拦截了
    // 借助异步任务Promise.resolve.then 来实现异步调用
    resolvePromise.then(() => {
      // 在这里做清理操作，但是要注意，当在清理的过程中又有任务进来了，应该放到下一轮任务中
      isFlushing = false // 保证新任务能放到下一轮任务中
      // 执行任务队列queue，要注意 需要任务队列拷贝一份来使用，防止在循环的过程中队列里有新增的逻辑
      const copyQueue = queue.slice(0)
      queue.length = 0;// 清空队列
      let i
      for (i = 0; i < copyQueue.length; i++) {
        const job = copyQueue[i]
        job()
      }
      copyQueue.length = 0
    })
  }
}