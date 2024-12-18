export default class RangePicker {
  rangePickerOpenClass = "rangepicker_open";

  constructor({ from, to }) {
    this.from = from;
    this.to = to;

    this.createElement();

    this.subElements = {
      from: this.element.querySelector('[data-element="from"]'),
      to: this.element.querySelector('[data-element="to"]'),
      input: this.element.querySelector('[data-element="input"]'),
      selector: this.element.querySelector(".rangepicker__selector"),
    };

    this.firstMonthDate = new Date(from);

    this.createInputListeners();
  }

  renderSelector() {
    this.subElements.selector.innerHTML = this.createSelectorTemplate();

    this.subElements.leftArrow = this.element.querySelector(
      ".rangepicker__selector-control-left"
    );
    this.subElements.rightArrow = this.element.querySelector(
      ".rangepicker__selector-control-right"
    );
    this.subElements.calendarFirst = this.element.querySelectorAll(
      ".rangepicker__calendar"
    )[0];
    this.subElements.calendarSecond = this.element.querySelectorAll(
      ".rangepicker__calendar"
    )[1];

    this.renderCalendars();

    this.updateMonthArrays();

    this.setDaysOfWeek();

    this.setFromDate(this.from);
    this.setToDate(this.to);

    this.isSelected = true;

    this.setBetween();

    this.createSelectorListeners();
  }

  createElement() {
    const element = document.createElement("div");
    element.innerHTML = this.createTemplate();
    this.element = element.firstElementChild;
  }

  createSelectorTemplate() {
    return ` <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      <div class="rangepicker__calendar">
      </div>
      <div class="rangepicker__calendar">
      </div>`;
  }

  createTemplate() {
    return `<div class="rangepicker">
    <div class="rangepicker__input" data-element="input">
      <span data-element="from">${this.formatDate(this.from)}</span> -
      <span data-element="to">${this.formatDate(this.to)}</span>
    </div>
    <div class="rangepicker__selector" data-element="selector"></div>
    </div>`;
  }

  getFirstMonthCells() {
    this.firstMonthCells = [];
  }

  formatDate(date) {
    return date.toLocaleString("ru", { dateStyle: "short" });
  }

  updateDateInputs() {
    this.subElements.from.textContent = this.formatDate(this.from);
    this.subElements.to.textContent = this.formatDate(this.to);
  }

  openRangePicker() {
    this.element.classList.add(this.rangePickerOpenClass);
  }

  closeRangePicker() {
    this.element.classList.remove(this.rangePickerOpenClass);
  }

  isRangePickerOpened() {
    return this.element.classList.contains(this.rangePickerOpenClass);
  }

  handleInputClick = (event) => {
    const input = event.target.closest('[data-element="input"]');
    if (!input || !this.subElements.input === input) return;

    if (!this.isRangePickerOpened()) {
      this.renderSelector();
      this.openRangePicker();
    } else {
      this.closeRangePicker();
    }
  };

  handleDocumentClick = (event) => {
    const rangepicker = event.target.closest(".rangepicker");
    if (!rangepicker || !this.element === rangepicker) {
      this.closeRangePicker();
    }
  };

  handleLeftArrowClick = (event) => {
    const arrow = event.target.closest(".rangepicker__selector-control-left");
    if (!arrow || !this.subElements.leftArrow === arrow) return;
    event.stopPropagation();
    this.firstMonthDate = new Date(
      this.firstMonthDate.getFullYear(),
      this.firstMonthDate.getMonth() - 1,
      1
    );

    this.renderCalendars();
    this.setDaysOfWeek();

    if (this.isSelected) {
      this.setFromDate(this.from);
      this.setToDate(this.to);
      this.setBetween();
    }
  };

  handleRightArrowClick = (event) => {
    const arrow = event.target.closest(".rangepicker__selector-control-right");
    if (!arrow || !this.subElements.rightArrow === arrow) return;
    event.stopPropagation();
    this.firstMonthDate = new Date(
      this.firstMonthDate.getFullYear(),
      this.firstMonthDate.getMonth() + 1,
      1
    );

    this.renderCalendars();
    this.setDaysOfWeek();

    if (this.isSelected) {
      this.setFromDate(this.from);
      this.setToDate(this.to);
      this.setBetween();
    } else if (this.cellIndexFrom !== null) {
      this.setFromDate(this.from);
    }
  };

  handleCellClick = (event) => {
    const cell = event.target;
    if (!cell.classList.contains("rangepicker__cell")) return;

    if (this.isSelected) {
      this.clearSelectedRange();
      let newDate = new Date(cell.getAttribute("data-value"));
      newDate.setDate(newDate.getDate() - 1);

      this.from = newDate;

      this.setFromDate(this.from);

      this.isSelected = false;
    } else {
      let newDate = new Date(cell.getAttribute("data-value"));
      newDate.setDate(newDate.getDate() - 1);

      if (newDate < this.from) {
        this.clearSelectedRange();
        this.to = this.from;
        this.from = newDate;
        this.setFromDate(this.from);
      } else {
        this.to = newDate;
      }

      this.setToDate(this.to);
      this.isSelected = true;
      this.setBetween();
      this.updateDateInputs();

      this.dispatchSelectEvent();
      this.closeRangePicker();
    }
  };

  dispatchSelectEvent() {
    this.element.dispatchEvent(
      new CustomEvent("date-select", {
        bubbles: true,
      })
    );
  }

  createSelectorListeners() {
    this.subElements.leftArrow.addEventListener(
      "click",
      this.handleLeftArrowClick
    );
    this.subElements.rightArrow.addEventListener(
      "click",
      this.handleRightArrowClick
    );
    this.subElements.selector.addEventListener("click", this.handleCellClick);
  }

  createInputListeners() {
    document.addEventListener("click", this.handleDocumentClick, true);
    this.subElements.input.addEventListener("click", this.handleInputClick);
  }

  removeSelectorListeners() {
    this.subElements.leftArrow?.removeEventListener(
      "click",
      this.handleLeftArrowClick
    );
    this.subElements.rightArrow?.removeEventListener(
      "click",
      this.handleRightArrowClick
    );
    this.subElements.selector?.removeEventListener(
      "click",
      this.handleCellClick
    );
  }

  removeInputListeners() {
    document.removeEventListener("click", this.handleDocumentClick, true);
    this.subElements.input.removeEventListener("click", this.handleInputClick);
  }

  getDaysInMonth(month, year) {
    return new Date(year, month + 1, 0).getDate();
  }

  getMonthName(date) {
    return date.toLocaleString("ru", { month: "long" });
  }

  setDaysOfWeek() {
    this.firstMonthCellArray[0].setAttribute(
      "style",
      `--start-from: ${new Date(
        this.firstMonthDate.getFullYear(),
        this.firstMonthDate.getMonth(),
        1
      ).getDay()}`
    );
    this.secondMonthCellArray[0].setAttribute(
      "style",
      `--start-from: ${new Date(
        this.firstMonthDate.getFullYear(),
        this.firstMonthDate.getMonth() + 1,
        1
      ).getDay()}`
    );
  }

  setFromDate(date) {
    const allCellsArr = this.getAllCellsArr();
    const cellIndex = this.getCellIndexByDate(date, allCellsArr);
    if (cellIndex !== -1) {
      allCellsArr[cellIndex].classList.add("rangepicker__selected-from");
    }
  }

  setToDate(date) {
    const allCellsArr = this.getAllCellsArr();
    const cellIndex = this.getCellIndexByDate(date, allCellsArr);
    if (cellIndex !== -1) {
      allCellsArr[cellIndex].classList.add("rangepicker__selected-to");
    }
  }

  setBetween() {
    const allCellsArr = this.getAllCellsArr();

    if (this.isSelected) {
      allCellsArr.forEach((cell) => {
        let date = new Date(cell.getAttribute("data-value"));
        date.setDate(date.getDate() - 1);
        if (date > this.from && date < this.to) {
          cell.classList.add("rangepicker__selected-between");
        }
      });
    }
  }

  clearSelectedRange() {
    this.cellIndexFrom = null;
    this.cellIndexTo = null;

    this.subElements.selector
      .querySelector(".rangepicker__selected-from")
      ?.classList.remove("rangepicker__selected-from");

    this.subElements.selector
      .querySelector(".rangepicker__selected-to")
      ?.classList.remove("rangepicker__selected-to");

    this.subElements.selector
      .querySelectorAll(".rangepicker__selected-between")
      .forEach((cell) => {
        cell.classList.remove("rangepicker__selected-between");
      });
  }

  getAllCellsArr() {
    return [...this.firstMonthCellArray, ...this.secondMonthCellArray];
  }

  getCellIndexByDate(date, arr) {
    return arr.findIndex(
      (cell) =>
        cell.getAttribute("data-value") ===
        new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate() + 1
        ).toISOString()
    );
  }

  updateMonthArrays() {
    this.firstMonthCellArray =
      this.subElements.calendarFirst.getElementsByClassName(
        "rangepicker__cell"
      );
    this.secondMonthCellArray =
      this.subElements.calendarSecond.getElementsByClassName(
        "rangepicker__cell"
      );
  }

  createDateGridCell(month, year) {
    const cells = [];
    const dayInMonth = this.getDaysInMonth(month, year);

    for (let i = 1; i <= dayInMonth; i++) {
      cells.push(
        `<button type="button" class="rangepicker__cell" data-value="${new Date(
          year,
          month,
          i + 1
        ).toISOString()}">${i}</button>`
      );
    }

    return cells.join("");
  }

  renderCalendars() {
    this.subElements.calendarFirst.innerHTML = this.createCalendarTemplate(
      this.firstMonthDate
    );
    this.subElements.calendarSecond.innerHTML = this.createCalendarTemplate(
      new Date(
        this.firstMonthDate.getFullYear(),
        this.firstMonthDate.getMonth() + 1,
        1
      )
    );
  }

  createCalendarTemplate(date) {
    return `<div class="rangepicker__month-indicator">
          <time datetime="${this.getMonthName(date)}">${this.getMonthName(
      date
    )}</time>
        </div>
        <div class="rangepicker__day-of-week">
          <div>Пн</div>
          <div>Вт</div>
          <div>Ср</div>
          <div>Чт</div>
          <div>Пт</div>
          <div>Сб</div>
          <div>Вс</div>
        </div>
        <div class="rangepicker__date-grid">
          ${this.createDateGridCell(date.getMonth(), date.getFullYear())}
        </div>
      </div>`;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.removeInputListeners();
    this.removeSelectorListeners();
    this.remove();
  }
}
