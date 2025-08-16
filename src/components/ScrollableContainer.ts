import Phaser from 'phaser';

export class ScrollableContainer extends Phaser.GameObjects.Container {
  private viewHeight: number;
  private contentContainer: Phaser.GameObjects.Container;
  private scrollMask: Phaser.Display.Masks.GeometryMask;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);
    this.width = width;
    this.viewHeight = height;

    // Container interno que guardará o conteúdo e será movido
    this.contentContainer = this.scene.add.container(0, 0);
    this.add(this.contentContainer);

    // Máscara para a área visível
    const maskShape = this.scene.make.graphics().fillRect(x, y, width, height);
    this.scrollMask = maskShape.createGeometryMask();
    this.contentContainer.setMask(this.scrollMask);

    // Adiciona o listener de rolagem
    this.scene.input.on('wheel', this.onWheel, this);

    scene.add.existing(this);
  }

  // Adiciona um ou mais GameObjects ao conteúdo rolável
  public addContent(
    gameObjects: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]
  ): void {
    this.contentContainer.add(gameObjects);
  }

  // Retorna a lista de GameObjects do conteúdo
  public getContent(): Phaser.GameObjects.GameObject[] {
    return this.contentContainer.list;
  }

  private onWheel(
    pointer: Phaser.Input.Pointer,
    _gameObjects: Phaser.GameObjects.GameObject[],
    _dx: number,
    dy: number
  ): void {
    const bounds = new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.viewHeight);
    if (!Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
      return;
    }

    const contentHeight = this.contentContainer.getBounds().height;
    if (contentHeight <= this.viewHeight) {
      return;
    }

    let newY = this.contentContainer.y - dy * 0.5;
    const minY = -(contentHeight - this.viewHeight);
    const maxY = 0;

    this.contentContainer.y = Phaser.Math.Clamp(newY, minY, maxY);
  }

  // Limpa o listener quando a cena for destruída
  preDestroy() {
    this.scene.input.off('wheel', this.onWheel, this);
    super.preDestroy();
  }
}
