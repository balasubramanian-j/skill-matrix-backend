import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { FieldType, FieldVisibility } from '../settings/dto/settings.dto';

@Entity('custom_fields')
export class CustomField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({
    type: 'enum',
    enum: FieldType,
  })
  type: FieldType;

  @Column({ nullable: true })
  defaultValue: string;

  @Column()
  required: boolean;

  @Column({
    type: 'enum',
    enum: FieldVisibility,
  })
  visibility: FieldVisibility;

  @Column('simple-array', { nullable: true })
  options: string[];
} 