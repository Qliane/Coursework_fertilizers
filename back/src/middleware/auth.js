const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Требуется аутентификация' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        req.user = {
            id: decoded.userid || decoded.userId || decoded.id,
            roleId: decoded.roleid || decoded.roleId,
            storageId: decoded.storageid || decoded.storageId,
            roleName: decoded.rolename || decoded.roleName
        };
        
        console.log('DEBUG: User authenticated:', req.user);
        
        next();
    } catch (error) {
        console.error('Ошибка верификации токена:', error);
        return res.status(401).json({ error: 'Неверный или просроченный токен' });
    }
}

// Middleware для проверки ролей
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Требуется аутентификация' });
        }

        if (!allowedRoles.includes(req.user.roleId)) {
            return res.status(403).json({ 
                error: 'Недостаточно прав для выполнения операции' 
            });
        }

        next();
    };
}

module.exports = { authenticate, requireRole };