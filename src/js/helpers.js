import { TIMEOUT_SEC } from './config.js';

const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};

export const AJAX = async function (url, uploadData = undefined) {
  try {
    const fetchPro = uploadData
      ? fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(uploadData),
        })
      : fetch(url);

    const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
    const data = res.json();

    // 错误处理
    if (!res.ok) throw new Error(`${data.message} (${res.status})`);
    return data; //这个data作为getJSON方法返回的resolved value以至于在model.js中,await该函数并将这里返回的data存在model.js的data变量中
  } catch (err) {
    throw error; //为了将error传到model.js中,这里变为rejected状态以至于能走到model.js的catch内
  }
};

// export const getJSON = async function (url) {
//   try {
//     // 下面的巧妙操作：
//     // 防止在网速很慢的情况下超时fetch,设置一个定时器限制fetch的时间,用到Promise.race
//     const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
//     const data = res.json();

//     // 错误处理
//     if (!res.ok) throw new Error(`${data.message} (${res.status})`);
//     return data; //这个data作为getJSON方法返回的resolved value以至于在model.js中,await该函数并将这里返回的data存在model.js的data变量中
//   } catch (error) {
//     throw error; //为了将error传到model.js中,这里变为rejected状态以至于能走到model.js的catch内
//   }

//   console.log('data', data);
// };

// // 上传菜单到API
// export const sendJSON = async function (url, uploadData) {
//   try {
//     // 下面的巧妙操作：
//     // 防止在网速很慢的情况下超时fetch,设置一个定时器限制fetch的时间,用到Promise.race
//     const fetchPro = fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(uploadData),
//     });
//     const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
//     const data = res.json();

//     // 错误处理
//     if (!res.ok) throw new Error(`${data.message} (${res.status})`);
//     return data; //这个data作为getJSON方法返回的resolved value以至于在model.js中,await该函数并将这里返回的data存在model.js的data变量中
//   } catch (error) {
//     throw error; //为了将error传到model.js中,这里变为rejected状态以至于能走到model.js的catch内
//   }

//   console.log('data', data);
// };
