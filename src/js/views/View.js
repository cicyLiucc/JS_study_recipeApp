import icons from 'url:../../img/icons.svg'; //Parcel2
export default class View {
  _data;
  /**
   *
   * @param {Object | Object} data
   * @param {*} render
   * @returns
   */
  render(data, render = true) {
    // 如果data数组为空,或data不是数组类型且长度为0,则返回错误信息
    if (!data || (Array.isArray(data) && data.length === 0))
      return this.renderError();

    this._data = data;
    const markup = this._generateMarkup();

    if (!render) return markup;

    this._clear(); //先格式化网页原有的内容
    // 把上面的HTML模版作为第一个孩子(afterbegin)插入到DOM
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // 👁️👁️ 只更新局部的DOM内容
  update(data) {
    this._data = data;
    //便于和之前的markup对比，后面只需更新有变动的地方
    const newMarkup = this._generateMarkup();

    //❗将newMarkup的string类型->DOM类型,newDOM类似于一个Virtual DOM
    const newDOM = document.createRange().createContextualFragment(newMarkup);

    const newElements = Array.from(newDOM.querySelectorAll('*')); //更新之后的
    const curElements = Array.from(this._parentElement.querySelectorAll('*')); //更新之前的
    // console.log(newElements);

    // 同时遍历两个新旧数组
    newElements.forEach((newEl, index) => {
      const curEl = curElements[index];

      // 1.更新 changed TEXT
      // firstChild是因为DOM元素有text的话就是firstChild, nodeValue可以获取是text元素的文本,如果不是text就返回null(参见MDN)
      if (
        !newEl.isEqualNode(curEl) &&
        newEl.firstChild?.nodeValue.trim() !== ''
      ) {
        curEl.textContent = newEl.textContent;
      }

      // 2.更新 changed ATTRIBUTES  (主要是为了改text的具体数值)
      if (!newEl.isEqualNode(curEl)) {
        // console.log('😍', newEl.attributes);
        Array.from(newEl.attributes).forEach(attr =>
          curEl.setAttribute(attr.name, attr.value)
        );
      }
    });
  }
  _clear() {
    this._parentElement.innerHTML = '';
  }

  renderSpinner() {
    const markup = `
      <div class="spinner">
        <svg>
          <use href="${icons}#icon-loader"></use>
        </svg>
      </div>`;
    this._parentElement.innerHTML = '';
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // 渲染错误信息
  // 如果没有信息传入，则用默认的_message
  renderError(message = this._errorMessage) {
    const markup = `
      <div class="error">
            <div>
              <svg>
                <use href="${icons}#icon-alert-triangle"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>
    `;
    this._parentElement.innerHTML = '';
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }

  // 渲染提示信息
  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
            <div>
              <svg>
                <use href="${icons}#icon-smile"></use>
              </svg>
            </div>
            <p>${message}</p>
          </div>
    `;
    this._parentElement.innerHTML = '';
    this._parentElement.insertAdjacentHTML('afterbegin', markup);
  }
}
