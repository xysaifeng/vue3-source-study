

// [5 3 4 0] => [1,2]

// 从一个序列中找到最长递增子序列的个数（5个）

// 2 3 7 6 8 4 9 5

// 2 3 6 8 9
// 2 3 7 8 9

// 用贪心算法，找更有潜力的

// 以2开始算
// 2 3
// 2 3 7 
// 2 3 6 
// 2 3 6 8 
// 2 3 4 8 
// 2 3 4 8 9
// 2 3 4 5 9 => 5个
// 0 1 5 7 6

// 当前的和序列的最后一项比较，如果比最后一项大，则直接放到序列尾部，如果比最后一项小，则找到序列中比当前大的替换调
// 个数没问题了，最后把序列弄对了就行
// 替换时，因为序列是递增序列，可以采用二分查找，找比当前项大的

// 二分查找的复杂度是logn,再循环序列则整体复杂度是n倍logn

// tips:解决思想是，默认向后追加 + 二分查找，替换 + 追溯
export function getSequence(arr) {
  let result = [0] // 放索引
  let p = new Array(arr).fill(0)
  let len = arr.length;
  let lastIdex = 0
  let start
  let end
  let middle
  for (let i = 0; i < len; i++) {
    let arrI = arr[i]
    if (arrI !== 0) { // 0意味这是新增节点，不用计入最长递增子序列中
      lastIdex = result[result.length - 1] // 渠道数组中最后一项的索引，也即最大一项
      if (arr[lastIdex] < arrI) { // 说明当前这一项比结果集中的最后一项大，则直接将索引放入result中
        p[i] = lastIdex  // p中存的是索引
        result.push(i)
        continue
      }

      // 否则二分查找+替换，有开始指针，中间值和结束指针，
      start = 0;
      end = result.length - 1
      while (start < end) { // 计算有序比较都可以二分查找
        middle = Math.floor((start + end) / 2)
        if (arr[result[middle]] < arrI) {
          start = middle + 1
        } else {
          end = middle
        }
      }
      // while结束start=== end
      if (arrI < arr[result[end]]) {
        // 处理顺序不对的情况，在替换之前先记住要替换的前驱节点（要换掉的节点的前面节点的位置）
        p[i] = result[end - 1]
        result[end] = i
      }
    }
  }
  // console.log(p); // [ 0, 0, undefined, 1, 3, 4, 4, 6, 1 ]
  // 倒序追溯,先取到结果集中的最后一项（最大项）（一定是正确的）
  let l = result.length
  let last = result[l - 1]
  while (l-- > 0) { // 当检索后停止
    result[l] = last // 最有一项时正确的，
    last = p[last] // 根据最后一项向前追溯
  }
  return result
}
// const arrInex = getSequence([1, 2, 3, 4, 5])
// const arrInex = getSequence([2, 3, 7, 6, 8, 4, 9, 5]) // [ 0, 1, 5, 7, 6 ]
const arrInex = getSequence([2, 3, 1, 5, 6, 8, 7, 9, 4]) // [ 0, 1, 3, 4, 6, 7 ] => [2,3,5,6,7,9]
// console.log(arrInex);
