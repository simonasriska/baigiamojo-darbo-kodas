const express = require('express');
const multer = require('multer');
const Photo = require('../models/photo');
const DetectedObject = require('../models/detectedObject');
const { fetchAllPhotos } = require('../utils/utils');
const sequelize = require('../config/database');

const base64 = require('base64-js');

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const { exec } = require('child_process');
const fs = require('fs').promises;
const tmp = require('tmp');
const { spawn } = require('child_process');

const path = require('path');;
const fse = require('fs-extra');

router.post('/upload', async (req, res) => {
  const { username, password, target, check } = req.body;

  if (!username || !password || !target) {
    return res.status(400).json({ error: 'Slapyvardis, slaptažodis ir norimo palyginti vartotojo vardas yra privalomi.' });
  }

  if (check == "true") {
    try {
      const pythonProcess = spawn('python', ['../bd-scripts/scraper/main.py', username, password, target, check]);
  
      pythonProcess.on('close', async (code) => {
        if (code !== 0) {
          return res.status(404).json({ error: 'Vartotojas neegzistuoja.' });
        }
        res.status(200).json({ message: 'Vartotojas patikrintas sėkmingai.' });
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Nepavyko patikrinti vartotojo.' });
    }
  } else {
      try {
        const pythonProcess = spawn('python', ['../bd-scripts/scraper/main.py', username, password, target, check]);
    
        let stderr = '';
    
        pythonProcess.stderr.on('data', (data) => {
          stderr += data;
        });
    
        pythonProcess.on('close', async (code) => {
          if (code !== 0) {
            console.error(`exec error: ${stderr}`);
            return res.status(500).json({ error: 'Nepavyko įkelti nuotraukų.' });
          }
    
          try {
            await processImages(target);
            res.status(201).json({ message: 'Nuotraukos įkeltos sėkmingai.' });
          } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Nepavyko apdoroti nuotraukų.' });
          }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Nepavyko įkelti nuotraukų.' });
    }
  }
});

async function processImages(targetName) {
  try {
    const imageDirectory = path.join(__dirname, '..', 'data', targetName);
    const files = await fs.readdir(imageDirectory);
    const imageFiles = files.filter(file => path.extname(file) === '.jpg');

    for (const imageFile of imageFiles) {
      const imagePath = path.join(imageDirectory, imageFile);
      const imageBuffer = await fs.readFile(imagePath);

      const photoPath = '../bd-scripts/yolov7/images/temp_photo.jpg';
      await fs.writeFile(photoPath, imageBuffer);

      await new Promise((resolve, reject) => {
        exec(
          'cd ../bd-scripts/yolov7 && python detect.py --source images/temp_photo.jpg --weights yolov7.pt',
          async (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
              reject(new Error('Nepavyko aptikti objektų.'));
            }

            const outputPath = '../bd-scripts/yolov7/output.json';
            const objects = JSON.parse(await fs.readFile(outputPath, 'utf8'));

            const target = targetName;

            const newPhoto = await Photo.create({ photo: imageBuffer, target });

            const detectedObjects = objects.map((obj) => ({
              objectName: obj.objectName,
              relativeSize: obj.relativeSize,
              PhotoId: newPhoto.id,
            }));

            await DetectedObject.bulkCreate(detectedObjects);

            await fs.unlink(photoPath);
            await fs.unlink(outputPath);

            resolve();
          }
        );
      });
    }
  } catch (error) {
    console.error(error);
    throw new Error('Nepavyko apdoroti nuotraukų.');
  }
}

router.get('/user/:target', async (req, res) => {
  const { target } = req.params;

  try {
    const userPhotos = await Photo.findAll({
      where: { target },
      include: [DetectedObject],
    });

    if(!userPhotos.length) {
      return res.status(404).json({ error: 'Nerasta nurodyto vartotojo nuotraukų.'});
    }

    const result = userPhotos.map((photo) => {
      const photoData = photo.photo.toString('base64');

      return {
        id: photo.id,
        objects: photo.DetectedObjects.map((obj) => ({
          objectName: obj.objectName,
          relativeSize: obj.relativeSize,
        })),
        target: photo.target,
        photoData,
      };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nepavyko gauti vartotojo nuotraukų.' });
  }
});

router.get('/similar/:id', async (req, res) => {
  const input_user_id = req.params.id;

  try {


    const allPhotos = await fetchAllPhotos();

    const targetUserExists = allPhotos.some(photo => photo.target === input_user_id);

    if (!targetUserExists) {
      return res.status(404).json({ error: 'Nurodytas vartotojas neegzistuoja.' });
    }

    const encodedData = base64.fromByteArray(Buffer.from(JSON.stringify(allPhotos), 'utf-8'));

    const pythonProcess = spawn('python', ['../bd-scripts/similarity.py', input_user_id]);

    pythonProcess.stdin.write(encodedData);
    pythonProcess.stdin.end();

    let stdout = '';
    let stderr = '';

    pythonProcess.stdout.on('data', (data) => {
      stdout += data;
    });

    pythonProcess.stderr.on('data', (data) => {
      stderr += data;
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`exec error: ${stderr}`);
        res.status(500).json({ error: 'Nepavyko atrasti panašių vartotojų.' });
      } else {
        try {
          const result = JSON.parse(stdout);
          res.status(200).json(result);
        } catch (e) {
          console.error(e);
          res.status(500).json({ error: 'Nepavyko gauti rezultatų.' });
        }
      }
      clearProject();
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Nepavyko gauti duomenų.' });
    clearProject();
  }
});

async function clearProject() {
  const directory = path.join(__dirname, '..', 'data');
  const databaseFile = path.join(__dirname, '..', 'database.sqlite');

  try {
    await fs.rm(directory, { recursive: true, force: true });
  } catch (error) {
    console.error(error);
  }

  try {
    try {
      await sequelize.close();
    } catch (error) {}
    await fs.unlink(databaseFile);
  } catch (error) {}
}

module.exports = router;