const containerService = require('../services/containerService');

async function getAllContainers(req, res) {
    try {
        const containers = await containerService.getAllContainers();
        
        res.json({
            success: true,
            data: containers,
            count: containers.length
        });
    } catch (error) {
        console.error('Ошибка при получении списка тары:', error);
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при получении списка тары',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function getContainerById(req, res) {
    try {
        const containerId = parseInt(req.params.id);
        const container = await containerService.getContainerById(containerId);
        
        if (!container) {
            return res.status(404).json({
                success: false,
                error: 'Тара не найдена'
            });
        }

        res.json({
            success: true,
            data: container
        });
    } catch (error) {
        console.error('Ошибка при получении тары:', error);
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при получении тары',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function createContainer(req, res) {
    try {
        const containerData = {
            name: req.body.name,
            weight: req.body.weight,
            width: req.body.width,
            height: req.body.height
        };

        const newContainer = await containerService.createContainer(containerData);
        
        res.status(201).json({
            success: true,
            data: newContainer,
            message: 'Тара успешно создана'
        });
    } catch (error) {
        console.error('Ошибка при создании тары:', error);
        
        if (error.message.includes('уже существует')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при создании тары',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function updateContainer(req, res) {
    try {
        const containerId = parseInt(req.params.id);
        
        const updateData = {
            name: req.body.name,
            weight: req.body.weight,
            width: req.body.width,
            height: req.body.height
        };

        const updatedContainer = await containerService.updateContainer(containerId, updateData);
        
        res.json({
            success: true,
            data: updatedContainer,
            message: 'Тара успешно обновлена'
        });
    } catch (error) {
        console.error('Ошибка при обновлении тары:', error);
        
        if (error.message.includes('не найдена') || 
            error.message.includes('уже существует')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при обновлении тары',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function deleteContainer(req, res) {
    try {
        const containerId = parseInt(req.params.id);
        
        await containerService.deleteContainer(containerId);
        
        res.json({
            success: true,
            message: 'Тара успешно удалена'
        });
    } catch (error) {
        console.error('Ошибка при удалении тары:', error);
        
        if (error.message.includes('не найдена')) {
            return res.status(404).json({
                success: false,
                error: error.message
            });
        }
        
        if (error.message.includes('используется')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при удалении тары',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    getAllContainers,
    getContainerById,
    createContainer,
    updateContainer,
    deleteContainer
};