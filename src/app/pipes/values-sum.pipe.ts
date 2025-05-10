import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'valuesSum', standalone: true })
export class ValuesSumPipe implements PipeTransform {
  transform(value: { [key: string]: number }): number {
    if (!value) return 0;
    return Object.values(value).reduce((sum, v) => sum + v, 0);
  }
}
