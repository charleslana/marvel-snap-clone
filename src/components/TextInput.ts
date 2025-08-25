import Phaser from 'phaser';

export interface TextInputConfig {
  placeholder?: string;
  type?: 'text' | 'password';
  width?: number;
  height?: number;
  maxLength?: number;
}

export class TextInput extends Phaser.GameObjects.DOMElement {
  constructor(scene: Phaser.Scene, x: number, y: number, config: TextInputConfig = {}) {
    super(scene, x, y);

    const width = config.width ?? 300;
    const height = config.height ?? 38;
    const type = config.type ?? 'text';
    const placeholder = config.placeholder ?? '';
    const maxLength = config.maxLength;

    const maxLengthAttribute = maxLength ? `maxlength="${maxLength}"` : '';

    const html = `<input type="${type}" name="input" placeholder="${placeholder}" ${maxLengthAttribute}
      style="
        background-color: #1b1e29;
        border: 1px solid #292d3e;
        border-radius: 6px;
        padding: .5rem 1rem;
        color: #fff;
        width: ${width}px;
        height: ${height}px;
        font-size:16px;
        font-family: 'Red Hat Display', sans-serif;
      ">`;

    this.createFromHTML(html);
    scene.add.existing(this);
  }

  getValue(): string {
    const input = this.getChildByName('input') as HTMLInputElement;
    return input?.value ?? '';
  }

  setValue(value: string) {
    const input = this.getChildByName('input') as HTMLInputElement;
    if (input) input.value = value;
  }
}
