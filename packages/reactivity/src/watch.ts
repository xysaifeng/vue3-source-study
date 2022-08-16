import { isReactive } from "./baseHandler";


export function watch(scource, cb) {
  // 判断当前的scource是否是一个reactive的值，不是的话监控就没意义了
  if (isReactive(scource)) {
    console.log('响一声对象');

  }

}