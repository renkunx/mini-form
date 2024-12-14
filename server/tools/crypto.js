const crypto = require('crypto');

const SECRET_KEY = '31348732432244b2b62f2d19cd4471ac';

/**
 * AES加密方法
 * @param {string} text 要加密的文本
 * @returns {string} 加密后的字符串
 */
function encrypt(text) {
    try {
        // 由于AES-256需要32位的key，我们需要确保密钥长度正确
        const key = Buffer.from(SECRET_KEY, 'utf8').slice(0, 32);
        const cipher = crypto.createCipheriv('aes-256-ecb', key, null);
        let encrypted = cipher.update(text, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        // 将base64转换为URL安全的格式
        return encrypted.replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    } catch (error) {
        console.error('加密错误:', error);
        return null;
    }
}

/**
 * AES解密方法
 * @param {string} encryptedText 要解密的文本
 * @returns {string} 解密后的字符串
 */
function decrypt(encryptedText) {
    try {
        // 将URL安全的base64转换回标准base64
        const standardBase64 = encryptedText
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const key = Buffer.from(SECRET_KEY, 'utf8').slice(0, 32);
        const decipher = crypto.createDecipheriv('aes-256-ecb', key, null);
        let decrypted = decipher.update(standardBase64, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        console.error('解密错误:', error);
        return null;
    }
}

// 导出函数供其他模块使用
module.exports = {
    encrypt,
    decrypt
};

// 测试代码
if (require.main === module) {
    const phoneNumber = '13800138000';
    const encrypted = encrypt(phoneNumber);
    console.log('加密的手机号:', encrypted);
    15985773045
    
    console.log('dddd',`http://yqw.fft.com.cn/nbback/qwmsg/genKFQRCode?name=${encodeURIComponent('任琨')}&phone=${encrypt('18629080248')}&manager=${encrypt('19906920597')}`)
    console.log('cccc',`http://yqw.fft.com.cn/nbback/qwmsg/genKFQRCode?name=${encrypt('任琨')}&phone=${encrypt('18629080248')}&manager=${encrypt('19906920597')}`)
    const decrypted = decrypt(encrypted);
    console.log('解密后的手机号:', decrypted);
}
