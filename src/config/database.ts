// Configurações temporárias - mover para .env posteriormente
export const DB_CONFIG = {
  user: 'postgres',
  password: 'gZ33eBHvoNJAaXCd90SzYhZ1tehUT386MJe56PsfroixeVZeuk',
  host: 'vps.iaautomation-dev.com.br',
  port: 5432,
  database: 'bingo',
} as const;

export const APP_CONFIG = {
  maxCartelasPorPedido: 500,
  maxPedidosAbertosPorVendedor: 5,
} as const;