// Controller: 专门 Handle events

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { MODAL_CLOSE_SEC } from './config.js';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

const recipeContainer = document.querySelector('.recipe');

// API: https://forkify-api.herokuapp.com/v2
// 直接访问会被墙，但数据是可以fetch到的

// 热加载，避免重复刷新整个页面
// if (module.hot) {
//   module.hot.accept();
// }
///////////////////////////////////////

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1); //把 #去掉
    // 先加载一下“加载的动画”
    if (!id) return;
    recipeView.renderSpinner();

    // 0. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    // 1. loading recipe
    await model.loadRecipe(id); //它返回的是一个Promise
    // const { recipe } = model.state;

    // 2. 渲染 recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 渲染"加载中..."图标
    resultsView.renderSpinner();
    // console.log(resultsView);
    // 1. 获取搜索的值
    const query = searchView.getQuery();
    if (!query) return;

    // 2. 加载搜索结果
    await model.loadSearchResults(query);

    // 3. 渲染搜索结果
    console.log(model.state.search.results);
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4. 渲染初始的分页按钮,传入整个搜索对象
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // 1. 渲染新的搜索结果
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2. 渲染点击按钮后的的分页按钮
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // 更新 recipe servings (in state)
  model.updateServings(newServings); //几人份的菜单
  // 更新 recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1. 添加/删除收藏标记
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  // 2. 更新recipe view
  recipeView.update(model.state.recipe);

  // 3. 渲染bookmarks
  bookmarksView.render(model.state.bookmarks);
  // console.log(model.state.recipe);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

// 上传菜单
const controlAddRecipe = async function (newRecipe) {
  // Show Spinner
  addRecipeView.renderSpinner();
  // console.log(newRecipe);
  try {
    // Upload recipe
    await model.uploadRecipe(newRecipe);
    console.log('newRecipe', newRecipe);
    console.log(model.state.recipe);

    // Render Recipe
    recipeView.render(model.state.recipe);

    // Success Message
    addRecipeView.renderMessage();

    // Render Bookmark View
    bookmarksView.render(model.state.bookmarks);

    // Change hash ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // window.history.back();

    // Close Form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('🐞', err);
    addRecipeView.renderError(err.message);
  }
};
const newFeature = function () {
  console.log('Just simulate the change~');
};

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  newFeature();
  // controlServings();
};
init();

// 👇仅供开发环境下使用
const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
