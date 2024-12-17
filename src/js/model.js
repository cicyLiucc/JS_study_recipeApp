import { async } from 'regenerator-runtime';
import { API_URL, KEY } from './config.js';
import { RES_PER_PAGE } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';
export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE, //每一页展示的条目数
  },
  bookmarks: [],
};

const createRecipeObject = function (data) {
  const { recipe } = data.data; //解构出来
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    // 如果recipe.key不存在，下面啥也不会做
    // 如果recipe.key存在，那么会返回第二项，又被扩展开来，就会显示: key: recipe.key
    ...(recipe.key && { key: recipe.key }),
  };
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);
    // 提取data中的recipe

    // 我们要从bookmark数组来加载recipe,可以保证收藏之后又返回该条recipe,收藏标记不会消失
    if (state.bookmarks.some(bookmark => bookmark.id === id))
      // 只要数组里有任一一个recipe的id与当前要加载recipe的id相同，我们就将当前要加载的recipe的bookmarked设置为true,always true
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;
    // console.log(state.recipe);
  } catch (err) {
    console.error(`${err}🐞🐞🐞🐞`);
    throw err; //继续把错误向下传播,使Promise变为rejected状态,被Controller接收,使之能被渲染出来
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(data);
    state.search.results = data.data.recipes.map(res => {
      // 返回一个新数组只包含如下信息,存在state的search中
      return {
        id: res.id,
        title: res.title,
        publisher: res.publisher,
        image: res.image_url,
        ...(res.key && { key: res.key }),
      };
    });
    state.search.page = 1; //重新将page变为1
  } catch (err) {
    throw err;
  }
};

// 分页处理,page不传值则默认为1
export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  // resultsPerPage=10,page=1,start=0*10=0
  const start = (page - 1) * state.search.resultsPerPage;
  // end=1*10=10
  const end = page * state.search.resultsPerPage;
  // return 0-9共10条记录
  return state.search.results.slice(start, end);
};

// 更新几人份的菜单
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // 公式:newQt = oldQt * newServings / oldServings
  });
  // 更新新的state.recipe.servings值
  state.recipe.servings = newServings;
};

// 缓存bookmark数组，刷新网页不丢失
const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  // 添加收藏 到数组
  state.bookmarks.push(recipe);
  // 将当前页标记为收藏
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true; //设置一个新属性
    persistBookmarks();
  }
};

// 删除收藏标记，只需要接收id
export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  // 将其在数组中删除
  state.bookmarks.splice(index, 1);

  // 将当前页不再标记为收藏
  if (id === state.recipe.id) {
    state.recipe.bookmarked = false; //设置一个新属性
    persistBookmarks();
  }
};

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll().split(',');
        if (ingArr.length !== 3) {
          throw new Error('Wrong ingredient format!'); //这会返回一个rejected的Promise
        }
        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });
    // console.log(ingredients);

    // 上传的对象
    const recipe = {
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      servings: +newRecipe.servings,
      cooking_time: +newRecipe.cookingTime,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe); //自己上传的菜单默认就是被标记
    // console.log(data);
  } catch (err) {
    throw err;
  }
};

// 将缓存的收藏数组取出来
const init = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};

init();
