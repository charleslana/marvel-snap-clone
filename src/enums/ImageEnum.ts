export enum ImageEnum {
  Background = 'Background',
  Example = 'Example',
}

export function getImageEnum(value: string): string {
  const enumValue = Object.values(ImageEnum).find((enumValue) => enumValue === value);
  return enumValue ?? '';
}
