import { CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryColumn('text')
  token!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
