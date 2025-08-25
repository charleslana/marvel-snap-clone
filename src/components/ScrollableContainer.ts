import Phaser from 'phaser';
import { UIFactory } from './UIFactory';

export class ScrollableContainer extends Phaser.GameObjects.Container {
  public readonly viewWidth: number;
  public readonly viewHeight: number;
  private contentContainer: Phaser.GameObjects.Container;
  private scrollMask: Phaser.Display.Masks.GeometryMask;

  // Elementos da barra de rolagem
  private scrollTrack?: Phaser.GameObjects.Graphics;
  private scrollThumb?: Phaser.GameObjects.Graphics;
  private thumbHeight: number = 30; // Armazenar altura do thumb
  private isDragging: boolean = false;
  private dragOffsetY: number = 0;

  // Configurações da scrollbar
  private scrollbarWidth: number = 20;
  private scrollbarPadding: number = 80;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number) {
    super(scene, x, y);
    this.viewWidth = width;
    this.viewHeight = height;

    // Cria o container de conteúdo
    this.contentContainer = this.scene.add.container(0, 0);
    this.add(this.contentContainer);

    // Criar a máscara com coordenadas relativas
    const maskShape = this.scene.make.graphics();
    maskShape.fillRect(0, 0, width, height);
    this.scrollMask = maskShape.createGeometryMask();

    // Posicionar a máscara corretamente
    maskShape.setPosition(x, y);
    this.contentContainer.setMask(this.scrollMask);

    // Setup do scroll com mouse wheel
    this.scene.input.on('wheel', this.onWheel, this);

    // Setup dos eventos de drag
    this.scene.input.on('pointerup', this.onPointerUp, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);

    scene.add.existing(this);
  }

  public addContent(
    gameObjects: Phaser.GameObjects.GameObject | Phaser.GameObjects.GameObject[]
  ): void {
    this.contentContainer.add(gameObjects);
    // Atualizar scrollbar quando conteúdo é adicionado
    this.updateScrollbar();
  }

  public getContent(): Phaser.GameObjects.GameObject[] {
    return this.contentContainer.list;
  }

  public clearContent(): void {
    this.contentContainer.removeAll(true);
    this.contentContainer.y = 0;
    this.updateScrollbar();
  }

  private updateScrollbar(): void {
    // Remove scrollbar existente
    if (this.scrollTrack) {
      this.scrollTrack.destroy();
      this.scrollTrack = undefined;
    }
    if (this.scrollThumb) {
      this.scrollThumb.destroy();
      this.scrollThumb = undefined;
    }

    const contentHeight = this.getContentHeight();

    // Só mostrar scrollbar se o conteúdo for maior que a área visível
    if (contentHeight <= this.viewHeight) {
      return;
    }

    this.createScrollbar(contentHeight);
  }

  private createScrollbar(contentHeight: number): void {
    const scrollbarX = this.viewWidth - this.scrollbarWidth - this.scrollbarPadding;

    // Criar track (trilha)
    this.scrollTrack = UIFactory.createRoundedRectangle(
      this.scene,
      scrollbarX,
      0,
      this.scrollbarWidth,
      this.viewHeight,
      0x555555,
      1,
      6
    );

    // Calcular tamanho do thumb proporcional
    const visibleRatio = this.viewHeight / contentHeight;
    this.thumbHeight = Math.max(30, this.viewHeight * visibleRatio);

    // Criar thumb
    this.scrollThumb = UIFactory.createRoundedRectangle(
      this.scene,
      scrollbarX,
      0,
      this.scrollbarWidth,
      this.thumbHeight,
      0x888888,
      1,
      6
    );

    // Adicionar ao container
    this.add([this.scrollTrack, this.scrollThumb]);

    // Configurar interatividade do thumb
    this.scrollThumb
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.isDragging = true;
        this.dragOffsetY = pointer.y - (this.y + this.scrollThumb!.y);
      });

    // Atualizar posição inicial do thumb
    this.updateThumbPosition();
  }

  private updateThumbPosition(): void {
    if (!this.scrollThumb) return;

    const contentHeight = this.getContentHeight();
    const scrollRange = this.viewHeight - this.thumbHeight;
    const contentRange = contentHeight - this.viewHeight;

    if (contentRange <= 0) return;

    const scrollPercent = Math.abs(this.contentContainer.y) / contentRange;
    this.scrollThumb.y = scrollPercent * scrollRange;
  }

  private getContentHeight(): number {
    if (this.contentContainer.list.length === 0) return 0;

    const bounds = this.contentContainer.getBounds();
    return bounds.height;
  }

  private onWheel(
    pointer: Phaser.Input.Pointer,
    _gameObjects: Phaser.GameObjects.GameObject[],
    _dx: number,
    dy: number
  ): void {
    // Verificar se o mouse está dentro da área do container
    const bounds = new Phaser.Geom.Rectangle(this.x, this.y, this.viewWidth, this.viewHeight);
    if (!Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
      return;
    }

    this.scroll(dy * 0.5);
  }

  private scroll(deltaY: number): void {
    const contentHeight = this.getContentHeight();
    if (contentHeight <= this.viewHeight) {
      return;
    }

    let newY = this.contentContainer.y - deltaY;
    const minY = -(contentHeight - this.viewHeight);
    const maxY = 0;

    this.contentContainer.y = Phaser.Math.Clamp(newY, minY, maxY);
    this.updateThumbPosition();
  }

  private onPointerUp(): void {
    this.isDragging = false;
  }

  private onPointerMove(pointer: Phaser.Input.Pointer): void {
    if (!this.isDragging || !this.scrollThumb) return;

    const contentHeight = this.getContentHeight();
    if (contentHeight <= this.viewHeight) return;

    // Calcular nova posição do thumb
    const top = 0;
    const bottom = this.viewHeight - this.thumbHeight;
    const newThumbY = Phaser.Math.Clamp(pointer.y - this.y - this.dragOffsetY, top, bottom);

    this.scrollThumb.y = newThumbY;

    // Calcular nova posição do conteúdo baseada na posição do thumb
    const scrollRange = this.viewHeight - this.thumbHeight;
    const contentRange = contentHeight - this.viewHeight;
    const scrollPercent = this.scrollThumb.y / scrollRange;

    this.contentContainer.y = -scrollPercent * contentRange;
  }

  preDestroy() {
    // Limpar todos os event listeners
    this.scene.input.off('wheel', this.onWheel, this);
    this.scene.input.off('pointerup', this.onPointerUp, this);
    this.scene.input.off('pointermove', this.onPointerMove, this);

    super.preDestroy();
  }
}
