import Phaser from 'phaser';

export class ScrollableContainer extends Phaser.GameObjects.Container {
  private viewHeight: number;
  private contentContainer: Phaser.GameObjects.Container;
  private scrollMask: Phaser.Display.Masks.GeometryMask;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);
    this.width = width;
    this.viewHeight = height;

    // Cria o container de conteúdo
    this.contentContainer = this.scene.add.container(0, 0);
    this.add(this.contentContainer);

    // CORREÇÃO: Criar a máscara com coordenadas relativas (0,0) ao invés de absolutas
    const maskShape = this.scene.make.graphics();
    maskShape.fillRect(0, 0, width, height); // Usar coordenadas relativas
    this.scrollMask = maskShape.createGeometryMask();

    // Posicionar a máscara corretamente
    maskShape.setPosition(x, y);
    this.contentContainer.setMask(this.scrollMask);

    // Setup do scroll
    this.scene.input.on('wheel', this.onWheel, this);
    scene.add.existing(this);
  }

  public addContent(
    gameObjects: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]
  ): void {
    this.contentContainer.add(gameObjects);
  }

  public getContent(): Phaser.GameObjects.GameObject[] {
    return this.contentContainer.list;
  }

  public clearContent(): void {
    this.contentContainer.removeAll(true);
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

  preDestroy() {
    this.scene.input.off('wheel', this.onWheel, this);
    super.preDestroy();
  }
}
