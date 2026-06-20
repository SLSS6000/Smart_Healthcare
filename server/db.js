const mysql = require('mysql2/promise');

// 数据库配置，优先读取环境变量，默认值为用户指定的配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'smart_healthcare',
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT) : 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

console.log(`🔌 正在连接 MySQL 数据库 [${dbConfig.host}:${dbConfig.port}/${dbConfig.database}] 作为用户 [${dbConfig.user}]...`);

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 验证连接是否成功的辅助方法
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL 数据库连接池初始化成功！');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL 数据库连接池初始化失败。请检查服务是否启动或配置是否正确。错误信息:', error.message);
    return false;
  }
}

// 导出 pool 和验证方法
module.exports = {
  pool,
  testConnection
};
