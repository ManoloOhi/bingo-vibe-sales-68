import { db } from '@/db/connection';
import { users, type User, type NewUser } from '@/db/schema';
import { eq } from 'drizzle-orm';

export class UserService {
  static async create(userData: Omit<NewUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || null;
  }

  static async findById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || null;
  }

  static async update(id: string, userData: Partial<User>): Promise<User | null> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || null;
  }

  static async delete(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount > 0;
  }

  static async list(tipo?: 'admin' | 'user'): Promise<User[]> {
    if (tipo) {
      return await db.select().from(users).where(eq(users.tipo, tipo));
    }
    return await db.select().from(users);
  }
}