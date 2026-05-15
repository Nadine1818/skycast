const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            default: 'Guest User',
        },
        email: {
            type: String,
            unique: true,
            sparse: true,
        },
        favoriteLocations: [
            {
                location: String,
                latitude: Number,
                longitude: Number,
            },
        ],
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('User', userSchema);
