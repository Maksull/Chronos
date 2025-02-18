import { databaseConfig } from '@/config/database';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource(databaseConfig);
