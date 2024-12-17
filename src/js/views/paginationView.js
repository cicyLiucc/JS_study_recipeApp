import View from './View.js';
import icons from 'url:../../img/icons.svg'; //Parcel2

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  generateMarkupBtnPrev(curPage) {
    return `
        <button data-goto="${
          curPage - 1
        }" class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-left"></use>
            </svg>
            <span>Page ${curPage - 1}</span>
          </button>
    `;
  }

  generateMarkupBtnNext(curPage) {
    return `
        <button data-goto="${
          curPage + 1
        }" class="btn--inline pagination__btn--next">
            <svg class="search__icon">
              <use href="${icons}#icon-arrow-right"></use>
            </svg>
            <span>Page ${curPage + 1}</span>
          </button>
    `;
  }
  _generateMarkup() {
    // 计算有几页
    const curPage = this._data.page;
    const numPages = Math.ceil(
      this._data.results.length / this._data.resultsPerPage
    );
    console.log(numPages);

    // 当前位于Page 1, 且无别的page了只有一页
    if (numPages === 1) return '';

    // 当前位于Page 1,还有别的pages
    if (curPage === 1 && numPages > 1) {
      return this.generateMarkupBtnNext(curPage);
    }
    // 当前位于最后一页
    if (curPage === numPages && numPages > 1) {
      return this.generateMarkupBtnPrev(curPage);
    }
    // 当前位于中间Other pages
    if (curPage < numPages) {
      return (
        this.generateMarkupBtnPrev(curPage) +
        this.generateMarkupBtnNext(curPage)
      );
    }
  }

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline'); //closest: 保证在按钮上的每一个最近元素点击都会响应
      if (!btn) return;

      const goToPage = +btn.dataset.goto; //转换为Number类型
      handler(goToPage); //传给handler->传给Controller
      console.log(btn);
    });
  }
}

/* <button class="btn--inline pagination__btn--prev">
            <svg class="search__icon">
              <use href="src/img/icons.svg#icon-arrow-left"></use>
            </svg>
            <span>Page 1</span>
          </button>
          <button class="btn--inline pagination__btn--next">
            <span>Page 3</span>
            <svg class="search__icon">
              <use href="src/img/icons.svg#icon-arrow-right"></use>
            </svg>
          </button> */
export default new PaginationView();
