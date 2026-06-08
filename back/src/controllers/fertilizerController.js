const fertilizerService = require('../services/fertilizerService');

async function getAllFertilizers(req, res) {
    try {
        const fertilizers = await fertilizerService.getAllFertilizers();
        
        res.json({
            success: true,
            data: fertilizers,
            count: fertilizers.length
        });
    } catch (error) {
        console.error('Ошибка при получении списка удобрений:', error);
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при получении списка удобрений',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function getFertilizerById(req, res) {
    try {
        const fertilizerId = parseInt(req.params.id);
        const fertilizer = await fertilizerService.getFertilizerById(fertilizerId);
        
        if (!fertilizer) {
            return res.status(404).json({
                success: false,
                error: 'Удобрение не найдено'
            });
        }

        res.json({
            success: true,
            data: fertilizer
        });
    } catch (error) {
        console.error('Ошибка при получении удобрения:', error);
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при получении удобрения',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function createFertilizer(req, res) {
    try {
        const fertilizerData = {
            name: req.body.name,
            weight: req.body.weight,
            containerId: req.body.containerId
        };

        const newFertilizer = await fertilizerService.createFertilizer(fertilizerData);
        
        res.status(201).json({
            success: true,
            data: newFertilizer,
            message: 'Удобрение успешно создано'
        });
    } catch (error) {
        console.error('Ошибка при создании удобрения:', error);
        
        if (error.message.includes('уже существует')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        if (error.message.includes('Тара не найдена')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при создании удобрения',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function updateFertilizer(req, res) {
    try {
        const fertilizerId = parseInt(req.params.id);
        
        const updateData = {
            name: req.body.name,
            weight: req.body.weight,
            containerId: req.body.containerId
        };

        const updatedFertilizer = await fertilizerService.updateFertilizer(fertilizerId, updateData);
        
        res.json({
            success: true,
            data: updatedFertilizer,
            message: 'Удобрение успешно обновлено'
        });
    } catch (error) {
        console.error('Ошибка при обновлении удобрения:', error);
        
        if (error.message.includes('не найдено') || 
            error.message.includes('уже существует') ||
            error.message.includes('Тара не найдена')) {
            return res.status(400).json({
                success: false,
                error: error.message
            });
        }
        
        res.status(500).json({ 
            success: false,
            error: 'Ошибка сервера при обновлении удобрения',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

async function deleteFertilizer(req, res) {
    try {
        const fertilizerId = parseInt(req.params.id);
        
        await fertilizerService.deleteFertilizer(fertilizerId);
        
        res.json({
            success: true,
            message: 'Удобрение успешно удалено'
        });
    } catch (error) {
        console.error('Ошибка при удалении удобрения:', error);
        
        if (error.message.includes('не найдено')) {
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
            error: 'Ошибка сервера при удалении удобрения',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    getAllFertilizers,
    getFertilizerById,
    createFertilizer,
    updateFertilizer,
    deleteFertilizer
};