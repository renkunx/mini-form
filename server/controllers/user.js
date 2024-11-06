const mysql = require('mysql2/promise');
const config = require('../config');

// 创建数据库连接池
const pool = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.user,
  password: config.mysql.pass,
  database: config.mysql.db
});

// 获取用户信息
exports.getUserInfo = async (ctx) => {
  if (ctx.state.$wxInfo.loginState !== 1) {
    ctx.state.code = -1;
    return;
  }
  
  try {
    const openId = ctx.state.$wxInfo.userinfo.openId;
    const [rows] = await pool.execute(
      'SELECT avatarUrl, nickname, gender, phone, open_id FROM cUserInfo WHERE open_id = ?',
      [openId]
    );
    
    ctx.state.data = rows[0] || ctx.state.$wxInfo.userinfo;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    ctx.state.code = -1;
    ctx.state.data = { error: '获取用户信息失败' };
  }
};

// 更新用户信息
exports.updateUserInfo = async (ctx) => {
  if (ctx.state.$wxInfo.loginState !== 1) {
    ctx.state.code = -1;
    return;
  }

  const { avatarUrl, nickname, gender, phone } = ctx.request.body;
  const { openId } = ctx.state.$wxInfo.userinfo;
  try {
    const [existing] = await pool.execute(
      'SELECT * FROM cUserInfo WHERE open_id = ?',
      [openId]
    );

    // 构建更新字段和值
    const updateFields = [];
    const values = [];
    
    if (avatarUrl !== undefined) {
      updateFields.push('avatarUrl = ?');
      values.push(avatarUrl);
    }
    if (nickname !== undefined) {
      updateFields.push('nickname = ?');
      values.push(nickname);
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      values.push(gender);
    }
    if (phone !== undefined) {
      updateFields.push('phone = ?');
      values.push(phone);
    }
    
    if (existing.length > 0) {
      // 只有有字段更新时才执行更新
      if (updateFields.length > 0) {
        updateFields.push('update_time = NOW()');
        const sql = `UPDATE cUserInfo SET ${updateFields.join(', ')} WHERE open_id = ?`;
        values.push(openId);
        await pool.execute(sql, values);
      }
    } else {
      // 插入新用户时使用默认值
      const defaultUserInfo = ctx.state.$wxInfo.userinfo;
      await pool.execute(
        `INSERT INTO cUserInfo 
         (open_id, avatarUrl, nickname, gender, phone, create_time, update_time)
         VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          openId,
          avatarUrl || defaultUserInfo.avatarUrl,
          nickname || defaultUserInfo.nickName,
          gender || defaultUserInfo.gender,
          phone || ''
        ]
      );
    }

    ctx.state.code = 0;
    ctx.state.data = { message: '用户信息更新成功' };
  } catch (error) {
    console.error('更新用户信息失败:', error);
    ctx.state.code = -1;
    ctx.state.data = { error: '更新用户信息失败' };
  }
};
