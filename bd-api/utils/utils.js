const Photo = require('../models/photo');
const DetectedObject = require('../models/detectedObject');

async function fetchAllPhotos() {
    try {
        const allPhotos = await Photo.findAll({
            include: [DetectedObject],
        });

        return allPhotos.map((photo) => ({
            id: photo.id,
            objects: photo.DetectedObjects.map((obj) => ({
                objectName: obj.objectName,
                relativeSize: obj.relativeSize,
            })),
            target: photo.target
        }));
    } catch (error) {
        console.error(error);
        throw new Error('Nepavyko gauti visų duomenų.');
    }
}

module.exports = { fetchAllPhotos };