import { type UUID } from 'crypto';
import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'requests', createdAt: false, updatedAt: false })
export class Request extends Model {
  @Column({ primaryKey: true, type: DataType.UUID })
  declare id: UUID;

  @Column({ type: DataType.STRING(10), allowNull: false })
  declare filter: string;

  @Column({ allowNull: false })
  declare time: Date;
}
