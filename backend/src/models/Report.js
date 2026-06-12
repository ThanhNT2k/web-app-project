// src/models/reportModel.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Đường dẫn đến file config db của bạn

const Report = sequelize.define('Report', {
    user_id: DataTypes.INTEGER,
    chapter_id: DataTypes.INTEGER,
    reason: DataTypes.STRING,
    description: DataTypes.TEXT,
    status: DataTypes.ENUM('NEW', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED')
}, {
    tableName: 'reports', // Phải khớp với tên bảng trong Postgres (chữ thường)
    timestamps: false
});

module.exports = Report;