export default class ColumnChart {
  #element;
  chartHeight = 50;

  constructor(chartData) {
    this.data = chartData?.data;
    this.label = chartData?.label;
    this.value = chartData?.value;
    this.link = chartData?.link;
    this.formatHeading = chartData?.formatHeading;
  }

  get element() {
    if (!this.#element) {
      this.#element = this.createTemplate();
    }
    return this.#element;
  }

  createTemplate() {
    let div = document.createElement("div");
    if (!this.data || this.data.length === 0) {
      div.className = "column-chart column-chart_loading";
    } else {
      div.className = "column-chart";
    }
    div.setAttribute("style", `--chart-height: ${this.chartHeight}`);
    div.innerHTML = this.title() + this.container();
    return div;
  }

  title() {
    if (this.link) {
      return `<div class="column-chart__title">${this.label}<a href="${this.link}" class="column-chart__link">View all</a></div>`;
    }
    return `<div class="column-chart__title">${this.label}</div>`;
  }

  chartHeader() {
    if (this.formatHeading) {
      return this.formatHeading(this.value);
    }
    return this.value;
  }

  container() {
    if (!this.data || this.data.length === 0) {
      return (
        `<div class="column-chart__container">
        <div data-element="header" class="column-chart__header">` +
        this.chartHeader() +
        `</div>
      </div>`
      );
    } else {
      return (
        `<div class="column-chart__container">
          <div data-element="header" class="column-chart__header">` +
        this.chartHeader() +
        `</div>
          <div data-element="body" class="column-chart__chart">` +
        getColumnProps(this.data)
          .map(
            (x) =>
              `<div style="--value: ${x.value}" data-tooltip="${x.percent}"></div>`
          )
          .join("\n") +
        `</div>
        </div>
      </div>
          `
      );
    }
  }

  update(newData) {
    this.data = newData;
    this.render();
  }

  render() {
    this.element
      .querySelector(".column-chart__container")
      ?.replaceWith(this.container());
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

export function getColumnProps(data) {
  const maxValue = Math.max(...data);
  const scale = 50 / maxValue;

  return data.map((item) => {
    return {
      percent: ((item / maxValue) * 100).toFixed(0) + "%",
      value: String(Math.floor(item * scale)),
    };
  });
}
