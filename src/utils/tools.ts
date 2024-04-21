// 生成自增的长度为n的数组，从0开始


export const generateArray = function (n: number): number[] {
  return [...Array(n).keys()];
};



/**
 *
 *
 * @param {string} title
 * @param {number} age 
 * @return {*} 
 */
function sum(title:string, age:number) {
    return title + age;
}