import Phaser from 'phaser';

interface SelectOption {
  value: string;
  text: string;
}

interface SelectConfig {
  width?: number;
  height?: number;
  options?: SelectOption[];
  defaultValue?: string;
}

export class Select extends Phaser.GameObjects.DOMElement {
  constructor(scene: Phaser.Scene, x: number, y: number, config: SelectConfig = {}) {
    super(scene, x, y);

    const width = config.width ?? 200;
    const height = config.height ?? 38;
    const options = config.options ?? [];
    const defaultValue = config.defaultValue;

    let optionsHtml = '';

    if (defaultValue) {
      optionsHtml += `<option value="" disabled selected>${defaultValue}</option>`;
    }

    options.forEach((option) => {
      optionsHtml += `<option value="${option.value}">${option.text}</option>`;
    });

    const style = `
      background-color: #1b1e29;
      border: 1px solid #292d3e;
      border-radius: 6px;
      padding: .5rem 1rem;
      color: #fff;
      width: ${width}px;
      height: ${height}px;
      font-size: 16px;
      cursor: pointer;
    `;

    const html = `<select name="select" style="${style}">${optionsHtml}</select>`;

    this.createFromHTML(html);

    this.addListener('change');

    scene.add.existing(this);
  }

  getValue(): string {
    const select = this.getChildByName('select') as HTMLSelectElement;
    return select?.value ?? '';
  }

  setValue(value: string) {
    const select = this.getChildByName('select') as HTMLSelectElement;
    if (select) select.value = value;
  }
}
