const fs = require('fs');

if (process.argv.length !== 3) {
  console.log(`Usage:\nnode patch-codenames-json.js "file.json"\n`);
  process.exit(0);
}

const filePath = process.argv[2];

if (!fs.existsSync(filePath)) {
  console.log('File not exists: ' + filePath + '\n');
  process.exit(1);
}

function getDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));
}

function findClosestZone(item, zones) {
  if (zones.length === 0) {
    return null;
  }
  let distanceMin, zone;
  for (let i = 0; i < zones.length; i++) {
    let distance = getDistance(item.position.x, item.position.y,
      zones[0].position.x, zones[0].position.y);

    if (distanceMin === undefined || distanceMin > distance) {
      distanceMin = distance;
      zone = zones[i];
    }
  }
  return zone;
}

fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }

  try {
    const json = JSON.parse(data);
    const zones = json.Entities.filter(entity => entity.name === 'Zone.Panel');
    const items = json.Entities.filter(entity => entity.name.match(/^(Plane|Text)\.Panel\./));

    // Panel items should be rendered only within its 'Zone.Panel'
    items.forEach(item => {
      const zone = findClosestZone(item, zones);
      if (zone) {
        item.renderWithZones = [zone.id];
      }
    });

    // Remove Cube.ToDelete from the Entities (it was used only to define the zone's size)
    json.Entities = json.Entities.filter(entity => entity.name !== 'Cube.ToDelete');

    // Remove numbers from Sudoku buttons
    json.Entities.forEach(entity => {
      if (entity.name.match(/^Text\.(NewGame|Hint)\.\d+$/)) {
        entity.name = entity.name.replace(/\.\d+$/, '');
      }
    });

    fs.writeFile(filePath, JSON.stringify(json, null, 2), (err, data) => {
      if (err) {
        console.error(err);
        process.exit(1);
      }
      console.log('Done');
    });

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});

