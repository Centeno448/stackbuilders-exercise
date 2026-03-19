import { Table, Column, Model } from 'sequelize-typescript';

@Table({ tableName: 'requests', createdAt: false, updatedAt: false })
export class Request extends Model {
  @Column
  declare filter: string;

  @Column
  declare time: Date;
}
